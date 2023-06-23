[inbdpa.api.hscc.bdpa.org](../README.md) / lib/throttled-fetch

# Module: lib/throttled-fetch

## Table of contents

### Classes

- [RequestQueue](../classes/lib_throttled_fetch.RequestQueue.md)
- [RequestQueueClearedError](../classes/lib_throttled_fetch.RequestQueueClearedError.md)
- [RequestQueueError](../classes/lib_throttled_fetch.RequestQueueError.md)

### Type Aliases

- [FetchErrorInspector](lib_throttled_fetch.md#fetcherrorinspector)
- [RequestInspector](lib_throttled_fetch.md#requestinspector)
- [ResponseInspector](lib_throttled_fetch.md#responseinspector)

### Functions

- [defaultFetchErrorInspector](lib_throttled_fetch.md#defaultfetcherrorinspector)
- [defaultRequestInspector](lib_throttled_fetch.md#defaultrequestinspector)
- [defaultResponseInspector](lib_throttled_fetch.md#defaultresponseinspector)

## Type Aliases

### FetchErrorInspector

Ƭ **FetchErrorInspector**: (`params`: { `error`: `unknown` ; `queue`: [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md) ; `requestInfo`: `RequestInfo` ; `requestInit`: `RequestInitWithSignal` ; `state`: `Record`<`string`, `unknown`\>  }) => `Promisable`<`unknown`\>

#### Type declaration

▸ (`params`): `Promisable`<`unknown`\>

The shape of a FetchError-inspecting function.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.error` | `unknown` |
| `params.queue` | [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md) |
| `params.requestInfo` | `RequestInfo` |
| `params.requestInit` | `RequestInitWithSignal` |
| `params.state` | `Record`<`string`, `unknown`\> |

##### Returns

`Promisable`<`unknown`\>

#### Defined in

[lib/throttled-fetch/index.ts:70](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L70)

___

### RequestInspector

Ƭ **RequestInspector**: (`params`: { `queue`: [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md) ; `requestInfo`: `RequestInfo` ; `requestInit`: `RequestInitWithSignal` ; `state`: `Record`<`string`, `unknown`\>  }) => `Promisable`<`unknown`\>

#### Type declaration

▸ (`params`): `Promisable`<`unknown`\>

The shape of a request-inspecting function.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.queue` | [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md) |
| `params.requestInfo` | `RequestInfo` |
| `params.requestInit` | `RequestInitWithSignal` |
| `params.state` | `Record`<`string`, `unknown`\> |

##### Returns

`Promisable`<`unknown`\>

#### Defined in

[lib/throttled-fetch/index.ts:49](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L49)

___

### ResponseInspector

Ƭ **ResponseInspector**: (`params`: { `queue`: [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md) ; `requestInfo`: `RequestInfo` ; `requestInit`: `RequestInitWithSignal` ; `response`: `unknown` ; `state`: `Record`<`string`, `unknown`\>  }) => `Promisable`<`unknown`\>

#### Type declaration

▸ (`params`): `Promisable`<`unknown`\>

The shape of a response-inspecting function.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.queue` | [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md) |
| `params.requestInfo` | `RequestInfo` |
| `params.requestInit` | `RequestInitWithSignal` |
| `params.response` | `unknown` |
| `params.state` | `Record`<`string`, `unknown`\> |

##### Returns

`Promisable`<`unknown`\>

#### Defined in

[lib/throttled-fetch/index.ts:59](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L59)

## Functions

### defaultFetchErrorInspector

▸ **defaultFetchErrorInspector**(`params`): `unknown`

The default `FetchErrorInspector` used by each `RequestQueue` instance unless
otherwise configured. Re-throws the `FetchError` instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.error` | `unknown` |
| `params.queue` | [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md)<`any`\> |
| `params.requestInfo` | `RequestInfo` |
| `params.requestInit` | `RequestInitWithSignal` |
| `params.state` | `Record`<`string`, `unknown`\> |

#### Returns

`unknown`

#### Defined in

[lib/throttled-fetch/index.ts:70](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L70)

___

### defaultRequestInspector

▸ **defaultRequestInspector**(`params`): `unknown`

The default `RequestInspector` used by each `RequestQueue` instance unless
otherwise configured. Simply passes through the given fetch parameters.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.queue` | [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md)<`any`\> |
| `params.requestInfo` | `RequestInfo` |
| `params.requestInit` | `RequestInitWithSignal` |
| `params.state` | `Record`<`string`, `unknown`\> |

#### Returns

`unknown`

#### Defined in

[lib/throttled-fetch/index.ts:49](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L49)

___

### defaultResponseInspector

▸ **defaultResponseInspector**(`params`): `unknown`

The default `ResponseInspector` used by each `RequestQueue` instance unless
otherwise configured. Simply passes through the `Response` instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.queue` | [`RequestQueue`](../classes/lib_throttled_fetch.RequestQueue.md)<`any`\> |
| `params.requestInfo` | `RequestInfo` |
| `params.requestInit` | `RequestInitWithSignal` |
| `params.response` | `unknown` |
| `params.state` | `Record`<`string`, `unknown`\> |

#### Returns

`unknown`

#### Defined in

[lib/throttled-fetch/index.ts:59](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L59)
