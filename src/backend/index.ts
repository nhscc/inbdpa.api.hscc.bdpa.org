import assert from 'node:assert';
import { MongoServerError, ObjectId } from 'mongodb';
import { toss } from 'toss-expression';

import { getEnv } from 'universe/backend/env';

import {
  ErrorMessage,
  GuruMeditationError,
  InvalidItemError,
  ItemNotFoundError,
  ValidationError
} from 'universe/error';

import {
  type Email,
  type UserId,
  type BlogId,
  type SessionId,
  type Username,
  type NewUser,
  type NewPage,
  type PatchUser,
  type PatchPage,
  type PatchBlog,
  type InternalUser,
  type InternalPage,
  type InternalSession,
  type InternalInfo,
  type PublicUser,
  type PublicBlog,
  type PublicPage,
  type PublicInfo,
  type PublicPageMetadata,
  type TokenAttributeOwner,
  type NavigationLink,
  type UserType,
  userTypes,
  toPublicUser,
  toPublicPage,
  publicUserProjection,
  publicPageProjection,
  publicBlogProjection,
  publicPageMetadataProjection
} from 'universe/backend/db';

import { isPlainObject } from 'multiverse/is-plain-object';
import { getDb } from 'multiverse/mongo-schema';
import { itemExists, itemToObjectId } from 'multiverse/mongo-item';

import type { LiteralUnknownUnion } from 'types/global';

const emailRegex = /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i;
const usernameRegex = /^[\d_a-z-]+$/;
const alphanumericRegex = /^[\w-]+$/i;
const hexadecimalRegex = /^[\dA-Fa-f]+$/;
const hrefRegex = /^(\/\/|[\w-])/i;

/**
 * Validate a username string for correctness.
 */
function isValidUsername(username: unknown): username is Username {
  return (
    typeof username == 'string' &&
    usernameRegex.test(username) &&
    username.length >= getEnv().MIN_USER_NAME_LENGTH &&
    username.length <= getEnv().MAX_USER_NAME_LENGTH
  );
}

/**
 * Validate a generic _subset_ of a new (`required: true`) or patch (`required:
 * false`) user data object.
 */
function validateGenericUserData(
  data: unknown,
  { required }: { required: true }
): asserts data is Pick<NewUser, 'email' | 'salt' | 'key'>;
function validateGenericUserData(
  data: unknown,
  { required }: { required: false }
): asserts data is Pick<PatchUser, 'email' | 'salt' | 'key'>;
function validateGenericUserData(
  data: unknown,
  { required }: { required: boolean }
): void {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  const {
    USER_KEY_LENGTH,
    USER_SALT_LENGTH,
    MIN_USER_EMAIL_LENGTH,
    MAX_USER_EMAIL_LENGTH
  } = getEnv();

  if (
    (required || (!required && data.email !== undefined)) &&
    (typeof data.email != 'string' ||
      !emailRegex.test(data.email) ||
      data.email.length < MIN_USER_EMAIL_LENGTH ||
      data.email.length > MAX_USER_EMAIL_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'email',
        MIN_USER_EMAIL_LENGTH,
        MAX_USER_EMAIL_LENGTH,
        'valid email address'
      )
    );
  }

  if (
    (required || (!required && data.salt !== undefined)) &&
    (typeof data.salt != 'string' ||
      !hexadecimalRegex.test(data.salt) ||
      data.salt.length != USER_SALT_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength('salt', USER_SALT_LENGTH, null, 'hexadecimal')
    );
  }

  if (
    (required || (!required && data.key !== undefined)) &&
    (typeof data.key != 'string' ||
      !hexadecimalRegex.test(data.key) ||
      data.key.length != USER_KEY_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength('key', USER_KEY_LENGTH, null, 'hexadecimal')
    );
  }
}

/**
 * Validate a patch blog data object.
 */
