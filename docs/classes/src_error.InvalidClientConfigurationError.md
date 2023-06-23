[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / InvalidClientConfigurationError

# Class: InvalidClientConfigurationError

[src/error](../modules/src_error.md).InvalidClientConfigurationError

Represents a user-provided misconfiguration.

## Hierarchy

- [`ClientValidationError`](src_error.ClientValidationError.md)

  ↳ **`InvalidClientConfigurationError`**

## Table of contents

### Constructors

- [constructor](src_error.InvalidClientConfigurationError.md#constructor)

### Properties

- [cause](src_error.InvalidClientConfigurationError.md#cause)
- [details](src_error.InvalidClientConfigurationError.md#details)
- [message](src_error.InvalidClientConfigurationError.md#message)
- [name](src_error.InvalidClientConfigurationError.md#name)
- [stack](src_error.InvalidClientConfigurationError.md#stack)
- [prepareStackTrace](src_error.InvalidClientConfigurationError.md#preparestacktrace)
- [stackTraceLimit](src_error.InvalidClientConfigurationError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.InvalidClientConfigurationError.md#capturestacktrace)

## Constructors

### constructor

• **new InvalidClientConfigurationError**(`details?`)

Represents a user-provided misconfiguration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `details?` | `string` |

#### Overrides

[ClientValidationError](src_error.ClientValidationError.md).[constructor](src_error.ClientValidationError.md#constructor)

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-client-configuration.d.ts:10

• **new InvalidClientConfigurationError**(`details`, `message`)

This constructor syntax is used by subclasses when calling this constructor
via `super`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `details` | `string` |
| `message` | `string` |

#### Overrides

ClientValidationError.constructor

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-client-configuration.d.ts:15

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[ClientValidationError](src_error.ClientValidationError.md).[cause](src_error.ClientValidationError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### details

• `Readonly` **details**: `undefined` \| `string`

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-client-configuration.d.ts:6

___

### message

• **message**: `string`

#### Inherited from

[ClientValidationError](src_error.ClientValidationError.md).[message](src_error.ClientValidationError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[ClientValidationError](src_error.ClientValidationError.md).[name](src_error.ClientValidationError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[ClientValidationError](src_error.ClientValidationError.md).[stack](src_error.ClientValidationError.md#stack)

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

[ClientValidationError](src_error.ClientValidationError.md).[prepareStackTrace](src_error.ClientValidationError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[ClientValidationError](src_error.ClientValidationError.md).[stackTraceLimit](src_error.ClientValidationError.md#stacktracelimit)

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

[ClientValidationError](src_error.ClientValidationError.md).[captureStackTrace](src_error.ClientValidationError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
