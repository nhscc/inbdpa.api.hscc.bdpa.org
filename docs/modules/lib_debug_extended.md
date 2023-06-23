[inbdpa.api.hscc.bdpa.org](../README.md) / lib/debug-extended

# Module: lib/debug-extended

## Table of contents

### Interfaces

- [Debug](../interfaces/lib_debug_extended.Debug.md)
- [Debugger](../interfaces/lib_debug_extended.Debugger.md)
- [ExtendedDebug](../interfaces/lib_debug_extended.ExtendedDebug.md)
- [ExtendedDebugger](../interfaces/lib_debug_extended.ExtendedDebugger.md)

### Functions

- [debugFactory](lib_debug_extended.md#debugfactory)
- [extendDebugger](lib_debug_extended.md#extenddebugger)

## Functions

### debugFactory

▸ **debugFactory**(`...args`): [`ExtendedDebugger`](../interfaces/lib_debug_extended.ExtendedDebugger.md)

An `ExtendedDebug` instance that returns an `ExtendedDebugger` instance via
`extendDebugger`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [namespace: string] |

#### Returns

[`ExtendedDebugger`](../interfaces/lib_debug_extended.ExtendedDebugger.md)

#### Defined in

[lib/debug-extended/index.ts:10](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/debug-extended/index.ts#L10)

▸ **debugFactory**(`namespace`): [`Debugger`](../interfaces/lib_debug_extended.Debugger.md)

An `ExtendedDebug` instance that returns an `ExtendedDebugger` instance via
`extendDebugger`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |

#### Returns

[`Debugger`](../interfaces/lib_debug_extended.Debugger.md)

#### Defined in

node_modules/@types/debug/index.d.ts:19

___

### extendDebugger

▸ **extendDebugger**(`instance`): [`ExtendedDebugger`](../interfaces/lib_debug_extended.ExtendedDebugger.md)

Extends a `Debugger` instance with several convenience methods, returning
what would more accurately be called an `ExtendedDebugger` instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `instance` | [`Debugger`](../interfaces/lib_debug_extended.Debugger.md) |

#### Returns

[`ExtendedDebugger`](../interfaces/lib_debug_extended.ExtendedDebugger.md)

#### Defined in

[lib/debug-extended/index.ts:38](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/debug-extended/index.ts#L38)
