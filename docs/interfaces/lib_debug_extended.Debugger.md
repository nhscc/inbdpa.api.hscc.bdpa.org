[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/debug-extended](../modules/lib_debug_extended.md) / Debugger

# Interface: Debugger

[lib/debug-extended](../modules/lib_debug_extended.md).Debugger

## Hierarchy

- **`Debugger`**

  ↳ [`ExtendedDebugger`](lib_debug_extended.ExtendedDebugger.md)

## Callable

### Debugger

▸ **Debugger**(`formatter`, `...args`): `void`

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

- [color](lib_debug_extended.Debugger.md#color)
- [destroy](lib_debug_extended.Debugger.md#destroy)
- [diff](lib_debug_extended.Debugger.md#diff)
- [enabled](lib_debug_extended.Debugger.md#enabled)
- [extend](lib_debug_extended.Debugger.md#extend)
- [log](lib_debug_extended.Debugger.md#log)
- [namespace](lib_debug_extended.Debugger.md#namespace)

## Properties

### color

• **color**: `string`

#### Defined in

node_modules/@types/debug/index.d.ts:53

___

### destroy

• **destroy**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

node_modules/@types/debug/index.d.ts:58

___

### diff

• **diff**: `number`

#### Defined in

node_modules/@types/debug/index.d.ts:54

___

### enabled

• **enabled**: `boolean`

#### Defined in

node_modules/@types/debug/index.d.ts:55

___

### extend

• **extend**: (`namespace`: `string`, `delimiter?`: `string`) => [`Debugger`](lib_debug_extended.Debugger.md)

#### Type declaration

▸ (`namespace`, `delimiter?`): [`Debugger`](lib_debug_extended.Debugger.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |
| `delimiter?` | `string` |

##### Returns

[`Debugger`](lib_debug_extended.Debugger.md)

#### Defined in

node_modules/@types/debug/index.d.ts:59

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

#### Defined in

node_modules/@types/debug/index.d.ts:56

___

### namespace

• **namespace**: `string`

#### Defined in

node_modules/@types/debug/index.d.ts:57
