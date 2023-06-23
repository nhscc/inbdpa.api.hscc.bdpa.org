[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / AppError

# Class: AppError

[src/error](../modules/src_error.md).AppError

Represents a generic application exception.

## Hierarchy

- `Error`

  ↳ **`AppError`**

  ↳↳ [`AuthError`](src_error.AuthError.md)

  ↳↳ [`HttpError`](src_error.HttpError.md)

  ↳↳ [`NotFoundError`](src_error.NotFoundError.md)

  ↳↳ [`TrialError`](src_error.TrialError.md)

  ↳↳ [`ValidationError`](src_error.ValidationError.md)

  ↳↳ [`GuruMeditationError`](src_error.GuruMeditationError.md)

  ↳↳ [`NotImplementedError`](src_error.NotImplementedError.md)

## Table of contents

### Constructors

- [constructor](src_error.AppError.md#constructor)

### Properties

- [cause](src_error.AppError.md#cause)
- [message](src_error.AppError.md#message)
- [name](src_error.AppError.md#name)
- [stack](src_error.AppError.md#stack)
- [prepareStackTrace](src_error.AppError.md#preparestacktrace)
- [stackTraceLimit](src_error.AppError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.AppError.md#capturestacktrace)

## Constructors

### constructor

• **new AppError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1060

• **new AppError**(`message?`, `options?`)

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
