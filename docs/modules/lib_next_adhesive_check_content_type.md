[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/check-content-type

# Module: lib/next-adhesive/check-content-type

## Table of contents

### Type Aliases

- [AllowedContentTypesConfig](lib_next_adhesive_check_content_type.md#allowedcontenttypesconfig)
- [AllowedContentTypesPerMethodConfig](lib_next_adhesive_check_content_type.md#allowedcontenttypespermethodconfig)
- [Options](lib_next_adhesive_check_content_type.md#options)

### Functions

- [default](lib_next_adhesive_check_content_type.md#default)

## Type Aliases

### AllowedContentTypesConfig

Ƭ **AllowedContentTypesConfig**: `string`[] \| ``"any"`` \| ``"none"``

The shape of a simple configuration object.

#### Defined in

[lib/next-adhesive/check-content-type.ts:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-content-type.ts#L19)

___

### AllowedContentTypesPerMethodConfig

Ƭ **AllowedContentTypesPerMethodConfig**: { [method in ValidHttpMethod]?: AllowedContentTypesConfig }

The shape of a complex configuration object.

#### Defined in

[lib/next-adhesive/check-content-type.ts:24](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-content-type.ts#L24)

___

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `allowedContentTypes?` | [`AllowedContentTypesConfig`](lib_next_adhesive_check_content_type.md#allowedcontenttypesconfig) \| [`AllowedContentTypesPerMethodConfig`](lib_next_adhesive_check_content_type.md#allowedcontenttypespermethodconfig) | A string, a mapping, or an array of media types this endpoint is allowed to receive. If the string `"any"` is provided, any Content-Type header will be allowed, including requests without a Content-Type header. If the string `"none"` is provided, only requests without a Content-Type header will be allowed. Similarly, `"none"` can also be included in the array form to indicate that requests without a Content-Type header are allowed in addition to those with a listed media type. If a plain object is provided, it is assumed to be a mapping of HTTP method keys and media type values where each value is one of the string `"any"` or `"none"` or an array of media types / `"none"`s. In this form, these constraints are applied per request method. By default, _all_ requests using `POST`, `PUT`, and `PATCH` methods, or any request _with_ a Content-Type header, _will always be rejected_ unless configured otherwise. Requests _without_ a Content-Type header that are using methods other than `POST`, `PUT`, and `PATCH` _will always be allowed_ unless explicitly configured via mapping. **`See`** https://www.iana.org/assignments/media-types/media-types.xhtml |

#### Defined in

[lib/next-adhesive/check-content-type.ts:28](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-content-type.ts#L28)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Rejects requests that are not using an allowed content type. This middleware
should usually come _after_ check-method.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_check_content_type.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/check-content-type.ts:63](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/check-content-type.ts#L63)