function validatePatchBlogData(data: unknown): asserts data is PatchBlog {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  const {
    MAX_BLOG_PAGE_NAME_LENGTH,
    MAX_NAV_LINK_HREF_LENGTH,
    MAX_NAV_LINK_TEXT_LENGTH
  } = getEnv();

  if (
    data.name !== undefined &&
    (!data.name ||
      typeof data.name !== 'string' ||
      data.name.length < 1 ||
      data.name.length > MAX_BLOG_PAGE_NAME_LENGTH ||
      !alphanumericRegex.test(data.name))
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'name',
        1,
        MAX_BLOG_PAGE_NAME_LENGTH,
        'alphanumeric'
      )
    );
  }

  if (
    data.rootPage !== undefined &&
    (!data.rootPage ||
      typeof data.rootPage !== 'string' ||
      data.rootPage.length < 1 ||
      data.rootPage.length > MAX_BLOG_PAGE_NAME_LENGTH ||
      !alphanumericRegex.test(data.rootPage))
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'rootPage',
        1,
        MAX_BLOG_PAGE_NAME_LENGTH,
        'alphanumeric'
      )
    );
  }

  if (data.navLinks !== undefined) {
    if (!data.navLinks || !Array.isArray(data.navLinks)) {
      throw new ValidationError(ErrorMessage.InvalidFieldValue('navLinks'));
    }

    if (data.navLinks.length > navLinkUpperLimit) {
      throw new ValidationError(ErrorMessage.TooMany('navLinks', navLinkUpperLimit));
    }

    for (const link of data.navLinks) {
      if (!link || !isPlainObject(link) || Object.keys(link).length !== 2) {
        throw new ValidationError(
          ErrorMessage.InvalidArrayValue('navLinks', JSON.stringify(link))
        );
      }

      if (
        typeof link.href !== 'string' ||
        !link.href ||
        link.href.length > MAX_NAV_LINK_HREF_LENGTH ||
        !hrefRegex.test(link.href)
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidObjectKeyValue('navLink.href', String(link.href))
        );
      }

      if (
        typeof link.text !== 'string' ||
        !link.text ||
        link.text.length > MAX_NAV_LINK_TEXT_LENGTH
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidObjectKeyValue('navLink.text', String(link.text))
        );
      }
    }
  }
}

/**
 * Validate a generic _subset_ of a new (`required: true`) or patch (`required:
 * false`) page data object.
 */
function validateGenericPageData(
  data: unknown,
  { required }: { required: true }
): asserts data is Pick<NewPage, 'contents'>;
function validateGenericPageData(
  data: unknown,
  { required }: { required: false }
): asserts data is Pick<PatchPage, 'contents'>;
function validateGenericPageData(
  data: unknown,
  { required }: { required: boolean }
): void | never {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  const { MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES: maxBlogPageContentsLengthBytes } =
    getEnv();

  if (
    (required || (!required && data.contents !== undefined)) &&
    (typeof data.contents != 'string' ||
      data.contents.length > maxBlogPageContentsLengthBytes)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'contents',
        0,
        maxBlogPageContentsLengthBytes,
        'bytes'
      )
    );
  }
}

/**
 * Transforms a username-or-email string into a user object.
 */
async function usernameOrEmailParamToUser<T extends InternalUser>(
  usernameOrEmail: Username | Email | undefined
): Promise<T>;
async function usernameOrEmailParamToUser<T extends PublicUser | PublicBlog>(
  usernameOrEmail: Username | Email | undefined,
  projection: object
): Promise<T>;
async function usernameOrEmailParamToUser<
  T extends InternalUser | PublicUser | PublicBlog
>(usernameOrEmail: Username | Email | undefined, projection?: object): Promise<T> {
  if (!usernameOrEmail) {
    throw new InvalidItemError('usernameOrEmail', 'parameter');
  }

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');

  const user = await usersDb.findOne<T>(
    {
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    },
    { projection }
  );

  if (!user) {
    throw new ItemNotFoundError(usernameOrEmail, 'user');
  }

  return user;
}

