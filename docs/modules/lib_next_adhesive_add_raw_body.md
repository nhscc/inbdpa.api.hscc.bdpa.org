[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/add-raw-body

# Module: lib/next-adhesive/add-raw-body

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_add_raw_body.md#options)
- [WithRawBody](lib_next_adhesive_add_raw_body.md#withrawbody)

### Functions

- [default](lib_next_adhesive_add_raw_body.md#default)
- [ensureNextApiRequestHasRawBody](lib_next_adhesive_add_raw_body.md#ensurenextapirequesthasrawbody)
- [isNextApiRequestWithRawBody](lib_next_adhesive_add_raw_body.md#isnextapirequestwithrawbody)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `requestBodySizeLimit?` | `number` \| `string` \| ``null`` | The byte limit of the request body. This is the number of bytes or any string format supported by bytes, for example `1000`, `'500kb'` or `'3mb'`. **`Default`** ```ts defaultRequestBodySizeLimit (see source) ``` **`See`** https://nextjs.org/docs/api-routes/api-middlewares#custom-config |

#### Defined in

[lib/next-adhesive/add-raw-body.ts:36](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/add-raw-body.ts#L36)

___

### WithRawBody

Ƭ **WithRawBody**<`T`\>: `T` & { `rawBody`: `string`  }

The shape of an object (typically a NextApiRequest object) that has a rawBody
property.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[lib/next-adhesive/add-raw-body.ts:28](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/add-raw-body.ts#L28)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Adds a `rawBody` property onto the NextApiRequest object, which contains the
raw unparsed content of the request body if it exists or `undefined` if it
does not. The body is still parsed (using `bodyParser`) like normal using a
custom implementation of Next.js's `parseBody` function.

To use this middleware, `bodyParser` must be disabled via Next.js API route
configuration like so:

```TypeScript
export const config = {
  api: {
    bodyParser: false
  },
}
```

Note that this middleware cannot be used with other middleware or routes that
also directly consume the request body in a special way, such as when using
streams.

**`See`**

https://nextjs.org/docs/api-routes/api-middlewares#custom-config

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_add_raw_body.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/add-raw-body.ts:98](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/add-raw-body.ts#L98)

___

### ensureNextApiRequestHasRawBody

▸ **ensureNextApiRequestHasRawBody**(`req`): req is WithRawBody<NextApiRequest\>

Type guard function similar to the `isNextApiRequestWithRawBody` type
predicate except an error is thrown if the request object cannot satisfy the
`WithRawBody` type constraint.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |

#### Returns

req is WithRawBody<NextApiRequest\>

#### Defined in

[lib/next-adhesive/add-raw-body.ts:63](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/add-raw-body.ts#L63)

___

### isNextApiRequestWithRawBody

▸ **isNextApiRequestWithRawBody**(`req`): req is WithRawBody<NextApiRequest\>

Type predicate function that returns `true` if the request object can
satisfy the `WithRawBody` type constraint.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |

#### Returns

req is WithRawBody<NextApiRequest\>

#### Defined in

[lib/next-adhesive/add-raw-body.ts:52](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/add-raw-body.ts#L52)
