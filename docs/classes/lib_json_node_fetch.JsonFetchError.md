[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/json-node-fetch](../modules/lib_json_node_fetch.md) / JsonFetchError

# Class: JsonFetchError<T\>

[lib/json-node-fetch](../modules/lib_json_node_fetch.md).JsonFetchError

Represents a JSON Fetch error.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `JsonObject` \| `JsonPrimitive` \| `undefined` |

## Hierarchy

- `FetchError`

  ↳ **`JsonFetchError`**

## Table of contents

### Constructors

- [constructor](lib_json_node_fetch.JsonFetchError.md#constructor)

### Properties

- [cause](lib_json_node_fetch.JsonFetchError.md#cause)
- [code](lib_json_node_fetch.JsonFetchError.md#code)
- [errno](lib_json_node_fetch.JsonFetchError.md#errno)
- [json](lib_json_node_fetch.JsonFetchError.md#json)
- [message](lib_json_node_fetch.JsonFetchError.md#message)
- [name](lib_json_node_fetch.JsonFetchError.md#name)
- [res](lib_json_node_fetch.JsonFetchError.md#res)
- [stack](lib_json_node_fetch.JsonFetchError.md#stack)
- [type](lib_json_node_fetch.JsonFetchError.md#type)
- [prepareStackTrace](lib_json_node_fetch.JsonFetchError.md#preparestacktrace)
- [stackTraceLimit](lib_json_node_fetch.JsonFetchError.md#stacktracelimit)

### Methods

- [captureStackTrace](lib_json_node_fetch.JsonFetchError.md#capturestacktrace)

## Constructors

### constructor

• **new JsonFetchError**<`T`\>(`res`, `json`, `message`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `undefined` \| `JsonObject` \| `JsonPrimitive` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `undefined` \| `Response` |
| `json` | `T` |
| `message` | `string` |

#### Overrides

FetchError.constructor

#### Defined in

[lib/json-node-fetch/index.ts:22](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L22)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

FetchError.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### code

• `Optional` **code**: `string`

#### Inherited from

FetchError.code

#### Defined in

node_modules/@types/node-fetch/index.d.ts:164

___

### errno

• `Optional` **errno**: `string`

#### Inherited from

FetchError.errno

#### Defined in

node_modules/@types/node-fetch/index.d.ts:165

___

### json

• `Readonly` **json**: `T`

#### Defined in

[lib/json-node-fetch/index.ts:24](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L24)

___

### message

• **message**: `string`

#### Inherited from

FetchError.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: ``"FetchError"``

#### Inherited from

FetchError.name

#### Defined in

node_modules/@types/node-fetch/index.d.ts:161

___

### res

• `Readonly` **res**: `undefined` \| `Response`

#### Defined in

[lib/json-node-fetch/index.ts:23](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L23)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

FetchError.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1056

___

### type

• **type**: `string`

#### Inherited from

FetchError.type

#### Defined in

node_modules/@types/node-fetch/index.d.ts:163

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

FetchError.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

FetchError.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

FetchError.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
