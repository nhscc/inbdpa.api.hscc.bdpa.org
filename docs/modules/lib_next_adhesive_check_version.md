[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/check-version

# Module: lib/next-adhesive/check-version

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_check_version.md#options)

### Functions

- [default](lib_next_adhesive_check_version.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiVersion?` | `string` | The version of the api this endpoint serves. |

#### Defined in

[lib/next-adhesive/check-version.ts:10](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-version.ts#L10)

## Functions

### default

▸ **default**(`_req`, `res`, `context`): `Promise`<`void`\>

Rejects requests to disabled versions of the API.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_check_version.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/check-version.ts:20](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-version.ts#L20)
