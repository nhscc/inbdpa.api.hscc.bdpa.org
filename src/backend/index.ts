import assert from 'node:assert';
import { MongoServerError, ObjectId } from 'mongodb';
import { toss } from 'toss-expression';

import { getEnv } from 'universe/backend/env';

import {
  ErrorMessage,
  AppValidationError,
  InvalidItemError,
  ItemNotFoundError,
  ValidationError
} from 'universe/error';

import {
  type UserId,
  type ArticleId,
  type OpportunityId,
  type SessionId,
  type NewUser,
  type NewArticle,
  type NewOpportunity,
  type NewSession,
  type PatchUser,
  type PatchArticle,
  type PatchOpportunity,
  type InternalUser,
  type InternalArticle,
  type InternalOpportunity,
  type InternalSession,
  type InternalInfo,
  type PublicUser,
  type PublicArticle,
  type PublicOpportunity,
  type PublicSession,
  type PublicInfo,
  type TokenAttributeOwner,
  type UserType,
  type SessionView,
  userTypes,
  toPublicUser,
  toPublicArticle,
  toPublicInfo,
  toPublicOpportunity,
  toPublicSession,
  publicArticleAggregation,
  incompletePublicArticleProjection,
  publicOpportunityAggregation,
  incompletePublicOpportunityProjection,
  publicSessionProjection,
  publicUserAggregation,
  incompletePublicUserProjection,
  getUsersDb,
  getSessionsDb,
  getOpportunitiesDb,
  getArticlesDb,
  getInfoDb,
  makeSessionQueryTtlFilter,
  UserSectionEntries,
  UserSectionEntry
} from 'universe/backend/db';

import { itemExists, itemToObjectId } from 'multiverse/mongo-item';

import type { LiteralUnknownUnion } from 'types/global';
import {
  validateNewArticleData,
  validateNewOpportunityData,
  validateNewSessionData,
  validateNewUserData,
  validatePatchArticleData,
  validatePatchOpportunityData,
  validatePatchUserData
} from './validators';

export async function getAllUsers({
  after_id,
  updatedAfter: updatedAfter_,
  includeSessionCount
}: {
  after_id: string | undefined;
  updatedAfter: string | undefined;
  includeSessionCount: boolean;
}): Promise<PublicUser[]> {
  const usersDb = await getUsersDb();
  const afterId = after_id ? itemToObjectId<UserId>(after_id) : undefined;
  const updatedAfter =
    updatedAfter_ !== undefined ? Number(updatedAfter_) : undefined;

  if (afterId && !(await itemExists(usersDb, afterId))) {
    throw new ItemNotFoundError(after_id, 'after_id');
  }

  if (updatedAfter !== undefined && !Number.isInteger(updatedAfter)) {
    throw new InvalidItemError(updatedAfter, 'updatedAfter');
  }

  const filter = {
    ...(afterId ? { _id: { $gt: afterId } } : {}),
    ...(updatedAfter !== undefined ? { updatedAt: { $gt: updatedAfter } } : {})
  };

  // eslint-disable-next-line unicorn/prefer-ternary
  if (includeSessionCount) {
    return usersDb
      .aggregate<PublicUser>([{ $match: filter }, ...publicUserAggregation])
      .toArray();
  } else {
    return (
      usersDb
        // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
        .find<PublicUser>(filter, {
          projection: incompletePublicUserProjection,
          limit: getEnv().RESULTS_PER_PAGE,
          sort: { _id: 1 }
        })
        .toArray()
    );
  }
}

export async function getAllSessions({
  after_id,
  updatedAfter: updatedAfter_
}: {
  after_id: string | undefined;
  updatedAfter: string | undefined;
}): Promise<PublicSession[]> {
  const sessionsDb = await getSessionsDb();
  const afterId = after_id ? itemToObjectId<SessionId>(after_id) : undefined;
  const updatedAfter =
    updatedAfter_ !== undefined ? Number(updatedAfter_) : undefined;

  if (afterId && !(await itemExists(sessionsDb, afterId))) {
    throw new ItemNotFoundError(after_id, 'after_id');
  }

  if (updatedAfter !== undefined && !Number.isInteger(updatedAfter)) {
    throw new InvalidItemError(updatedAfter, 'updatedAfter');
  }

  const filter = {
    ...(afterId ? { _id: { $gt: afterId } } : {}),
    ...(updatedAfter !== undefined ? { updatedAt: { $gt: updatedAfter } } : {}),
    ...makeSessionQueryTtlFilter()
  };

  return (
    sessionsDb
      // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
      .find<PublicSession>(filter, {
        projection: publicSessionProjection,
        limit: getEnv().RESULTS_PER_PAGE,
        sort: { _id: 1 }
      })
      .toArray()
  );
}

