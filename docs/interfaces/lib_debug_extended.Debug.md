[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/debug-extended](../modules/lib_debug_extended.md) / Debug

# Interface: Debug

[lib/debug-extended](../modules/lib_debug_extended.md).Debug

## Hierarchy

- **`Debug`**

  ↳ [`ExtendedDebug`](lib_debug_extended.ExtendedDebug.md)

## Callable

### Debug

▸ **Debug**(`namespace`): [`Debugger`](lib_debug_extended.Debugger.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |

#### Returns

[`Debugger`](lib_debug_extended.Debugger.md)

#### Defined in

node_modules/@types/debug/index.d.ts:19

## Table of contents

### Properties

- [coerce](lib_debug_extended.Debug.md#coerce)
- [disable](lib_debug_extended.Debug.md#disable)
- [enable](lib_debug_extended.Debug.md#enable)
- [enabled](lib_debug_extended.Debug.md#enabled)
- [formatArgs](lib_debug_extended.Debug.md#formatargs)
- [formatters](lib_debug_extended.Debug.md#formatters)
- [humanize](lib_debug_extended.Debug.md#humanize)
- [inspectOpts](lib_debug_extended.Debug.md#inspectopts)
- [log](lib_debug_extended.Debug.md#log)
- [names](lib_debug_extended.Debug.md#names)
- [selectColor](lib_debug_extended.Debug.md#selectcolor)
- [skips](lib_debug_extended.Debug.md#skips)

## Properties

### coerce

• **coerce**: (`val`: `any`) => `any`

#### Type declaration

▸ (`val`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `val` | `any` |

##### Returns

`any`

#### Defined in

node_modules/@types/debug/index.d.ts:20

___

### disable

• **disable**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

node_modules/@types/debug/index.d.ts:21

___

### enable

• **enable**: (`namespaces`: `string`) => `void`

#### Type declaration

▸ (`namespaces`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `namespaces` | `string` |

##### Returns

`void`

#### Defined in

node_modules/@types/debug/index.d.ts:22

___

### enabled

• **enabled**: (`namespaces`: `string`) => `boolean`

#### Type declaration

▸ (`namespaces`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `namespaces` | `string` |

##### Returns

`boolean`

#### Defined in

node_modules/@types/debug/index.d.ts:23

___

### formatArgs

• **formatArgs**: (`this`: [`Debugger`](lib_debug_extended.Debugger.md), `args`: `any`[]) => `void`

#### Type declaration

▸ (`this`, `args`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Debugger`](lib_debug_extended.Debugger.md) |
| `args` | `any`[] |

##### Returns

`void`

#### Defined in

node_modules/@types/debug/index.d.ts:24

___

### formatters

• **formatters**: `Formatters`

#### Defined in

node_modules/@types/debug/index.d.ts:32

___

### humanize

• **humanize**: (`value`: `number`, `options?`: { `long`: `boolean`  }) => `string`(`value`: `string`) => `number`

#### Type declaration

▸ (`value`, `options?`): `string`

Short/Long format for `value`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |
| `options?` | `Object` |
| `options.long` | `boolean` |

##### Returns

`string`

▸ (`value`): `number`

Parse the given `value` and return milliseconds.

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

##### Returns

`number`

#### Defined in

node_modules/@types/debug/index.d.ts:27

___

### inspectOpts

• `Optional` **inspectOpts**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `colors?` | ``null`` \| `number` \| `boolean` |
| `depth?` | ``null`` \| `number` \| `boolean` |
| `hideDate?` | ``null`` \| `number` \| `boolean` |
| `showHidden?` | ``null`` \| `number` \| `boolean` |

#### Defined in

node_modules/@types/debug/index.d.ts:34

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

node_modules/@types/debug/index.d.ts:25

___

### names

• **names**: `RegExp`[]

#### Defined in

node_modules/@types/debug/index.d.ts:29

___

### selectColor

• **selectColor**: (`namespace`: `string`) => `string` \| `number`

#### Type declaration

▸ (`namespace`): `string` \| `number`

##### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |

##### Returns

`string` \| `number`

#### Defined in

node_modules/@types/debug/index.d.ts:26

___

### skips

• **skips**: `RegExp`[]

#### Defined in

node_modules/@types/debug/index.d.ts:30
