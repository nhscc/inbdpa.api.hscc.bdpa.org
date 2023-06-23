[inbdpa.api.hscc.bdpa.org](../README.md) / src/pages

# Module: src/pages

## Table of contents

### Functions

- [default](src_pages.md#default)
- [getServerSideProps](src_pages.md#getserversideprops)

## Functions

### default

▸ **default**(`«destructured»`): `Element`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | `undefined` |
| › `isInProduction` | `boolean` | `undefined` |
| › `nodeEnv` | `string` | `env.NODE_ENV` |
| › `nodeVersion` | `string` | `process.version` |

#### Returns

`Element`

#### Defined in

[src/pages/index.tsx:19](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/pages/index.tsx#L19)

___

### getServerSideProps

▸ **getServerSideProps**(): `Promise`<{ `props`: { `isInProduction`: `boolean` ; `nodeEnv`: `string` = env.NODE\_ENV; `nodeVersion`: `string` = process.version }  }\>

#### Returns

`Promise`<{ `props`: { `isInProduction`: `boolean` ; `nodeEnv`: `string` = env.NODE\_ENV; `nodeVersion`: `string` = process.version }  }\>

#### Defined in

[src/pages/index.tsx:6](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/pages/index.tsx#L6)
