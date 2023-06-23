[inbdpa.api.hscc.bdpa.org](../README.md) / lib/suppress-experimental-warnings

# Module: lib/suppress-experimental-warnings

## Table of contents

### Functions

- [suppressWarnings](lib_suppress_experimental_warnings.md#suppresswarnings)

## Functions

### suppressWarnings

▸ **suppressWarnings**(`names?`): `void`

Prevent Node from emitting specific warnings when running third-party code.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `names?` | `string`[] | The exact (case-sensitive) names of the warnings that will be suppressed. **`Default`** ```ts ['ExperimentalWarning'] ``` |

#### Returns

`void`

#### Defined in

[lib/suppress-experimental-warnings/index.ts:8](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/suppress-experimental-warnings/index.ts#L8)
