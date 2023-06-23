[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/handle-error

# Module: lib/next-adhesive/handle-error

## Table of contents

### Type Aliases

- [ErrorHandler](lib_next_adhesive_handle_error.md#errorhandler)
- [ErrorHandlerMap](lib_next_adhesive_handle_error.md#errorhandlermap)
- [Options](lib_next_adhesive_handle_error.md#options)

### Functions

- [default](lib_next_adhesive_handle_error.md#default)

## Type Aliases

### ErrorHandler

Ƭ **ErrorHandler**: (`res`: `NextApiResponse`, `errorJson`: `Partial`<`JsonError`\>) => `Promisable`<`void`\>

#### Type declaration

▸ (`res`, `errorJson`): `Promisable`<`void`\>

Special middleware used to handle custom errors.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `errorJson` | `Partial`<`JsonError`\> |

##### Returns

`Promisable`<`void`\>

#### Defined in

[lib/next-adhesive/handle-error.ts:31](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/handle-error.ts#L31)

___

### ErrorHandlerMap

Ƭ **ErrorHandlerMap**: `Map`<(...`args`: `any`[]) => `Error`, [`ErrorHandler`](lib_next_adhesive_handle_error.md#errorhandler)\>

A Map of Error class constructors to the special middleware that handles
them.

#### Defined in

[lib/next-adhesive/handle-error.ts:41](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/handle-error.ts#L41)

___

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `errorHandlers?` | [`ErrorHandlerMap`](lib_next_adhesive_handle_error.md#errorhandlermap) | A mapping of Error classes and the functions that handle them. |

#### Defined in

[lib/next-adhesive/handle-error.ts:43](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/handle-error.ts#L43)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Generic error handling middleware. **This should be among the final
middleware to run on the error handling middleware chain.**

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_handle_error.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/handle-error.ts:54](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/handle-error.ts#L54)