export async function getAllOpportunities({
  after_id,
  updatedAfter: updatedAfter_,
  includeSessionCount
}: {
  after_id: string | undefined;
  updatedAfter: string | undefined;
  includeSessionCount: boolean;
}): Promise<PublicOpportunity[]> {
  const opportunitiesDb = await getOpportunitiesDb();
  const afterId = after_id ? itemToObjectId<OpportunityId>(after_id) : undefined;
  const updatedAfter =
    updatedAfter_ !== undefined ? Number(updatedAfter_) : undefined;

  if (afterId && !(await itemExists(opportunitiesDb, afterId))) {
    throw new ItemNotFoundError(after_id, 'after_id');
  }

  if (updatedAfter !== undefined && !Number.isInteger(updatedAfter)) {
    throw new InvalidItemError(updatedAfter, 'updatedAfter');
  }

  const filter = {
    ...(afterId ? { _id: { $gt: afterId } } : {}),
    ...(updatedAfter !== undefined ? { updatedAt: { $gt: updatedAfter } } : {})
  };

  // eslint-disable-next-line unicorn/prefer-ternary
  if (includeSessionCount) {
    return opportunitiesDb
      .aggregate<PublicOpportunity>([
        { $match: filter },
        ...publicOpportunityAggregation
      ])
      .toArray();
  } else {
    return (
      opportunitiesDb
        // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
        .find<PublicOpportunity>(filter, {
          projection: incompletePublicOpportunityProjection,
          limit: getEnv().RESULTS_PER_PAGE,
          sort: { _id: 1 }
        })
        .toArray()
    );
  }
}

export async function getAllArticles({
  after_id,
  updatedAfter: updatedAfter_
}: {
  after_id: string | undefined;
  updatedAfter: string | undefined;
}): Promise<PublicArticle[]> {
  const articlesDb = await getArticlesDb();
  const afterId = after_id ? itemToObjectId<ArticleId>(after_id) : undefined;
  const updatedAfter =
    updatedAfter_ !== undefined ? Number(updatedAfter_) : undefined;

  if (afterId && !(await itemExists(articlesDb, afterId))) {
    throw new ItemNotFoundError(after_id, 'after_id');
  }

  if (updatedAfter !== undefined && !Number.isInteger(updatedAfter)) {
    throw new InvalidItemError(updatedAfter, 'updatedAfter');
  }

  const filter = {
    ...(afterId ? { _id: { $gt: afterId } } : {}),
    ...(updatedAfter !== undefined ? { updatedAt: { $gt: updatedAfter } } : {})
  };

  return articlesDb
    .aggregate<PublicArticle>([{ $match: filter }, ...publicArticleAggregation])
    .toArray();
}

export async function getUser({
  usernameOrId,
  includeSessionCount
}: {
  usernameOrId: string | undefined;
  includeSessionCount: boolean;
}): Promise<PublicUser> {
  if (!usernameOrId) {
    throw new InvalidItemError('usernameOrId', 'parameter');
  }

  const usersDb = await getUsersDb();

  const userId = (() => {
    try {
      return itemToObjectId(usernameOrId);
    } catch {
      return undefined;
    }
  })();

  const filter = {
    $or: [{ username: usernameOrId }, ...(userId ? [{ _id: userId }] : [])]
  };

  const user = includeSessionCount
    ? await usersDb
        .aggregate<PublicUser>([{ $match: filter }, ...publicUserAggregation])
        .next()
    : await usersDb.findOne<PublicUser>(filter, {
        projection: incompletePublicUserProjection
      });

  if (!user) {
    throw new ItemNotFoundError(usernameOrId, 'user');
  }

  return user;
}