async function blogNameToUser<T extends InternalUser>(
  blogName: string | undefined
): Promise<T>;
async function blogNameToUser<T extends PublicUser | PublicBlog>(
  blogName: string | undefined,
  projection: object
): Promise<T>;
async function blogNameToUser<T extends InternalUser | PublicUser | PublicBlog>(
  blogName: string | undefined,
  projection?: object
): Promise<T> {
  if (!blogName) {
    throw new InvalidItemError('blogName', 'parameter');
  }

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');
  const user = await usersDb.findOne<T>({ blogName }, { projection });

  if (!user) {
    throw new ItemNotFoundError(blogName, 'blog');
  }

  return user;
}

async function pageNameToPage<T extends InternalPage>(
  pageName: string | undefined,
  blog_id: BlogId
): Promise<T>;
async function pageNameToPage<T extends PublicPage | PublicPageMetadata>(
  pageName: string | undefined,
  blog_id: BlogId,
  projection: object
): Promise<T>;
async function pageNameToPage<
  T extends InternalPage | PublicPage | PublicPageMetadata
>(pageName: string | undefined, blog_id: BlogId, projection?: object): Promise<T> {
  if (!pageName) {
    throw new InvalidItemError('pageName', 'parameter');
  }

  const db = await getDb({ name: 'app' });
  const pagesDb = db.collection<InternalPage>('pages');
  const page = await pagesDb.findOne<T>({ blog_id, name: pageName }, { projection });

  if (!page) {
    throw new ItemNotFoundError(pageName, 'page');
  }

  return page;
}

/**
 * The maximum amount of navLinks that can be associated with a blog. This is a
 * hardcoded limit.
 */
export const navLinkUpperLimit = 5 as const;

/**
 * The default `navLinks` value for newly created blogs (users).
 */
export const defaultNavLinks: NavigationLink[] = [{ href: 'home', text: 'home' }];

/**
 * The default home page for newly created blogs (users).
 */
export const defaultHomePage: Required<NewPage> = {
  name: 'home',
  contents: '# Hello World\n\nWelcome **to** _Inbdpa!_'
};

export async function getAllUsers({
  after_id
}: {
  after_id: string | undefined;
}): Promise<PublicUser[]> {
  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');
  const afterId = after_id ? itemToObjectId<UserId>(after_id) : undefined;

  if (afterId && !(await itemExists(usersDb, afterId))) {
    throw new ItemNotFoundError(after_id, 'user_id');
  }

  return (
    usersDb
      // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
      .find<PublicUser>(afterId ? { _id: { $lt: afterId } } : {}, {
        projection: publicUserProjection,
        limit: getEnv().RESULTS_PER_PAGE,
        sort: { _id: -1 }
      })
      .toArray()
  );
}

export async function getBlogPagesMetadata({
  blogName
}: {
  blogName: string | undefined;
}): Promise<PublicPageMetadata[]> {
  const db = await getDb({ name: 'app' });
  const pagesDb = db.collection<InternalPage>('pages');
  const { _id: blog_id } = await blogNameToUser(blogName);

  return pagesDb
    .find<PublicPage>(
      { blog_id },
      {
        projection: publicPageMetadataProjection,
        limit: getEnv().RESULTS_PER_PAGE,
        sort: { _id: -1 }
      }
    )
    .toArray();
}

export async function getUser({
  usernameOrEmail
}: {
  usernameOrEmail: Username | Email | undefined;
}): Promise<PublicUser> {
  return usernameOrEmailParamToUser(usernameOrEmail, publicUserProjection);
}

export async function getBlog({
  blogName
}: {
  blogName: string | undefined;
}): Promise<PublicBlog> {
  return blogNameToUser(blogName, publicBlogProjection);
}

export async function getPage({
  blogName,
  pageName
}: {
  blogName: string | undefined;
  pageName: string | undefined;
}): Promise<PublicPage> {
  const { _id: blog_id } = await blogNameToUser(blogName);
  return pageNameToPage(pageName, blog_id, publicPageProjection);
}

