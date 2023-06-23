[inbdpa.api.hscc.bdpa.org](../README.md) / [src/error](../modules/src_error.md) / ItemNotFoundError

# Class: ItemNotFoundError<T\>

[src/error](../modules/src_error.md).ItemNotFoundError

Represents a failure to locate a specific item or resource, optionally
represented by a string literal `name` or the item's constructor name.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Hierarchy

- [`NotFoundError`](src_error.NotFoundError.md)

  ↳ **`ItemNotFoundError`**

## Table of contents

### Constructors

- [constructor](src_error.ItemNotFoundError.md#constructor)

### Properties

- [cause](src_error.ItemNotFoundError.md#cause)
- [item](src_error.ItemNotFoundError.md#item)
- [itemName](src_error.ItemNotFoundError.md#itemname)
- [message](src_error.ItemNotFoundError.md#message)
- [name](src_error.ItemNotFoundError.md#name)
- [stack](src_error.ItemNotFoundError.md#stack)
- [prepareStackTrace](src_error.ItemNotFoundError.md#preparestacktrace)
- [stackTraceLimit](src_error.ItemNotFoundError.md#stacktracelimit)

### Methods

- [captureStackTrace](src_error.ItemNotFoundError.md#capturestacktrace)

## Constructors

### constructor

• **new ItemNotFoundError**<`T`\>(`item?`, `itemName?`)

Represents a failure to locate a specific item or resource, optionally
represented by a string literal `name` or the item's constructor name.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item?` | `T` |
| `itemName?` | `string` |

#### Overrides

[NotFoundError](src_error.NotFoundError.md).[constructor](src_error.NotFoundError.md#constructor)

#### Defined in

node_modules/named-app-errors/dist/modules/error/not-found/item-not-found.d.ts:13

• **new ItemNotFoundError**<`T`\>(`item`, `itemName`, `message`)

This constructor syntax is used by subclasses when calling this constructor
via `super`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `T` |
| `itemName` | `string` |
| `message` | `string` |

#### Overrides

NotFoundError.constructor

#### Defined in

node_modules/named-app-errors/dist/modules/error/not-found/item-not-found.d.ts:18

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[NotFoundError](src_error.NotFoundError.md).[cause](src_error.NotFoundError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### item

• `Readonly` **item**: `undefined` \| `T`

#### Defined in

node_modules/named-app-errors/dist/modules/error/not-found/item-not-found.d.ts:7

___

### itemName

• `Readonly` **itemName**: `undefined` \| `string`

#### Defined in

node_modules/named-app-errors/dist/modules/error/not-found/item-not-found.d.ts:8

___

### message

• **message**: `string`

#### Inherited from

[NotFoundError](src_error.NotFoundError.md).[message](src_error.NotFoundError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### name

• **name**: `string`

#### Inherited from

[NotFoundError](src_error.NotFoundError.md).[name](src_error.NotFoundError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[NotFoundError](src_error.NotFoundError.md).[stack](src_error.NotFoundError.md#stack)

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

[NotFoundError](src_error.NotFoundError.md).[prepareStackTrace](src_error.NotFoundError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[NotFoundError](src_error.NotFoundError.md).[stackTraceLimit](src_error.NotFoundError.md#stacktracelimit)

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

[NotFoundError](src_error.NotFoundError.md).[captureStackTrace](src_error.NotFoundError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