export async function getSession({
  session_id
}: {
  session_id: string | undefined;
}): Promise<PublicSession> {
  if (!session_id) {
    throw new InvalidItemError('session_id', 'parameter');
  }

  const sessionsDb = await getSessionsDb();

  const session = await sessionsDb.findOne<PublicSession>(
    { _id: itemToObjectId(session_id), ...makeSessionQueryTtlFilter() },
    { projection: publicSessionProjection }
  );

  if (!session) {
    throw new ItemNotFoundError(session_id, 'session');
  }

  return session;
}

export async function getOpportunity({
  opportunity_id,
  includeSessionCount
}: {
  opportunity_id: string | undefined;
  includeSessionCount: boolean;
}): Promise<PublicOpportunity> {
  if (!opportunity_id) {
    throw new InvalidItemError('opportunity_id', 'parameter');
  }

  const opportunitiesDb = await getOpportunitiesDb();
  const filter = { _id: itemToObjectId(opportunity_id) };

  const opportunity = includeSessionCount
    ? await opportunitiesDb
        .aggregate<PublicOpportunity>([
          { $match: filter },
          ...publicOpportunityAggregation
        ])
        .next()
    : await opportunitiesDb.findOne<PublicOpportunity>(filter, {
        projection: incompletePublicOpportunityProjection
      });

  if (!opportunity) {
    throw new ItemNotFoundError(opportunity_id, 'opportunity');
  }

  return opportunity;
}

export async function getInfo({
  includeArticleCount
}: {
  includeArticleCount: boolean;
}): Promise<PublicInfo> {
  const [info, sessions] = await Promise.all([
    (
      await getInfoDb()
    ).findOne<Omit<PublicInfo, 'sessions'>>(
      {},
      {
        projection: {
          _id: false,
          ...(includeArticleCount ? {} : { articles: false })
        }
      }
    ),
    (await getSessionsDb()).countDocuments()
  ]);

  if (!info) {
    throw new AppValidationError('system info is missing');
  }

  return {
    ...info,
    sessions
  };
}

export async function getArticle({
  article_id
}: {
  article_id: string | undefined;
}): Promise<PublicArticle> {
  if (!article_id) {
    throw new InvalidItemError('article_id', 'parameter');
  }

  const articlesDb = await getArticlesDb();
  const article = await articlesDb
    .aggregate<PublicArticle>([
      { $match: { _id: itemToObjectId(article_id) } },
      ...publicArticleAggregation
    ])
    .next();

  if (!article) {
    throw new ItemNotFoundError(article_id, 'article');
  }

  return article;
}

export async function getSessionsFor(
  view: Extract<SessionView, 'opportunity' | 'article' | 'profile'>,
  {
    viewed_id,
    after_id
  }: { viewed_id: string | undefined; after_id: string | undefined }
): Promise<PublicSession[]> {
  if (!viewed_id) {
    throw new InvalidItemError(
      `${view === 'profile' ? 'user' : view}_id`,
      'parameter'
    );
  }

  const sessionsDb = await getSessionsDb();
  const afterId = after_id ? itemToObjectId(after_id) : undefined;

  if (afterId && !(await itemExists(sessionsDb, afterId))) {
    throw new ItemNotFoundError(after_id, 'after_id');
  }

  // ! Probably not a problem that we race these promises here...
  const dbMap = {
    article: getArticlesDb(),
    opportunity: getOpportunitiesDb(),
    profile: getUsersDb()
  } as const; /*satisfies Record<typeof view, unknown>*/

  const xDb = await dbMap[view];
  const viewedId = itemToObjectId(viewed_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!viewedId || !(await itemExists<any>(xDb, viewedId))) {
    throw new ItemNotFoundError(
      viewed_id,
      `${view === 'profile' ? 'user' : view}_id`
    );
  }

  return sessionsDb
    .find<PublicSession>(
      {
        viewed_id: viewedId,
        ...(afterId ? { _id: { $gt: afterId } } : {}),
        ...makeSessionQueryTtlFilter()
      },
      {
        projection: publicSessionProjection,
        limit: getEnv().RESULTS_PER_PAGE,
        sort: { _id: 1 }
      }
    )
    .toArray();
}

