[inbdpa.api.hscc.bdpa.org](../README.md) / src/backend/db

# Module: src/backend/db

## Table of contents

### Interfaces

- [PageId](../interfaces/src_backend_db.PageId.md)
- [SessionId](../interfaces/src_backend_db.SessionId.md)
- [UserId](../interfaces/src_backend_db.UserId.md)

### Type Aliases

- [BlogId](src_backend_db.md#blogid)
- [Email](src_backend_db.md#email)
- [InternalInfo](src_backend_db.md#internalinfo)
- [InternalPage](src_backend_db.md#internalpage)
- [InternalSession](src_backend_db.md#internalsession)
- [InternalUser](src_backend_db.md#internaluser)
- [MaybeUsernameOrEmail](src_backend_db.md#maybeusernameoremail)
- [NavigationLink](src_backend_db.md#navigationlink)
- [NewPage](src_backend_db.md#newpage)
- [NewUser](src_backend_db.md#newuser)
- [PatchBlog](src_backend_db.md#patchblog)
- [PatchPage](src_backend_db.md#patchpage)
- [PatchUser](src_backend_db.md#patchuser)
- [PublicBlog](src_backend_db.md#publicblog)
- [PublicInfo](src_backend_db.md#publicinfo)
- [PublicPage](src_backend_db.md#publicpage)
- [PublicPageMetadata](src_backend_db.md#publicpagemetadata)
- [PublicUser](src_backend_db.md#publicuser)
- [PublicUserAdministrator](src_backend_db.md#publicuseradministrator)
- [PublicUserBlogger](src_backend_db.md#publicuserblogger)
- [TokenAttributeOwner](src_backend_db.md#tokenattributeowner)
- [UserType](src_backend_db.md#usertype)
- [Username](src_backend_db.md#username)

### Variables

- [publicBlogProjection](src_backend_db.md#publicblogprojection)
- [publicPageMetadataProjection](src_backend_db.md#publicpagemetadataprojection)
- [publicPageProjection](src_backend_db.md#publicpageprojection)
- [publicUserProjection](src_backend_db.md#publicuserprojection)
- [userTypes](src_backend_db.md#usertypes)

### Functions

- [getSchemaConfig](src_backend_db.md#getschemaconfig)
- [toPublicBlog](src_backend_db.md#topublicblog)
- [toPublicPage](src_backend_db.md#topublicpage)
- [toPublicPageMetadata](src_backend_db.md#topublicpagemetadata)
- [toPublicUser](src_backend_db.md#topublicuser)

## Type Aliases

### BlogId

Ƭ **BlogId**: [`UserId`](../interfaces/src_backend_db.UserId.md)

#### Defined in

[src/backend/db.ts:88](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L88)

___

### Email

Ƭ **Email**: `string`

#### Defined in

[src/backend/db.ts:78](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L78)

___

### InternalInfo

Ƭ **InternalInfo**: `WithId`<{ `blogs`: `number` ; `pages`: `number` ; `users`: `number`  }\>

The shape of internal info.

#### Defined in

[src/backend/db.ts:247](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L247)

___

### InternalPage

Ƭ **InternalPage**: `WithId`<{ `__provenance`: [`TokenAttributeOwner`](src_backend_db.md#tokenattributeowner) ; `blog_id`: [`BlogId`](src_backend_db.md#blogid) ; `contents`: `string` ; `createdAt`: `UnixEpochMs` ; `name`: `string` ; `totalViews`: `number`  }\>

The shape of an internal blog page.

#### Defined in

[src/backend/db.ts:206](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L206)

___

### InternalSession

Ƭ **InternalSession**: `WithId`<{ `__provenance`: [`TokenAttributeOwner`](src_backend_db.md#tokenattributeowner) ; `lastRenewedDate`: `Date` ; `page_id`: [`PageId`](../interfaces/src_backend_db.PageId.md)  }\>

The shape of an internal active user entry.

#### Defined in

[src/backend/db.ts:238](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L238)

___

### InternalUser

Ƭ **InternalUser**: `WithId`<{ `__provenance`: [`TokenAttributeOwner`](src_backend_db.md#tokenattributeowner) ; `email`: `string` ; `key`: `string` ; `salt`: `string` ; `type`: [`UserType`](src_backend_db.md#usertype) ; `username`: [`Username`](src_backend_db.md#username) \| ``null``  }\> & { `banned`: `boolean` ; `blogName`: `string` ; `blogRootPage`: `string` ; `createdAt`: `UnixEpochMs` ; `navLinks`: [`NavigationLink`](src_backend_db.md#navigationlink)[] ; `type`: ``"blogger"``  } \| { `banned?`: `never` ; `blogName?`: `never` ; `blogRootPage?`: `never` ; `createdAt?`: `never` ; `navLinks?`: `never` ; `type`: ``"administrator"``  }

The shape of an internal application user.

#### Defined in

[src/backend/db.ts:116](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L116)

___

### MaybeUsernameOrEmail

Ƭ **MaybeUsernameOrEmail**: [`Username`](src_backend_db.md#username) \| [`Email`](src_backend_db.md#email) \| `undefined`

#### Defined in

[src/backend/db.ts:79](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L79)

___

### NavigationLink

Ƭ **NavigationLink**: `Object`

The shape of a navigation link.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `href` | `string` |
| `text` | `string` |

#### Defined in

[src/backend/db.ts:103](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L103)

___

### NewPage

Ƭ **NewPage**: `Partial`<`Pick`<[`InternalPage`](src_backend_db.md#internalpage), ``"name"`` \| ``"contents"``\>\>

The shape of a new blog page.

#### Defined in

[src/backend/db.ts:226](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L226)

___

### NewUser

Ƭ **NewUser**: `Partial`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"username"`` \| ``"salt"`` \| ``"email"`` \| ``"key"`` \| ``"type"`` \| ``"blogName"``\>\>

The shape of a new application user.

#### Defined in

[src/backend/db.ts:174](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L174)

___

### PatchBlog

Ƭ **PatchBlog**: `Partial`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"navLinks"``\> & { `name`: `NonNullable`<[`InternalUser`](src_backend_db.md#internaluser)[``"blogName"``]\> ; `rootPage`: `NonNullable`<[`InternalUser`](src_backend_db.md#internaluser)[``"blogRootPage"``]\>  }\>

The shape of a patch blog.

#### Defined in

[src/backend/db.ts:196](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L196)

___

### PatchPage

Ƭ **PatchPage**: `Partial`<`Pick`<[`InternalPage`](src_backend_db.md#internalpage), ``"contents"``\>\> & { `totalViews?`: ``"increment"``  }

The shape of a patch blog page.

#### Defined in

[src/backend/db.ts:231](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L231)

___

### PatchUser

Ƭ **PatchUser**: `Partial`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"salt"`` \| ``"email"`` \| ``"key"`` \| ``"banned"``\>\>

The shape of a patch application user.

#### Defined in

[src/backend/db.ts:181](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L181)

___

### PublicBlog

Ƭ **PublicBlog**: `Required`<`Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"navLinks"`` \| ``"createdAt"``\>\> & { `name`: `NonNullable`<[`InternalUser`](src_backend_db.md#internaluser)[``"blogName"``]\> ; `rootPage`: `NonNullable`<[`InternalUser`](src_backend_db.md#internaluser)[``"blogRootPage"``]\>  }

The shape of a public blog.

#### Defined in

[src/backend/db.ts:188](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L188)

___

### PublicInfo

Ƭ **PublicInfo**: `WithoutId`<[`InternalInfo`](src_backend_db.md#internalinfo)\>

The shape of public info.

#### Defined in

[src/backend/db.ts:256](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L256)

___

### PublicPage

Ƭ **PublicPage**: `Pick`<[`InternalPage`](src_backend_db.md#internalpage), ``"contents"`` \| ``"createdAt"`` \| ``"name"`` \| ``"totalViews"``\>

The shape of a public blog page.

#### Defined in

[src/backend/db.ts:218](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L218)

___

### PublicPageMetadata

Ƭ **PublicPageMetadata**: `Pick`<[`InternalPage`](src_backend_db.md#internalpage), ``"name"`` \| ``"createdAt"`` \| ``"totalViews"``\>

The shape of a public blog page metadata object.

#### Defined in

[src/backend/db.ts:108](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L108)

___

### PublicUser

Ƭ **PublicUser**: [`PublicUserAdministrator`](src_backend_db.md#publicuseradministrator) \| [`PublicUserBlogger`](src_backend_db.md#publicuserblogger)

The shape of a public application user.

#### Defined in

[src/backend/db.ts:146](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L146)

___

### PublicUserAdministrator

Ƭ **PublicUserAdministrator**: `Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"username"`` \| ``"salt"`` \| ``"email"``\> & { `banned?`: `never` ; `blogName?`: `never` ; `type`: ``"administrator"`` ; `user_id`: `string`  }

The shape of a public application administrator user.

#### Defined in

[src/backend/db.ts:151](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L151)

___

### PublicUserBlogger

Ƭ **PublicUserBlogger**: `Pick`<[`InternalUser`](src_backend_db.md#internaluser), ``"username"`` \| ``"salt"`` \| ``"email"``\> & { `banned`: [`InternalUser`](src_backend_db.md#internaluser)[``"banned"``] ; `blogName`: [`InternalUser`](src_backend_db.md#internaluser)[``"blogName"``] ; `type`: ``"blogger"`` ; `user_id`: `string`  }

The shape of a public application user.

#### Defined in

[src/backend/db.ts:164](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L164)

___

### TokenAttributeOwner

Ƭ **TokenAttributeOwner**: [`TokenAttributes`](lib_next_auth.md#tokenattributes)[``"owner"``]

#### Defined in

[src/backend/db.ts:80](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L80)

___

### UserType

Ƭ **UserType**: typeof [`userTypes`](src_backend_db.md#usertypes)[`number`]

Represents the type of authenticated user.

#### Defined in

[src/backend/db.ts:98](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L98)

___

### Username

Ƭ **Username**: `string`

#### Defined in

[src/backend/db.ts:77](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L77)

## Variables

### publicBlogProjection

• `Const` **publicBlogProjection**: `Object`

A MongoDB cursor projection that transforms an internal user into a public
user.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_id` | ``false`` |
| `createdAt` | ``true`` |
| `name` | ``"$blogName"`` |
| `navLinks` | ``true`` |
| `rootPage` | ``"$blogRootPage"`` |

#### Defined in

[src/backend/db.ts:355](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L355)

___

### publicPageMetadataProjection

• `Const` **publicPageMetadataProjection**: `Object`

A MongoDB cursor projection that transforms an internal user into a public
user.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_id` | ``false`` |
| `createdAt` | ``true`` |
| `name` | ``true`` |
| `totalViews` | ``true`` |

#### Defined in

[src/backend/db.ts:367](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L367)

___

### publicPageProjection

• `Const` **publicPageProjection**: `Object`

A MongoDB cursor projection that transforms an internal user into a public
user.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_id` | ``false`` |
| `contents` | ``true`` |
| `createdAt` | ``true`` |
| `name` | ``true`` |
| `totalViews` | ``true`` |

#### Defined in

[src/backend/db.ts:378](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L378)

___

### publicUserProjection

• `Const` **publicUserProjection**: `Object`

A MongoDB cursor projection that transforms an internal user into a public
user.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_id` | ``false`` |
| `banned` | ``true`` |
| `blogName` | ``true`` |
| `email` | ``true`` |
| `salt` | ``true`` |
| `type` | ``true`` |
| `user_id` | { `$toString`: ``"$_id"`` = '$\_id' } |
| `user_id.$toString` | ``"$_id"`` |
| `username` | ``true`` |

#### Defined in

[src/backend/db.ts:340](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L340)

___

### userTypes

• `Const` **userTypes**: readonly [``"blogger"``, ``"administrator"``]

An array of valid authenticated user types.

#### Defined in

[src/backend/db.ts:93](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L93)

## Functions

### getSchemaConfig

▸ **getSchemaConfig**(): [`DbSchema`](lib_mongo_schema.md#dbschema)

A JSON representation of the backend Mongo database structure. This is used
for consistent app-wide db access across projects and to generate transient
versions of the db during testing.

#### Returns

[`DbSchema`](lib_mongo_schema.md#dbschema)

#### Defined in

[src/backend/db.ts:16](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L16)

___

### toPublicBlog

▸ **toPublicBlog**(`«destructured»`): [`PublicBlog`](src_backend_db.md#publicblog)

Transforms an internal user into a public user.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`InternalUser`](src_backend_db.md#internaluser) |

#### Returns

[`PublicBlog`](src_backend_db.md#publicblog)

#### Defined in

[src/backend/db.ts:288](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L288)

___

### toPublicPage

▸ **toPublicPage**(`«destructured»`): [`PublicPage`](src_backend_db.md#publicpage)

Transforms an internal user into a public user.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`InternalPage`](src_backend_db.md#internalpage) |

#### Returns

[`PublicPage`](src_backend_db.md#publicpage)

#### Defined in

[src/backend/db.ts:307](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L307)

___

### toPublicPageMetadata

▸ **toPublicPageMetadata**(`«destructured»`): [`PublicPageMetadata`](src_backend_db.md#publicpagemetadata)

Transforms an internal user into a public user.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`InternalPage`](src_backend_db.md#internalpage) |

#### Returns

[`PublicPageMetadata`](src_backend_db.md#publicpagemetadata)

#### Defined in

[src/backend/db.ts:324](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L324)

___

### toPublicUser

▸ **toPublicUser**(`internalUser`): [`PublicUser`](src_backend_db.md#publicuser)

Transforms an internal user into a public user.

#### Parameters

| Name | Type |
| :------ | :------ |
| `internalUser` | [`InternalUser`](src_backend_db.md#internaluser) |

#### Returns

[`PublicUser`](src_backend_db.md#publicuser)

#### Defined in

[src/backend/db.ts:261](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/backend/db.ts#L261)
