[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / DummyError

# Class: DummyError

[src/error](../modules/src_error.md).DummyError

Represents a generic pseudo-error meant to be thrown, caught, and consumed
during testing (e.g. Jest) to verify error handling behavior.

**This class MUST NEVER appear in production code.**

## Hierarchy

- [`TrialError`](src_error.TrialError.md)

  ↳ **`DummyError`**

## Table of contents

### Constructors

- [constructor](src_error.DummyError.md#constructor)

### Properties

- [cause](src_error.DummyError.md#cause)
- [message](src_error.DummyError.md#message)
- [name](src_error.DummyError.md#name)
- [stack](src_error.DummyError.md#stack)
- [prepareStackTrace](src_error.DummyError.md#preparestacktrace)
- [stackTraceLimit](src_error.DummyError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.DummyError.md#capturestacktrace)

## Constructors

### constructor

• **new DummyError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Inherited from

[TrialError](src_error.TrialError.md).[constructor](src_error.TrialError.md#constructor)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1060

• **new DummyError**(`message?`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Inherited from

[TrialError](src_error.TrialError.md).[constructor](src_error.TrialError.md#constructor)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:28

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[TrialError](src_error.TrialError.md).[cause](src_error.TrialError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

[TrialError](src_error.TrialError.md).[message](src_error.TrialError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[TrialError](src_error.TrialError.md).[name](src_error.TrialError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[TrialError](src_error.TrialError.md).[stack](src_error.TrialError.md#stack)

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

[TrialError](src_error.TrialError.md).[prepareStackTrace](src_error.TrialError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[TrialError](src_error.TrialError.md).[stackTraceLimit](src_error.TrialError.md#stacktracelimit)

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

[TrialError](src_error.TrialError.md).[captureStackTrace](src_error.TrialError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
