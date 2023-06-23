[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-api-respond

# Module: lib/next-api-respond

## Table of contents

### Functions

- [sendGenericHttpResponse](lib_next_api_respond.md#sendgenerichttpresponse)
- [sendHttpBadContentType](lib_next_api_respond.md#sendhttpbadcontenttype)
- [sendHttpBadMethod](lib_next_api_respond.md#sendhttpbadmethod)
- [sendHttpBadRequest](lib_next_api_respond.md#sendhttpbadrequest)
- [sendHttpContrivedError](lib_next_api_respond.md#sendhttpcontrivederror)
- [sendHttpError](lib_next_api_respond.md#sendhttperror)
- [sendHttpErrorResponse](lib_next_api_respond.md#sendhttperrorresponse)
- [sendHttpNotFound](lib_next_api_respond.md#sendhttpnotfound)
- [sendHttpOk](lib_next_api_respond.md#sendhttpok)
- [sendHttpRateLimited](lib_next_api_respond.md#sendhttpratelimited)
- [sendHttpSuccessResponse](lib_next_api_respond.md#sendhttpsuccessresponse)
- [sendHttpTooLarge](lib_next_api_respond.md#sendhttptoolarge)
- [sendHttpUnauthenticated](lib_next_api_respond.md#sendhttpunauthenticated)
- [sendHttpUnauthorized](lib_next_api_respond.md#sendhttpunauthorized)
- [sendNotImplemented](lib_next_api_respond.md#sendnotimplemented)

## Functions

### sendGenericHttpResponse

▸ **sendGenericHttpResponse**(`res`, `statusCode`, `responseJson?`): `void`

Sends a generic HTTP response with the given `statusCode` and optional
`responseJson` body (defaults to `{}`). This is the "base" function called by
all other response functions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `statusCode` | `HttpStatusCode` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:9](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L9)

___

### sendHttpBadContentType

▸ **sendHttpBadContentType**(`res`, `responseJson?`): `void`

Sends an HTTP 415 "unsupported media type" response with optional
`responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:143](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L143)

___

### sendHttpBadMethod

▸ **sendHttpBadMethod**(`res`, `responseJson?`): `void`

Sends an HTTP 405 "bad method" response with optional `responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:116](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L116)

___

### sendHttpBadRequest

▸ **sendHttpBadRequest**(`res`, `responseJson?`): `void`

Sends an HTTP 400 "client error" response with optional `responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:62](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L62)

___

### sendHttpContrivedError

▸ **sendHttpContrivedError**(`res`, `responseJson?`): `void`

Sends an HTTP 555 "contrived" response with optional `responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:198](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L198)

___

### sendHttpError

▸ **sendHttpError**(`res`, `responseJson?`): `void`

Sends a generic HTTP 500 "error" response with `error` property and optional
`responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:171](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L171)

___

### sendHttpErrorResponse

▸ **sendHttpErrorResponse**(`res`, `statusCode`, `responseJson`): `JsonError`

Sends a generic "error" response and `responseJson` body, optionally with
additional properties. This function is called by all non-2xx response
functions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `statusCode` | `HttpStatusCode` |
| `responseJson` | `Record`<`string`, `unknown`\> & { `error`: `string`  } |

#### Returns

`JsonError`

#### Defined in

[lib/next-api-respond/index.ts:39](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L39)

___

### sendHttpNotFound

▸ **sendHttpNotFound**(`res`, `responseJson?`): `void`

Sends an HTTP 404 "not found" response with optional `responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:103](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L103)

___

### sendHttpOk

▸ **sendHttpOk**(`res`, `responseJson?`): `void`

Sends an HTTP 200 "ok" response with optional `responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:52](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L52)

___

### sendHttpRateLimited

▸ **sendHttpRateLimited**(`res`, `responseJson?`): `void`

Sends an HTTP 429 "too many requests" response with optional `responseJson`
data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:157](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L157)

___

### sendHttpSuccessResponse

▸ **sendHttpSuccessResponse**(`res`, `statusCode`, `responseJson?`): `JsonSuccess`

Sends a generic "success" response and `responseJson` body, optionally with
additional properties. This function is called by all 2xx response functions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `statusCode` | `HttpStatusCode` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`JsonSuccess`

#### Defined in

[lib/next-api-respond/index.ts:24](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L24)

___

### sendHttpTooLarge

▸ **sendHttpTooLarge**(`res`, `responseJson?`): `void`

Sends an HTTP 413 "too big" response with optional `responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:129](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L129)

___

### sendHttpUnauthenticated

▸ **sendHttpUnauthenticated**(`res`, `responseJson?`): `void`

Sends an HTTP 401 "unauthenticated" response with optional `responseJson`
data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:76](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L76)

___

### sendHttpUnauthorized

▸ **sendHttpUnauthorized**(`res`, `responseJson?`): `void`

Sends an HTTP 403 "forbidden" ("unauthorized") response with optional
`responseJson` data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:90](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L90)

___

### sendNotImplemented

▸ **sendNotImplemented**(`res`, `responseJson?`): `void`

Sends an HTTP 501 "not implemented" response with optional `responseJson`
data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `NextApiResponse` |
| `responseJson?` | `Record`<`string`, `unknown`\> |

#### Returns

`void`

#### Defined in

[lib/next-api-respond/index.ts:185](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-api-respond/index.ts#L185)
