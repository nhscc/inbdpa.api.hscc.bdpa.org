[inbdpa.api.hscc.bdpa.org](../README.md) / [src/backend/db](../modules/src_backend_db.md) / SessionId

# Interface: SessionId

[src/backend/db](../modules/src_backend_db.md).SessionId

## Hierarchy

- `ObjectId`

  ↳ **`SessionId`**

## Table of contents

### Accessors

- [\_bsontype](src_backend_db.SessionId.md#_bsontype)
- [id](src_backend_db.SessionId.md#id)

### Methods

- [equals](src_backend_db.SessionId.md#equals)
- [getTimestamp](src_backend_db.SessionId.md#gettimestamp)
- [inspect](src_backend_db.SessionId.md#inspect)
- [toHexString](src_backend_db.SessionId.md#tohexstring)
- [toJSON](src_backend_db.SessionId.md#tojson)
- [toString](src_backend_db.SessionId.md#tostring)

## Accessors

### \_bsontype

• `get` **_bsontype**(): ``"ObjectId"``

#### Returns

``"ObjectId"``

#### Inherited from

ObjectId.\_bsontype

#### Defined in

node_modules/bson/bson.d.ts:976

___

### id

• `get` **id**(): `Uint8Array`

The ObjectId bytes

#### Returns

`Uint8Array`

#### Inherited from

ObjectId.id

#### Defined in

node_modules/bson/bson.d.ts:991

## Methods

### equals

▸ **equals**(`otherId`): `boolean`

Compares the equality of this ObjectId with `otherID`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `otherId` | `string` \| `ObjectId` \| `ObjectIdLike` | ObjectId instance to compare against. |

#### Returns

`boolean`

#### Inherited from

ObjectId.equals

#### Defined in

node_modules/bson/bson.d.ts:1014

___

### getTimestamp

▸ **getTimestamp**(): `Date`

Returns the generation date (accurate up to the second) that this ID was generated.

#### Returns

`Date`

#### Inherited from

ObjectId.getTimestamp

#### Defined in

node_modules/bson/bson.d.ts:1016

___

### inspect

▸ **inspect**(): `string`

#### Returns

`string`

#### Inherited from

ObjectId.inspect

#### Defined in

node_modules/bson/bson.d.ts:1040

___

### toHexString

▸ **toHexString**(): `string`

Returns the ObjectId id as a 24 character hex string representation

#### Returns

`string`

#### Inherited from

ObjectId.toHexString

#### Defined in

node_modules/bson/bson.d.ts:994

___

### toJSON

▸ **toJSON**(): `string`

Converts to its JSON the 24 character hex string representation.

#### Returns

`string`

#### Inherited from

ObjectId.toJSON

#### Defined in

node_modules/bson/bson.d.ts:1008

___

### toString

▸ **toString**(`encoding?`): `string`

Converts the id into a 24 character hex string for printing, unless encoding is provided.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `encoding?` | ``"base64"`` \| ``"hex"`` | hex or base64 |

#### Returns

`string`

#### Inherited from

ObjectId.toString

#### Defined in

node_modules/bson/bson.d.ts:1006
