[inbdpa.api.hscc.bdpa.org](../README.md) / lib/mongo-common

# Module: lib/mongo-common

## Table of contents

### References

- [mockDateNowMs](lib_mongo_common.md#mockdatenowms)
- [useMockDateNow](lib_mongo_common.md#usemockdatenow)

### Type Aliases

- [DummyRootData](lib_mongo_common.md#dummyrootdata)

### Variables

- [dummyRootData](lib_mongo_common.md#dummyrootdata-1)

### Functions

- [getCommonDummyData](lib_mongo_common.md#getcommondummydata)
- [getCommonSchemaConfig](lib_mongo_common.md#getcommonschemaconfig)

## References

### mockDateNowMs

Re-exports [mockDateNowMs](lib_jest_mock_date.md#mockdatenowms)

___

### useMockDateNow

Re-exports [useMockDateNow](lib_jest_mock_date.md#usemockdatenow)

## Type Aliases

### DummyRootData

Ƭ **DummyRootData**: `Object`

The shape of the well-known `root` database's collections and their test
data.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_generatedAt` | `number` |
| `auth` | [`InternalAuthEntry`](lib_next_auth.md#internalauthentry)[] |
| `limited-log` | [`InternalLimitedLogEntry`](lib_next_limit.md#internallimitedlogentry)[] |
| `request-log` | [`InternalRequestLogEntry`](lib_next_log.md#internalrequestlogentry)[] |

#### Defined in

[lib/mongo-common/index.ts:95](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-common/index.ts#L95)

## Variables

### dummyRootData

• `Const` **dummyRootData**: [`DummyRootData`](lib_mongo_common.md#dummyrootdata)

Test data for the well-known `root` database.

#### Defined in

[lib/mongo-common/index.ts:105](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-common/index.ts#L105)

## Functions

### getCommonDummyData

▸ **getCommonDummyData**(`additionalDummyData?`): [`DummyData`](lib_mongo_test.md#dummydata)

Returns data used to hydrate well-known databases and their well-known
collections.

Well-known databases and their well-known collections currently include:
  - `root` (collections: `auth`, `request-log`, `limited-log`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalDummyData?` | [`DummyData`](lib_mongo_test.md#dummydata) |

#### Returns

[`DummyData`](lib_mongo_test.md#dummydata)

#### Defined in

[lib/mongo-common/index.ts:87](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-common/index.ts#L87)

___

### getCommonSchemaConfig

▸ **getCommonSchemaConfig**(`additionalSchemaConfig?`): [`DbSchema`](lib_mongo_schema.md#dbschema)

A JSON representation of the backend Mongo database structure. This is used
for common consistent "well-known" db structure across projects.

Well-known databases and their well-known collections currently include:
  - `root` (collections: `auth`, `request-log`, `limited-log`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalSchemaConfig?` | [`DbSchema`](lib_mongo_schema.md#dbschema) |

#### Returns

[`DbSchema`](lib_mongo_schema.md#dbschema)

#### Defined in

[lib/mongo-common/index.ts:28](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-common/index.ts#L28)
