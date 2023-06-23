[inbdpa.api.hscc.bdpa.org](../README.md) / src/backend/api

# Module: src/backend/api

## Table of contents

### Variables

- [defaultConfig](src_backend_api.md#defaultconfig)

### Functions

- [authorizationHeaderToOwnerAttribute](src_backend_api.md#authorizationheadertoownerattribute)

## Variables

### defaultConfig

• `Const` **defaultConfig**: `PageConfig`

The default app-wide Next.js API configuration object.

**`See`**

https://nextjs.org/docs/api-routes/api-middlewares#custom-config

#### Defined in

[src/backend/api.ts:14](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/api.ts#L14)

## Functions

### authorizationHeaderToOwnerAttribute

▸ **authorizationHeaderToOwnerAttribute**(`authorizationHeader`): `Promise`<`string`\>

Returns the owner token attribute cross-referenced by the
`authorizationHeader`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `authorizationHeader` | `Required`<`undefined` \| `string`\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/backend/api.ts:28](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/api.ts#L28)
