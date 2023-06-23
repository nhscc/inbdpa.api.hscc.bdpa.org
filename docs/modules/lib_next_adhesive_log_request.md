[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/log-request

# Module: lib/next-adhesive/log-request

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_log_request.md#options)

### Functions

- [default](lib_next_adhesive_log_request.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Defined in

[lib/next-adhesive/log-request.ts:12](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/log-request.ts#L12)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Logs the response to each request after it is sent (i.e. `res.end()`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_log_request.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/log-request.ts:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/log-request.ts#L19)
