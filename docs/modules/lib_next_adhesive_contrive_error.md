[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/contrive-error

# Module: lib/next-adhesive/contrive-error

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_contrive_error.md#options)

### Functions

- [default](lib_next_adhesive_contrive_error.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `enableContrivedErrors?` | `boolean` | If `true`, every Nth request will fail with a contrived error. **`Default`** ```ts false ``` |

#### Defined in

[lib/next-adhesive/contrive-error.ts:10](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/contrive-error.ts#L10)

## Functions

### default

▸ **default**(`_req`, `res`, `context`): `Promise`<`void`\>

Rejects every Nth request with a dummy error (see .env.example).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_req` | `NextApiRequest` |
| `res` | `NextApiResponse` |
| `context` | [`MiddlewareContext`](lib_next_api_glue.md#middlewarecontext)<[`Options`](lib_next_adhesive_contrive_error.md#options)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/contrive-error.ts:22](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/contrive-error.ts#L22)
