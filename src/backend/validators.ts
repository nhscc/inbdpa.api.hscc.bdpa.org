import { getEnv } from 'universe/backend/env';
import { ErrorMessage, ValidationError } from 'universe/error';
import { isPlainObject } from 'multiverse/is-plain-object';

import {
  type Username,
  type NewUser,
  type PatchUser,
  type NewArticle,
  type PatchArticle,
  type NewSession,
  type NewOpportunity,
  type PatchOpportunity,
  type UserType,
  type SessionView,
  userTypes,
  sessionViews
} from 'universe/backend/db';

/**
 * Regular expression used to validate email addresses.
 */
export const emailRegex = /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i;

/**
 * Regular expression used to validate usernames.
 */
export const usernameRegex = /^[\d_a-z-]+$/;

/**
 * Regular expression used to validate alphanumerical constraints.
 */
export const alphanumericRegex = /^[\w-]+$/i;

/**
 * Regular expression used to validate alphanumerical constraints plus the plus
 * sign (+).
 */
export const alphanumericRegexPlus = /^[\w-+]+$/i;

/**
 * Regular expression used to validate hexadecimal constraints.
 */
export const hexadecimalRegex = /^[\dA-Fa-f]+$/;

/**
 * Validate a username string for correctness.
 */
export function isValidUsername(username: unknown): username is Username {
  return (
    typeof username === 'string' &&
    usernameRegex.test(username) &&
    username.length >= getEnv().MIN_USER_NAME_LENGTH &&
    username.length <= getEnv().MAX_USER_NAME_LENGTH
  );
}

/**
 * Assert that `data` is of type {@link NewUser}.
 */
export function validateNewUserData(
  data: unknown,
  { allowFullName }: { allowFullName: boolean }
): asserts data is Pick<
  NewUser,
  'username' | 'email' | 'key' | 'salt' | 'fullName' | 'type'
> {
  validateGenericUserData(data, { isPatchData: false, allowFullName });

  const { MAX_USER_NAME_LENGTH, MIN_USER_NAME_LENGTH } = getEnv();

  if (!('username' in data) || !isValidUsername(data.username)) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, username, key, salt, type, fullName, ...rest } = data;
  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }
}

/**
 * Assert that `data` is of type {@link PatchUser}.
 */
export function validatePatchUserData(
  data: unknown,
  { allowFullName }: { allowFullName: boolean }
): asserts data is Pick<
  PatchUser,
  'email' | 'fullName' | 'key' | 'salt' | 'sections' | 'views'
> {
  validateGenericUserData(data, { isPatchData: true, allowFullName });

  if ('sections' in data) {
    if (!isPlainObject(data.sections)) {
      throw new ValidationError(ErrorMessage.InvalidFieldValue('sections'));
    }

    const { sections } = data;

    const {
      MAX_USER_ABOUT_SECTION_LENGTH_BYTES,
      MAX_USER_ABOUT_SECTION_SKILLS,
      MAX_USER_ABOUT_SECTION_SKILL_LENGTH
    } = getEnv();

    if (
      'about' in sections &&
      sections.about !== null &&
      (typeof sections.about !== 'string' ||
        sections.about.length < 1 ||
        sections.about.length > MAX_USER_ABOUT_SECTION_LENGTH_BYTES)
    ) {
      throw new ValidationError(
        ErrorMessage.InvalidStringLength(
          'sections.about',
          0,
          MAX_USER_ABOUT_SECTION_LENGTH_BYTES,
          'bytes'
        )
      );
    }

    validateGenericUserSectionArray('experience', sections);
    validateGenericUserSectionArray('education', sections);
    validateGenericUserSectionArray('volunteering', sections);

    if ('skills' in sections) {
      if (!Array.isArray(sections.skills)) {
        throw new ValidationError(ErrorMessage.InvalidFieldValue('skills'));
      }

      if (sections.skills.length > MAX_USER_ABOUT_SECTION_SKILLS) {
        throw new ValidationError(
          ErrorMessage.TooMany('keywords', MAX_USER_ABOUT_SECTION_SKILLS)
        );
      }

      for (const [index, skill] of sections.skills.entries()) {
        if (
          typeof skill !== 'string' ||
          skill.length < 1 ||
          skill.length > MAX_USER_ABOUT_SECTION_SKILL_LENGTH ||
          alphanumericRegexPlus.test(skill)
        ) {
          throw new ValidationError(
            ErrorMessage.InvalidArrayValue('sections.skills', skill, index)
          );
        }
      }
    }
  }

  if ('views' in data && data.views !== 'increment') {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue('views', undefined, ['increment'])
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, fullName, key, salt, sections, views, ...rest } =
    data as typeof data & {
      sections?: PatchUser['sections'];
      views?: PatchUser['views'];
    };

  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }

  // ? Key update requires salt update and vice-versa
  if (!!key !== !!salt) {
    const { USER_SALT_LENGTH, USER_KEY_LENGTH } = getEnv();
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        !!key ? 'salt' : 'key',
        !!key ? USER_SALT_LENGTH : USER_KEY_LENGTH,
        null,
        'hexadecimal'
      )
    );
  }
}

