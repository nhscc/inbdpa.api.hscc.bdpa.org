[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / AppValidationError

# Class: AppValidationError

[src/error](../modules/src_error.md).AppValidationError

Represents a generic validation failure outside of the user's control.

## Hierarchy

- [`ValidationError`](src_error.ValidationError.md)

  ↳ **`AppValidationError`**

  ↳↳ [`InvalidAppConfigurationError`](src_error.InvalidAppConfigurationError.md)

  ↳↳ [`InvalidAppEnvironmentError`](src_error.InvalidAppEnvironmentError.md)

## Table of contents

### Constructors

- [constructor](src_error.AppValidationError.md#constructor)

### Properties

- [cause](src_error.AppValidationError.md#cause)
- [message](src_error.AppValidationError.md#message)
- [name](src_error.AppValidationError.md#name)
- [stack](src_error.AppValidationError.md#stack)
- [prepareStackTrace](src_error.AppValidationError.md#preparestacktrace)
- [stackTraceLimit](src_error.AppValidationError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.AppValidationError.md#capturestacktrace)

## Constructors

### constructor

• **new AppValidationError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Overrides

[ValidationError](src_error.ValidationError.md).[constructor](src_error.ValidationError.md#constructor)

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/app-validation/app-validation.d.ts:6

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[ValidationError](src_error.ValidationError.md).[cause](src_error.ValidationError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

[ValidationError](src_error.ValidationError.md).[message](src_error.ValidationError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[ValidationError](src_error.ValidationError.md).[name](src_error.ValidationError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[ValidationError](src_error.ValidationError.md).[stack](src_error.ValidationError.md#stack)

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

[ValidationError](src_error.ValidationError.md).[prepareStackTrace](src_error.ValidationError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[ValidationError](src_error.ValidationError.md).[stackTraceLimit](src_error.ValidationError.md#stacktracelimit)

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

[ValidationError](src_error.ValidationError.md).[captureStackTrace](src_error.ValidationError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
