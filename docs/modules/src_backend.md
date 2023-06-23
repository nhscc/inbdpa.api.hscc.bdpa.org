[inbdpa.api.hscc.bdpa.org](../README.md) / src/backend

# Module: src/backend

## Table of contents

### Variables

- [defaultHomePage](src_backend.md#defaulthomepage)
- [defaultNavLinks](src_backend.md#defaultnavlinks)
- [navLinkUpperLimit](src_backend.md#navlinkupperlimit)

### Functions

- [authAppUser](src_backend.md#authappuser)
- [createPage](src_backend.md#createpage)
- [createSession](src_backend.md#createsession)
- [createUser](src_backend.md#createuser)
- [deletePage](src_backend.md#deletepage)
- [deleteSession](src_backend.md#deletesession)
- [deleteUser](src_backend.md#deleteuser)
- [getAllUsers](src_backend.md#getallusers)
- [getBlog](src_backend.md#getblog)
- [getBlogPagesMetadata](src_backend.md#getblogpagesmetadata)
- [getInfo](src_backend.md#getinfo)
- [getPage](src_backend.md#getpage)
- [getPageSessionsCount](src_backend.md#getpagesessionscount)
- [getUser](src_backend.md#getuser)
- [renewSession](src_backend.md#renewsession)
- [updateBlog](src_backend.md#updateblog)
- [updatePage](src_backend.md#updatepage)
- [updateUser](src_backend.md#updateuser)

## Variables

### defaultHomePage

• `Const` **defaultHomePage**: `Required`<[`NewPage`](src_backend_db.md#newpage)\>

The default home page for newly created blogs (users).

#### Defined in

[src/backend/index.ts:349](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L349)

___

### defaultNavLinks

• `Const` **defaultNavLinks**: [`NavigationLink`](src_backend_db.md#navigationlink)[]

The default `navLinks` value for newly created blogs (users).

#### Defined in

[src/backend/index.ts:344](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L344)

___

### navLinkUpperLimit

• `Const` **navLinkUpperLimit**: ``5``

The maximum amount of navLinks that can be associated with a blog. This is a
hardcoded limit.

#### Defined in

[src/backend/index.ts:339](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L339)

## Functions

### authAppUser

▸ **authAppUser**(`«destructured»`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `key` | `undefined` \| `string` |
| › `usernameOrEmail` | `undefined` \| `string` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/backend/index.ts:969](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L969)

___

### createPage

▸ **createPage**(`«destructured»`): `Promise`<[`PublicPage`](src_backend_db.md#publicpage)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `__provenance` | `string` |
| › `blogName` | `undefined` \| `string` |
| › `data` | `undefined` \| `Partial`<`Pick`<[`InternalPage`](src_backend_db.md#internalpage), ``"name"`` \| ``"contents"``\>\> |

#### Returns

`Promise`<[`PublicPage`](src_backend_db.md#publicpage)\>

#### Defined in

[src/backend/index.ts:589](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L589)

___

### createSession

▸ **createSession**(`«destructured»`): `Promise`<[`SessionId`](../interfaces/src_backend_db.SessionId.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `__provenance` | `string` |
| › `blogName` | `undefined` \| `string` |
| › `pageName` | `undefined` \| `string` |

#### Returns

`Promise`<[`SessionId`](../interfaces/src_backend_db.SessionId.md)\>

#### Defined in

[src/backend/index.ts:666](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L666)

___

### createUser

▸ **createUser**(`«destructured»`): `Promise`<[`PublicUser`](src_backend_db.md#publicuser)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `__provenance` | `string` |
| › `data` | `undefined` \| `Partial`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"key"`` \| ``"username"`` \| ``"email"`` \| ``"blogName"`` \| ``"type"`` \| ``"salt"``\>\> |

#### Returns

`Promise`<[`PublicUser`](src_backend_db.md#publicuser)\>

#### Defined in

[src/backend/index.ts:458](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L458)

___

### deletePage

▸ **deletePage**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |
| › `pageName` | `undefined` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:926](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L926)

___

### deleteSession

▸ **deleteSession**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `sessionId` | `undefined` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:953](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L953)

___

### deleteUser

▸ **deleteUser**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `usernameOrEmail` | `undefined` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:894](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L894)

___

### getAllUsers

▸ **getAllUsers**(`«destructured»`): `Promise`<[`PublicUser`](src_backend_db.md#publicuser)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `after_id` | `undefined` \| `string` |

#### Returns

`Promise`<[`PublicUser`](src_backend_db.md#publicuser)[]\>

#### Defined in

[src/backend/index.ts:354](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L354)

___

### getBlog

▸ **getBlog**(`«destructured»`): `Promise`<[`PublicBlog`](src_backend_db.md#publicblog)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |

#### Returns

`Promise`<[`PublicBlog`](src_backend_db.md#publicblog)\>

#### Defined in

[src/backend/index.ts:408](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L408)

___

### getBlogPagesMetadata

▸ **getBlogPagesMetadata**(`«destructured»`): `Promise`<[`PublicPageMetadata`](src_backend_db.md#publicpagemetadata)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |

#### Returns

`Promise`<[`PublicPageMetadata`](src_backend_db.md#publicpagemetadata)[]\>

#### Defined in

[src/backend/index.ts:379](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L379)

___

### getInfo

▸ **getInfo**(): `Promise`<[`PublicInfo`](src_backend_db.md#publicinfo)\>

#### Returns

`Promise`<[`PublicInfo`](src_backend_db.md#publicinfo)\>

#### Defined in

[src/backend/index.ts:427](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L427)

___

### getPage

▸ **getPage**(`«destructured»`): `Promise`<[`PublicPage`](src_backend_db.md#publicpage)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |
| › `pageName` | `undefined` \| `string` |

#### Returns

`Promise`<[`PublicPage`](src_backend_db.md#publicpage)\>

#### Defined in

[src/backend/index.ts:416](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L416)

___

### getPageSessionsCount

▸ **getPageSessionsCount**(`«destructured»`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |
| › `pageName` | `undefined` \| `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[src/backend/index.ts:437](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L437)

___

### getUser

▸ **getUser**(`«destructured»`): `Promise`<[`PublicUser`](src_backend_db.md#publicuser)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `usernameOrEmail` | `undefined` \| `string` |

#### Returns

`Promise`<[`PublicUser`](src_backend_db.md#publicuser)\>

#### Defined in

[src/backend/index.ts:400](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L400)

___

### renewSession

▸ **renewSession**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `sessionId` | `undefined` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:875](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L875)

___

### updateBlog

▸ **updateBlog**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |
| › `data` | `undefined` \| `Partial`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"navLinks"``\> & { `name`: `string` ; `rootPage`: `string`  }\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:779](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L779)

___

### updatePage

▸ **updatePage**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `blogName` | `undefined` \| `string` |
| › `data` | `undefined` \| [`PatchPage`](src_backend_db.md#patchpage) |
| › `pageName` | `undefined` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:826](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L826)

___

### updateUser

▸ **updateUser**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `data` | `undefined` \| `Partial`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"key"`` \| ``"email"`` \| ``"salt"`` \| ``"banned"``\>\> |
| › `usernameOrEmail` | `undefined` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/backend/index.ts:697](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/index.ts#L697)
