[inbdpa.api.hscc.bdpa.org](../README.md) / src/backend/middleware

# Module: src/backend/middleware

## Table of contents

### Functions

- [withMiddleware](src_backend_middleware.md#withmiddleware)
- [withSysMiddleware](src_backend_middleware.md#withsysmiddleware)

## Functions

### withMiddleware

▸ **withMiddleware**<`PassedOptions`\>(`handler`, `params`): (`req`: `NextApiRequest`, `res`: `NextApiResponse`) => `Promise`<`void`\>

Primary middleware runner for the REST API. Decorates a request handler.

Passing `undefined` as `handler` or not calling `res.end()` (and not sending
headers) in your handler or use chain will trigger an `HTTP 501 Not
Implemented` response. This can be used to to stub out endpoints and their
middleware for later implementation.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `PassedOptions` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `undefined` \| `NextApiHandler` |
| `params` | `Object` |
| `params.appendUse?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_check_version.md#options) & [`Options`](lib_next_adhesive_use_cors.md#options) & [`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options) & [`Options`](lib_next_adhesive_contrive_error.md#options)\>[] |
| `params.appendUseOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_check_version.md#options) & [`Options`](lib_next_adhesive_use_cors.md#options) & [`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options) & [`Options`](lib_next_adhesive_contrive_error.md#options)\>[] |
| `params.descriptor` | `undefined` \| `string` |
| `params.options?` | `Partial`<[`Options`](lib_next_adhesive_check_version.md#options) & [`Options`](lib_next_adhesive_use_cors.md#options) & [`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options) & [`Options`](lib_next_adhesive_contrive_error.md#options) & { `callDoneOnEnd`: `boolean`  }\> & `NoInfer`<`PassedOptions`\> |
| `params.prependUse?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_check_version.md#options) & [`Options`](lib_next_adhesive_use_cors.md#options) & [`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options) & [`Options`](lib_next_adhesive_contrive_error.md#options)\>[] |
| `params.prependUseOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_check_version.md#options) & [`Options`](lib_next_adhesive_use_cors.md#options) & [`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options) & [`Options`](lib_next_adhesive_contrive_error.md#options)\>[] |

#### Returns

`fn`

▸ (`req`, `res`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |

##### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-api-glue/index.ts:349](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-glue/index.ts#L349)

___

### withSysMiddleware

▸ **withSysMiddleware**<`PassedOptions`\>(`handler`, `params`): (`req`: `NextApiRequest`, `res`: `NextApiResponse`) => `Promise`<`void`\>

Middleware runner for the special /sys API endpoints. Decorates a request
handler.

Passing `undefined` as `handler` or not calling `res.end()` (and not sending
headers) in your handler or use chain will trigger an `HTTP 501 Not
Implemented` response. This can be used to to stub out endpoints and their
middleware for later implementation.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `PassedOptions` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `undefined` \| `NextApiHandler` |
| `params` | `Object` |
| `params.appendUse?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options)\>[] |
| `params.appendUseOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options)\>[] |
| `params.descriptor` | `undefined` \| `string` |
| `params.options?` | `Partial`<[`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options) & { `callDoneOnEnd`: `boolean`  }\> & `NoInfer`<`PassedOptions`\> |
| `params.prependUse?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options)\>[] |
| `params.prependUseOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<[`Options`](lib_next_adhesive_auth_request.md#options) & [`Options`](lib_next_adhesive_check_method.md#options) & [`Options`](lib_next_adhesive_check_content_type.md#options) & [`Options`](lib_next_adhesive_handle_error.md#options)\>[] |

#### Returns

`fn`

▸ (`req`, `res`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |

##### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-api-glue/index.ts:349](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-glue/index.ts#L349)
