[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / InvalidItemError

# Class: InvalidItemError<T\>

[src/error](../modules/src_error.md).InvalidItemError

Represents encountering an invalid item as the result of bad user input.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

## Hierarchy

- [`ClientValidationError`](src_error.ClientValidationError.md)

  ↳ **`InvalidItemError`**

## Table of contents

### Constructors

- [constructor](src_error.InvalidItemError.md#constructor)

### Properties

- [cause](src_error.InvalidItemError.md#cause)
- [item](src_error.InvalidItemError.md#item)
- [itemName](src_error.InvalidItemError.md#itemname)
- [message](src_error.InvalidItemError.md#message)
- [name](src_error.InvalidItemError.md#name)
- [stack](src_error.InvalidItemError.md#stack)
- [prepareStackTrace](src_error.InvalidItemError.md#preparestacktrace)
- [stackTraceLimit](src_error.InvalidItemError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.InvalidItemError.md#capturestacktrace)

## Constructors

### constructor

• **new InvalidItemError**<`T`\>(`item?`, `itemName?`)

Represents encountering an invalid item as the result of bad user input.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item?` | `T` |
| `itemName?` | `string` |

#### Overrides

[ClientValidationError](src_error.ClientValidationError.md).[constructor](src_error.ClientValidationError.md#constructor)

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-item.d.ts:11

• **new InvalidItemError**<`T`\>(`item`, `itemName`, `message`)

This constructor syntax is used by subclasses when calling this constructor
via `super`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `T` |
| `itemName` | `string` |
| `message` | `string` |

#### Overrides

ClientValidationError.constructor

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-item.d.ts:16

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[ClientValidationError](src_error.ClientValidationError.md).[cause](src_error.ClientValidationError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### item

• `Readonly` **item**: `undefined` \| `T`

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-item.d.ts:6

___

### itemName

• `Readonly` **itemName**: `string`

#### Defined in

node_modules/named-app-errors/dist/modules/error/validation/client-validation/invalid-item.d.ts:7

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
