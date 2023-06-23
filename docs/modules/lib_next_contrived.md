[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-contrived

# Module: lib/next-contrived

## Table of contents

### Functions

- [isDueForContrivedError](lib_next_contrived.md#isdueforcontrivederror)

## Functions

### isDueForContrivedError

▸ **isDueForContrivedError**(): `Promise`<`boolean`\>

Returns `true` if a request should be rejected with a pseudo-error.

Note that this is a per-serverless-function request counter and not global
across all Vercel virtual machines.

#### Returns

`Promise`<`boolean`\>

#### Defined in

[lib/next-contrived/index.ts:13](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-contrived/index.ts#L13)
