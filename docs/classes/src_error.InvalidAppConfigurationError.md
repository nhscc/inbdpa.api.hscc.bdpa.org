[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / InvalidAppConfigurationError

# Class: InvalidAppConfigurationError

[src/error](../modules/src_error.md).InvalidAppConfigurationError

Represents an application misconfiguration outside the user's control.

## Hierarchy

- [`AppValidationError`](src_error.AppValidationError.md)

  ↳ **`InvalidAppConfigurationError`**

## Table of contents

### Constructors

- [constructor](src_error.InvalidAppConfigurationError.md#constructor)

### Properties

- [cause](src_error.InvalidAppConfigurationError.md#cause)
- [details](src_error.InvalidAppConfigurationError.md#details)
- [message](src_error.InvalidAppConfigurationError.md#message)
- [name](src_error.InvalidAppConfigurationError.md#name)
- [stack](src_error.InvalidAppConfigurationError.md#stack)
- [prepareStackTrace](src_error.InvalidAppConfigurationError.md#preparestacktrace)
- [stackTraceLimit](src_error.InvalidAppConfigurationError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.InvalidAppConfigurationError.md#capturestacktrace)

## Constructors

### constructor

• **new InvalidAppConfigurationError**(`details?`)

Represents an application misconfiguration outside the user's control.

#### Parameters

| Name | Type |
| :------ | :------ |
| `details?` | `string` |

#### Overrides

[AppValidationError](src_error.AppValidationError.md).[constructor](src_error.AppValidationError.md#constructor)

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/app-validation/invalid-app-configuration.d.ts:10

• **new InvalidAppConfigurationError**(`details`, `message`)

This constructor syntax is used by subclasses when calling this constructor
via `super`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `details` | `string` |
| `message` | `string` |

#### Overrides

AppValidationError.constructor

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/app-validation/invalid-app-configuration.d.ts:15

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[AppValidationError](src_error.AppValidationError.md).[cause](src_error.AppValidationError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### details

• `Readonly` **details**: `undefined` \| `string`

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/app-validation/invalid-app-configuration.d.ts:6

___

### message

• **message**: `string`

#### Inherited from

[AppValidationError](src_error.AppValidationError.md).[message](src_error.AppValidationError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[AppValidationError](src_error.AppValidationError.md).[name](src_error.AppValidationError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[AppValidationError](src_error.AppValidationError.md).[stack](src_error.AppValidationError.md#stack)

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

[AppValidationError](src_error.AppValidationError.md).[prepareStackTrace](src_error.AppValidationError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[AppValidationError](src_error.AppValidationError.md).[stackTraceLimit](src_error.AppValidationError.md#stacktracelimit)

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

[AppValidationError](src_error.AppValidationError.md).[captureStackTrace](src_error.AppValidationError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
