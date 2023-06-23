// * Hard-coded constants
export function getConfig() {
  return {
    /**
     * Used as the MongoDb query resultset limit. The API will never return
     * more JSON objects than this number.
     *
     * If this number is not positive, behavior is undefined.
     */
    resultsPerPage: 100
  };
}

// * Well-known tokens

/**
 * This string is guaranteed never to appear in data generated during tests or
 * in production. Hence, this string can be used to represent a `null` or
 * non-existent token. This string cannot be used for authenticated HTTP access
 * to the API.
 */
export const NULL_BEARER_TOKEN = '00000000-0000-0000-0000-000000000000';

/**
 * This string allows authenticated API access only when running in a test
 * environment (i.e. `NODE_ENV=test`). This string cannot be used for
 * authenticated HTTP access to the API in production.
 */
export const DUMMY_BEARER_TOKEN = '12349b61-83a7-4036-b060-213784b491';

/**
 * This string is guaranteed to be rate limited when running in a test
 * environment (i.e. `NODE_ENV=test`). This string cannot be used for
 * authenticated HTTP access to the API in production.
 */
export const BANNED_BEARER_TOKEN = 'banned-h54e-6rt7-gctfh-hrftdygct0';

/**
 * This string can be used to authenticate with local and _non-web-facing_ test
 * and preview deployments as a global administrator. This string cannot be used
 * for authenticated HTTP access to the API in production.
 */
export const DEV_BEARER_TOKEN = 'dev-xunn-dev-294a-536h-9751-rydmj';
