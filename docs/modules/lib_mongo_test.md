[inbdpa.api.hscc.bdpa.org](../README.md) / lib/mongo-test

# Module: lib/mongo-test

## Table of contents

### Type Aliases

- [DummyData](lib_mongo_test.md#dummydata)
- [TestCustomizations](lib_mongo_test.md#testcustomizations)

### Functions

- [getDummyData](lib_mongo_test.md#getdummydata)
- [hydrateDb](lib_mongo_test.md#hydratedb)
- [setupMemoryServerOverride](lib_mongo_test.md#setupmemoryserveroverride)

## Type Aliases

### DummyData

Ƭ **DummyData**: `Object`

Generic dummy data used to hydrate databases and their collections.

#### Index signature

▪ [databaseName: `string`]: { `[collectionName: string]`: `unknown`; `_generatedAt`: `number`  }

#### Defined in

[lib/mongo-test/index.ts:32](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-test/index.ts#L32)

___

### TestCustomizations

Ƭ **TestCustomizations**: `Object`

For use when mocking the contents of files containing `getDummyData` and/or
`getSchemaConfig`.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getDummyData` | () => `Promise`<[`DummyData`](lib_mongo_test.md#dummydata)\> |
| `getSchemaConfig` | () => `Promise`<[`DbSchema`](lib_mongo_schema.md#dbschema)\> |

#### Defined in

[lib/mongo-test/index.ts:55](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-test/index.ts#L55)

## Functions

### getDummyData

▸ **getDummyData**(): `Promise`<[`DummyData`](lib_mongo_test.md#dummydata)\>

Imports `getDummyData` from "configverse/get-dummy-data" and calls it.

#### Returns

`Promise`<[`DummyData`](lib_mongo_test.md#dummydata)\>

#### Defined in

[lib/mongo-test/index.ts:63](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-test/index.ts#L63)

___

### hydrateDb

▸ **hydrateDb**(`«destructured»`): `Promise`<`void`\>

Fill an initialized database with data. You should call [initializeDb](lib_mongo_schema.md#initializedb)
before calling this function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `name` | `string` | The name or alias of the database to hydrate. |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/mongo-test/index.ts:82](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-test/index.ts#L82)

___

### setupMemoryServerOverride

▸ **setupMemoryServerOverride**(`params?`): `Object`

Setup per-test versions of the mongodb client and database connections using
jest lifecycle hooks.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params?` | `Object` | - |
| `params.defer?` | `boolean` | If `true`, `beforeEach` and `afterEach` lifecycle hooks are skipped and the database is initialized and hydrated once before all tests are run. **In this mode, all tests will share the same database state!** **`Default`** ```ts false ``` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `reinitializeServer` | () => `Promise`<`void`\> |

#### Defined in

[lib/mongo-test/index.ts:154](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-test/index.ts#L154)