export async function getSessionsCountFor(
  view: Extract<SessionView, 'opportunity' | 'profile'>,
  { viewed_id }: { viewed_id: string | undefined }
): Promise<number> {
  if (!viewed_id) {
    throw new InvalidItemError(
      `${view === 'profile' ? 'user' : view}_id`,
      'parameter'
    );
  }

  const sessionsDb = await getSessionsDb();

  // ! Probably not a problem that we race these promises here...
  const dbMap = {
    opportunity: getOpportunitiesDb(),
    profile: getUsersDb()
  } as const; /*satisfies Record<typeof view, unknown>*/

  const xDb = await dbMap[view];
  const viewedId = itemToObjectId(viewed_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(await itemExists<any>(xDb, viewedId))) {
    throw new ItemNotFoundError(
      viewed_id,
      `${view === 'profile' ? 'user' : view}_id`
    );
  }

  return sessionsDb.countDocuments({
    viewed_id: viewedId,
    ...makeSessionQueryTtlFilter()
  });
}

export async function getUserConnections({
  user_id
}: {
  user_id: string | undefined;
}): Promise<string[]> {
  if (!user_id) {
    throw new InvalidItemError('user_id', 'parameter');
  }

  const usersDb = await getUsersDb();
  const userId = itemToObjectId(user_id);

  const { connections } =
    (await usersDb.findOne<Pick<InternalUser, 'connections'>>(
      { _id: userId },
      { projection: { connections: true } }
    )) || toss(new ItemNotFoundError(user_id, 'user'));

  return connections.map((connection) => connection.toString());
}

export async function createUser({
  data,
  allowFullName,
  __provenance
}: {
  data: LiteralUnknownUnion<NewUser>;
  allowFullName: boolean;
  __provenance: TokenAttributeOwner;
}): Promise<PublicUser> {
  if (typeof __provenance !== 'string') {
    throw new AppValidationError('invalid provenance token attribute owner');
  }

  validateNewUserData(data, { allowFullName });

  const now = Date.now();
  const usersDb = await getUsersDb();
  const { username, email, fullName, key, salt, type } = data;

  const newUser: InternalUser = {
    _id: new ObjectId(),
    __provenance,
    username,
    email,
    fullName,
    type,
    salt: salt.toLowerCase(),
    key: key.toLowerCase(),
    views: 0,
    connections: [],
    createdAt: now,
    updatedAt: now,
    sections: {
      about: null,
      education: [],
      experience: [],
      skills: [],
      volunteering: []
    }
  };

  // TODO: the rest of the below should probably be a transaction

  try {
    await usersDb.insertOne(newUser);
  } catch (error) {
    /* istanbul ignore else */
    if (
      error instanceof MongoServerError &&
      error.code === 11_000 &&
      error.keyPattern?.username !== undefined
    ) {
      throw new ValidationError(ErrorMessage.DuplicateFieldValue('username'));
    } else if (
      error instanceof MongoServerError &&
      error.code === 11_000 &&
      error.keyPattern?.email !== undefined
    ) {
      throw new ValidationError(ErrorMessage.DuplicateFieldValue('email'));
    }

    /* istanbul ignore next */
    throw error;
  }

  await (await getInfoDb()).updateOne({}, { $inc: { users: 1 } });
  return toPublicUser(newUser, 0);
}

export async function createSession({
  data,
  includeArticleInErrorMessage,
  __provenance
}: {
  data: LiteralUnknownUnion<NewSession>;
  includeArticleInErrorMessage: boolean;
  __provenance: TokenAttributeOwner;
}): Promise<SessionId> {
  if (typeof __provenance !== 'string') {
    throw new AppValidationError('invalid provenance token attribute owner');
  }

  validateNewSessionData(data, { includeArticleInErrorMessage });

  const now = Date.now();
  const sessionDb = await getSessionsDb();
  const { user_id, view, viewed_id } = data;

  const userId = user_id !== null ? itemToObjectId(user_id) : null;
  const viewedId = viewed_id !== null ? itemToObjectId(viewed_id) : null;

  const newSession: InternalSession = {
    _id: new ObjectId(),
    __provenance,
    createdAt: now,
    updatedAt: now,
    user_id: userId,
    view,
    viewed_id: viewedId,
    // ? Using Date.now ensures we pick up Date mocking when testing
    lastRenewedDate: new Date(now)
  };

  await sessionDb.insertOne(newSession);
  return newSession._id;
}

