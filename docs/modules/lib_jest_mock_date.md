[inbdpa.api.hscc.bdpa.org](../README.md) / lib/jest-mock-date

# Module: lib/jest-mock-date

## Table of contents

### Variables

- [mockDateNowMs](lib_jest_mock_date.md#mockdatenowms)

### Functions

- [useMockDateNow](lib_jest_mock_date.md#usemockdatenow)

## Variables

### mockDateNowMs

• `Const` **mockDateNowMs**: `number`

The mock Date.now() value returned after calling `useMockDateNow`.

#### Defined in

[lib/jest-mock-date/index.ts:4](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/jest-mock-date/index.ts#L4)

## Functions

### useMockDateNow

▸ **useMockDateNow**(`options?`): `void`

Sets up a Jest spy on the `Date` object's `now` method such that it returns
`mockNow` or `mockDateNowMs` (default) rather than the actual date. If you
want to restore the mock, you will have to do so manually (or use Jest
configuration to do so automatically).

This is useful when testing against/playing with dummy data containing values
derived from the current time (i.e. unix epoch).

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.mockNow?` | `number` |

#### Returns

`void`

#### Defined in

[lib/jest-mock-date/index.ts:15](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/jest-mock-date/index.ts#L15)
