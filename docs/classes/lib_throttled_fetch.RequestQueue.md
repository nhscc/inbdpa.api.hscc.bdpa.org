[inbdpa.api.hscc.bdpa.org](../README.md) / [lib/throttled-fetch](../modules/lib_throttled_fetch.md) / RequestQueue

# Class: RequestQueue<T\>

[lib/throttled-fetch](../modules/lib_throttled_fetch.md).RequestQueue

Execute requests present in the request queue with respect to backoff data,
flow control, rate limits, and other data.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Constructors

- [constructor](lib_throttled_fetch.RequestQueue.md#constructor)

### Properties

- [#debugAddRequestCounter](lib_throttled_fetch.RequestQueue.md##debugaddrequestcounter)
- [#debugIntervalCounter](lib_throttled_fetch.RequestQueue.md##debugintervalcounter)
- [#debugSentRequestCounter](lib_throttled_fetch.RequestQueue.md##debugsentrequestcounter)
- [#defaultRequestInit](lib_throttled_fetch.RequestQueue.md##defaultrequestinit)
- [#delayRequestProcessingByMs](lib_throttled_fetch.RequestQueue.md##delayrequestprocessingbyms)
- [#fetchErrorInspector](lib_throttled_fetch.RequestQueue.md##fetcherrorinspector)
- [#intervalPeriodMs](lib_throttled_fetch.RequestQueue.md##intervalperiodms)
- [#keepProcessingRequestQueue](lib_throttled_fetch.RequestQueue.md##keepprocessingrequestqueue)
- [#maxRequestsPerInterval](lib_throttled_fetch.RequestQueue.md##maxrequestsperinterval)
- [#queueProcessingIsSoftPaused](lib_throttled_fetch.RequestQueue.md##queueprocessingissoftpaused)
- [#queueStoppedPromise](lib_throttled_fetch.RequestQueue.md##queuestoppedpromise)
- [#queueStoppedPromiseResolver](lib_throttled_fetch.RequestQueue.md##queuestoppedpromiseresolver)
- [#requestInspector](lib_throttled_fetch.RequestQueue.md##requestinspector)
- [#requestQueue](lib_throttled_fetch.RequestQueue.md##requestqueue)
- [#responseInspector](lib_throttled_fetch.RequestQueue.md##responseinspector)
- [#terminationAbortController](lib_throttled_fetch.RequestQueue.md##terminationabortcontroller)
- [#timeoutId](lib_throttled_fetch.RequestQueue.md##timeoutid)

### Accessors

- [defaultRequestInit](lib_throttled_fetch.RequestQueue.md#defaultrequestinit)
- [fetchErrorInspector](lib_throttled_fetch.RequestQueue.md#fetcherrorinspector)
- [intervalPeriodMs](lib_throttled_fetch.RequestQueue.md#intervalperiodms)
- [isProcessingRequestQueue](lib_throttled_fetch.RequestQueue.md#isprocessingrequestqueue)
- [maxRequestsPerInterval](lib_throttled_fetch.RequestQueue.md#maxrequestsperinterval)
- [requestInspector](lib_throttled_fetch.RequestQueue.md#requestinspector)
- [requestProcessingDelayMs](lib_throttled_fetch.RequestQueue.md#requestprocessingdelayms)
- [responseInspector](lib_throttled_fetch.RequestQueue.md#responseinspector)

### Methods

- [#finishGracefulStop](lib_throttled_fetch.RequestQueue.md##finishgracefulstop)
- [#processRequestQueue](lib_throttled_fetch.RequestQueue.md##processrequestqueue)
- [#scheduleNextInterval](lib_throttled_fetch.RequestQueue.md##schedulenextinterval)
- [addRequestToQueue](lib_throttled_fetch.RequestQueue.md#addrequesttoqueue)
- [beginProcessingRequestQueue](lib_throttled_fetch.RequestQueue.md#beginprocessingrequestqueue)
- [clearRequestQueue](lib_throttled_fetch.RequestQueue.md#clearrequestqueue)
- [delayRequestProcessingByMs](lib_throttled_fetch.RequestQueue.md#delayrequestprocessingbyms)
- [getStats](lib_throttled_fetch.RequestQueue.md#getstats)
- [gracefullyStopProcessingRequestQueue](lib_throttled_fetch.RequestQueue.md#gracefullystopprocessingrequestqueue)
- [immediatelyStopProcessingRequestQueue](lib_throttled_fetch.RequestQueue.md#immediatelystopprocessingrequestqueue)
- [prependRequestToQueue](lib_throttled_fetch.RequestQueue.md#prependrequesttoqueue)
- [waitForQueueProcessingToStop](lib_throttled_fetch.RequestQueue.md#waitforqueueprocessingtostop)

## Constructors

### constructor

• **new RequestQueue**<`T`\>(`«destructured»`)

Create, configure, and return a new RequestQueue instance. All instance
methods are auto-bound.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `autoStart?` | `boolean` | If `true`, `beginProcessingRequestQueue` and `gracefullyStopProcessingRequestQueue` will be called immediately after the new instance is created. This allows you to start adding requests to the queue immediately without worrying about managing the processor runtime. Note that using `await` in the same context as the queue instance, and before adding all of your desired requests, could cause the queue to stop processing earlier than you might expect. If this is happening, you'll have to call `beginProcessingRequestQueue` and `gracefullyStopProcessingRequestQueue` manually instead of using `autoStart`. **`Default`** ```ts false ``` |
| › `fetchErrorInspector?` | [`FetchErrorInspector`](../modules/lib_throttled_fetch.md#fetcherrorinspector) | A function used to take some action after the node-fetch `fetch` function rejects due to failure. Like `requestInspector`, this function must do one of the following before terminating: - Return a promise that resolves how you want. - Call `addRequestToQueue` again and return it (beware infinite loops). - Await a `setTimeout` promise to delay the request before continuing. - Throw an error causing the `addRequestToQueue` method to reject. Delaying a request using `requestInspector` will have no effect on the processing of other requests or the period between intervals, making it ideal to retry failed fetch requests. The resolved value of this function will always be passed to `responseInspector` directly (no additional internal `fetch()` happens) unless an error is thrown, in which case the `addRequestToQueue` return value will reject. **`Default`** ```ts defaultFetchErrorInspector (see export) ``` |
| › `intervalPeriodMs` | `number` | A maximum of `maxRequestsPerInterval` requests will be processed every `>=intervalPeriodMs` milliseconds. |
| › `maxRequestsPerInterval` | `number` | A maximum of `maxRequestsPerInterval` requests will be processed every `>=intervalPeriodMs` milliseconds. |
| › `requestInspector?` | [`RequestInspector`](../modules/lib_throttled_fetch.md#requestinspector) | A function used to alter the behavior of individual requests based on available parameters. This function must do one of the following before terminating: - Mutate `addRequestToQueue`'s params before letting it continuing. - BYO fetch library and return a promise that resolves how you want. - Call `addRequestToQueue` again and return it (beware infinite loops). - Await a `setTimeout` promise to delay the request before continuing. - Throw an error causing the `addRequestToQueue` method to reject. Delaying a request using `requestInspector` will have no effect on the processing of other requests or the period between intervals, making it ideal for more complex (e.g. isolated, per-endpoint) throttling requirements. If this function returns `undefined` or a promise that resolves to `undefined`, an internal `fetch()` will be made using the request params passed to (and potentially mutated by) this function. The fetch result will be passed to `responseInspector`. Otherwise, the resolved defined value of this function will be passed to `responseInspector` directly (no additional internal `fetch()` happens). If this function throws, the corresponding `addRequestToQueue` call will reject and `responseInspector` will not be called. **`Default`** ```ts defaultRequestInspector (see export) ``` |
| › `responseInspector?` | [`ResponseInspector`](../modules/lib_throttled_fetch.md#responseinspector) | A function used to reshape response data before returning it through the resolved `addRequestToQueue` promise. This function must do one of the following before terminating: - Return a JSON representation of the response, e.g. `response.json()`. - Interpret and/or transform the response data and return any value. - Throw an error causing the `addRequestToQueue` method to reject. The return value of this function will eventually be used as the resolved value of the promise returned by the corresponding `addRequestToQueue` call that triggered it. Similarly, if this function throws, the corresponding `addRequestToQueue` call will reject. **`Default`** ```ts defaultResponseInspector (see export) ``` |

#### Defined in

[lib/throttled-fetch/index.ts:217](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L217)

## Properties

### #debugAddRequestCounter

• `Private` **#debugAddRequestCounter**: `number` = `0`

A counter used only in debug and stats output.

#### Defined in

[lib/throttled-fetch/index.ts:206](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L206)

___

### #debugIntervalCounter

• `Private` **#debugIntervalCounter**: `number` = `0`

A counter used only in debug and stats output.

#### Defined in

[lib/throttled-fetch/index.ts:201](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L201)

___

### #debugSentRequestCounter

• `Private` **#debugSentRequestCounter**: `number` = `0`

A counter used only in debug and stats output.

#### Defined in

[lib/throttled-fetch/index.ts:211](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L211)

___

### #defaultRequestInit

• `Private` **#defaultRequestInit**: `RequestInit` = `{}`

Default request initialization parameters sent along with every request.

#### Defined in

[lib/throttled-fetch/index.ts:165](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L165)

___

### #delayRequestProcessingByMs

• `Private` **#delayRequestProcessingByMs**: `number` = `0`

If non-zero, no new requests will be made until this many milliseconds have
transpired.

#### Defined in

[lib/throttled-fetch/index.ts:120](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L120)

___

### #fetchErrorInspector

• `Private` **#fetchErrorInspector**: [`FetchErrorInspector`](../modules/lib_throttled_fetch.md#fetcherrorinspector)

A function used to alter the behavior of the queue when the fetch function
rejects.

#### Defined in

[lib/throttled-fetch/index.ts:160](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L160)

___

### #intervalPeriodMs

• `Private` **#intervalPeriodMs**: `number`

The number of milliseconds between intervals.

#### Defined in

[lib/throttled-fetch/index.ts:186](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L186)

___

### #keepProcessingRequestQueue

• `Private` **#keepProcessingRequestQueue**: `boolean` = `true`

Once this is set to false and requestQueue is empty,
`queueAbortController.abort()` will be called automatically.

#### Defined in

[lib/throttled-fetch/index.ts:126](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L126)

___

### #maxRequestsPerInterval

• `Private` **#maxRequestsPerInterval**: `number`

The maximum number of requests processed in a single interval.

#### Defined in

[lib/throttled-fetch/index.ts:181](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L181)

___

### #queueProcessingIsSoftPaused

• `Private` **#queueProcessingIsSoftPaused**: `boolean` = `false`

Determines when queue processing is "soft-paused," which allows the
processor to avoid wasting cycles scheduling intervals when the request
queue is empty.

#### Defined in

[lib/throttled-fetch/index.ts:133](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L133)

___

### #queueStoppedPromise

• `Private` **#queueStoppedPromise**: `Promise`<`void`\>

Used to facilitate "waiting" for the queue to stop processing requests.

#### Defined in

[lib/throttled-fetch/index.ts:170](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L170)

___

### #queueStoppedPromiseResolver

• `Private` **#queueStoppedPromiseResolver**: () => `void`

#### Type declaration

▸ (): `void`

Used to facilitate "waiting" for the queue to stop processing requests.

##### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:176](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L176)

___

### #requestInspector

• `Private` **#requestInspector**: [`RequestInspector`](../modules/lib_throttled_fetch.md#requestinspector)

A function used to individual requests based on feedback from request data.

#### Defined in

[lib/throttled-fetch/index.ts:148](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L148)

___

### #requestQueue

• `Private` **#requestQueue**: [fetchParams: [url: RequestInfo, init?: RequestInit], callback: RequestQueueCallback, state: Record<string, unknown\>][] = `[]`

A queue of requests waiting to be processed. The response JSON data will be
returned via the `resolve` function.

#### Defined in

[lib/throttled-fetch/index.ts:192](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L192)

___

### #responseInspector

• `Private` **#responseInspector**: [`ResponseInspector`](../modules/lib_throttled_fetch.md#responseinspector)

A function used to alter the behavior of the queue based on feedback from
response data.

#### Defined in

[lib/throttled-fetch/index.ts:154](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L154)

___

### #terminationAbortController

• `Private` **#terminationAbortController**: `AbortController`

Used to immediately end the delaying period.

#### Defined in

[lib/throttled-fetch/index.ts:143](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L143)

___

### #timeoutId

• `Private` **#timeoutId**: ``null`` \| `Timeout` = `null`

Used to abort the request queue processor.

#### Defined in

[lib/throttled-fetch/index.ts:138](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L138)

## Accessors

### defaultRequestInit

• `get` **defaultRequestInit**(): `RequestInit`

Default request initialization parameters sent along with every request.

#### Returns

`RequestInit`

#### Defined in

[lib/throttled-fetch/index.ts:449](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L449)

• `set` **defaultRequestInit**(`init`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | `RequestInit` |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:453](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L453)

___

### fetchErrorInspector

• `get` **fetchErrorInspector**(): [`FetchErrorInspector`](../modules/lib_throttled_fetch.md#fetcherrorinspector)

A function used to take some action after the node-fetch `fetch` function
rejects due to failure. Like `requestInspector`, this function must do one
of the following before terminating:

  - Return a promise that resolves how you want.
  - Call `addRequestToQueue` again and return it (beware infinite loops).
  - Await a `setTimeout` promise to delay the request before continuing.
  - Throw an error causing the `addRequestToQueue` method to reject.

Delaying a request using `requestInspector` will have no effect on the
processing of other requests or the period between intervals, making it
ideal to retry failed fetch requests.

The resolved value of this function will always be passed to
`responseInspector` directly (no additional internal `fetch()` happens)
unless an error is thrown, in which case the `addRequestToQueue` return
value will reject.

**`Default`**

```ts
defaultFetchErrorInspector (see export)
```

#### Returns

[`FetchErrorInspector`](../modules/lib_throttled_fetch.md#fetcherrorinspector)

#### Defined in

[lib/throttled-fetch/index.ts:437](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L437)

• `set` **fetchErrorInspector**(`inspector`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inspector` | [`FetchErrorInspector`](../modules/lib_throttled_fetch.md#fetcherrorinspector) |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:441](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L441)

___

### intervalPeriodMs

• `get` **intervalPeriodMs**(): `number`

A maximum of `maxRequestsPerInterval` requests will be processed every
`>=intervalPeriodMs` milliseconds.

#### Returns

`number`

#### Defined in

[lib/throttled-fetch/index.ts:475](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L475)

• `set` **intervalPeriodMs**(`period`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `period` | `number` |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:479](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L479)

___

### isProcessingRequestQueue

• `get` **isProcessingRequestQueue**(): `boolean`

Returns `true` if the request queue is currently being processed or `false`
otherwise.

#### Returns

`boolean`

#### Defined in

[lib/throttled-fetch/index.ts:340](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L340)

___

### maxRequestsPerInterval

• `get` **maxRequestsPerInterval**(): `number`

A maximum of `maxRequestsPerInterval` requests will be processed every
`>=intervalPeriodMs` milliseconds.

#### Returns

`number`

#### Defined in

[lib/throttled-fetch/index.ts:462](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L462)

• `set` **maxRequestsPerInterval**(`count`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `count` | `number` |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:466](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L466)

___

### requestInspector

• `get` **requestInspector**(): [`RequestInspector`](../modules/lib_throttled_fetch.md#requestinspector)

A function used to alter the behavior of individual requests based on
available parameters. This function must do one of the following before
terminating:

  - Mutate `addRequestToQueue`'s params before letting it continuing.
  - BYO fetch library and return a promise that resolves how you want.
  - Call `addRequestToQueue` again and return it (beware infinite loops).
  - Await a `setTimeout` promise to delay the request before continuing.
  - Throw an error causing the `addRequestToQueue` method to reject.

Delaying a request using `requestInspector` will have no effect on the
processing of other requests or the period between intervals, making it
ideal for more complex (e.g. isolated, per-endpoint) throttling
requirements.

If this function returns `undefined` or a promise that resolves to
`undefined`, an internal `fetch()` will be made using the request params
passed to (and potentially mutated by) this function. The fetch result
will be passed to `responseInspector`. Otherwise, the resolved defined
value of this function will be passed to `responseInspector` directly (no
internal `fetch()` happens).

If this function throws, the corresponding `addRequestToQueue` call will
reject and `responseInspector` will not be called.

**`Default`**

```ts
defaultRequestInspector (see export)
```

#### Returns

[`RequestInspector`](../modules/lib_throttled_fetch.md#requestinspector)

#### Defined in

[lib/throttled-fetch/index.ts:382](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L382)

• `set` **requestInspector**(`inspector`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inspector` | [`RequestInspector`](../modules/lib_throttled_fetch.md#requestinspector) |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:386](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L386)

___

### requestProcessingDelayMs

• `get` **requestProcessingDelayMs**(): `number`

If non-zero, no new requests will be made until this many milliseconds have
transpired. This value is relative to when `delayRequestProcessingByMs` was
last called, so querying this property isn't useful without that additional
context.

#### Returns

`number`

#### Defined in

[lib/throttled-fetch/index.ts:350](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L350)

___

### responseInspector

• `get` **responseInspector**(): [`ResponseInspector`](../modules/lib_throttled_fetch.md#responseinspector)

A function used to reshape response data before returning it through the
resolved `addRequestToQueue` promise. This function must do one of the
following before terminating:

  - Return a JSON representation of the response, e.g. `response.json()`.
  - Interpret and/or transform the response data and return any value.
  - Throw an error causing the `addRequestToQueue` method to reject.

The return value of this function will eventually be used as the resolved
value of the promise returned by the corresponding `addRequestToQueue`
call that triggered it. Similarly, if this function throws, the
corresponding `addRequestToQueue` call will reject.

**`Default`**

```ts
defaultResponseInspector (see export)
```

#### Returns

[`ResponseInspector`](../modules/lib_throttled_fetch.md#responseinspector)

#### Defined in

[lib/throttled-fetch/index.ts:407](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L407)

• `set` **responseInspector**(`inspector`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inspector` | [`ResponseInspector`](../modules/lib_throttled_fetch.md#responseinspector) |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:411](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L411)

## Methods

### #finishGracefulStop

▸ `Private` **#finishGracefulStop**(): `void`

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:498](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L498)

___

### #processRequestQueue

▸ `Private` **#processRequestQueue**(): `Promise`<`void`\>

An internal function to execute requests present in the request queue with
respect to constraints available in the response data.

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/throttled-fetch/index.ts:511](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L511)

___

### #scheduleNextInterval

▸ `Private` **#scheduleNextInterval**(): `void`

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:484](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L484)

___

### addRequestToQueue

▸ **addRequestToQueue**<`TT`\>(`...params`): `Promise`<`TT`\>

Append a request to the request queue. This function returns a promise that
will resolve with the request's response data as determined by
`responseInspector`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TT` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...params` | `ExtendedFetchParams` |

#### Returns

`Promise`<`TT`\>

#### Defined in

[lib/throttled-fetch/index.ts:714](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L714)

___

### beginProcessingRequestQueue

▸ **beginProcessingRequestQueue**(): `void`

Begin asynchronously processing the request queue. If the queue is already
being processed, calling this function again will throw.

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:791](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L791)

___

### clearRequestQueue

▸ **clearRequestQueue**(): `void`

Remove all pending and unprocessed requests from the request queue,
rejecting their corresponding promises with a `RequestQueueClearedError`.
In-flight requests will still complete unless
`immediatelyStopProcessingRequestQueue` has been called.

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:884](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L884)

___

### delayRequestProcessingByMs

▸ **delayRequestProcessingByMs**(`delay`): `void`

Calling this function will cause the request processor to wait `delay`
milliseconds before sending any subsequent requests. Requests that have
already been sent will resolve without delay.

After the delay period transpires, the internal delay value will be reset
to `0` _regardless of calls to `delayRequestProcessingByMs` in the
interim_. Hence, due to the asynchronous nature of request processing,
calling `delayRequestProcessingByMs` asynchronously (e.g. via
`requestInspector` or `responseInspector`) **does not guarantee that the
new value will be respected.**

To implement backoff or other complex throttling functionality, consider
instead using per-request delays manually (e.g. via `setTimeout`) at the
`requestInspector` level.

#### Parameters

| Name | Type |
| :------ | :------ |
| `delay` | `number` |

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:772](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L772)

___

### getStats

▸ **getStats**(): `Object`

Returns various statistics about the queue runtime.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `internalRequestsSent` | `number` |
| `intervals` | `number` |
| `requestsEnqueued` | `number` |

#### Defined in

[lib/throttled-fetch/index.ts:914](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L914)

___

### gracefullyStopProcessingRequestQueue

▸ **gracefullyStopProcessingRequestQueue**(): `void`

Signal to the queue processor that, once the queue is empty, request
processing is to stop. This means no further requests will be dequeued or
executed.

Requests can still be added to the queue after request processing
eventually stops (via `addRequestToQueue`), but they will not be dequeued
and executed until `beginProcessingRequestQueue` is called again.

This function will throw if called when the queue is not being processed.

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:824](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L824)

___

### immediatelyStopProcessingRequestQueue

▸ **immediatelyStopProcessingRequestQueue**(): `void`

Signal to the queue processor to stop all request processing immediately,
regardless of if the queue is empty or not. After calling this method, no
new or queued requests will be processed, though the queue is not cleared.
Requests can still be added to the queue (via `addRequestToQueue`) but they
will not be processed until `beginProcessingRequestQueue` is called again.

If a request is in-flight when this method is called, the request will be
aborted and the corresponding promise rejected with an `AbortError`. The
aborted request must be re-added to the queue manually as it will not be
retried automatically.

This function will throw if called when the queue is not being processed.

#### Returns

`void`

#### Defined in

[lib/throttled-fetch/index.ts:855](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L855)

___

### prependRequestToQueue

▸ **prependRequestToQueue**<`TT`\>(`...params`): `Promise`<`TT`\>

Exactly the same as `addRequestToQueue` in every way, except the request is
_prepended_ rather than appended to the queue.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TT` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...params` | `ExtendedFetchParams` |

#### Returns

`Promise`<`TT`\>

#### Defined in

[lib/throttled-fetch/index.ts:737](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L737)

___

### waitForQueueProcessingToStop

▸ **waitForQueueProcessingToStop**(): `Promise`<`void`\>

Returns a promise that resolves after queue processing stops. Before
  calling this function, you should ensure that
  `gracefullyStopProcessingRequestQueue` or
  `immediatelyStopProcessingRequestQueue` have already been or will
  eventually be called or this promise will never settle.

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/throttled-fetch/index.ts:906](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/throttled-fetch/index.ts#L906)