export async function createOpportunity({
  data,
  __provenance
}: {
  data: LiteralUnknownUnion<NewOpportunity>;
  __provenance: TokenAttributeOwner;
}): Promise<PublicOpportunity> {
  if (typeof __provenance !== 'string') {
    throw new AppValidationError('invalid provenance token attribute owner');
  }

  validateNewOpportunityData(data);

  const now = Date.now();
  const opportunitiesDb = await getOpportunitiesDb();
  const infoDb = await getInfoDb();
  const { contents, creator_id, title } = data;

  const newOpportunity: InternalOpportunity = {
    _id: new ObjectId(),
    __provenance,
    contents,
    creator_id: itemToObjectId(creator_id),
    title,
    views: 0,
    createdAt: now,
    updatedAt: now
  };

  // TODO: the rest of the below should probably be a transaction
  await opportunitiesDb.insertOne(newOpportunity);
  await infoDb.updateOne({}, { $inc: { opportunities: 1 } });

  return toPublicOpportunity(newOpportunity, 0);
}

export async function createArticle({
  data,
  __provenance
}: {
  data: LiteralUnknownUnion<NewArticle>;
  __provenance: TokenAttributeOwner;
}): Promise<PublicArticle> {
  if (typeof __provenance !== 'string') {
    throw new AppValidationError('invalid provenance token attribute owner');
  }

  validateNewArticleData(data);

  const now = Date.now();
  const articlesDb = await getArticlesDb();
  const infoDb = await getInfoDb();
  const { contents, creator_id, keywords, title } = data;

  const newArticle: InternalArticle = {
    _id: new ObjectId(),
    __provenance,
    contents,
    creator_id: itemToObjectId(creator_id),
    keywords: Array.from(new Set(keywords.map((s) => s.toLowerCase()))),
    title,
    views: 0,
    createdAt: now,
    updatedAt: now
  };

  // TODO: the rest of the below should probably be a transaction
  await articlesDb.insertOne(newArticle);
  await infoDb.updateOne({}, { $inc: { articles: 1 } });

  return toPublicArticle(newArticle, 0);
}

export async function createUserConnection({
  user_id,
  connection_id
}: {
  user_id: string | undefined;
  connection_id: string | undefined;
}): Promise<void> {
  if (!user_id) {
    throw new InvalidItemError('user_id', 'parameter');
  }

  if (!connection_id) {
    throw new InvalidItemError('connection_id', 'parameter');
  }

  const userId = itemToObjectId(user_id);
  const connectionId = itemToObjectId(connection_id);

  if (userId.equals(connectionId)) {
    throw new ValidationError(ErrorMessage.IllegalCyclicalConnection());
  }

  const usersDb = await getUsersDb();

  if (!(await itemExists(usersDb, connectionId))) {
    throw new ItemNotFoundError(connection_id, 'connection');
  }

  const now = Date.now();

  // TODO: all of this together is probably better in a transaction
  const [userIdResult] = await Promise.all([
    usersDb.updateOne(
      { _id: userId },
      { $push: { connections: connectionId }, $set: { updatedAt: now } }
    ),
    usersDb.updateOne(
      { _id: connectionId },
      { $push: { connections: userId }, $set: { updatedAt: now } }
    )
  ]);

  if (userIdResult.matchedCount !== 1) {
    throw new ItemNotFoundError(user_id, 'user');
  }

  if (userIdResult.modifiedCount !== 1) {
    throw new ValidationError(ErrorMessage.DuplicateConnection());
  }
}

export async function updateUser({
  user_id,
  allowFullName,
  data
}: {
  user_id: string | undefined;
  allowFullName: boolean;
  data: LiteralUnknownUnion<PatchUser>;
}): Promise<void> {
  if (!user_id) {
    throw new InvalidItemError('user_id', 'parameter');
  }

  validatePatchUserData(data, { allowFullName });

  const usersDb = await getUsersDb();
  const infoDb = await getInfoDb();
  const { email, fullName, key, salt, sections, views } = data;
  const shouldIncrementViews = !!views;

  const sectionUpdates = Object.fromEntries(
    Object.entries(sections || {}).map(([key, value]) => {
      return key === 'skills' && Array.isArray(value)
        ? [
            `sections.${key}`,
            Array.from(new Set(value.map((s) => s.toString().toLowerCase())))
          ]
        : [`sections.${key}`, value];
    })
  );

  try {
    const [result] = await Promise.all([
      usersDb.updateOne(
        { _id: itemToObjectId(user_id) },
        {
          $set: {
            updatedAt: Date.now(),
            ...(email ? { email } : {}),
            ...(fullName ? { fullName } : {}),
            ...(key ? { key: key.toLowerCase() } : {}),
            ...(salt ? { salt: salt.toLowerCase() } : {}),
            ...(shouldIncrementViews ? { $inc: { views: 1 } } : {}),
            ...sectionUpdates
          }
        }
      ),
      shouldIncrementViews
        ? infoDb.updateOne({}, { $inc: { views: 1 } })
        : Promise.resolve()
    ]);

    assert(
      result.matchedCount === 1,
      `expected 1 matched document, ${result.matchedCount} were matched`
    );
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.code === 11_000 &&
      error.keyPattern?.email !== undefined
    ) {
      throw new ValidationError(ErrorMessage.DuplicateFieldValue('email'));
    }

    throw error;
  }
}