export async function getInfo(): Promise<PublicInfo> {
  const db = await getDb({ name: 'app' });
  const infoDb = db.collection<InternalInfo>('info');

  return (
    (await infoDb.findOne<PublicInfo>({}, { projection: { _id: false } })) ||
    toss(new GuruMeditationError('system info is missing'))
  );
}

export async function getPageSessionsCount({
  blogName,
  pageName
}: {
  blogName: string | undefined;
  pageName: string | undefined;
}): Promise<number> {
  const { _id: blog_id } = await blogNameToUser(blogName);
  const { _id: page_id } = await pageNameToPage(pageName, blog_id);

  const db = await getDb({ name: 'app' });
  const sessionDb = db.collection<InternalSession>('sessions');

  return sessionDb.countDocuments({
    page_id,
    lastRenewedDate: {
      $gt: new Date(Date.now() - getEnv().SESSION_EXPIRE_AFTER_SECONDS * 1000)
    }
  });
}

export async function createUser({
  data,
  __provenance
}: {
  data: LiteralUnknownUnion<NewUser>;
  __provenance: TokenAttributeOwner;
}): Promise<PublicUser> {
  if (typeof __provenance !== 'string') {
    throw new GuruMeditationError('invalid provenance token attribute owner');
  }

  validateGenericUserData(data, { required: true });

  const { MAX_USER_NAME_LENGTH, MIN_USER_NAME_LENGTH, MAX_BLOG_NAME_LENGTH } =
    getEnv();

  if ('username' in data && !isValidUsername(data.username)) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'username',
        MIN_USER_NAME_LENGTH,
        MAX_USER_NAME_LENGTH,
        'lowercase alphanumeric'
      )
    );
  }

  if (
    !('type' in data) ||
    typeof data.type !== 'string' ||
    !userTypes.includes(data.type as UserType)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue('type', undefined, userTypes)
    );
  }

  if (data.type === 'administrator' && 'blogName' in data && data.blogName) {
    throw new ValidationError(ErrorMessage.UnknownField('blogName'));
  } else if (
    data.type === 'blogger' &&
    (!('blogName' in data) ||
      typeof data.blogName !== 'string' ||
      !alphanumericRegex.test(data.blogName) ||
      data.blogName.length < 1 ||
      data.blogName.length > MAX_BLOG_NAME_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'blogName',
        1,
        MAX_BLOG_NAME_LENGTH,
        'alphanumeric'
      )
    );
  }

  const { email, username, key, salt, type, blogName, ...rest } = data as NewUser;
  const restKeys = Object.keys(rest);

  if (restKeys.length != 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');

  if (username && (await itemExists(usersDb, { key: 'username', id: username }))) {
    throw new ValidationError(ErrorMessage.DuplicateFieldValue('username'));
  }

  if (blogName && (await itemExists(usersDb, { key: 'blogName', id: blogName }))) {
    throw new ValidationError(ErrorMessage.DuplicateFieldValue('blogName'));
  }

  const newUser: InternalUser = Object.assign(
    {
      _id: new ObjectId(),
      __provenance,
      username: username || null,
      salt: salt.toLowerCase(),
      email,
      key: key.toLowerCase()
    },
    type === 'administrator'
      ? { type: 'administrator' as const }
      : {
          type: 'blogger' as const,
          createdAt: Date.now(),
          blogName,
          blogRootPage: 'home',
          banned: false,
          navLinks: defaultNavLinks
        }
  );

  // * At this point, we can finally trust this data is valid and not malicious
  try {
    await usersDb.insertOne(newUser);
  } catch (error) {
    /* istanbul ignore else */
    if (
      error instanceof MongoServerError &&
      error.code == 11_000 &&
      error.keyPattern?.email !== undefined
    ) {
      throw new ValidationError(ErrorMessage.DuplicateFieldValue('email'));
    }

    /* istanbul ignore next */
    throw error;
  }

  const infoDb = db.collection<InternalInfo>('info');
  const promises: Promise<unknown>[] = [infoDb.updateOne({}, { $inc: { users: 1 } })];

  // TODO: this should be implemented as a transaction
  if (data.type === 'blogger') {
    promises.push(
      infoDb.updateOne({}, { $inc: { blogs: 1, pages: 1 } }),
      db.collection<InternalPage>('pages').insertOne({
        __provenance,
        _id: new ObjectId(),
        blog_id: newUser._id,
        createdAt: Date.now(),
        totalViews: 0,
        ...defaultHomePage
      })
    );
  }

  await Promise.all(promises);
  return toPublicUser(newUser);
}

