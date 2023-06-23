[inbdpa.api.hscc.bdpa.org](../README.md) / [test/setup](../modules/test_setup.md) / MockedProcessExit

# Class: MockedProcessExit

[test/setup](../modules/test_setup.md).MockedProcessExit

Represents a call to process.exit that has been mocked by `withMockedExit`.

## Hierarchy

- `Error`

  ↳ **`MockedProcessExit`**

## Table of contents

### Constructors

- [constructor](test_setup.MockedProcessExit.md#constructor)

### Properties

- [cause](test_setup.MockedProcessExit.md#cause)
- [code](test_setup.MockedProcessExit.md#code)
- [message](test_setup.MockedProcessExit.md#message)
- [name](test_setup.MockedProcessExit.md#name)
- [stack](test_setup.MockedProcessExit.md#stack)
- [prepareStackTrace](test_setup.MockedProcessExit.md#preparestacktrace)
- [stackTraceLimit](test_setup.MockedProcessExit.md#stacktracelimit)

### Methods

- [captureStackTrace](test_setup.MockedProcessExit.md#capturestacktrace)

## Constructors

### constructor

• **new MockedProcessExit**(`code?`)

Represents a call to process.exit that has been mocked by `withMockedExit`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `code?` | `number` |

#### Overrides

Error.constructor

#### Defined in

[test/setup.ts:512](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L512)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### code

• `Optional` `Readonly` **code**: `number`

#### Defined in

[test/setup.ts:512](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L512)

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