export async function renewSession({
  session_id
}: {
  session_id: string | undefined;
}): Promise<void> {
  if (!session_id) {
    throw new InvalidItemError('session_id', 'parameter');
  }

  const sessionDb = await getSessionsDb();
  const updatedAt = Date.now();

  const result = await sessionDb.updateOne(
    { _id: itemToObjectId(session_id) },
    { $set: { lastRenewedDate: new Date(updatedAt), updatedAt } }
  );

  if (result.matchedCount !== 1) {
    throw new ItemNotFoundError(session_id, 'session');
  }
}

export async function updateOpportunity({
  opportunity_id,
  data
}: {
  opportunity_id: string | undefined;
  data: LiteralUnknownUnion<PatchOpportunity>;
}): Promise<void> {
  if (!opportunity_id) {
    throw new InvalidItemError('opportunity_id', 'parameter');
  }

  validatePatchOpportunityData(data);

  const opportunitiesDb = await getOpportunitiesDb();
  const infoDb = await getInfoDb();
  const { contents, title, views } = data;
  const shouldIncrementViews = !!views;

  const [result] = await Promise.all([
    opportunitiesDb.updateOne(
      { _id: itemToObjectId(opportunity_id) },
      {
        $set: {
          updateAt: Date.now(),
          ...(contents ? { contents } : {}),
          ...(title ? { title } : {}),
          ...(shouldIncrementViews ? { $inc: { views: 1 } } : {})
        }
      }
    ),
    shouldIncrementViews
      ? infoDb.updateOne({}, { $inc: { views: 1 } })
      : Promise.resolve()
  ]);

  assert(
    result.matchedCount === 1,
    `expected 1 matched document, ${result.matchedCount} were matched`
  );
}

export async function updateArticle({
  article_id,
  data
}: {
  article_id: string | undefined;
  data: LiteralUnknownUnion<PatchArticle>;
}): Promise<void> {
  if (!article_id) {
    throw new InvalidItemError('article_id', 'parameter');
  }

  validatePatchArticleData(data);

  // TODO: also +1 to views if necessary
  // TODO: keywords need to be deduplicated and lowercased

  const articlesDb = await getArticlesDb();
  const infoDb = await getInfoDb();
  const { contents, title, keywords, views } = data;
  const shouldIncrementViews = !!views;

  const [result] = await Promise.all([
    articlesDb.updateOne(
      { _id: itemToObjectId(article_id) },
      {
        $set: {
          updateAt: Date.now(),
          ...(contents ? { contents } : {}),
          ...(title ? { title } : {}),
          ...(keywords
            ? { keywords: Array.from(new Set(keywords.map((s) => s.toLowerCase()))) }
            : {}),
          ...(shouldIncrementViews ? { $inc: { views: 1 } } : {})
        }
      }
    ),
    shouldIncrementViews
      ? infoDb.updateOne({}, { $inc: { views: 1 } })
      : Promise.resolve()
  ]);

  assert(
    result.matchedCount === 1,
    `expected 1 matched document, ${result.matchedCount} were matched`
  );
}

