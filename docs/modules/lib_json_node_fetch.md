[inbdpa.api.hscc.bdpa.org](../README.md) / lib/json-node-fetch

# Module: lib/json-node-fetch

## Table of contents

### Classes

- [JsonFetchError](../classes/lib_json_node_fetch.JsonFetchError.md)

### Type Aliases

- [JsonRequestInit](lib_json_node_fetch.md#jsonrequestinit)

### Variables

- [JsonContentType](lib_json_node_fetch.md#jsoncontenttype)
- [globalJsonRequestOptions](lib_json_node_fetch.md#globaljsonrequestoptions)

### Functions

- [jsonFetch](lib_json_node_fetch.md#jsonfetch)

## Type Aliases

### JsonRequestInit

Ƭ **JsonRequestInit**: `Omit`<`RequestInit`, ``"body"``\> & { `body?`: `BodyInit` \| `JsonObject` \| `JsonPrimitive` ; `rejectIfNonJsonContentType?`: `boolean` ; `rejectIfNotOk?`: `boolean`  }

Options to configure how jsonFetch executes.

**`See`**

https://github.com/node-fetch/node-fetch#options

#### Defined in

[lib/json-node-fetch/index.ts:37](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L37)

## Variables

### JsonContentType

• `Const` **JsonContentType**: ``"application/json"``

#### Defined in

[lib/json-node-fetch/index.ts:14](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L14)

___

### globalJsonRequestOptions

• `Const` **globalJsonRequestOptions**: [`JsonRequestInit`](lib_json_node_fetch.md#jsonrequestinit)

The mutable default options for all `jsonFetch` calls. Keys will be
overridden by the optional `options` object passed into each call, e.g.
`jsonFetch(url, options)`.

Note: you must use `credentials: 'include'` to include cookies with your
requests. This is not the default setting.

**WARN: this setting MUST only be used in "end-developer" source, not in
libraries or anything that is meant to be imported into higher-order code or
you run the risk of terrible conflicts!**

**`See`**

https://github.com/node-fetch/node-fetch#options

#### Defined in

[lib/json-node-fetch/index.ts:79](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L79)

## Functions

### jsonFetch

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init?`): `Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: `Response`  }\>

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
| `init?` | `Omit`<[`JsonRequestInit`](lib_json_node_fetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"``\> & { `rejectIfNonJsonContentType?`: ``false`` ; `rejectIfNotOk?`: ``false``  } |

#### Returns

`Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: `Response`  }\>

#### Defined in

[lib/json-node-fetch/index.ts:121](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L121)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: `Response`  }\>

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
| `init` | `Omit`<[`JsonRequestInit`](lib_json_node_fetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"``\> & { `rejectIfNonJsonContentType`: ``true`` ; `rejectIfNotOk?`: ``false``  } |

#### Returns

`Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: `Response`  }\>

#### Defined in

[lib/json-node-fetch/index.ts:175](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L175)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: `Response`  }\>

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
| `init` | `Omit`<[`JsonRequestInit`](lib_json_node_fetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"``\> & { `rejectIfNonJsonContentType?`: ``false`` ; `rejectIfNotOk`: ``true``  } |

#### Returns

`Promise`<{ `error`: `Partial`<`ErrorType`\> \| `undefined` ; `json`: `JsonType` \| `undefined` ; `res`: `Response`  }\>

#### Defined in

[lib/json-node-fetch/index.ts:226](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L226)

▸ **jsonFetch**<`JsonType`, `ErrorType`\>(`url`, `init`): `Promise`<{ `error`: `undefined` ; `json`: `JsonType` ; `res`: `Response`  }\>

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
| `init` | `Omit`<[`JsonRequestInit`](lib_json_node_fetch.md#jsonrequestinit), ``"rejectIfNotOk"`` \| ``"rejectIfNonJsonContentType"``\> & { `rejectIfNonJsonContentType`: ``true`` ; `rejectIfNotOk`: ``true``  } |

#### Returns

`Promise`<{ `error`: `undefined` ; `json`: `JsonType` ; `res`: `Response`  }\>

#### Defined in

[lib/json-node-fetch/index.ts:273](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/lib/json-node-fetch/index.ts#L273)