export async function createPage({
  blogName,
  data,
  __provenance
}: {
  blogName: string | undefined;
  data: LiteralUnknownUnion<NewPage>;
  __provenance: TokenAttributeOwner;
}): Promise<PublicPage> {
  if (typeof __provenance !== 'string') {
    throw new GuruMeditationError('invalid provenance token attribute owner');
  }

  validateGenericPageData(data, { required: true });

  const { MAX_BLOG_PAGE_NAME_LENGTH, MAX_USER_BLOG_PAGES } = getEnv();

  if (
    !('name' in data) ||
    !data.name ||
    typeof data.name !== 'string' ||
    data.name.length < 1 ||
    data.name.length > MAX_BLOG_PAGE_NAME_LENGTH ||
    !alphanumericRegex.test(data.name)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'name',
        1,
        MAX_BLOG_PAGE_NAME_LENGTH,
        'alphanumeric'
      )
    );
  }

  const { name, contents, ...rest } = data;
  const restKeys = Object.keys(rest);

  if (restKeys.length != 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }

  const db = await getDb({ name: 'app' });
  const pagesDb = db.collection<InternalPage>('pages');
  const { _id: blog_id } = await blogNameToUser(blogName);
  const numOfPages = await pagesDb.countDocuments({ blog_id });

  if (numOfPages >= MAX_USER_BLOG_PAGES) {
    throw new ValidationError(ErrorMessage.TooMany('pages', MAX_USER_BLOG_PAGES));
  }

  const newPage: InternalPage = {
    _id: new ObjectId(),
    __provenance,
    blog_id,
    name,
    contents,
    createdAt: Date.now(),
    totalViews: 0
  };

  // * At this point, we can finally trust this data is valid and not malicious
  try {
    await pagesDb.insertOne(newPage);
  } catch (error) {
    /* istanbul ignore else */
    if (error instanceof MongoServerError && error.code == 11_000) {
      throw new ValidationError(ErrorMessage.DuplicateFieldValue('pageName'));
    }

    /* istanbul ignore next */
    throw error;
  }

  await db.collection<InternalInfo>('info').updateOne({}, { $inc: { pages: 1 } });
  return toPublicPage(newPage);
}

export async function createSession({
  blogName,
  pageName,
  __provenance
}: {
  blogName: string | undefined;
  pageName: string | undefined;
  __provenance: TokenAttributeOwner;
}): Promise<SessionId> {
  if (typeof __provenance !== 'string') {
    throw new GuruMeditationError('invalid provenance token attribute owner');
  }

  const db = await getDb({ name: 'app' });
  const sessionDb = db.collection<InternalSession>('sessions');
  const { _id: blog_id } = await blogNameToUser(blogName);
  const { _id: page_id } = await pageNameToPage(pageName, blog_id);

  const newSession: InternalSession = {
    _id: new ObjectId(),
    __provenance,
    page_id,
    // ? Using Date.now ensures we pick up Date mocking when testing
    lastRenewedDate: new Date(Date.now())
  };

  // * At this point, we can finally trust this data is valid and not malicious
  await sessionDb.insertOne(newSession);
  return newSession._id;
}

