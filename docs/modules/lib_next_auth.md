[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-auth

# Module: lib/next-auth

## Table of contents

### Type Aliases

- [AuthAttribute](lib_next_auth.md#authattribute)
- [AuthConstraint](lib_next_auth.md#authconstraint)
- [AuthScheme](lib_next_auth.md#authscheme)
- [BearerToken](lib_next_auth.md#bearertoken)
- [InternalAuthBearerEntry](lib_next_auth.md#internalauthbearerentry)
- [InternalAuthEntry](lib_next_auth.md#internalauthentry)
- [NewAuthEntry](lib_next_auth.md#newauthentry)
- [PublicAuthEntry](lib_next_auth.md#publicauthentry)
- [TargetToken](lib_next_auth.md#targettoken)
- [Token](lib_next_auth.md#token)
- [TokenAttributes](lib_next_auth.md#tokenattributes)

### Variables

- [BANNED\_BEARER\_TOKEN](lib_next_auth.md#banned_bearer_token)
- [DEV\_BEARER\_TOKEN](lib_next_auth.md#dev_bearer_token)
- [DUMMY\_BEARER\_TOKEN](lib_next_auth.md#dummy_bearer_token)
- [NULL\_BEARER\_TOKEN](lib_next_auth.md#null_bearer_token)
- [authAttributes](lib_next_auth.md#authattributes)
- [authConstraints](lib_next_auth.md#authconstraints)
- [authSchemes](lib_next_auth.md#authschemes)

### Functions

- [authenticateHeader](lib_next_auth.md#authenticateheader)
- [authorizeHeader](lib_next_auth.md#authorizeheader)
- [createEntry](lib_next_auth.md#createentry)
- [deleteEntry](lib_next_auth.md#deleteentry)
- [deriveSchemeAndToken](lib_next_auth.md#deriveschemeandtoken)
- [getAttributes](lib_next_auth.md#getattributes)
- [getOwnersEntries](lib_next_auth.md#getownersentries)
- [isAllowedScheme](lib_next_auth.md#isallowedscheme)
- [isNewAuthEntry](lib_next_auth.md#isnewauthentry)
- [isTokenAttributes](lib_next_auth.md#istokenattributes)
- [toPublicAuthEntry](lib_next_auth.md#topublicauthentry)
- [updateAttributes](lib_next_auth.md#updateattributes)

## Type Aliases

### AuthAttribute

Ƭ **AuthAttribute**: typeof [`authAttributes`](lib_next_auth.md#authattributes)[`number`]

A supported "auth" entry attribute (field name).

#### Defined in

[lib/next-auth/index.ts:77](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L77)

___

### AuthConstraint

Ƭ **AuthConstraint**: typeof [`authConstraints`](lib_next_auth.md#authconstraints)[`number`]

A supported authorization constraint.

#### Defined in

[lib/next-auth/index.ts:95](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L95)

___

### AuthScheme

Ƭ **AuthScheme**: typeof [`authSchemes`](lib_next_auth.md#authschemes)[`number`]

A supported authentication scheme.

#### Defined in

[lib/next-auth/index.ts:72](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L72)

___

### BearerToken

Ƭ **BearerToken**: `Object`

The shape of a bearer token object.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `scheme` | ``"bearer"`` | The authentication scheme this token supports. |
| `token` | { `bearer`: `string`  } | The bearer token. |
| `token.bearer` | `string` | - |

#### Defined in

[lib/next-auth/index.ts:183](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L183)

___

### InternalAuthBearerEntry

Ƭ **InternalAuthBearerEntry**: `Merge`<[`InternalAuthEntry`](lib_next_auth.md#internalauthentry), [`BearerToken`](lib_next_auth.md#bearertoken)\>

The shape of a bearer token entry in the well-known "auth" collection.

#### Defined in

[lib/next-auth/index.ts:199](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L199)

___

### InternalAuthEntry

Ƭ **InternalAuthEntry**: `WithId`<{ `attributes`: [`TokenAttributes`](lib_next_auth.md#tokenattributes)  } & [`Token`](lib_next_auth.md#token)\>

The base shape of an entry in the well-known "auth" collection. **More
complex entry types must extend from or intersect with this base type.**

#### Defined in

[lib/next-auth/index.ts:153](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L153)

___

### NewAuthEntry

Ƭ **NewAuthEntry**: `Pick`<[`InternalAuthEntry`](lib_next_auth.md#internalauthentry), ``"attributes"``\>

The base shape of a new entry in the well-known "auth" collection. More
complex entry types may or may not extend from or intersect with this type.

Each API has the latitude to generate a token using whichever available
scheme is most convenient. Hence, the only external data necessary to create
a new auth entry is `attributes`.

#### Defined in

[lib/next-auth/index.ts:170](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L170)

___

### PublicAuthEntry

Ƭ **PublicAuthEntry**: `WithoutId`<[`InternalAuthEntry`](lib_next_auth.md#internalauthentry)\>

The public base shape derived from an entry in the well-known "auth"
collection.

#### Defined in

[lib/next-auth/index.ts:176](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L176)

___

### TargetToken

Ƭ **TargetToken**: `Partial`<{ `scheme`: `string` ; `token`: `Record`<`string`, `JsonValue`\>  }\>

The shape of a token and scheme data that might be contained within an entry
in the well-known "auth" collection.

#### Defined in

[lib/next-auth/index.ts:103](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L103)

___

### Token

Ƭ **Token**: `Object`

The shape of the actual token and scheme data contained within an entry in
the well-known "auth" collection.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `scheme` | [`AuthScheme`](lib_next_auth.md#authscheme) | The authentication scheme this token supports. |
| `token` | `Record`<`string`, `JsonValue`\> | The actual token. |

#### Defined in

[lib/next-auth/index.ts:118](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L118)

___

### TokenAttributes

Ƭ **TokenAttributes**: `Object`

The shape of the attributes associated with an entry in the well-known "auth"
collection. Each property must correspond to an array element in the
[authAttributes](lib_next_auth.md#authattributes) array and vice-versa.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `isGlobalAdmin?` | `boolean` | If `true`, the token grants access to potentially dangerous abilities via the well-known "/sys" API endpoint. **`Default`** ```ts undefined ``` |
| `owner` | `string` | A string (or stringified ObjectId) representing the owner of the token. |

#### Defined in

[lib/next-auth/index.ts:135](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L135)

## Variables

### BANNED\_BEARER\_TOKEN

• `Const` **BANNED\_BEARER\_TOKEN**: ``"banned-h54e-6rt7-gctfh-hrftdygct0"``

This string is guaranteed to be rate limited when running in a test
environment (i.e. `NODE_ENV=test`). This string cannot be used for
authenticated HTTP access to the API in production.

#### Defined in

[lib/next-auth/index.ts:46](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L46)

___

### DEV\_BEARER\_TOKEN

• `Const` **DEV\_BEARER\_TOKEN**: ``"dev-xunn-dev-294a-536h-9751-rydmj"``

This string can be used to authenticate with local and _non-web-facing_ test
and preview deployments as a global administrator. This string cannot be used
for authenticated HTTP access to the API in production.

#### Defined in

[lib/next-auth/index.ts:53](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L53)

___

### DUMMY\_BEARER\_TOKEN

• `Const` **DUMMY\_BEARER\_TOKEN**: ``"12349b61-83a7-4036-b060-213784b491"``

This string allows authenticated API access only when running in a test
environment (i.e. `NODE_ENV=test`). This string cannot be used for
authenticated HTTP access to the API in production.

#### Defined in

[lib/next-auth/index.ts:39](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L39)

___

### NULL\_BEARER\_TOKEN

• `Const` **NULL\_BEARER\_TOKEN**: ``"00000000-0000-0000-0000-000000000000"``

This string is guaranteed never to appear in data generated during tests or
in production. Hence, this string can be used to represent a `null` or
non-existent token. This string cannot be used for authenticated HTTP access
to the API.

#### Defined in

[lib/next-auth/index.ts:32](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L32)

___

### authAttributes

• `Const` **authAttributes**: readonly [``"owner"``, ``"isGlobalAdmin"``]

An array of allowed "auth" entry attributes. Each array element must
correspond to a field in the [TokenAttributes](lib_next_auth.md#tokenattributes) type and vice-versa.

#### Defined in

[lib/next-auth/index.ts:67](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L67)

___

### authConstraints

• `Const` **authConstraints**: readonly [``"isGlobalAdmin"``]

An array of supported authorization constraints.

#### Defined in

[lib/next-auth/index.ts:84](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L84)

___

### authSchemes

• `Const` **authSchemes**: readonly [``"bearer"``]

An array of supported authentication schemes.

#### Defined in

[lib/next-auth/index.ts:61](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L61)

## Functions

### authenticateHeader

▸ **authenticateHeader**(`«destructured»`): `Promise`<{ `authenticated`: `boolean` ; `error?`: `unknown`  }\>

Authenticates a client via their Authorization header using the well-known
"auth" MongoDB collection. Does not throw on invalid/missing header string.

Despite the unfortunate name of the "Authorization" header, this function is
only used for authentication, not authorization.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `allowedSchemes?` | ``"bearer"`` \| ``"bearer"``[] | Accepted authentication schemes. By default, all schemes are accepted. |
| › `header` | `undefined` \| `string` | Contents of the HTTP Authorization header. |

#### Returns

`Promise`<{ `authenticated`: `boolean` ; `error?`: `unknown`  }\>

#### Defined in

[lib/next-auth/index.ts:402](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L402)

___

### authorizeHeader

▸ **authorizeHeader**(`«destructured»`): `Promise`<{ `authorized`: `boolean` ; `error?`: `unknown`  }\>

Authorizes a client via their Authorization header using the well-known
"auth" MongoDB collection. Does not throw on invalid/missing header string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `constraints?` | ``"isGlobalAdmin"`` \| ``"isGlobalAdmin"``[] | Constraints a client must satisfy to be considered authorized. |
| › `header` | `undefined` \| `string` | Contents of the HTTP Authorization header. |

#### Returns

`Promise`<{ `authorized`: `boolean` ; `error?`: `unknown`  }\>

#### Defined in

[lib/next-auth/index.ts:447](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L447)

___

### createEntry

▸ **createEntry**(`«destructured»`): `Promise`<[`PublicAuthEntry`](lib_next_auth.md#publicauthentry)\>

Generates a new entry in the well-known "auth" MongoDB collection, including
the provided attribute metadata (if any). Throws on invalid entry data.

The current version of this function uses the `bearer` scheme to create v4
UUID "bearer tokens". This _implementation detail_ may change at any time.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `entry?` | `Partial`<[`NewAuthEntry`](lib_next_auth.md#newauthentry)\> | Data used to generate a new "auth" entry. |

#### Returns

`Promise`<[`PublicAuthEntry`](lib_next_auth.md#publicauthentry)\>

#### Defined in

[lib/next-auth/index.ts:640](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L640)

___

### deleteEntry

▸ **deleteEntry**(`«destructured»`): `Promise`<`void`\>

Deletes an entry in the well-known "auth" MongoDB collection by matching
against the target data. Throws on invalid/missing target data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `target?` | `Partial`<{ `scheme`: `string` ; `token`: `Record`<`string`, `JsonValue`\>  }\> | The target `token` and its `scheme` to delete. |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-auth/index.ts:677](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L677)

___

### deriveSchemeAndToken

▸ **deriveSchemeAndToken**(`«destructured»`): `Promise`<[`BearerToken`](lib_next_auth.md#bearertoken)\>

Derives a token and scheme from an authentication string (such as an
Authorization header). **Does not check the database for token existence**.
Throws on invalid/missing authentication string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `allowedSchemes?` | ``"bearer"`` \| ``"bearer"``[] | Accepted authentication schemes. By default, all schemes are accepted. |
| › `authString?` | `string` | The authentication string used to derive a token and scheme. |

#### Returns

`Promise`<[`BearerToken`](lib_next_auth.md#bearertoken)\>

#### Defined in

[lib/next-auth/index.ts:259](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L259)

▸ **deriveSchemeAndToken**(`«destructured»`): `Promise`<[`BearerToken`](lib_next_auth.md#bearertoken)\>

Derives a token and scheme from authentication data. Throws on
invalid/missing authentication data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `allowedSchemes?` | ``"bearer"`` \| ``"bearer"``[] | Accepted authentication schemes. By default, all schemes are accepted. |
| › `authData?` | `Partial`<{ `scheme`: `string` ; `token`: `Record`<`string`, `JsonValue`\>  }\> | The data used to derive a token and scheme. |

#### Returns

`Promise`<[`BearerToken`](lib_next_auth.md#bearertoken)\>

#### Defined in

[lib/next-auth/index.ts:276](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L276)

___

### getAttributes

▸ **getAttributes**<`T`\>(`«destructured»`): `Promise`<`T`\>

Returns an entry's attributes by matching the target data against the
well-known "auth" MongoDB collection. Throws on invalid/missing data.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TokenAttributes`](lib_next_auth.md#tokenattributes) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `target?` | `Partial`<{ `scheme`: `string` ; `token`: `Record`<`string`, `JsonValue`\>  }\> |

#### Returns

`Promise`<`T`\>

#### Defined in

[lib/next-auth/index.ts:530](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L530)

___

### getOwnersEntries

▸ **getOwnersEntries**(`«destructured»`): `Promise`<[`PublicAuthEntry`](lib_next_auth.md#publicauthentry)[]\>

Returns all entries with a matching `owner` attribute in the well-known
"auth" MongoDB collection. Throws on invalid/missing `owner` attribute.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `owners` | (`undefined` \| `string`)[] | An array of one or more valid `owner` tokens. **`See`** [TokenAttributes](lib_next_auth.md#tokenattributes) |

#### Returns

`Promise`<[`PublicAuthEntry`](lib_next_auth.md#publicauthentry)[]\>

#### Defined in

[lib/next-auth/index.ts:597](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L597)

___

### isAllowedScheme

▸ **isAllowedScheme**(`obj`, `onlyAllowSubset?`): obj is "bearer"

Type guard that returns `true` if `obj` satisfies the [AuthScheme](lib_next_auth.md#authscheme)
interface. Additional constraints may be enforced such that `obj` is among a
_subset_ of allowable schemes via the `onlyAllowSubset` parameter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |
| `onlyAllowSubset?` | ``"bearer"`` \| ``"bearer"``[] |

#### Returns

obj is "bearer"

#### Defined in

[lib/next-auth/index.ts:208](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L208)

___

### isNewAuthEntry

▸ **isNewAuthEntry**(`obj`): obj is NewAuthEntry

Type guard that returns `true` if `obj` satisfies the [NewAuthEntry](lib_next_auth.md#newauthentry)
interface.

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is NewAuthEntry

#### Defined in

[lib/next-auth/index.ts:247](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L247)

___

### isTokenAttributes

▸ **isTokenAttributes**(`obj`, `«destructured»?`): obj is TokenAttributes

Type guard that returns `true` if `obj` satisfies the [TokenAttributes](lib_next_auth.md#tokenattributes)
interface.

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |
| `«destructured»` | `Object` |
| › `patch` | `undefined` \| `boolean` |

#### Returns

obj is TokenAttributes

#### Defined in

[lib/next-auth/index.ts:219](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L219)

___

### toPublicAuthEntry

▸ **toPublicAuthEntry**(`entry`): [`PublicAuthEntry`](lib_next_auth.md#publicauthentry)

Transform an internal entry from the well-known "auth" MongoDB collection
into one that is safe for public consumption.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | [`InternalAuthEntry`](lib_next_auth.md#internalauthentry) |

#### Returns

[`PublicAuthEntry`](lib_next_auth.md#publicauthentry)

#### Defined in

[lib/next-auth/index.ts:388](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L388)

___

### updateAttributes

▸ **updateAttributes**(`«destructured»`): `Promise`<`void`\>

Updates an entry's attributes by matching the provided data against the
well-known "auth" MongoDB collection. Throws on invalid/missing target or
entry data.

**Note that the new `attributes` object will _patch_, not replace, the old
object.**

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `attributes?` | `Partial`<[`TokenAttributes`](lib_next_auth.md#tokenattributes)\> | The updated attributes |
| › `target?` | `Partial`<{ `scheme`: `string` ; `token`: `Record`<`string`, `JsonValue`\>  }\> | The target `token` and its `scheme` whose attributes will be updated. |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-auth/index.ts:558](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-auth/index.ts#L558)
