[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-env

# Module: lib/next-env

## Table of contents

### Type Aliases

- [Environment](lib_next_env.md#environment)

### Functions

- [envToArray](lib_next_env.md#envtoarray)
- [getEnv](lib_next_env.md#getenv)

## Type Aliases

### Environment

Ƭ **Environment**: `Record`<`string`, `Primitive` \| `Primitive`[]\>

#### Defined in

[lib/next-env/index.ts:30](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-env/index.ts#L30)

## Functions

### envToArray

▸ **envToArray**(`envVal`): `string`[]

This method takes an environment variable value (string), removes illegal
characters, and then splits the string by its commas, returning the resulting
array with all nullish members filtered out.

#### Parameters

| Name | Type |
| :------ | :------ |
| `envVal` | `string` |

#### Returns

`string`[]

#### Defined in

[lib/next-env/index.ts:23](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-env/index.ts#L23)

___

### getEnv

▸ **getEnv**<`T`\>(`customizedEnv?`): { `AUTH_HEADER_MAX_LENGTH`: `number` ; `BAN_HAMMER_DEFAULT_BAN_TIME_MINUTES`: ``null`` \| `number` ; `BAN_HAMMER_MAX_REQUESTS_PER_WINDOW`: ``null`` \| `number` ; `BAN_HAMMER_RECIDIVISM_PUNISH_MULTIPLIER`: ``null`` \| `number` ; `BAN_HAMMER_RESOLUTION_WINDOW_SECONDS`: ``null`` \| `number` ; `BAN_HAMMER_WILL_BE_CALLED_EVERY_SECONDS`: ``null`` \| `number` ; `DEBUG`: ``null`` \| `string` ; `DEBUG_INSPECTING`: `boolean` = !!process.env.VSCODE\_INSPECTOR\_OPTIONS; `DISABLED_API_VERSIONS`: `string`[] ; `DISALLOWED_METHODS`: `string`[] ; `IGNORE_RATE_LIMITS`: `boolean` ; `LOCKOUT_ALL_CLIENTS`: `boolean` ; `MAX_CONTENT_LENGTH_BYTES`: `number` ; `MONGODB_MS_PORT`: ``null`` \| `number` ; `MONGODB_URI`: `string` ; `NODE_ENV`: `string` ; `OVERRIDE_EXPECT_ENV`: `OverrideEnvExpect` ; `PRUNE_DATA_MAX_BANNED_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_LOGS_BYTES`: ``null`` \| `number` ; `REQUESTS_PER_CONTRIVED_ERROR`: `number` ; `RESULTS_PER_PAGE`: `number`  } & `T`

Returns an object representing the current runtime environment.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Environment`](lib_next_env.md#environment) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `customizedEnv?` | `T` |

#### Returns

{ `AUTH_HEADER_MAX_LENGTH`: `number` ; `BAN_HAMMER_DEFAULT_BAN_TIME_MINUTES`: ``null`` \| `number` ; `BAN_HAMMER_MAX_REQUESTS_PER_WINDOW`: ``null`` \| `number` ; `BAN_HAMMER_RECIDIVISM_PUNISH_MULTIPLIER`: ``null`` \| `number` ; `BAN_HAMMER_RESOLUTION_WINDOW_SECONDS`: ``null`` \| `number` ; `BAN_HAMMER_WILL_BE_CALLED_EVERY_SECONDS`: ``null`` \| `number` ; `DEBUG`: ``null`` \| `string` ; `DEBUG_INSPECTING`: `boolean` = !!process.env.VSCODE\_INSPECTOR\_OPTIONS; `DISABLED_API_VERSIONS`: `string`[] ; `DISALLOWED_METHODS`: `string`[] ; `IGNORE_RATE_LIMITS`: `boolean` ; `LOCKOUT_ALL_CLIENTS`: `boolean` ; `MAX_CONTENT_LENGTH_BYTES`: `number` ; `MONGODB_MS_PORT`: ``null`` \| `number` ; `MONGODB_URI`: `string` ; `NODE_ENV`: `string` ; `OVERRIDE_EXPECT_ENV`: `OverrideEnvExpect` ; `PRUNE_DATA_MAX_BANNED_BYTES`: ``null`` \| `number` ; `PRUNE_DATA_MAX_LOGS_BYTES`: ``null`` \| `number` ; `REQUESTS_PER_CONTRIVED_ERROR`: `number` ; `RESULTS_PER_PAGE`: `number`  } & `T`

#### Defined in

[lib/next-env/index.ts:37](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-env/index.ts#L37)
