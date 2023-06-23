[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/debug-extended](../modules/lib_debug_extended.md) / ExtendedDebug

# Interface: ExtendedDebug

[lib/debug-extended](../modules/lib_debug_extended.md).ExtendedDebug

## Hierarchy

- [`Debug`](lib_debug_extended.Debug.md)

  ↳ **`ExtendedDebug`**

## Callable

### ExtendedDebug

▸ **ExtendedDebug**(`...args`): [`ExtendedDebugger`](lib_debug_extended.ExtendedDebugger.md)

A Debug factory interface that returns `ExtendedDebugger` instances.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [namespace: string] |

#### Returns

[`ExtendedDebugger`](lib_debug_extended.ExtendedDebugger.md)

#### Defined in

[lib/debug-extended/index.ts:10](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/debug-extended/index.ts#L10)

### ExtendedDebug

▸ **ExtendedDebug**(`namespace`): [`Debugger`](lib_debug_extended.Debugger.md)

A Debug factory interface that returns `ExtendedDebugger` instances.

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

- [coerce](lib_debug_extended.ExtendedDebug.md#coerce)
- [disable](lib_debug_extended.ExtendedDebug.md#disable)
- [enable](lib_debug_extended.ExtendedDebug.md#enable)
- [enabled](lib_debug_extended.ExtendedDebug.md#enabled)
- [formatArgs](lib_debug_extended.ExtendedDebug.md#formatargs)
- [formatters](lib_debug_extended.ExtendedDebug.md#formatters)
- [humanize](lib_debug_extended.ExtendedDebug.md#humanize)
- [inspectOpts](lib_debug_extended.ExtendedDebug.md#inspectopts)
- [log](lib_debug_extended.ExtendedDebug.md#log)
- [names](lib_debug_extended.ExtendedDebug.md#names)
- [selectColor](lib_debug_extended.ExtendedDebug.md#selectcolor)
- [skips](lib_debug_extended.ExtendedDebug.md#skips)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[coerce](lib_debug_extended.Debug.md#coerce)

#### Defined in

node_modules/@types/debug/index.d.ts:20

___

### disable

• **disable**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[disable](lib_debug_extended.Debug.md#disable)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[enable](lib_debug_extended.Debug.md#enable)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[enabled](lib_debug_extended.Debug.md#enabled)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[formatArgs](lib_debug_extended.Debug.md#formatargs)

#### Defined in

node_modules/@types/debug/index.d.ts:24

___

### formatters

• **formatters**: `Formatters`

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[formatters](lib_debug_extended.Debug.md#formatters)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[humanize](lib_debug_extended.Debug.md#humanize)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[inspectOpts](lib_debug_extended.Debug.md#inspectopts)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[log](lib_debug_extended.Debug.md#log)

#### Defined in

node_modules/@types/debug/index.d.ts:25

___

### names

• **names**: `RegExp`[]

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[names](lib_debug_extended.Debug.md#names)

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

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[selectColor](lib_debug_extended.Debug.md#selectcolor)

#### Defined in

node_modules/@types/debug/index.d.ts:26

___

### skips

• **skips**: `RegExp`[]

#### Inherited from

[Debug](lib_debug_extended.Debug.md).[skips](lib_debug_extended.Debug.md#skips)

#### Defined in

node_modules/@types/debug/index.d.ts:30
