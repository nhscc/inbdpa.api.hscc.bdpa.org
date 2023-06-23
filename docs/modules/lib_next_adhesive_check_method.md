[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/check-method

# Module: lib/next-adhesive/check-method

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_check_method.md#options)

### Functions

- [default](lib_next_adhesive_check_method.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `allowedMethods?` | `ValidHttpMethod`[] | An array of HTTP methods this endpoint is allowed to serve. |

#### Defined in

[lib/next-adhesive/check-method.ts:11](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-method.ts#L11)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Rejects requests that are either using a disallowed method or not using an
allowed method.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_check_method.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/check-method.ts:22](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-method.ts#L22)
