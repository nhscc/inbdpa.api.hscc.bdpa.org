[inbdpa.api.hscc.bdpa.org](../README.md) / lib/find-project-root

# Module: lib/find-project-root

## Table of contents

### Functions

- [findProjectRoot](lib_find_project_root.md#findprojectroot)
- [setProjectRoot](lib_find_project_root.md#setprojectroot)

## Functions

### findProjectRoot

▸ **findProjectRoot**(): `string`

Synchronously finds the root of a project by walking up parent
directories beginning at `process.cwd()` and looking for certain files/dirs.

#### Returns

`string`

#### Defined in

[lib/find-project-root/index.ts:20](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/find-project-root/index.ts#L20)

___

### setProjectRoot

▸ **setProjectRoot**(`rootPath`): `void`

Overwrite the memoized findProjectRoot result with an explicit value. Useful
in testing environments and complex setups.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rootPath` | ``null`` \| `string` |

#### Returns

`void`

#### Defined in

[lib/find-project-root/index.ts:12](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/find-project-root/index.ts#L12)
