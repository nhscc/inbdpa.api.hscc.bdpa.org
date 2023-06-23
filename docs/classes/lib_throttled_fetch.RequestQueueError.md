[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/throttled-fetch](../modules/lib_throttled_fetch.md) / RequestQueueError

# Class: RequestQueueError

[lib/throttled-fetch](../modules/lib_throttled_fetch.md).RequestQueueError

Thrown in response to a queue-related error.

## Hierarchy

- `Error`

  ↳ **`RequestQueueError`**

  ↳↳ [`RequestQueueClearedError`](lib_throttled_fetch.RequestQueueClearedError.md)

## Table of contents

### Constructors

- [constructor](lib_throttled_fetch.RequestQueueError.md#constructor)

### Properties

- [cause](lib_throttled_fetch.RequestQueueError.md#cause)
- [message](lib_throttled_fetch.RequestQueueError.md#message)
- [name](lib_throttled_fetch.RequestQueueError.md#name)
- [stack](lib_throttled_fetch.RequestQueueError.md#stack)
- [prepareStackTrace](lib_throttled_fetch.RequestQueueError.md#preparestacktrace)
- [stackTraceLimit](lib_throttled_fetch.RequestQueueError.md#stacktracelimit)

### Methods

- [captureStackTrace](lib_throttled_fetch.RequestQueueError.md#capturestacktrace)

## Constructors

### constructor

• **new RequestQueueError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1060

• **new RequestQueueError**(`message?`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:28

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

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