/**
 * Assert that `data` is of type {@link NewSession}.
 */
export function validateNewSessionData(
  data: unknown,
  { includeArticleInErrorMessage }: { includeArticleInErrorMessage: boolean }
): asserts data is Pick<NewSession, 'user_id' | 'view' | 'viewed_id'> {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  if (
    data.user_id !== undefined &&
    data.user_id !== null &&
    typeof data.user_id !== 'string'
  ) {
    throw new ValidationError(ErrorMessage.InvalidFieldValue('user_id'));
  }

  if (
    data.viewed_id !== undefined &&
    data.viewed_id !== null &&
    typeof data.viewed_id !== 'string'
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue('viewed_id', undefined, [
        'a user_id',
        'a opportunity_id',
        ...(includeArticleInErrorMessage ? ['an article_id'] : [])
      ])
    );
  }

  if (
    data.view === undefined ||
    typeof data.view !== 'string' ||
    !sessionViews.includes(data.view as SessionView)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue(
        'view',
        undefined,
        sessionViews.filter(
          (view) => includeArticleInErrorMessage || view !== 'article'
        )
      )
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id, view, viewed_id, ...rest } = data;
  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }
}

/**
 * Assert that `data` is of type {@link NewOpportunity}.
 */
export function validateNewOpportunityData(
  data: unknown
): asserts data is Pick<NewOpportunity, 'contents' | 'creator_id' | 'title'> {
  validateGenericOpportunityData(data, { isPatchData: false });

  if (!('creator_id' in data) || typeof data.creator_id !== 'string') {
    throw new ValidationError(ErrorMessage.InvalidFieldValue('creator_id'));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contents, creator_id, title, ...rest } = data;
  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }
}

/**
 * Assert that `data` is of type {@link PatchOpportunity}.
 */
export function validatePatchOpportunityData(
  data: unknown
): asserts data is Pick<PatchOpportunity, 'contents' | 'title' | 'views'> {
  validateGenericOpportunityData(data, { isPatchData: true });

  if ('views' in data && data.views !== 'increment') {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue('views', undefined, ['increment'])
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contents, title, views, ...rest } = data as typeof data & {
    views?: PatchOpportunity['views'];
  };

  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }
}

/**
 * Assert that `data` is of type {@link NewArticle}.
 */
export function validateNewArticleData(
  data: unknown
): asserts data is Pick<
  NewArticle,
  'contents' | 'creator_id' | 'keywords' | 'title'
> {
  validateGenericArticleData(data, { isPatchData: false });

  if (!('creator_id' in data) || typeof data.creator_id !== 'string') {
    throw new ValidationError(ErrorMessage.InvalidFieldValue('creator_id'));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contents, creator_id, keywords, title, ...rest } = data;
  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }
}

/**
 * Assert that `data` is of type {@link PatchArticle}.
 */
