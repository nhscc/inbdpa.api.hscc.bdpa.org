[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-log

# Module: lib/next-log

## Table of contents

### Type Aliases

- [InternalRequestLogEntry](lib_next_log.md#internalrequestlogentry)
- [NewRequestLogEntry](lib_next_log.md#newrequestlogentry)

### Functions

- [addToRequestLog](lib_next_log.md#addtorequestlog)

## Type Aliases

### InternalRequestLogEntry

Ƭ **InternalRequestLogEntry**: `WithId`<{ `createdAt`: `UnixEpochMs` ; `durationMs`: `number` ; `endpoint`: `string` \| ``null`` ; `header`: `string` \| ``null`` ; `ip`: `string` \| ``null`` ; `method`: `string` \| ``null`` ; `resStatusCode`: `HttpStatusCode` ; `route`: `string` \| ``null``  }\>

The shape of an entry in the well-known "request log" collection.

#### Defined in

[lib/next-log/index.ts:13](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-log/index.ts#L13)

___

### NewRequestLogEntry

Ƭ **NewRequestLogEntry**: `WithoutId`<[`InternalRequestLogEntry`](lib_next_log.md#internalrequestlogentry)\>

The shape of a new entry in the well-known "request log" collection.

#### Defined in

[lib/next-log/index.ts:27](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-log/index.ts#L27)

## Functions

### addToRequestLog

▸ **addToRequestLog**(`«destructured»`): `Promise`<`void`\>

This function adds a request metadata entry to the database.

Note that this async function **does not have to be awaited**. It's fire and
forget!

**`Example`**

```
doSomeStuff();
void addToRequestLog({ req, res, endpoint });
doSomeOtherStuff();
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `durationMs` | `number` |
| › `endpoint` | `undefined` \| ``null`` \| `string` |
| › `req` | `NextApiRequest` |
| › `res` | `NextApiResponse` |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/next-log/index.ts:42](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-log/index.ts#L42)
