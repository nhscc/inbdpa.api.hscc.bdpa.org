[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/throttled-fetch](../modules/lib_throttled_fetch.md) / RequestQueueClearedError

# Class: RequestQueueClearedError

[lib/throttled-fetch](../modules/lib_throttled_fetch.md).RequestQueueClearedError

Thrown by `addRequestToQueue` when the request was removed from the queue
without being sent or otherwise processed.

## Hierarchy

- [`RequestQueueError`](lib_throttled_fetch.RequestQueueError.md)

  ↳ **`RequestQueueClearedError`**

## Table of contents

### Constructors

- [constructor](lib_throttled_fetch.RequestQueueClearedError.md#constructor)

### Properties

- [cause](lib_throttled_fetch.RequestQueueClearedError.md#cause)
- [message](lib_throttled_fetch.RequestQueueClearedError.md#message)
- [name](lib_throttled_fetch.RequestQueueClearedError.md#name)
- [stack](lib_throttled_fetch.RequestQueueClearedError.md#stack)
- [prepareStackTrace](lib_throttled_fetch.RequestQueueClearedError.md#preparestacktrace)
- [stackTraceLimit](lib_throttled_fetch.RequestQueueClearedError.md#stacktracelimit)

### Methods

- [captureStackTrace](lib_throttled_fetch.RequestQueueClearedError.md#capturestacktrace)

## Constructors

### constructor

• **new RequestQueueClearedError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[constructor](lib_throttled_fetch.RequestQueueError.md#constructor)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1060

• **new RequestQueueClearedError**(`message?`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[constructor](lib_throttled_fetch.RequestQueueError.md#constructor)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:28

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[cause](lib_throttled_fetch.RequestQueueError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[message](lib_throttled_fetch.RequestQueueError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[name](lib_throttled_fetch.RequestQueueError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[stack](lib_throttled_fetch.RequestQueueError.md#stack)

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

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[prepareStackTrace](lib_throttled_fetch.RequestQueueError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[stackTraceLimit](lib_throttled_fetch.RequestQueueError.md#stacktracelimit)

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

[RequestQueueError](lib_throttled_fetch.RequestQueueError.md).[captureStackTrace](lib_throttled_fetch.RequestQueueError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