export function validatePatchArticleData(
  data: unknown
): asserts data is Pick<PatchArticle, 'contents' | 'keywords' | 'title' | 'views'> {
  validateGenericArticleData(data, { isPatchData: true });

  if ('views' in data && data.views !== 'increment') {
    throw new ValidationError(
      ErrorMessage.InvalidFieldValue('views', undefined, ['increment'])
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contents, keywords, title, views, ...rest } = data as typeof data & {
    views?: PatchArticle['views'];
  };

  const restKeys = Object.keys(rest);

  if (restKeys.length !== 0) {
    throw new ValidationError(ErrorMessage.UnknownField(restKeys[0]));
  }
}

// **                             **
// ** Generic validator functions **
// **                             **

function validateGenericUserData(
  data: unknown,
  { isPatchData, allowFullName }: { isPatchData: false; allowFullName: boolean }
): asserts data is Pick<NewUser, 'email' | 'salt' | 'key' | 'fullName'>;
function validateGenericUserData(
  data: unknown,
  { isPatchData, allowFullName }: { isPatchData: true; allowFullName: boolean }
): asserts data is Pick<PatchUser, 'email' | 'salt' | 'key' | 'fullName'>;
function validateGenericUserData(
  data: unknown,
  {
    isPatchData,
    allowFullName: allowFullName
  }: { isPatchData: boolean; allowFullName: boolean }
): void {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  const {
    USER_KEY_LENGTH,
    USER_SALT_LENGTH,
    MIN_USER_EMAIL_LENGTH,
    MAX_USER_EMAIL_LENGTH,
    MAX_USER_FULLNAME_LENGTH
  } = getEnv();

  if (
    (!isPatchData || (isPatchData && data.email !== undefined)) &&
    (typeof data.email !== 'string' ||
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
    (!isPatchData || (isPatchData && data.salt !== undefined)) &&
    (typeof data.salt !== 'string' ||
      !hexadecimalRegex.test(data.salt) ||
      data.salt.length !== USER_SALT_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength('salt', USER_SALT_LENGTH, null, 'hexadecimal')
    );
  }

  if (
    (!isPatchData || (isPatchData && data.key !== undefined)) &&
    (typeof data.key !== 'string' ||
      !hexadecimalRegex.test(data.key) ||
      data.key.length !== USER_KEY_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength('key', USER_KEY_LENGTH, null, 'hexadecimal')
    );
  }

  if (
    (!isPatchData || (isPatchData && data.fullName !== undefined)) &&
    ((!allowFullName && data.fullName !== null) ||
      (allowFullName &&
        (typeof data.fullName !== 'string' ||
          !alphanumericRegex.test(data.fullName) ||
          data.fullName.length < 1 ||
          data.fullName.length > MAX_USER_FULLNAME_LENGTH)))
  ) {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (allowFullName) {
      throw new ValidationError(
        ErrorMessage.InvalidStringLength(
          'fullName',
          1,
          MAX_USER_FULLNAME_LENGTH,
          'alphanumeric'
        )
      );
    } else {
      throw new ValidationError(ErrorMessage.UnknownField('fullName'));
    }
  }
}

function validateGenericOpportunityData(
  data: unknown,
  { isPatchData }: { isPatchData: false }
): asserts data is Pick<NewOpportunity, 'contents' | 'title'>;
function validateGenericOpportunityData(
  data: unknown,
  { isPatchData }: { isPatchData: true }
): asserts data is Pick<PatchOpportunity, 'contents' | 'title'>;
function validateGenericOpportunityData(
  data: unknown,
  { isPatchData }: { isPatchData: boolean }
): void {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  const { MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES, MAX_OPPORTUNITY_TITLE_LENGTH } =
    getEnv();

  if (
    (!isPatchData || (isPatchData && data.contents !== undefined)) &&
    (typeof data.contents !== 'string' ||
      data.contents.length > MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'contents',
        0,
        MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES,
        'bytes'
      )
    );
  }

  if (
    (!isPatchData || (isPatchData && data.title !== undefined)) &&
    (typeof data.title !== 'string' ||
      data.title.length < 1 ||
      data.title.length > MAX_OPPORTUNITY_TITLE_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'title',
        1,
        MAX_OPPORTUNITY_TITLE_LENGTH,
        'string'
      )
    );
  }
}

