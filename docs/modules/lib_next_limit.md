[inbdpa.api.hscc.bdpa.org](../README.md) / lib/next-limit

# Module: lib/next-limit

## Table of contents

### Type Aliases

- [InternalLimitedLogEntry](lib_next_limit.md#internallimitedlogentry)
- [NewLimitedLogEntry](lib_next_limit.md#newlimitedlogentry)

### Functions

- [clientIsRateLimited](lib_next_limit.md#clientisratelimited)
- [getAllRateLimits](lib_next_limit.md#getallratelimits)
- [removeRateLimit](lib_next_limit.md#removeratelimit)

## Type Aliases

### InternalLimitedLogEntry

Ƭ **InternalLimitedLogEntry**: `WithId`<{ `header?`: `never` ; `ip`: `string` ; `until`: `UnixEpochMs`  } \| { `header`: `string` ; `ip?`: `never` ; `until`: `UnixEpochMs`  }\>

The shape of an entry in the well-known "limited log" collection.

#### Defined in

[lib/next-limit/index.ts:13](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-limit/index.ts#L13)

___

### NewLimitedLogEntry

Ƭ **NewLimitedLogEntry**: `WithoutId`<[`InternalLimitedLogEntry`](lib_next_limit.md#internallimitedlogentry)\>

The shape of a new entry in the well-known "limited log" collection.

#### Defined in

[lib/next-limit/index.ts:29](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-limit/index.ts#L29)

## Functions

### clientIsRateLimited

▸ **clientIsRateLimited**(`req`): `Promise`<{ `isLimited`: `boolean` = !!limited; `retryAfter`: `number`  }\>

Returns an object with two keys: `isLimited` and `retryAfter`. If `isLimited`
is true, then the request should be rejected. The client should be instructed
to retry their request after `retryAfter` milliseconds have passed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `NextApiRequest` |

#### Returns

`Promise`<{ `isLimited`: `boolean` = !!limited; `retryAfter`: `number`  }\>

#### Defined in

[lib/next-limit/index.ts:36](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-limit/index.ts#L36)

___

### getAllRateLimits

▸ **getAllRateLimits**(): `Promise`<`WithoutId`<[`InternalLimitedLogEntry`](lib_next_limit.md#internallimitedlogentry)\>[]\>

Retrieve all active rate limits.

#### Returns

`Promise`<`WithoutId`<[`InternalLimitedLogEntry`](lib_next_limit.md#internallimitedlogentry)\>[]\>

#### Defined in

[lib/next-limit/index.ts:107](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-limit/index.ts#L107)

___

### removeRateLimit

▸ **removeRateLimit**(`«destructured»`): `Promise`<`number`\>

Removes a rate limit on a client matched against either `ip`, `header`, or
both. Matching against both removes rate limits that match either criterion.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `target` | `undefined` \| { `header?`: `string` ; `ip?`: `string`  } |

#### Returns

`Promise`<`number`\>

The number of rate limits removed.

#### Defined in

[lib/next-limit/index.ts:69](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/next-limit/index.ts#L69)
