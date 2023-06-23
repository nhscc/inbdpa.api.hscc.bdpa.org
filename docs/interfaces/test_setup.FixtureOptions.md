[inbdpa.api.hscc.bdpa.org](../README.md) / [test/setup](../modules/test_setup.md) / FixtureOptions

# Interface: FixtureOptions

[test/setup](../modules/test_setup.md).FixtureOptions

## Hierarchy

- `Partial`<[`WebpackTestFixtureOptions`](test_setup.WebpackTestFixtureOptions.md)\>

- `Partial`<[`GitRepositoryFixtureOptions`](test_setup.GitRepositoryFixtureOptions.md)\>

- `Partial`<[`DummyDirectoriesFixtureOptions`](test_setup.DummyDirectoriesFixtureOptions.md)\>

  ↳ **`FixtureOptions`**

## Table of contents

### Properties

- [directoryPaths](test_setup.FixtureOptions.md#directorypaths)
- [initialFileContents](test_setup.FixtureOptions.md#initialfilecontents)
- [performCleanup](test_setup.FixtureOptions.md#performcleanup)
- [setupGit](test_setup.FixtureOptions.md#setupgit)
- [use](test_setup.FixtureOptions.md#use)
- [webpackVersion](test_setup.FixtureOptions.md#webpackversion)

## Properties

### directoryPaths

• `Optional` **directoryPaths**: `string`[]

#### Inherited from

Partial.directoryPaths

#### Defined in

[test/setup.ts:775](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L775)

___

### initialFileContents

• **initialFileContents**: `Object`

#### Index signature

▪ [filePath: `string`]: `string`

#### Defined in

[test/setup.ts:760](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L760)

___

### performCleanup

• **performCleanup**: `boolean`

#### Defined in

[test/setup.ts:758](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L758)

___

### setupGit

• `Optional` **setupGit**: (`git`: `SimpleGit`) => `unknown`

#### Type declaration

▸ (`git`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `git` | `SimpleGit` |

##### Returns

`unknown`

#### Inherited from

Partial.setupGit

#### Defined in

[test/setup.ts:770](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L770)

___

### use

• **use**: [`MockFixture`](test_setup.MockFixture.md)<[`FixtureContext`](test_setup.FixtureContext.md)<{}\>\>[]

#### Defined in

[test/setup.ts:759](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L759)

___

### webpackVersion

• `Optional` **webpackVersion**: `string`

#### Inherited from

Partial.webpackVersion

#### Defined in

[test/setup.ts:765](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L765)
