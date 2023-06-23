[inbdpa.api.hscc.bdpa.org](../README.md) / lib/mongo-item

# Module: lib/mongo-item

## Table of contents

### Type Aliases

- [IdItem](lib_mongo_item.md#iditem)
- [IdItemArray](lib_mongo_item.md#iditemarray)
- [ItemExistsIdParam](lib_mongo_item.md#itemexistsidparam)
- [ItemExistsOptions](lib_mongo_item.md#itemexistsoptions)

### Functions

- [itemExists](lib_mongo_item.md#itemexists)
- [itemToObjectId](lib_mongo_item.md#itemtoobjectid)
- [itemToStringId](lib_mongo_item.md#itemtostringid)

## Type Aliases

### IdItem

Ƭ **IdItem**<`T`\>: `WithId`<`unknown`\> \| `string` \| `T` \| ``null`` \| `undefined`

The shape of an object that can be translated into an `ObjectId` (or `T`)
instance or is `null`/`undefined`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ObjectId` |

#### Defined in

[lib/mongo-item/index.ts:114](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L114)

___

### IdItemArray

Ƭ **IdItemArray**<`T`\>: [`IdItem`](lib_mongo_item.md#iditem)<`T`\>[]

The shape of an array of objects that can be translated into an array of
`ObjectId` (or `T`) instances or are `null`/`undefined`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ObjectId` |

#### Defined in

[lib/mongo-item/index.ts:125](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L125)

___

### ItemExistsIdParam

Ƭ **ItemExistsIdParam**: `string` \| `ObjectId` \| { `id`: `string` \| `ObjectId` ; `key`: `string`  }

Represents the value of the `_id` property of a MongoDB collection entry.
Optionally, a key other than `_id` can be specified using the `{ key: ...,
id: ... }` syntax.

#### Defined in

[lib/mongo-item/index.ts:11](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L11)

___

### ItemExistsOptions

Ƭ **ItemExistsOptions**: `Object`

Available options for the `itemExists` function.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `caseInsensitive?` | `boolean` | If `true`, ids will be matched in a case-insensitive manner (via locale). **`Default`** ```ts false ``` |
| `excludeId?` | [`ItemExistsIdParam`](lib_mongo_item.md#itemexistsidparam) | Items matching excludeId will be completely ignored by this function. **`Default`** ```ts undefined ``` |
| `optimisticCoercion?` | `boolean` | When looking for an item matching `{ _id: id }`, where the descriptor key is the string `"_id"`, `id` will be optimistically wrapped in a `new ObjectId(id)` call. Set this to `false` to prevent this. **`Default`** ```ts true ``` |

#### Defined in

[lib/mongo-item/index.ts:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L19)

## Functions

### itemExists

▸ **itemExists**<`T`\>(`collection`, `id`, `options?`): `Promise`<`boolean`\>

Checks if an item matching `{ _id: id }` exists within `collection`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Document` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collection` | `Collection`<`T`\> |
| `id` | `string` \| `ObjectId` |
| `options?` | [`ItemExistsOptions`](lib_mongo_item.md#itemexistsoptions) |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[lib/mongo-item/index.ts:45](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L45)

▸ **itemExists**<`T`\>(`collection`, `descriptor`, `options?`): `Promise`<`boolean`\>

Checks if an item matching `{ [descriptor.key]: descriptor.id }` exists
within `collection`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Document` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collection` | `Collection`<`T`\> |
| `descriptor` | `Object` |
| `descriptor.id` | `string` \| `ObjectId` |
| `descriptor.key` | `string` |
| `options?` | [`ItemExistsOptions`](lib_mongo_item.md#itemexistsoptions) |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[lib/mongo-item/index.ts:54](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L54)

___

### itemToObjectId

▸ **itemToObjectId**<`T`\>(`item`): `T`

Reduces an `item` down to its `ObjectId` instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ObjectId`<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`IdItem`](lib_mongo_item.md#iditem)<`T`\> |

#### Returns

`T`

#### Defined in

[lib/mongo-item/index.ts:130](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L130)

▸ **itemToObjectId**<`T`\>(`items`): `T`[]

Reduces an array of `items` down to their respective `ObjectId` instances.

An attempt is made to eliminate duplicates via `new Set(...)`, but the
absence of duplicates is not guaranteed when `items` contains `WithId<...>`
objects.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ObjectId`<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`IdItemArray`](lib_mongo_item.md#iditemarray)<`T`\> |

#### Returns

`T`[]

#### Defined in

[lib/mongo-item/index.ts:138](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L138)

___

### itemToStringId

▸ **itemToStringId**<`T`\>(`item`): `string`

Reduces an `item` down to the string representation of its `ObjectId`
instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ObjectId`<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`IdItem`](lib_mongo_item.md#iditem)<`T`\> |

#### Returns

`string`

#### Defined in

[lib/mongo-item/index.ts:182](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L182)

▸ **itemToStringId**<`T`\>(`items`): `string`[]

Reduces an array of `items` down to the string representations of their
respective `ObjectId` instances.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ObjectId`<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`IdItemArray`](lib_mongo_item.md#iditemarray)<`T`\> |

#### Returns

`string`[]

#### Defined in

[lib/mongo-item/index.ts:187](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-item/index.ts#L187)
