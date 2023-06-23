[inbdpa.api.hscc.bdpa.org](../README.md) / [test/setup](../modules/test_setup.md) / FactoryExhaustionError

# Class: FactoryExhaustionError

[test/setup](../modules/test_setup.md).FactoryExhaustionError

Represents a generic failure that occurred during testing (e.g. with Jest).

## Hierarchy

- [`TrialError`](src_error.TrialError.md)

  ↳ **`FactoryExhaustionError`**

## Table of contents

### Constructors

- [constructor](test_setup.FactoryExhaustionError.md#constructor)

### Properties

- [cause](test_setup.FactoryExhaustionError.md#cause)
- [message](test_setup.FactoryExhaustionError.md#message)
- [name](test_setup.FactoryExhaustionError.md#name)
- [stack](test_setup.FactoryExhaustionError.md#stack)
- [prepareStackTrace](test_setup.FactoryExhaustionError.md#preparestacktrace)
- [stackTraceLimit](test_setup.FactoryExhaustionError.md#stacktracelimit)

### Methods

- [captureStackTrace](test_setup.FactoryExhaustionError.md#capturestacktrace)

## Constructors

### constructor

• **new FactoryExhaustionError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Inherited from

[TrialError](src_error.TrialError.md).[constructor](src_error.TrialError.md#constructor)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1060

• **new FactoryExhaustionError**(`message?`, `options?`)

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
