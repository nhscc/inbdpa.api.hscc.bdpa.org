[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / NotAuthenticatedError

# Class: NotAuthenticatedError

[src/error](../modules/src_error.md).NotAuthenticatedError

Represents a failure to authenticate.

## Hierarchy

- [`AuthError`](src_error.AuthError.md)

  ↳ **`NotAuthenticatedError`**

## Table of contents

### Constructors

- [constructor](src_error.NotAuthenticatedError.md#constructor)

### Properties

- [cause](src_error.NotAuthenticatedError.md#cause)
- [message](src_error.NotAuthenticatedError.md#message)
- [name](src_error.NotAuthenticatedError.md#name)
- [stack](src_error.NotAuthenticatedError.md#stack)
- [prepareStackTrace](src_error.NotAuthenticatedError.md#preparestacktrace)
- [stackTraceLimit](src_error.NotAuthenticatedError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.NotAuthenticatedError.md#capturestacktrace)

## Constructors

### constructor

• **new NotAuthenticatedError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Overrides

[AuthError](src_error.AuthError.md).[constructor](src_error.AuthError.md#constructor)

#### Defined in

node_modules/named-app-errors/dist/modules/error/auth/not-authenticated.d.ts:6

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[AuthError](src_error.AuthError.md).[cause](src_error.AuthError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

[AuthError](src_error.AuthError.md).[message](src_error.AuthError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[AuthError](src_error.AuthError.md).[name](src_error.AuthError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[AuthError](src_error.AuthError.md).[stack](src_error.AuthError.md#stack)

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

[AuthError](src_error.AuthError.md).[prepareStackTrace](src_error.AuthError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[AuthError](src_error.AuthError.md).[stackTraceLimit](src_error.AuthError.md#stacktracelimit)

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

[AuthError](src_error.AuthError.md).[captureStackTrace](src_error.AuthError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
