[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/debug-extended](../modules/lib_debug_extended.md) / ExtendedDebugger

# Interface: ExtendedDebugger

[lib/debug-extended](../modules/lib_debug_extended.md).ExtendedDebugger

## Hierarchy

- [`Debugger`](lib_debug_extended.Debugger.md)

  ↳ **`ExtendedDebugger`**

## Callable

### ExtendedDebugger

▸ **ExtendedDebugger**(`formatter`, `...args`): `void`

A Debugger interface extended with convenience methods.

#### Parameters

| Name | Type |
| :------ | :------ |
| `formatter` | `any` |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

node_modules/@types/debug/index.d.ts:51

## Table of contents

### Properties

- [color](lib_debug_extended.ExtendedDebugger.md#color)
- [destroy](lib_debug_extended.ExtendedDebugger.md#destroy)
- [diff](lib_debug_extended.ExtendedDebugger.md#diff)
- [enabled](lib_debug_extended.ExtendedDebugger.md#enabled)
- [error](lib_debug_extended.ExtendedDebugger.md#error)
- [extend](lib_debug_extended.ExtendedDebugger.md#extend)
- [log](lib_debug_extended.ExtendedDebugger.md#log)
- [namespace](lib_debug_extended.ExtendedDebugger.md#namespace)
- [warn](lib_debug_extended.ExtendedDebugger.md#warn)

## Properties

### color

• **color**: `string`

#### Inherited from

[Debugger](lib_debug_extended.Debugger.md).[color](lib_debug_extended.Debugger.md#color)

#### Defined in

node_modules/@types/debug/index.d.ts:53

___

### destroy

• **destroy**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Inherited from

[Debugger](lib_debug_extended.Debugger.md).[destroy](lib_debug_extended.Debugger.md#destroy)

#### Defined in

node_modules/@types/debug/index.d.ts:58

___

### diff

• **diff**: `number`

#### Inherited from

[Debugger](lib_debug_extended.Debugger.md).[diff](lib_debug_extended.Debugger.md#diff)

#### Defined in

node_modules/@types/debug/index.d.ts:54

___

### enabled

• **enabled**: `boolean`

#### Inherited from

[Debugger](lib_debug_extended.Debugger.md).[enabled](lib_debug_extended.Debugger.md#enabled)

#### Defined in

node_modules/@types/debug/index.d.ts:55

___

### error

• **error**: [`Debugger`](lib_debug_extended.Debugger.md)

#### Defined in

[lib/debug-extended/index.ts:17](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/debug-extended/index.ts#L17)

___

### extend

• **extend**: (...`args`: [namespace: string, delimiter?: string]) => [`ExtendedDebugger`](lib_debug_extended.ExtendedDebugger.md)

#### Type declaration

▸ (`...args`): [`ExtendedDebugger`](lib_debug_extended.ExtendedDebugger.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [namespace: string, delimiter?: string] |

##### Returns

[`ExtendedDebugger`](lib_debug_extended.ExtendedDebugger.md)

#### Overrides

[Debugger](lib_debug_extended.Debugger.md).[extend](lib_debug_extended.Debugger.md#extend)

#### Defined in

[lib/debug-extended/index.ts:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/debug-extended/index.ts#L19)

___

### log

• **log**: (...`args`: `any`[]) => `any`

#### Type declaration

▸ (`...args`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`any`

#### Inherited from

[Debugger](lib_debug_extended.Debugger.md).[log](lib_debug_extended.Debugger.md#log)

#### Defined in

node_modules/@types/debug/index.d.ts:56

___

### namespace

• **namespace**: `string`

#### Inherited from

[Debugger](lib_debug_extended.Debugger.md).[namespace](lib_debug_extended.Debugger.md#namespace)

#### Defined in

node_modules/@types/debug/index.d.ts:57

___

### warn

• **warn**: [`Debugger`](lib_debug_extended.Debugger.md)

#### Defined in

[lib/debug-extended/index.ts:18](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/debug-extended/index.ts#L18)
