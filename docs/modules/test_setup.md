[inbdpa.api.hscc.bdpa.org](../README.md) / test/setup

# Module: test/setup

## Table of contents

### Classes

- [FactoryExhaustionError](../classes/test_setup.FactoryExhaustionError.md)
- [MockedProcessExit](../classes/test_setup.MockedProcessExit.md)

### Interfaces

- [DummyDirectoriesFixtureOptions](../interfaces/test_setup.DummyDirectoriesFixtureOptions.md)
- [FixtureContext](../interfaces/test_setup.FixtureContext.md)
- [FixtureOptions](../interfaces/test_setup.FixtureOptions.md)
- [GitProvider](../interfaces/test_setup.GitProvider.md)
- [GitRepositoryFixtureOptions](../interfaces/test_setup.GitRepositoryFixtureOptions.md)
- [MockFixture](../interfaces/test_setup.MockFixture.md)
- [RunOptions](../interfaces/test_setup.RunOptions.md)
- [TestResultProvider](../interfaces/test_setup.TestResultProvider.md)
- [TreeOutputProvider](../interfaces/test_setup.TreeOutputProvider.md)
- [WebpackTestFixtureOptions](../interfaces/test_setup.WebpackTestFixtureOptions.md)

### Type Aliases

- [FixtureAction](test_setup.md#fixtureaction)
- [MockArgvOptions](test_setup.md#mockargvoptions)
- [MockEnvOptions](test_setup.md#mockenvoptions)
- [ReturnsString](test_setup.md#returnsstring)

### Variables

- [expectedEntries](test_setup.md#expectedentries)

### Functions

- [describeRootFixture](test_setup.md#describerootfixture)
- [dummyDirectoriesFixture](test_setup.md#dummydirectoriesfixture)
- [dummyFilesFixture](test_setup.md#dummyfilesfixture)
- [dummyNpmPackageFixture](test_setup.md#dummynpmpackagefixture)
- [gitRepositoryFixture](test_setup.md#gitrepositoryfixture)
- [isolatedImport](test_setup.md#isolatedimport)
- [isolatedImportFactory](test_setup.md#isolatedimportfactory)
- [itemFactory](test_setup.md#itemfactory)
- [mockArgvFactory](test_setup.md#mockargvfactory)
- [mockEnvFactory](test_setup.md#mockenvfactory)
- [mockFixtureFactory](test_setup.md#mockfixturefactory)
- [mockOutputFactory](test_setup.md#mockoutputfactory)
- [nodeImportTestFixture](test_setup.md#nodeimporttestfixture)
- [noopHandler](test_setup.md#noophandler)
- [npmLinkSelfFixture](test_setup.md#npmlinkselffixture)
- [protectedImport](test_setup.md#protectedimport)
- [protectedImportFactory](test_setup.md#protectedimportfactory)
- [rootFixture](test_setup.md#rootfixture)
- [run](test_setup.md#run)
- [runnerFactory](test_setup.md#runnerfactory)
- [webpackTestFixture](test_setup.md#webpacktestfixture)
- [withDebugEnabled](test_setup.md#withdebugenabled)
- [withMockedArgv](test_setup.md#withmockedargv)
- [withMockedEnv](test_setup.md#withmockedenv)
- [withMockedExit](test_setup.md#withmockedexit)
- [withMockedFixture](test_setup.md#withmockedfixture)
- [withMockedOutput](test_setup.md#withmockedoutput)
- [wrapHandler](test_setup.md#wraphandler)

## Type Aliases

### FixtureAction

Ƭ **FixtureAction**<`Context`\>: (`context_`: `Context`) => `Promise`<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | [`FixtureContext`](../interfaces/test_setup.FixtureContext.md) |

#### Type declaration

▸ (`context_`): `Promise`<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `context_` | `Context` |

##### Returns

`Promise`<`unknown`\>

#### Defined in

[test/setup.ts:809](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L809)

___

### MockArgvOptions

Ƭ **MockArgvOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `replace?` | `boolean` | By default, the first two elements in `process.argv` are preserved. Setting `replace` to `true` will cause the entire process.argv array to be replaced **`Default`** ```ts false ``` |

#### Defined in

[test/setup.ts:224](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L224)

___

### MockEnvOptions

Ƭ **MockEnvOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `replace?` | `boolean` | By default, the `process.env` object is emptied and re-hydrated with `newEnv`. Setting `replace` to `false` will cause `newEnv` to be appended instead **`Default`** ```ts true ``` |

#### Defined in

[test/setup.ts:234](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L234)

___

### ReturnsString

Ƭ **ReturnsString**<`Context`\>: (`context_`: `Context`) => `Promise`<`string`\> \| `string`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | [`FixtureContext`](../interfaces/test_setup.FixtureContext.md) |

#### Type declaration

▸ (`context_`): `Promise`<`string`\> \| `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `context_` | `Context` |

##### Returns

`Promise`<`string`\> \| `string`

#### Defined in

[test/setup.ts:814](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L814)

## Variables

### expectedEntries

• `Const` **expectedEntries**: `Object`

Contains the expected shapes of the gzipped tar archives under
`test/fixtures`.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `monorepo` | { `data`: `string` = ''; `headers`: `any`  }[] |
| `pkg1` | { `data`: `string` = ''; `headers`: `any`  }[] |
| `pkg2` | { `data`: `string` = ''; `headers`: `any`  }[] |

#### Defined in

[test/setup.ts:69](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L69)

## Functions

### describeRootFixture

▸ **describeRootFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:1063](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L1063)

___

### dummyDirectoriesFixture

▸ **dummyDirectoriesFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:1016](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L1016)

___

### dummyFilesFixture

▸ **dummyFilesFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:1037](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L1037)

___

### dummyNpmPackageFixture

▸ **dummyNpmPackageFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:848](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L848)

___

### gitRepositoryFixture

▸ **gitRepositoryFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:989](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L989)

___

### isolatedImport

▸ **isolatedImport**<`T`\>(`«destructured»`): `T`

Performs a module import as if it were being imported for the first time.

Note that this function breaks the "require caching" expectation of Node.js
modules. Problems can arise, for example, when closing an app-wide database
connection in your test cleanup phase and expecting it to close for the
isolated module too. In this case, the isolated module has its own isolated
"app-wide" connection that would not actually be closed and could cause your
test to hang unexpectedly, even when all tests pass.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `path` | `string` | Path to the module to import. Module resolution is handled by `require`. |
| › `useDefault?` | `boolean` | By default, only if `module.__esModule === true`, the default export will be returned instead. Use `useDefault` to override this behavior in either direction. |

#### Returns

`T`

#### Defined in

[test/setup.ts:353](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L353)

___

### isolatedImportFactory

▸ **isolatedImportFactory**<`T`\>(`«destructured»`): () => `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `path` | `string` | Path to the module to import. Module resolution is handled by `require`. |
| › `useDefault?` | `boolean` | By default, only if `module.__esModule === true`, the default export will be returned instead. Use `useDefault` to override this behavior in either direction. |

#### Returns

`fn`

▸ (): `T`

##### Returns

`T`

#### Defined in

[test/setup.ts:391](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L391)

___

### itemFactory

▸ **itemFactory**<`T`\>(`testItems`): () => `T` & { `$iter`: `IterableIterator`<`T`\> ; `count`: `number` = testItems.length; `items`: `T`[] = testItems; `[asyncIterator]`: () => `AsyncGenerator`<`Awaited`<`T`\>, `void`, `unknown`\> ; `[iterator]`: () => `Generator`<`T`, `void`, `unknown`\>  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `testItems` | `T`[] |

#### Returns

() => `T` & { `$iter`: `IterableIterator`<`T`\> ; `count`: `number` = testItems.length; `items`: `T`[] = testItems; `[asyncIterator]`: () => `AsyncGenerator`<`Awaited`<`T`\>, `void`, `unknown`\> ; `[iterator]`: () => `Generator`<`T`, `void`, `unknown`\>  }

#### Defined in

[test/setup.ts:173](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L173)

___

### mockArgvFactory

▸ **mockArgvFactory**(`newArgv`, `options?`): (`fn`: () => `unknown`, `newArgv?`: `string`[], `options?`: [`MockArgvOptions`](test_setup.md#mockargvoptions)) => `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `newArgv` | `string`[] |
| `options?` | [`MockArgvOptions`](test_setup.md#mockargvoptions) |

#### Returns

`fn`

▸ (`fn`, `newArgv?`, `options?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `unknown` |
| `newArgv?` | `string`[] |
| `options?` | [`MockArgvOptions`](test_setup.md#mockargvoptions) |

##### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:265](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L265)

___

### mockEnvFactory

▸ **mockEnvFactory**(`newEnv`, `options?`): (`fn`: () => `unknown`, `newEnv?`: `Record`<`string`, `undefined` \| `string`\>, `options?`: [`MockEnvOptions`](test_setup.md#mockenvoptions)) => `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `newEnv` | `Record`<`string`, `undefined` \| `string`\> |
| `options?` | [`MockEnvOptions`](test_setup.md#mockenvoptions) |

#### Returns

`fn`

▸ (`fn`, `newEnv?`, `options?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `unknown` |
| `newEnv?` | `Record`<`string`, `undefined` \| `string`\> |
| `options?` | [`MockEnvOptions`](test_setup.md#mockenvoptions) |

##### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:307](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L307)

___

### mockFixtureFactory

▸ **mockFixtureFactory**<`CustomOptions`, `CustomContext`\>(`testIdentifier`, `options?`): (`fn`: [`FixtureAction`](test_setup.md#fixtureaction)<[`FixtureContext`](../interfaces/test_setup.FixtureContext.md)<[`FixtureOptions`](../interfaces/test_setup.FixtureOptions.md) & `Partial`<`Record`<`string`, `unknown`\> & `CustomOptions`\>\> & `CustomContext`\>) => `Promise`<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CustomOptions` | extends `Record`<`string`, `unknown`\> = {} |
| `CustomContext` | extends `Record`<`string`, `unknown`\> = {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `testIdentifier` | `string` |
| `options?` | `Partial`<[`FixtureOptions`](../interfaces/test_setup.FixtureOptions.md) & `CustomOptions`\> |

#### Returns

`fn`

▸ (`fn`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | [`FixtureAction`](test_setup.md#fixtureaction)<[`FixtureContext`](../interfaces/test_setup.FixtureContext.md)<[`FixtureOptions`](../interfaces/test_setup.FixtureOptions.md) & `Partial`<`Record`<`string`, `unknown`\> & `CustomOptions`\>\> & `CustomContext`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:1198](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L1198)

___

### mockOutputFactory

▸ **mockOutputFactory**(`options`): (`fn`: (`spies`: { `errorSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `infoSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `logSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `stdErrSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `stdoutSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `warnSpy`: `SpyInstance`<`any`, `any`, `any`\>  }) => `unknown`, `options?`: { `passthrough?`: { `errorSpy?`: `boolean` ; `infoSpy?`: `boolean` ; `logSpy?`: `boolean` ; `stdErrSpy?`: `boolean` ; `stdoutSpy?`: `boolean` ; `warnSpy?`: `boolean`  }  }) => `Promise`<`void`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | - |
| `options.passthrough?` | `Object` | Determine if spies provide mock implementations for output functions, thus preventing any output to the terminal, or if spies should passthrough output as normal. Passthrough is disabled for all spies by default (except `stdErrSpy`). Pass `true` to enable passthrough for a specific spy. |
| `options.passthrough.errorSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.infoSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.logSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.stdErrSpy?` | `boolean` | **`Default`** ```ts true ``` |
| `options.passthrough.stdoutSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.warnSpy?` | `boolean` | **`Default`** ```ts false ``` |

#### Returns

`fn`

▸ (`fn`, `options?`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`spies`: { `errorSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `infoSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `logSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `stdErrSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `stdoutSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `warnSpy`: `SpyInstance`<`any`, `any`, `any`\>  }) => `unknown` | - |
| `options?` | `Object` | - |
| `options.passthrough?` | `Object` | Determine if spies provide mock implementations for output functions, thus preventing any output to the terminal, or if spies should passthrough output as normal. Passthrough is disabled for all spies by default (except `stdErrSpy`). Pass `true` to enable passthrough for a specific spy. |
| `options.passthrough.errorSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.infoSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.logSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.stdErrSpy?` | `boolean` | **`Default`** ```ts true ``` |
| `options.passthrough.stdoutSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.warnSpy?` | `boolean` | **`Default`** ```ts false ``` |

##### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:634](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L634)

___

### nodeImportTestFixture

▸ **nodeImportTestFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:952](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L952)

___

### noopHandler

▸ **noopHandler**(`_req`, `res`): `Promise`<`void`\>

A mock Next.js API handler that sends an empty object Reponse with a 200
status code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_req` | `NextApiRequest` |
| `res` | `NextApiResponse` |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:51](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L51)

___

### npmLinkSelfFixture

▸ **npmLinkSelfFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:873](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L873)

___

### protectedImport

▸ **protectedImport**<`T`\>(`«destructured»`): `Promise`<`T`\>

While `isolatedImport` performs a module import as if it were being
imported for the first time, `protectedImport` wraps `isolatedImport`
with `withMockedExit`. This makes `protectedImport` useful for testing
IIFE modules such as CLI entry points an externals.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `expectedExitCode?` | `number` \| ``"non-zero"`` | The code that must be passed to process.exit by the imported module. If `undefined` (default), then process.exit must not be called. **`Default`** ```ts undefined ``` |
| › `path` | `string` | Path to the module to import. Module resolution is handled by `require`. |
| › `useDefault?` | `boolean` | By default, only if `module.__esModule === true`, the default export will be returned instead. Use `useDefault` to override this behavior in either direction. |

#### Returns

`Promise`<`T`\>

#### Defined in

[test/setup.ts:416](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L416)

___

### protectedImportFactory

▸ **protectedImportFactory**<`T`\>(`«destructured»`): (`params?`: { `expectedExitCode?`: `number` \| ``"non-zero"``  }) => `Promise`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `expectedExitCode?` | `number` \| ``"non-zero"`` | The code that must be passed to process.exit by the imported module. If `undefined` (default), then process.exit must not be called. **`Default`** ```ts undefined ``` |
| › `path` | `string` | Path to the module to import. Module resolution is handled by `require`. |
| › `useDefault?` | `boolean` | By default, only if `module.__esModule === true`, the default export will be returned instead. Use `useDefault` to override this behavior in either direction. |

#### Returns

`fn`

▸ (`params?`): `Promise`<`T`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params?` | `Object` | - |
| `params.expectedExitCode?` | `number` \| ``"non-zero"`` | The code that must be passed to process.exit by the imported module. If `undefined` (default), then process.exit must not be called. **`Default`** ```ts undefined ``` |

##### Returns

`Promise`<`T`\>

#### Defined in

[test/setup.ts:465](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L465)

___

### rootFixture

▸ **rootFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:827](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L827)

___

### run

▸ **run**(`file`, `args?`, `options?`): `Promise`<`ExecaReturnValue`<`string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `string` |
| `args?` | `string`[] |
| `options?` | [`RunOptions`](../interfaces/test_setup.RunOptions.md) |

#### Returns

`Promise`<`ExecaReturnValue`<`string`\>\>

#### Defined in

[test/setup.ts:733](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L733)

___

### runnerFactory

▸ **runnerFactory**(`file`, `args?`, `options?`): (`args?`: `string`[], `options?`: [`RunOptions`](../interfaces/test_setup.RunOptions.md)) => `Promise`<`ExecaReturnValue`<`string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `string` |
| `args?` | `string`[] |
| `options?` | [`RunOptions`](../interfaces/test_setup.RunOptions.md) |

#### Returns

`fn`

▸ (`args?`, `options?`): `Promise`<`ExecaReturnValue`<`string`\>\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | `string`[] |
| `options?` | [`RunOptions`](../interfaces/test_setup.RunOptions.md) |

##### Returns

`Promise`<`ExecaReturnValue`<`string`\>\>

#### Defined in

[test/setup.ts:745](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L745)

___

### webpackTestFixture

▸ **webpackTestFixture**(): [`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Returns

[`MockFixture`](../interfaces/test_setup.MockFixture.md)

#### Defined in

[test/setup.ts:888](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L888)

___

### withDebugEnabled

▸ **withDebugEnabled**(`fn`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `Promisable`<`void`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:329](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L329)

___

### withMockedArgv

▸ **withMockedArgv**(`fn`, `newArgv`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `unknown` |
| `newArgv` | `string`[] |
| `options?` | [`MockArgvOptions`](test_setup.md#mockargvoptions) |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:245](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L245)

___

### withMockedEnv

▸ **withMockedEnv**(`fn`, `newEnv`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `unknown` |
| `newEnv` | `Record`<`string`, `string`\> |
| `options?` | [`MockEnvOptions`](test_setup.md#mockenvoptions) |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:282](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L282)

___

### withMockedExit

▸ **withMockedExit**(`fn`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`spies`: { `exitSpy`: `SpyInstance`<`any`, `any`, `any`\>  }) => `unknown` |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:520](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L520)

___

### withMockedFixture

▸ **withMockedFixture**<`CustomOptions`, `CustomContext`\>(`«destructured»`): `Promise`<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CustomOptions` | extends `Record`<`string`, `unknown`\> = {} |
| `CustomContext` | extends `Record`<`string`, `unknown`\> = {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `fn` | [`FixtureAction`](test_setup.md#fixtureaction)<[`FixtureContext`](../interfaces/test_setup.FixtureContext.md)<[`FixtureOptions`](../interfaces/test_setup.FixtureOptions.md) & `Partial`<`Record`<`string`, `unknown`\> & `CustomOptions`\>\> & `CustomContext`\> |
| › `options?` | `Partial`<[`FixtureOptions`](../interfaces/test_setup.FixtureOptions.md) & `CustomOptions`\> |
| › `testIdentifier` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:1077](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L1077)

___

### withMockedOutput

▸ **withMockedOutput**(`fn`, `options?`): `Promise`<`void`\>

Any output generated within `fn` will be captured by an output spy instead of
emitting to the console (stdout/stderr).

However, not that `stdErrSpy` is set to passthrough mode by default. If
desired, use the `passthrough` option to prevent this.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`spies`: { `errorSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `infoSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `logSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `stdErrSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `stdoutSpy`: `SpyInstance`<`any`, `any`, `any`\> ; `warnSpy`: `SpyInstance`<`any`, `any`, `any`\>  }) => `unknown` | - |
| `options?` | `Object` | - |
| `options.passthrough?` | `Object` | Determine if spies provide mock implementations for output functions, thus preventing any output to the terminal, or if spies should passthrough output as normal. Passthrough is disabled for all spies by default (except `stdErrSpy`). Pass `true` to enable passthrough for a specific spy. |
| `options.passthrough.errorSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.infoSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.logSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.stdErrSpy?` | `boolean` | **`Default`** ```ts true ``` |
| `options.passthrough.stdoutSpy?` | `boolean` | **`Default`** ```ts false ``` |
| `options.passthrough.warnSpy?` | `boolean` | **`Default`** ```ts false ``` |

#### Returns

`Promise`<`void`\>

#### Defined in

[test/setup.ts:554](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L554)

___

### wrapHandler

▸ **wrapHandler**(`handler`, `config?`): (`req`: `NextApiRequest`, `res`: `NextApiResponse`) => `Promise`<`unknown`\>

This function wraps mock Next.js API handler functions so that they provide
the default (or a custom) API configuration object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `NextApiHandler` |
| `config?` | `PageConfig` |

#### Returns

`fn`

▸ (`req`, `res`): `Promise`<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |
| `res` | `NextApiResponse` |

##### Returns

`Promise`<`unknown`\>

| Name | Type |
| :------ | :------ |
| `config` | `PageConfig` |

#### Defined in

[test/setup.ts:59](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L59)
