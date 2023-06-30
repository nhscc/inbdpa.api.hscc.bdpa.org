import { parse as parseAsBytes } from 'bytes';
import { getEnv as getDefaultEnv } from 'multiverse/next-env';
import { InvalidAppEnvironmentError } from 'universe/error';

import type { Environment } from 'multiverse/next-env';

// TODO: replace validation logic with zod instead (including defaults) and
// TODO: integrate that logic with expect-env (also zod-based)

/**
 * Returns an object representing the application's runtime environment.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getEnv<T extends Environment = Environment>() {
  const env = getDefaultEnv({
    MAX_PARAMS_PER_REQUEST: Number(process.env.MAX_PARAMS_PER_REQUEST) || 100,
    MIN_USER_NAME_LENGTH: Number(process.env.MIN_USER_NAME_LENGTH) || 4,
    MAX_USER_NAME_LENGTH: Number(process.env.MAX_USER_NAME_LENGTH) || 16,
    MIN_USER_EMAIL_LENGTH: Number(process.env.MIN_USER_EMAIL_LENGTH) || 4,
    MAX_USER_EMAIL_LENGTH: Number(process.env.MAX_USER_EMAIL_LENGTH) || 75,
    USER_SALT_LENGTH: Number(process.env.USER_SALT_LENGTH) || 32,
    USER_KEY_LENGTH: Number(process.env.USER_KEY_LENGTH) || 128,

    MAX_SECTION_TITLE_LENGTH: Number(process.env.MAX_SECTION_TITLE_LENGTH) || 100,
    MAX_SECTION_LOCATION_LENGTH:
      Number(process.env.MAX_SECTION_LOCATION_LENGTH) || 100,
    MAX_SECTION_DESCRIPTION_LENGTH:
      Number(process.env.MAX_SECTION_DESCRIPTION_LENGTH) || 250,
    MAX_OPPORTUNITY_TITLE_LENGTH:
      Number(process.env.MAX_OPPORTUNITY_TITLE_LENGTH) || 100,
    MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES:
      parseAsBytes(
        process.env.MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES ?? '-Infinity'
      ) || 3072,
    MAX_ABOUT_SECTION_LENGTH_BYTES:
      parseAsBytes(process.env.MAX_ABOUT_SECTION_LENGTH_BYTES ?? '-Infinity') || 1024,
    MAX_USER_SECTION_ITEMS: Number(process.env.MAX_USER_SECTION_ITEMS) || 10,
    MAX_ARTICLE_KEYWORDS: Number(process.env.MAX_ARTICLE_KEYWORDS) || 10,
    MAX_ARTICLE_KEYWORD_LENGTH: Number(process.env.MAX_ARTICLE_KEYWORD_LENGTH) || 20,
    SESSION_EXPIRE_AFTER_SECONDS:
      Number(process.env.SESSION_EXPIRE_AFTER_SECONDS) || 30,

    PRUNE_DATA_MAX_ARTICLES_BYTES:
      parseAsBytes(process.env.PRUNE_DATA_MAX_ARTICLES_BYTES ?? '-Infinity') || null,
    PRUNE_DATA_MAX_OPPORTUNITIES_BYTES:
      parseAsBytes(process.env.PRUNE_DATA_MAX_OPPORTUNITIES_BYTES ?? '-Infinity') ||
      null,
    PRUNE_DATA_MAX_SESSIONS_BYTES:
      parseAsBytes(process.env.PRUNE_DATA_MAX_SESSIONS_BYTES ?? '-Infinity') || null,
    PRUNE_DATA_MAX_USERS_BYTES:
      parseAsBytes(process.env.PRUNE_DATA_MAX_USERS_BYTES ?? '-Infinity') || null
  });

  // TODO: retire all of the following logic when expect-env is created. Also,
  // TODO: expect-env should have the ability to skip runs on certain NODE_ENV
  // TODO: unless OVERRIDE_EXPECT_ENV is properly defined.
  /* istanbul ignore next */
  if (
    (env.NODE_ENV != 'test' && env.OVERRIDE_EXPECT_ENV != 'force-no-check') ||
    env.OVERRIDE_EXPECT_ENV == 'force-check'
  ) {
    const errors: string[] = [];

    (
      [
        'MAX_PARAMS_PER_REQUEST',
        'MIN_USER_NAME_LENGTH',
        'MAX_USER_NAME_LENGTH',
        'MIN_USER_EMAIL_LENGTH',
        'MAX_USER_EMAIL_LENGTH',
        'USER_SALT_LENGTH',
        'USER_KEY_LENGTH',

        'MAX_SECTION_TITLE_LENGTH',
        'MAX_SECTION_LOCATION_LENGTH',
        'MAX_SECTION_DESCRIPTION_LENGTH',
        'MAX_OPPORTUNITY_TITLE_LENGTH',
        'MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES',
        'MAX_ABOUT_SECTION_LENGTH_BYTES',
        'MAX_USER_SECTION_ITEMS',
        'SESSION_EXPIRE_AFTER_SECONDS'
      ] as (keyof typeof env)[]
    ).forEach((name) => {
      const value = env[name];
      if (!value || (Number.isInteger(value) && (value as number) <= 0)) {
        errors.push(
          `bad ${name}, saw "${env[name]}" (expected a non-negative number)`
        );
      }
    });

    if (env.MIN_USER_NAME_LENGTH >= env.MAX_USER_NAME_LENGTH) {
      errors.push(
        'MIN_USER_NAME_LENGTH must be strictly less than MAX_USER_NAME_LENGTH'
      );
    }

    if (env.MIN_USER_EMAIL_LENGTH >= env.MAX_USER_EMAIL_LENGTH) {
      errors.push(
        'MIN_USER_EMAIL_LENGTH must be strictly less than MAX_USER_EMAIL_LENGTH'
      );
    }

    // TODO: make it easier to reuse error code from getDefaultEnv. Or is it
    // TODO: obsoleted by expect-env package? Either way, factor this logic out!
    if (errors.length) {
      throw new InvalidAppEnvironmentError(
        `bad variables:\n - ${errors.join('\n - ')}`
      );
    }
  }

  return env as typeof env & T;
}
