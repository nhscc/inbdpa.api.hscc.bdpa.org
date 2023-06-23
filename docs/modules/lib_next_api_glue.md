[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-api-glue

# Module: lib/next-api-glue

## Table of contents

### Type Aliases

- [Middleware](lib_next_api_glue.md#middleware)
- [MiddlewareContext](lib_next_api_glue.md#middlewarecontext)

### Functions

- [middlewareFactory](lib_next_api_glue.md#middlewarefactory)
- [withMiddleware](lib_next_api_glue.md#withmiddleware)

## Type Aliases

### Middleware

Ƭ **Middleware**<`Options`\>: (`req`: `NextApiRequest`, `res`: `NextApiResponse`, `context`: [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<`Options`\>) => `unknown`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

#### Type declaration

▸ (`req`, `res`, `context`): `unknown`

The shape of a custom middleware function.

##### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<`Options`\> |

##### Returns

`unknown`

#### Defined in

[lib/next-api-glue/index.ts:14](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-glue/index.ts#L14)

___

### MiddlewareContext

Ƭ **MiddlewareContext**<`Options`\>: `Object`

The shape of a middleware context object, potentially customized with
additional middleware-specific options.

Note that type checking cannot enforce that certain options are passed in the
case that an options argument is omitted when calling `withMiddleware`. So,
to be safe, all custom middleware context options should be declared as
optional (i.e. `{ myOpt?: aType }` instead of `{ myOpt: aType })`.

Middleware should default to the most restrictive configuration possible if
its respective options are missing.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Options` & { `callDoneOnEnd`: `boolean`  } | Options expected by middleware functions at runtime. |
| `runtime` | { `done`: () => `void` ; `endpoint`: { `descriptor?`: `string`  } ; `error`: `unknown` ; `next`: () => `Promise`<`void`\>  } | Contains middleware use chain control functions and various metadata. |
| `runtime.done` | () => `void` | Stop calling middleware functions, effectively aborting execution of the use chain. If `response.end` hasn't been called before calling this function, it will be called automatically. On abort, the handler will also be skipped. |
| `runtime.endpoint` | { `descriptor?`: `string`  } | Metadata describing the current endpoint. |
| `runtime.endpoint.descriptor?` | `string` | A parameterized path string in the form of a URI path corresponding to the current endpoint. For example: `/my-endpoint/:some_id`. |
| `runtime.error` | `unknown` | For middleware run via `useOnError`, the `error` property will contain the thrown error object. |
| `runtime.next` | () => `Promise`<`void`\> | Call the next middleware function in the use chain. If not called explicitly before a middleware function resolves, and `done()` was also not called, `next()` will be called automatically. This means calling `next()` in a middleware function is entirely optional. |

#### Defined in

[lib/next-api-glue/index.ts:34](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-glue/index.ts#L34)

## Functions

### middlewareFactory

▸ **middlewareFactory**<`Options`\>(`«destructured»`): <PassedOptions\>(`handler`: `undefined` \| `NextApiHandler`, `params`: { `appendUse?`: [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] ; `appendUseOnError?`: [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] ; `descriptor`: `undefined` \| `string` ; `options?`: `Partial`<`NoInfer`<`Options`\> & { `callDoneOnEnd`: `boolean`  }\> & `NoInfer`<`PassedOptions`\> ; `prependUse?`: [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] ; `prependUseOnError?`: [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[]  }) => (`req`: `NextApiRequest`, `res`: `NextApiResponse`) => `Promise`<`void`\>

Returns a `withMiddleware` function decorated with a preset configuration.
`withMiddleware` optionally accepts its usual parameters, which will be
appended onto the arguments to `withMiddlewareFactory` (the "preset
parameters"); however, note that passed option keys will overwrite their
preset counterparts.

Useful when you don't want to repeatedly import, configure, and list a bunch
of middleware every time you want to call `withMiddleware`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `options?` | `Partial`<`NoInfer`<`Options`\> & { `callDoneOnEnd`: `boolean`  }\> & `NoInfer`<`Options`\> |
| › `use` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |
| › `useOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |

#### Returns

`fn`

▸ <`PassedOptions`\>(`handler`, `params`): (`req`: `NextApiRequest`, `res`: `NextApiResponse`) => `Promise`<`void`\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `PassedOptions` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `undefined` \| `NextApiHandler` |
| `params` | `Object` |
| `params.appendUse?` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |
| `params.appendUseOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |
| `params.descriptor` | `undefined` \| `string` |
| `params.options?` | `Partial`<`NoInfer`<`Options`\> & { `callDoneOnEnd`: `boolean`  }\> & `NoInfer`<`PassedOptions`\> |
| `params.prependUse?` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |
| `params.prependUseOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |

##### Returns

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

[lib/next-api-glue/index.ts:337](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-glue/index.ts#L337)

___

### withMiddleware

▸ **withMiddleware**<`Options`\>(`handler`, `«destructured»`): (`req`: `NextApiRequest`, `res`: `NextApiResponse`) => `Promise`<`void`\>

Generic middleware runner. Decorates a request handler.

Passing `undefined` as `handler` or not calling `res.end()` (and not sending
headers) in your handler or use chain will trigger an `HTTP 501 Not
Implemented` response. This can be used to to stub out endpoints and their
middleware for later implementation.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `Record`<`string`, `unknown`\> = `Record`<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `undefined` \| `NextApiHandler` |
| `«destructured»` | `Object` |
| › `descriptor` | `undefined` \| `string` |
| › `options?` | `Partial`<`NoInfer`<`Options`\> & { `callDoneOnEnd`: `boolean`  }\> & `NoInfer`<`Options`\> |
| › `use` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |
| › `useOnError?` | [`Middleware`](lib_next_api_glue.md#middleware)<`NoInfer`<`Options`\>\>[] |

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

[lib/next-api-glue/index.ts:95](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-glue/index.ts#L95)
