[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-adhesive/limit-request

# Module: lib/next-adhesive/limit-request

## Table of contents

### Type Aliases

- [Options](lib_next_adhesive_limit_request.md#options)

### Functions

- [default](lib_next_adhesive_limit_request.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Defined in

[lib/next-adhesive/limit-request.ts:14](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/limit-request.ts#L14)

## Functions

### default

▸ **default**(`req`, `res`): `Promise`<`void`\>

Rejects requests from clients that have sent too many previous requests.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-adhesive/limit-request.ts:21](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-adhesive/limit-request.ts#L21)
