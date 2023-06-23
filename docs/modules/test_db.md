[inbdpa.api.hscc.bdpa.org](../README.md) / test/db

# Module: test/db

## Table of contents

### Type Aliases

- [DummyAppData](test_db.md#dummyappdata)

### Variables

- [dummyAppData](test_db.md#dummyappdata-1)

### Functions

- [getDummyData](test_db.md#getdummydata)

## Type Aliases

### DummyAppData

Ƭ **DummyAppData**: `Object`

The shape of the application database's test data.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_generatedAt` | `number` |
| `info` | [[`InternalInfo`](src_backend_db.md#internalinfo)] |
| `pages` | [`InternalPage`](src_backend_db.md#internalpage)[] |
| `sessions` | [`InternalSession`](src_backend_db.md#internalsession)[] |
| `users` | [`InternalUser`](src_backend_db.md#internaluser)[] |

#### Defined in

[test/db.ts:30](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/db.ts#L30)

## Variables

### dummyAppData

• `Const` **dummyAppData**: [`DummyAppData`](test_db.md#dummyappdata)

Test data for the application database.

#### Defined in

[test/db.ts:158](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/db.ts#L158)

## Functions

### getDummyData

▸ **getDummyData**(): [`DummyData`](lib_mongo_test.md#dummydata)

Returns data used to hydrate databases and their collections.

#### Returns

[`DummyData`](lib_mongo_test.md#dummydata)

#### Defined in

[test/db.ts:23](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/db.ts#L23)
