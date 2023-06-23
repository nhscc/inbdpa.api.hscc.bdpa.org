[inbdpa.api.hscc.bdpa.org](../README.md) / [test/setup](../modules/test_setup.md) / MockFixture

# Interface: MockFixture<Context\>

[test/setup](../modules/test_setup.md).MockFixture

## Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | [`FixtureContext`](test_setup.FixtureContext.md) |

## Table of contents

### Properties

- [description](test_setup.MockFixture.md#description)
- [name](test_setup.MockFixture.md#name)
- [setup](test_setup.MockFixture.md#setup)
- [teardown](test_setup.MockFixture.md#teardown)

## Properties

### description

• **description**: `string` \| [`ReturnsString`](../modules/test_setup.md#returnsstring)<`Context`\>

#### Defined in

[test/setup.ts:821](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L821)

___

### name

• **name**: `string` \| `symbol` \| [`ReturnsString`](../modules/test_setup.md#returnsstring)<`Context`\>

#### Defined in

[test/setup.ts:820](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L820)

___

### setup

• `Optional` **setup**: [`FixtureAction`](../modules/test_setup.md#fixtureaction)<`Context`\>

#### Defined in

[test/setup.ts:822](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L822)

___

### teardown

• `Optional` **teardown**: [`FixtureAction`](../modules/test_setup.md#fixtureaction)<`Context`\>

#### Defined in

[test/setup.ts:823](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L823)
