[inbdpa.api.hscc.bdpa.org](../README.md) / lib/json-unfetch

# Module: lib/json-unfetch

## Table of contents

### Classes

- [JsonUnfetchError](../classes/lib_json_unfetch.JsonUnfetchError.md)

### Type Aliases

- [BodyInit](lib_json_unfetch.md#bodyinit)
- [JsonRequestInit](lib_json_unfetch.md#jsonrequestinit)
- [RequestInit](lib_json_unfetch.md#requestinit)
- [Response](lib_json_unfetch.md#response)

### Variables

- [globalJsonRequestOptions](lib_json_unfetch.md#globaljsonrequestoptions)

### Functions

- [jsonFetch](lib_json_unfetch.md#jsonfetch)
- [swrFetch](lib_json_unfetch.md#swrfetch)

## Type Aliases

### BodyInit

Ƭ **BodyInit**: [`RequestInit`](lib_json_unfetch.md#requestinit)[``"body"``]

#### Defined in

[lib/json-unfetch/index.ts:29](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L29)

___

### JsonRequestInit

Ƭ **JsonRequestInit**: `Omit`<[`RequestInit`](lib_json_unfetch.md#requestinit), ``"body"``\> & { `body?`: [`BodyInit`](lib_json_unfetch.md#bodyinit) \| `JsonObject` \| `JsonPrimitive` ; `rejectIfNonJsonContentType?`: `boolean` ; `rejectIfNotOk?`: `boolean` ; `swr?`: `boolean`  }

Options to configure how jsonFetch executes.

**`See`**

https://github.com/developit/unfetch#api

#### Defined in

[lib/json-unfetch/index.ts:36](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L36)

___

### RequestInit

Ƭ **RequestInit**: `NonNullable`<`Parameters`<typeof `unfetch`\>[``1``]\>

#### Defined in

[lib/json-unfetch/index.ts:28](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L28)

___

### Response

Ƭ **Response**: `Awaited`<`ReturnType`<typeof `unfetch`\>\>

#### Defined in

[lib/json-unfetch/index.ts:27](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L27)

## Variables

### globalJsonRequestOptions

• `Const` **globalJsonRequestOptions**: [`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit)

The mutable default options for all `jsonFetch` calls. Keys will be
overridden by the optional `options` object passed into each call, e.g.
`jsonFetch(url, options)`.

Note: you must use `credentials: 'include'` to include cookies with your
requests. This is not the default setting.

**`See`**

https://github.com/developit/unfetch#api

#### Defined in

[lib/json-unfetch/index.ts:82](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L82)

## Functions

### jsonFetch

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init?`): `Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

Fetches a resource and returns an object containing two items: the response
itself under `res` and the response body parsed as JSON under either `error`
(if the response has a non-2xx status) or `json`.

If the response was not received with an `application/json` content-type
header or has a non-2xx status _and_ unparseable response body, `json` will
be undefined and `error` will be an empty object.

This function rejects if 1) the request body cannot be parsed as JSON but is
being sent with an `application/json` content-type header or 2) the response
body cannot be parsed as JSON but was received with an `application/json`
content-type header.

**`Example`**

```
type ResJson = { myNumber: number };
type ResErr = { reason: string };
const { res, json, error } = await jsonFetch<ResJson, ResErr>(
  'api/endpoint',
  {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}` },
    body: requestData
  }
);

if (error) {
  console.error(error?.reason ?? (res.ok
      ? 'bad json'
      : res.statusText));
} else {
  console.log(`number is: ${json?.myNumber}`);
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `JsonType` | extends `JsonObject` = `JsonObject` |
| `ErrorType` | extends `JsonObject` = `JsonType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `init?` | `Omit`<[`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"`` \| ``"swr"``\> & { `rejectIfNonJsonContentType?`: ``false`` ; `rejectIfNotOk?`: ``false`` ; `swr?`: ``false``  } |

#### Returns

`Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

#### Defined in

[lib/json-unfetch/index.ts:124](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L124)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

Fetches a resource and returns an object containing two items: the response
itself under `res` and the response body parsed as JSON under either `error`
(if the response has a non-2xx status) or `json`.

If the response was received with a non-2xx status _and_ unparseable response
body, `json` will be undefined and `error` will be an empty object.

This function rejects if 1) the request body cannot be parsed as JSON but is
being sent with an `application/json` content-type header, 2) the response
body cannot be parsed as JSON but was received with an `application/json`
content-type header, or 3) the response was received with a content-type
header other than `application/json`.

**`Example`**

```
type ResJson = { myNumber: number };
type ResErr = { reason: string };

try {
  const { res, json, error } = await jsonFetch<ResJson, ResErr>(
    'api/endpoint',
    { rejectIfNonJsonContentType: true }
  );

  if (error) {
    console.error(error?.reason ?? res.statusText);
  } else {
    console.log(`number is: ${json?.myNumber}`);
  }
} catch(e) {
  if(e instanceof JsonFetchError) {
    // Special handling for non-json response bodies
    specialHandler(e.res.status, e.json);
  } else {
    throw e;
  }
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `JsonType` | extends `JsonObject` = `JsonObject` |
| `ErrorType` | extends `JsonObject` = `JsonType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `init` | `Omit`<[`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"`` \| ``"swr"``\> & { `rejectIfNonJsonContentType`: ``true`` ; `rejectIfNotOk?`: ``false`` ; `swr?`: ``false``  } |

#### Returns

`Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

#### Defined in

[lib/json-unfetch/index.ts:182](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L182)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

Fetches a resource and returns an object containing two items: the response
itself under `res` and either the response body parsed as JSON under `json`
or, if the response was received with a content-type header other than
`application/json`, an empty object under `error`.

This function rejects if 1) the request body cannot be parsed as JSON but is
being sent with an `application/json` content-type header, 2) the response
body cannot be parsed as JSON but was received with an `application/json`
content-type header, or 3) the response was received with a non-2xx status.

**`Example`**

```
type ResJson = { myNumber: number };
type ResErr = { reason: string };

try {
  const { res, json, error } = await jsonFetch<ResJson, ResErr>(
    'api/endpoint',
    { rejectIfNotOk: true }
  );

  if (error) {
    console.error(error?.reason ?? 'bad json');
  } else {
    console.log(`number is: ${json?.myNumber}`);
  }
} catch(e) {
  if(e instanceof JsonFetchError) {
    // Special handling for non-2xx responses
    specialHandler(e.res.status, e.json);
  } else {
    throw e;
  }
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `JsonType` | extends `JsonObject` = `JsonObject` |
| `ErrorType` | extends `JsonObject` = `JsonType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `init` | `Omit`<[`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"`` \| ``"swr"``\> & { `rejectIfNonJsonContentType?`: ``false`` ; `rejectIfNotOk`: ``true`` ; `swr?`: ``false``  } |

#### Returns

`Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

#### Defined in

[lib/json-unfetch/index.ts:237](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L237)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<{ `error`: `undefined` ; `json`: `JsonType` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

Fetches a resource and returns an object containing two items: the response
itself under `res` and and the response body parsed as JSON under `json`.

This function rejects if 1) the request body cannot be parsed as JSON but is
being sent with an `application/json` content-type header, 2) the response
body cannot be parsed as JSON but was received with an `application/json`
content-type header, 3) the response was received with a content-type header
other than `application/json`, or 4) the response was received with a non-2xx
status.

Hence, when jsonFetch is called in this way, `json` will always be defined
and `error` will always be undefined.

**`Example`**

```
try {
  const url = 'https://some.resource.com/data.json';
  const { json } = await jsonFetch(url, {
    rejectIfNotOk: true,
    rejectIfNonJsonContentType: true
  });
  doSomethingWith(json);
} catch(e) {
  if(e instanceof JsonFetchError) {
    // Special handling for non-2xx/non-json response bodies
    specialHandler(e.res.status, e.json);
  } else {
    throw e;
  }
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `JsonType` | extends `JsonObject` = `JsonObject` |
| `ErrorType` | extends `JsonObject` = `JsonType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `init` | `Omit`<[`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"`` \| ``"swr"``\> & { `rejectIfNonJsonContentType`: ``true`` ; `rejectIfNotOk`: ``true`` ; `swr?`: ``false``  } |

#### Returns

`Promise`<{ `error`: `undefined` ; `json`: `JsonType` ; `res`: [`Response`](lib_json_unfetch.md#response)  }\>

#### Defined in

[lib/json-unfetch/index.ts:288](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L288)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<`JsonType`\>

Fetches a resource and returns the response body parsed as a JSON object.

This function rejects if 1) the request body cannot be parsed as JSON but is
being sent with an `application/json` content-type header, 2) the response
body cannot be parsed as JSON but was received with an `application/json`
content-type header, 3) the response was received with a content-type header
other than `application/json`, or 4) the response was received with a non-2xx
status.

The object SWR returns will contain the rejection reason under the `error`
property. Usually, `error` is as an instance of JsonUnfetchError complete
with `json` and `res` properties. If unfetch itself fails, the `error`
object returned will not have these properties.

**`Example`**

```
  const { data: json, error } = useSwr('api/endpoint', swrFetch);
  // Or:                  ... = useSwr('api/endpoint', key => jsonFetch(key, { swr: true }));

  if(error) <div>Error: {error.message}</div>;
  return <div>Hello, your data is: {json.data}</div>;
```

**`See`**

https://swr.vercel.app

#### Type parameters

| Name | Type |
| :------ | :------ |
| `JsonType` | extends `JsonObject` = `JsonObject` |
| `ErrorType` | extends `JsonObject` = `JsonType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `init` | `Omit`<[`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit), ``"swr"``\> & { `swr`: ``true``  } |

#### Returns

`Promise`<`JsonType`\>

#### Defined in

[lib/json-unfetch/index.ts:333](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L333)

___

### swrFetch

▸ **swrFetch**<`JsonType`\>(`init?`): (`key`: `string`) => `Promise`<`JsonType`\>

Fetches a resource and returns the response body parsed as a JSON object.

This function rejects if 1) the request body cannot be parsed as JSON but is
being sent with an `application/json` content-type header, 2) the response
body cannot be parsed as JSON but was received with an `application/json`
content-type header, 3) the response was received with a content-type header
other than `application/json`, or 4) the response was received with a non-2xx
status.

The object SWR returns will contain the rejection reason under the `error`
property. Usually, `error` is as an instance of JsonUnfetchError complete
with `json` and `res` properties. If unfetch itself fails, the `error`
object returned will not have these properties.

**`Example`**

```
  const { data: json, error } = useSwr('api/endpoint', swrFetch);

  if(error) <div>Error: {error.message}</div>;
  return <div>Hello, your data is: {json.data}</div>;
```

**`See`**

https://swr.vercel.app

#### Type parameters

| Name | Type |
| :------ | :------ |
| `JsonType` | extends `JsonObject` = `JsonObject` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | [`JsonRequestInit`](lib_json_unfetch.md#jsonrequestinit) |

#### Returns

`fn`

▸ (`key`): `Promise`<`JsonType`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

##### Returns

`Promise`<`JsonType`\>

#### Defined in

[lib/json-unfetch/index.ts:445](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-unfetch/index.ts#L445)