export async function updateUser({
  usernameOrEmail,
  data
}: {
  usernameOrEmail: Username | Email | undefined;
  data: LiteralUnknownUnion<PatchUser>;
}): Promise<void> {
  const { _id: user_id, type } = await usernameOrEmailParamToUser(usernameOrEmail);

  if (data && !Object.keys(data).length) {
    throw new ValidationError(ErrorMessage.EmptyJSONBody());
  }

  validateGenericUserData(data, { required: false });

  if ('banned' in data && data.banned !== undefined) {
    if (type === 'administrator') {
      throw new ValidationError(ErrorMessage.UnknownField('banned'));
    } else if (typeof data.banned !== 'boolean') {
      throw new ValidationError(
        ErrorMessage.InvalidFieldValue('banned', data.banned, ['true', 'false'])
      );
    }
  }

  const { email, key, salt, banned, ...rest } = data as PatchUser;
  const restKeys = Object.keys(rest);

  if (restKeys.length != 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }

  // ? Key update requires salt update and vice-versa
  if (!!key !== !!salt) {
    const { USER_SALT_LENGTH: maxSaltLength, USER_KEY_LENGTH: maxKeyLength } =
      getEnv();

    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        !!key ? 'salt' : 'key',
        !!key ? maxSaltLength : maxKeyLength,
        null,
        'hexadecimal'
      )
    );
  }

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');

  // * At this point, we can finally trust this data is not malicious, but not
  // * necessarily valid...
  try {
    const result = await usersDb.updateOne(
      { _id: user_id },
      {
        $set: {
          ...(email ? { email } : {}),
          ...(salt ? { salt: salt.toLowerCase() } : {}),
          ...(key ? { key: key.toLowerCase() } : {}),
          ...(typeof banned === 'boolean' ? { banned } : {})
        }
      }
    );

    assert(
      result.matchedCount === 1,
      `expected 1 affected document, ${result.matchedCount} were affected`
    );
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.code == 11_000 &&
      error.keyPattern?.email !== undefined
    ) {
      throw new ValidationError(ErrorMessage.DuplicateFieldValue('email'));
    }

    throw error;
  }
}

export async function updateBlog({
  blogName,
  data
}: {
  blogName: string | undefined;
  data: LiteralUnknownUnion<PatchBlog>;
}): Promise<void> {
  const { _id: blog_id } = await blogNameToUser(blogName);

  if (data && !Object.keys(data).length) {
    throw new ValidationError(ErrorMessage.EmptyJSONBody());
  }

  validatePatchBlogData(data);

  const { name, rootPage, navLinks, ...rest } = data;
  const restKeys = Object.keys(rest);

  if (restKeys.length != 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');

  if (name && (await itemExists(usersDb, { key: 'blogName', id: name }))) {
    throw new ValidationError(ErrorMessage.DuplicateFieldValue('blogName'));
  }

  // * At this point, we can finally trust this data is valid and not malicious
  const result = await usersDb.updateOne(
    { _id: blog_id },
    {
      $set: {
        ...(name ? { blogName: name } : {}),
        ...(rootPage ? { blogRootPage: rootPage } : {}),
        ...(navLinks ? { navLinks } : {})
      }
    }
  );

  assert(
    result.matchedCount === 1,
    `expected 1 affected document, ${result.matchedCount} were affected`
  );
}

export async function updatePage({
  blogName,
  pageName,
  data
}: {
  blogName: string | undefined;
  pageName: string | undefined;
  data: LiteralUnknownUnion<PatchPage>;
}): Promise<void> {
  const { _id: blog_id } = await blogNameToUser(blogName);
  const { _id: page_id } = await pageNameToPage(pageName, blog_id);

  if (data && !Object.keys(data).length) {
    throw new ValidationError(ErrorMessage.EmptyJSONBody());
  }

  validateGenericPageData(data, { required: false });

  if (
    'totalViews' in data &&
    data.totalViews !== undefined &&
    data.totalViews !== 'increment'
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue('totalViews', data.totalViews, ['increment'])
    );
  }

  const { totalViews, contents, ...rest } = data as PatchPage;
  const restKeys = Object.keys(rest);

  if (restKeys.length != 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }

  const db = await getDb({ name: 'app' });
  const pagesDb = db.collection<InternalPage>('pages');

  // * At this point, we can finally trust this data is valid and not malicious
  const result = await pagesDb.updateOne(
    { _id: page_id },
    {
      ...(contents !== undefined ? { $set: { contents } } : {}),
      ...(!!totalViews ? { $inc: { totalViews: 1 } } : {})
    }
  );

  assert(
    result.matchedCount === 1,
    `expected 1 affected document, ${result.matchedCount} were affected`
  );
}

