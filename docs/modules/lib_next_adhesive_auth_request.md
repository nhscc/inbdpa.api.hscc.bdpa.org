[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/auth-request

# Module: lib/next-adhesive/auth-request

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_auth_request.md#options)

### Functions

- [default](lib_next_adhesive_auth_request.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `requiresAuth?` | `boolean` \| { `allowedSchemes?`: [`AuthScheme`](lib_next_auth.md#authscheme) \| [`AuthScheme`](lib_next_auth.md#authscheme)[] ; `constraints?`: [`AuthConstraint`](lib_next_auth.md#authconstraint) \| [`AuthConstraint`](lib_next_auth.md#authconstraint)[]  } | If not `false` or falsy, accessing this endpoint requires a valid (yet unfortunately named) Authorization header. If one or more schemes are provided, the request will be authenticated using one of said schemes. If no schemes are provided, the request will be authenticated using any available scheme. Additionally, if one or more constraints are provided, the request will be authorized conditioned upon said constraints. If no constraints are provided, all requests will be vacuously authorized. |

#### Defined in

[lib/next-adhesive/auth-request.ts:22](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/auth-request.ts#L22)

## Functions

### default

▸ **default**(`req`, `res`, `context`): `Promise`<`void`\>

Rejects unauthenticatable and unauthorizable requests (via Authorization
header).

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_auth_request.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/auth-request.ts:47](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/auth-request.ts#L47)
