[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/json-unfetch](../modules/lib_json_unfetch.md) / JsonUnfetchError

# Class: JsonUnfetchError<T\>

[lib/json-unfetch](../modules/lib_json_unfetch.md).JsonUnfetchError

Represents a JSON (un)Fetch error.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `JsonObject` \| `JsonPrimitive` \| `undefined` |

## Hierarchy

- `Error`

  ↳ **`JsonUnfetchError`**

## Table of contents

### Constructors

- [constructor](lib_json_unfetch.JsonUnfetchError.md#constructor)

### Properties

- [cause](lib_json_unfetch.JsonUnfetchError.md#cause)
- [json](lib_json_unfetch.JsonUnfetchError.md#json)
- [message](lib_json_unfetch.JsonUnfetchError.md#message)
- [name](lib_json_unfetch.JsonUnfetchError.md#name)
- [res](lib_json_unfetch.JsonUnfetchError.md#res)
- [stack](lib_json_unfetch.JsonUnfetchError.md#stack)
- [prepareStackTrace](lib_json_unfetch.JsonUnfetchError.md#preparestacktrace)
- [stackTraceLimit](lib_json_unfetch.JsonUnfetchError.md#stacktracelimit)

### Methods

- [captureStackTrace](lib_json_unfetch.JsonUnfetchError.md#capturestacktrace)

## Constructors

### constructor

• **new JsonUnfetchError**<`T`\>(`res`, `json`, `message`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `undefined` \| `JsonObject` \| `JsonPrimitive` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `undefined` \| `UnfetchResponse` |
| `json` | `T` |
| `message` | `string` |

#### Overrides

Error.constructor

#### Defined in

[lib/json-unfetch/index.ts:17](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L17)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### json

• `Readonly` **json**: `T`

#### Defined in

[lib/json-unfetch/index.ts:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L19)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### res

• `Readonly` **res**: `undefined` \| `UnfetchResponse`

#### Defined in

[lib/json-unfetch/index.ts:18](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L18)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1056

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

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

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

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