export async function renewSession({
  sessionId
}: {
  sessionId: string | undefined;
}): Promise<void> {
  const db = await getDb({ name: 'app' });
  const sessionDb = db.collection<InternalSession>('sessions');

  // * At this point, we can finally trust this data is valid and not malicious
  const result = await sessionDb.updateOne(
    { _id: itemToObjectId(String(sessionId)) },
    { $set: { lastRenewedDate: new Date(Date.now()) } }
  );

  if (result.matchedCount !== 1) {
    throw new ItemNotFoundError(sessionId, 'session');
  }
}

export async function deleteUser({
  usernameOrEmail
}: {
  usernameOrEmail: Username | Email | undefined;
}): Promise<void> {
  const { _id: user_id, type } = await usernameOrEmailParamToUser(usernameOrEmail);

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');
  const pagesDb = db.collection<InternalPage>('pages');
  const infoDb = db.collection<InternalInfo>('info');

  const [deleteUserResult, deletePagesResult] = await Promise.all([
    usersDb.deleteOne({ _id: user_id }),
    pagesDb.deleteMany({ blog_id: user_id }),
    infoDb.updateOne({}, { $inc: { users: -1 } })
  ]);

  if (type === 'blogger') {
    await infoDb.updateOne(
      {},
      { $inc: { blogs: -1, pages: -1 * deletePagesResult.deletedCount } }
    );
  }
  // ? We already do the existence check when we get the user_id. This is just a
  // ? sanity check at this point.
  assert(
    deleteUserResult.deletedCount === 1,
    `expected 1 affected document, ${deleteUserResult.deletedCount} were affected`
  );
}

export async function deletePage({
  blogName,
  pageName
}: {
  blogName: string | undefined;
  pageName: string | undefined;
}): Promise<void> {
  const { _id: blog_id } = await blogNameToUser(blogName);
  const { _id: page_id } = await pageNameToPage(pageName, blog_id);

  const db = await getDb({ name: 'app' });
  const pagesDb = db.collection<InternalPage>('pages');
  const infoDb = db.collection<InternalInfo>('info');

  const [deletePagesResult] = await Promise.all([
    pagesDb.deleteOne({ _id: page_id }),
    infoDb.updateOne({}, { $inc: { pages: -1 } })
  ]);

  // ? We already do the existence check when we get the page_id. This is just a
  // ? sanity check at this point.
  assert(
    deletePagesResult.deletedCount === 1,
    `expected 1 affected document, ${deletePagesResult.deletedCount} were affected`
  );
}

export async function deleteSession({
  sessionId
}: {
  sessionId: string | undefined;
}): Promise<void> {
  const db = await getDb({ name: 'app' });
  const sessionDb = db.collection<InternalSession>('sessions');
  const result = await sessionDb.deleteOne({
    _id: itemToObjectId(String(sessionId))
  });

  if (result.deletedCount !== 1) {
    throw new ItemNotFoundError(sessionId, 'session');
  }
}

export async function authAppUser({
  usernameOrEmail,
  key
}: {
  usernameOrEmail: Username | Email | undefined;
  key: string | undefined;
}): Promise<boolean> {
  if (!key || !usernameOrEmail) return false;

  const db = await getDb({ name: 'app' });
  const usersDb = db.collection<InternalUser>('users');

  return !!(await usersDb.countDocuments({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    key
  }));
}
