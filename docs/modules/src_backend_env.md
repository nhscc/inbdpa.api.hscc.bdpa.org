[inbdpa.api.hscc.bdpa.org](../README.md) / src/backend/env

# Module: src/backend/env

## Table of contents

### Functions

- [getEnv](src_backend_env.md#getenv)

## Functions

### getEnv

▸ **getEnv**<`T`\>(): { `AUTH_HEADER_MAX_LENGTH`: `number` ; `BAN_HAMMER_DEFAULT_BAN_TIME_MINUTES`: ``null`` \| `number` ; `BAN_HAMMER_MAX_REQUESTS_PER_WINDOW`: ``null`` \| `number` ; `BAN_HAMMER_RECIDIVISM_PUNISH_MULTIPLIER`: ``null`` \| `number` ; `BAN_HAMMER_RESOLUTION_WINDOW_SECONDS`: ``null`` \| `number` ; `BAN_HAMMER_WILL_BE_CALLED_EVERY_SECONDS`: ``null`` \| `number` ; `DEBUG`: ``null`` \| `string` ; `DEBUG_INSPECTING`: `boolean` = !!process.env.VSCODE\_INSPECTOR\_OPTIONS; `DISABLED_API_VERSIONS`: `string`[] ; `DISALLOWED_METHODS`: `string`[] ; `IGNORE_RATE_LIMITS`: `boolean` ; `LOCKOUT_ALL_CLIENTS`: `boolean` ; `MAX_CONTENT_LENGTH_BYTES`: `number` ; `MONGODB_MS_PORT`: ``null`` \| `number` ; `MONGODB_URI`: `string` ; `NODE_ENV`: `string` ; `OVERRIDE_EXPECT_ENV`: `OverrideEnvExpect` ; `PRUNE_DATA_MAX_BANNED_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_LOGS_BYTES`: ``null`` \| `number` ; `REQUESTS_PER_CONTRIVED_ERROR`: `number` ; `RESULTS_PER_PAGE`: `number`  } & { `MAX_BLOG_NAME_LENGTH`: `number` ; `MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES`: `number` ; `MAX_BLOG_PAGE_NAME_LENGTH`: `number` ; `MAX_NAV_LINK_HREF_LENGTH`: `number` ; `MAX_NAV_LINK_TEXT_LENGTH`: `number` ; `MAX_PARAMS_PER_REQUEST`: `number` ; `MAX_USER_BLOG_PAGES`: `number` ; `MAX_USER_EMAIL_LENGTH`: `number` ; `MAX_USER_NAME_LENGTH`: `number` ; `MIN_USER_EMAIL_LENGTH`: `number` ; `MIN_USER_NAME_LENGTH`: `number` ; `PRUNE_DATA_MAX_PAGES_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_SESSIONS_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_USERS_BYTES`: ``null`` \| `number` ; `SESSION_EXPIRE_AFTER_SECONDS`: `number` ; `USER_KEY_LENGTH`: `number` ; `USER_SALT_LENGTH`: `number`  } & `T`

Returns an object representing the application's runtime environment.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Environment`](lib_next_env.md#environment) = [`Environment`](lib_next_env.md#environment) |

#### Returns

{ `AUTH_HEADER_MAX_LENGTH`: `number` ; `BAN_HAMMER_DEFAULT_BAN_TIME_MINUTES`: ``null`` \| `number` ; `BAN_HAMMER_MAX_REQUESTS_PER_WINDOW`: ``null`` \| `number` ; `BAN_HAMMER_RECIDIVISM_PUNISH_MULTIPLIER`: ``null`` \| `number` ; `BAN_HAMMER_RESOLUTION_WINDOW_SECONDS`: ``null`` \| `number` ; `BAN_HAMMER_WILL_BE_CALLED_EVERY_SECONDS`: ``null`` \| `number` ; `DEBUG`: ``null`` \| `string` ; `DEBUG_INSPECTING`: `boolean` = !!process.env.VSCODE\_INSPECTOR\_OPTIONS; `DISABLED_API_VERSIONS`: `string`[] ; `DISALLOWED_METHODS`: `string`[] ; `IGNORE_RATE_LIMITS`: `boolean` ; `LOCKOUT_ALL_CLIENTS`: `boolean` ; `MAX_CONTENT_LENGTH_BYTES`: `number` ; `MONGODB_MS_PORT`: ``null`` \| `number` ; `MONGODB_URI`: `string` ; `NODE_ENV`: `string` ; `OVERRIDE_EXPECT_ENV`: `OverrideEnvExpect` ; `PRUNE_DATA_MAX_BANNED_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_LOGS_BYTES`: ``null`` \| `number` ; `REQUESTS_PER_CONTRIVED_ERROR`: `number` ; `RESULTS_PER_PAGE`: `number`  } & { `MAX_BLOG_NAME_LENGTH`: `number` ; `MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES`: `number` ; `MAX_BLOG_PAGE_NAME_LENGTH`: `number` ; `MAX_NAV_LINK_HREF_LENGTH`: `number` ; `MAX_NAV_LINK_TEXT_LENGTH`: `number` ; `MAX_PARAMS_PER_REQUEST`: `number` ; `MAX_USER_BLOG_PAGES`: `number` ; `MAX_USER_EMAIL_LENGTH`: `number` ; `MAX_USER_NAME_LENGTH`: `number` ; `MIN_USER_EMAIL_LENGTH`: `number` ; `MIN_USER_NAME_LENGTH`: `number` ; `PRUNE_DATA_MAX_PAGES_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_SESSIONS_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_USERS_BYTES`: ``null`` \| `number` ; `SESSION_EXPIRE_AFTER_SECONDS`: `number` ; `USER_KEY_LENGTH`: `number` ; `USER_SALT_LENGTH`: `number`  } & `T`

#### Defined in

[src/backend/env.ts:14](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/env.ts#L14)
