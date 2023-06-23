[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/use-cors

# Module: lib/next-adhesive/use-cors

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_use_cors.md#options)

### Functions

- [default](lib_next_adhesive_use_cors.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `allowedMethods?` | [`Options`](lib_next_adhesive_check_method.md#options)[``"allowedMethods"``] |

#### Defined in

[lib/next-adhesive/use-cors.ts:10](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/use-cors.ts#L10)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Allows _cross-origin_ requests for the most popular request types. **Note
that this can be dangerous (huge security hole) and should only be used for
public APIs**.

When present, this should be among the very first middleware in the chain and
certainly before _check-method_.

By default, allowed CORS methods are: `GET`, `HEAD`, `PUT`, `PATCH`, `POST`,
and `DELETE`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_use_cors.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/use-cors.ts:25](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/use-cors.ts#L25)