function validateGenericArticleData(
  data: unknown,
  { isPatchData }: { isPatchData: false }
): asserts data is Pick<NewArticle, 'contents' | 'keywords' | 'title'>;
function validateGenericArticleData(
  data: unknown,
  { isPatchData }: { isPatchData: true }
): asserts data is Pick<PatchArticle, 'contents' | 'keywords' | 'title'>;
function validateGenericArticleData(
  data: unknown,
  { isPatchData }: { isPatchData: boolean }
): void {
  if (!isPlainObject(data)) {
    throw new ValidationError(ErrorMessage.InvalidJSON());
  }

  const {
    MAX_ARTICLE_CONTENTS_LENGTH_BYTES,
    MAX_ARTICLE_TITLE_LENGTH,
    MAX_ARTICLE_KEYWORDS,
    MAX_ARTICLE_KEYWORD_LENGTH
  } = getEnv();

  if (
    (!isPatchData || (isPatchData && data.contents !== undefined)) &&
    (typeof data.contents !== 'string' ||
      data.contents.length > MAX_ARTICLE_CONTENTS_LENGTH_BYTES)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength(
        'contents',
        0,
        MAX_ARTICLE_CONTENTS_LENGTH_BYTES,
        'bytes'
      )
    );
  }

  if (!isPatchData || (isPatchData && data.keywords !== undefined)) {
    if (!Array.isArray(data.keywords)) {
      throw new ValidationError(ErrorMessage.InvalidFieldValue('keywords'));
    }

    if (data.keywords.length > MAX_ARTICLE_KEYWORDS) {
      throw new ValidationError(
        ErrorMessage.TooMany('keywords', MAX_ARTICLE_KEYWORDS)
      );
    }

    for (const [index, keyword] of data.keywords.entries()) {
      if (
        typeof keyword !== 'string' ||
        keyword.length < 1 ||
        keyword.length > MAX_ARTICLE_KEYWORD_LENGTH ||
        alphanumericRegex.test(keyword)
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidArrayValue('keywords', keyword, index)
        );
      }
    }
  }

  if (
    (!isPatchData || (isPatchData && data.title !== undefined)) &&
    (typeof data.title !== 'string' ||
      data.title.length < 1 ||
      data.title.length > MAX_ARTICLE_TITLE_LENGTH)
  ) {
    throw new ValidationError(
      ErrorMessage.InvalidStringLength('title', 1, MAX_ARTICLE_TITLE_LENGTH, 'string')
    );
  }
}

function validateGenericUserSectionArray(
  key: 'experience' | 'education' | 'volunteering',
  sections: Record<string, unknown>
) {
  const {
    MAX_USER_SECTION_ITEMS,
    MAX_SECTION_DESCRIPTION_LENGTH,
    MAX_SECTION_LOCATION_LENGTH,
    MAX_SECTION_TITLE_LENGTH
  } = getEnv();

  if (key in sections) {
    const section = sections[key];

    if (!Array.isArray(section)) {
      throw new ValidationError(ErrorMessage.InvalidFieldValue(`sections.${key}`));
    }

    if (section.length > MAX_USER_SECTION_ITEMS) {
      throw new ValidationError(
        ErrorMessage.TooMany(`sections.${key} items`, MAX_USER_SECTION_ITEMS)
      );
    }

    for (const [index, item] of section.entries()) {
      if (!isPlainObject(item)) {
        throw new ValidationError(
          ErrorMessage.InvalidArrayValue(`sections.${key}`, undefined, index)
        );
      }

      if (
        !('title' in item) ||
        typeof item.title !== 'string' ||
        item.title.length < 1 ||
        item.title.length > MAX_SECTION_TITLE_LENGTH
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidStringLength(
            `sections.${key}[${index}].title`,
            1,
            MAX_SECTION_TITLE_LENGTH,
            'string'
          )
        );
      }

      if (
        !('startedAt' in item) ||
        typeof item.startedAt !== 'number' ||
        !Number.isSafeInteger(item.startedAt) ||
        item.startedAt < 1
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidNumberValue(
            `sections${key}[${index}].startedAt`,
            1,
            Number.MAX_SAFE_INTEGER,
            'integer'
          )
        );
      }

      if (
        !('endedAt' in item) ||
        typeof item.endedAt !== 'number' ||
        !Number.isSafeInteger(item.endedAt) ||
        item.endedAt < item.startedAt
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidStringLength(
            `sections${key}[${index}].endedAt`,
            item.startedAt,
            Number.MAX_SAFE_INTEGER,
            'integer',
            true
          )
        );
      }

      if (
        !('location' in item) ||
        typeof item.location !== 'string' ||
        item.location.length < 1 ||
        item.location.length > MAX_SECTION_LOCATION_LENGTH
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidStringLength(
            `sections${key}[${index}].location`,
            1,
            MAX_SECTION_LOCATION_LENGTH,
            'string'
          )
        );
      }

      if (
        !('description' in item) ||
        typeof item.description !== 'string' ||
        item.description.length < 1 ||
        item.description.length > MAX_SECTION_DESCRIPTION_LENGTH
      ) {
        throw new ValidationError(
          ErrorMessage.InvalidStringLength(
            `sections${key}[${index}].description`,
            1,
            MAX_SECTION_DESCRIPTION_LENGTH,
            'string'
          )
        );
      }
    }
  }
}