export async function deleteUser({
  user_id
}: {
  user_id: string | undefined;
}): Promise<void> {
  if (!user_id) {
    throw new InvalidItemError('user_id', 'parameter');
  }

  const userId = itemToObjectId(user_id);
  const [usersDb, articlesDb, infoDb] = await Promise.all([
    getUsersDb(),
    getArticlesDb(),
    getInfoDb()
  ]);

  // TODO: this (and code like it elsewhere) should be within a transaction
  const [deleteUsersCount] = await Promise.all([
    usersDb.deleteOne({ _id: userId }).then(async ({ deletedCount }) => {
      await infoDb.updateOne({}, { $inc: { users: -1 } });
      return deletedCount;
    }),
    articlesDb.deleteMany({ creator_id: userId }).then(({ deletedCount }) => {
      if (deletedCount) {
        return infoDb.updateOne({}, { $inc: { articles: -1 * deletedCount } });
      }
    })
  ]);

  if (deleteUsersCount !== 1) {
    throw new ItemNotFoundError(user_id, 'user');
  }
}

export async function deleteSession({
  session_id
}: {
  session_id: string | undefined;
}): Promise<void> {
  if (!session_id) {
    throw new InvalidItemError('session_id', 'parameter');
  }

  const sessionDb = await getSessionsDb();
  const { deletedCount } = await sessionDb.deleteOne({
    _id: itemToObjectId(session_id)
  });

  if (deletedCount !== 1) {
    throw new ItemNotFoundError(session_id, 'session');
  }
}

export async function deleteOpportunity({
  opportunity_id
}: {
  opportunity_id: string | undefined;
}): Promise<void> {
  if (!opportunity_id) {
    throw new InvalidItemError('opportunity_id', 'parameter');
  }

  const opportunitiesDb = await getOpportunitiesDb();
  const infoDb = await getInfoDb();

  // TODO: this (and code like it elsewhere) should be within a transaction
  const deletedCount = await opportunitiesDb
    .deleteOne({ _id: itemToObjectId(opportunity_id) })
    .then(async ({ deletedCount }) => {
      await infoDb.updateOne({}, { $inc: { opportunities: -1 } });
      return deletedCount;
    });

  if (deletedCount !== 1) {
    throw new ItemNotFoundError(opportunity_id, 'opportunity');
  }
}

export async function deleteArticle({
  article_id
}: {
  article_id: string | undefined;
}): Promise<void> {
  if (!article_id) {
    throw new InvalidItemError('article_id', 'parameter');
  }

  const articlesDb = await getArticlesDb();
  const infoDb = await getInfoDb();

  // TODO: this (and code like it elsewhere) should be within a transaction
  const deletedCount = await articlesDb
    .deleteOne({ _id: itemToObjectId(article_id) })
    .then(async ({ deletedCount }) => {
      await infoDb.updateOne({}, { $inc: { articles: -1 } });
      return deletedCount;
    });

  if (deletedCount !== 1) {
    throw new ItemNotFoundError(article_id, 'article');
  }
}

export async function deleteUserConnection({
  user_id,
  connection_id
}: {
  user_id: string | undefined;
  connection_id: string | undefined;
}): Promise<void> {
  if (!user_id) {
    throw new InvalidItemError('user_id', 'parameter');
  }

  if (!connection_id) {
    throw new InvalidItemError('connection_id', 'parameter');
  }

  const now = Date.now();
  const userId = itemToObjectId(user_id);
  const connectionId = itemToObjectId(connection_id);
  const usersDb = await getUsersDb();

  // TODO: all of this together is probably better in a transaction
  const [userIdResult] = await Promise.all([
    usersDb.updateOne(
      { _id: userId },
      { $pull: { connections: connectionId }, $set: { updatedAt: now } }
    ),
    usersDb.updateOne(
      { _id: connectionId },
      { $pull: { connections: userId }, $set: { updatedAt: now } }
    )
  ]);

  if (userIdResult.matchedCount !== 1) {
    throw new ItemNotFoundError(user_id, 'user');
  }

  if (userIdResult.modifiedCount !== 1) {
    throw new ValidationError(ErrorMessage.NotConnected());
  }
}

export async function authAppUser({
  user_id,
  key
}: {
  user_id: string | undefined;
  key: string | undefined;
}): Promise<boolean> {
  if (!user_id) {
    throw new InvalidItemError('user_id', 'parameter');
  }

  if (!key) {
    throw new InvalidItemError('key', 'parameter');
  }

  const usersDb = await getUsersDb();
  return !!(await usersDb.countDocuments({ _id: itemToObjectId(user_id), key }));
}
