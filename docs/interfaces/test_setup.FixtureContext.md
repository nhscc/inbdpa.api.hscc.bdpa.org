[inbdpa.api.hscc.bdpa.org](../README.md) / [test/setup](../modules/test_setup.md) / FixtureContext

# Interface: FixtureContext<CustomOptions\>

[test/setup](../modules/test_setup.md).FixtureContext

## Type parameters

| Name | Type |
| :------ | :------ |
| `CustomOptions` | extends `Record`<`string`, `unknown`\> = {} |

## Hierarchy

- `Partial`<[`TestResultProvider`](test_setup.TestResultProvider.md)\>

- `Partial`<[`TreeOutputProvider`](test_setup.TreeOutputProvider.md)\>

- `Partial`<[`GitProvider`](test_setup.GitProvider.md)\>

  ↳ **`FixtureContext`**

## Table of contents

### Properties

- [debug](test_setup.FixtureContext.md#debug)
- [fileContents](test_setup.FixtureContext.md#filecontents)
- [git](test_setup.FixtureContext.md#git)
- [options](test_setup.FixtureContext.md#options)
- [root](test_setup.FixtureContext.md#root)
- [testIdentifier](test_setup.FixtureContext.md#testidentifier)
- [testResult](test_setup.FixtureContext.md#testresult)
- [treeOutput](test_setup.FixtureContext.md#treeoutput)
- [using](test_setup.FixtureContext.md#using)

## Properties

### debug

• **debug**: [`Debugger`](lib_debug_extended.Debugger.md)

#### Defined in

[test/setup.ts:789](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L789)

___

### fileContents

• **fileContents**: `Object`

#### Index signature

▪ [filePath: `string`]: `string`

#### Defined in

[test/setup.ts:788](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L788)

___

### git

• `Optional` **git**: `SimpleGit`

#### Inherited from

Partial.git

#### Defined in

[test/setup.ts:804](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L804)

___

### options

• **options**: [`FixtureOptions`](test_setup.FixtureOptions.md) & `CustomOptions`

#### Defined in

[test/setup.ts:786](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L786)

___

### root

• **root**: `string`

#### Defined in

[test/setup.ts:784](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L784)

___

### testIdentifier

• **testIdentifier**: `string`

#### Defined in

[test/setup.ts:785](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L785)

___

### testResult

• `Optional` **testResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exitCode` | `number` |
| `stderr` | `string` |
| `stdout` | `string` |

#### Inherited from

Partial.testResult

#### Defined in

[test/setup.ts:794](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L794)

___

### treeOutput

• `Optional` **treeOutput**: `string`

#### Inherited from

Partial.treeOutput

#### Defined in

[test/setup.ts:799](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L799)

___

### using

• **using**: [`MockFixture`](test_setup.MockFixture.md)<[`FixtureContext`](test_setup.FixtureContext.md)<{}\>\>[]

#### Defined in

[test/setup.ts:787](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L787)
