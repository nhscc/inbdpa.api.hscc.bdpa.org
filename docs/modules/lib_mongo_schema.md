[inbdpa.api.hscc.bdpa.org](../README.md) / lib/mongo-schema

# Module: lib/mongo-schema

## Table of contents

### Type Aliases

- [CollectionSchema](lib_mongo_schema.md#collectionschema)
- [DbSchema](lib_mongo_schema.md#dbschema)
- [InternalMemory](lib_mongo_schema.md#internalmemory)

### Functions

- [closeClient](lib_mongo_schema.md#closeclient)
- [destroyDb](lib_mongo_schema.md#destroydb)
- [getAliasFromName](lib_mongo_schema.md#getaliasfromname)
- [getClient](lib_mongo_schema.md#getclient)
- [getDb](lib_mongo_schema.md#getdb)
- [getInitialInternalMemoryState](lib_mongo_schema.md#getinitialinternalmemorystate)
- [getNameFromAlias](lib_mongo_schema.md#getnamefromalias)
- [getSchemaConfig](lib_mongo_schema.md#getschemaconfig)
- [initializeDb](lib_mongo_schema.md#initializedb)
- [overwriteMemory](lib_mongo_schema.md#overwritememory)

## Type Aliases

### CollectionSchema

Ƭ **CollectionSchema**: `Object`

A configuration object representing a MongoDB collection.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `createOptions?` | `Parameters`<`Db`[``"createCollection"``]\>[``1``] | An object passed directly to the MongoDB `createCollection` function via the `createOptions` parameter. |
| `indices?` | { `options?`: `createIndexParams`[``2``] ; `spec`: `createIndexParams`[``1``]  }[] | An object representing indices to be created on the MongoDB collection via `createIndex`. |
| `name` | `string` | The valid MongoDB name of the collection. |

#### Defined in

[lib/mongo-schema/index.ts:37](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L37)

___

### DbSchema

Ƭ **DbSchema**: `Object`

A configuration object representing one or more MongoDB databases and their
aliases.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `aliases` | `Record`<`string`, `string`\> | These are alternative names to use with `getDb` that map to the names of databases known to this system. Aliases are specified as `alias: real-name`. |
| `databases` | `Record`<`string`, { `collections`: (`string` \| [`CollectionSchema`](lib_mongo_schema.md#collectionschema))[]  }\> | All databases known to this system. These can be accessed via `getDb`. |

#### Defined in

[lib/mongo-schema/index.ts:61](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L61)

___

### InternalMemory

Ƭ **InternalMemory**: `Object`

An internal cache of connection, server schema, and database state.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `MongoClient` \| ``null`` | Memoized MongoDB driver client connection. |
| `databases` | `Record`<`string`, `Db`\> | Memoized MongoDB driver Database instances. |
| `schema` | [`DbSchema`](lib_mongo_schema.md#dbschema) \| ``null`` | Memoized resolved database schemas and aliases. |

#### Defined in

[lib/mongo-schema/index.ts:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L19)

## Functions

### closeClient

▸ **closeClient**(): `Promise`<`void`\>

Kills the MongoClient instance and any related database connections and
clears internal memory.

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/mongo-schema/index.ts:148](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L148)

___

### destroyDb

▸ **destroyDb**(`«destructured»`): `Promise`<`boolean`\>

Drops a database, destroying its collections. If the database does not exist
before calling this function, it will be created first then dropped.

Note that this function does not clear the destroyed database's Db instance
from internal memory for performance reasons.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `name` | `string` | The name or alias of the database to destroy. |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[lib/mongo-schema/index.ts:262](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L262)

___

### getAliasFromName

▸ **getAliasFromName**(`nameActual`): `Promise`<`string`[]\>

Accepts a database name (or an alias) and returns one or more aliases. If the
named database has no aliases listed in the schema, said database name is
returned as a single-element array. If said database name is not listed in
the schema, an error is thrown.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nameActual` | `string` |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[lib/mongo-schema/index.ts:185](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L185)

___

### getClient

▸ **getClient**(): `Promise`<`MongoClient`\>

Lazily connects to the server on-demand, memoizing the result.

#### Returns

`Promise`<`MongoClient`\>

#### Defined in

[lib/mongo-schema/index.ts:132](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L132)

___

### getDb

▸ **getDb**(`«destructured»`): `Promise`<`Db`\>

Lazily connects to a database on-demand, memoizing the result. If the
database does not yet exist, it is both created and initialized by this
function. The latter can be prevented by setting `initialize` to `false`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `initialize?` | `boolean` | Set to `false` to prevent `getDb` from calling `initializeDb` if the database does not exist prior to acquiring it. **`Default`** ```ts true ``` |
| › `name` | `string` | The name or alias of the database to retrieve. |

#### Returns

`Promise`<`Db`\>

#### Defined in

[lib/mongo-schema/index.ts:216](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L216)

___

### getInitialInternalMemoryState

▸ **getInitialInternalMemoryState**(): [`InternalMemory`](lib_mongo_schema.md#internalmemory)

Returns a copy of the initial state of internal memory. Useful when
overwriting internal memory.

#### Returns

[`InternalMemory`](lib_mongo_schema.md#internalmemory)

#### Defined in

[lib/mongo-schema/index.ts:87](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L87)

___

### getNameFromAlias

▸ **getNameFromAlias**(`alias`): `Promise`<`string`\>

Accepts a database alias (or real name) and returns its real name. If the
actual database is not listed in the schema, an error is thrown.

#### Parameters

| Name | Type |
| :------ | :------ |
| `alias` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[lib/mongo-schema/index.ts:162](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L162)

___

### getSchemaConfig

▸ **getSchemaConfig**(): `Promise`<[`DbSchema`](lib_mongo_schema.md#dbschema)\>

Imports `getSchemaConfig` from "configverse/get-schema-config", calls it, and
memoizes the result.

#### Returns

`Promise`<[`DbSchema`](lib_mongo_schema.md#dbschema)\>

#### Defined in

[lib/mongo-schema/index.ts:99](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L99)

___

### initializeDb

▸ **initializeDb**(`«destructured»`): `Promise`<`void`\>

Creates a database and initializes its collections. If the database does not
exist before calling this function, it will be created first. This function
should only be called on empty or brand new databases **and not on databases
with pre-existing collections.**

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `name` | `string` | The name or alias of the database to initialize. |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/mongo-schema/index.ts:281](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L281)

___

### overwriteMemory

▸ **overwriteMemory**(`newMemory`): `void`

Mutates internal memory. Used for testing purposes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `newMemory` | [`InternalMemory`](lib_mongo_schema.md#internalmemory) |

#### Returns

`void`

#### Defined in

[lib/mongo-schema/index.ts:124](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/mongo-schema/index.ts#L124)
