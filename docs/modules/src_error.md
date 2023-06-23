[inbdpa.api.hscc.bdpa.org](../README.md) / src/error

# Module: src/error

## Table of contents

### Classes

- [AppError](../classes/src_error.AppError.md)
- [AppValidationError](../classes/src_error.AppValidationError.md)
- [AuthError](../classes/src_error.AuthError.md)
- [ClientValidationError](../classes/src_error.ClientValidationError.md)
- [DummyError](../classes/src_error.DummyError.md)
- [GuruMeditationError](../classes/src_error.GuruMeditationError.md)
- [HttpError](../classes/src_error.HttpError.md)
- [InvalidAppConfigurationError](../classes/src_error.InvalidAppConfigurationError.md)
- [InvalidAppEnvironmentError](../classes/src_error.InvalidAppEnvironmentError.md)
- [InvalidClientConfigurationError](../classes/src_error.InvalidClientConfigurationError.md)
- [InvalidItemError](../classes/src_error.InvalidItemError.md)
- [InvalidSecretError](../classes/src_error.InvalidSecretError.md)
- [ItemNotFoundError](../classes/src_error.ItemNotFoundError.md)
- [ItemsNotFoundError](../classes/src_error.ItemsNotFoundError.md)
- [NotAuthenticatedError](../classes/src_error.NotAuthenticatedError.md)
- [NotAuthorizedError](../classes/src_error.NotAuthorizedError.md)
- [NotFoundError](../classes/src_error.NotFoundError.md)
- [NotImplementedError](../classes/src_error.NotImplementedError.md)
- [TrialError](../classes/src_error.TrialError.md)
- [ValidationError](../classes/src_error.ValidationError.md)

### Variables

- [ErrorMessage](src_error.md#errormessage)

### Functions

- [makeNamedError](src_error.md#makenamederror)

## Variables

### ErrorMessage

• `Const` **ErrorMessage**: `Object`

A collection of possible error and warning messages.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AppValidationFailure` | () => `string` |
| `AuthFailure` | () => `string` |
| `ClientValidationFailure` | () => `string` |
| `DuplicateFieldValue` | (`property`: `string`) => `string` |
| `EmptyJSONBody` | () => `string` |
| `GuruMeditation` | () => `string` |
| `HttpFailure` | (`error?`: `string`) => `string` |
| `HttpSubFailure` | (`error`: ``null`` \| `string`, `statusCode`: `number`) => `string` |
| `IllegalOperation` | () => `string` |
| `InvalidAppConfiguration` | (`details?`: `string`) => `string` |
| `InvalidAppEnvironment` | (`details?`: `string`) => `string` |
| `InvalidArrayValue` | (`property`: `string`, `value`: `string`, `validValues?`: readonly `string`[]) => `string` |
| `InvalidClientConfiguration` | (`details?`: `string`) => `string` |
| `InvalidFieldValue` | (`property`: `string`, `value?`: ``null`` \| `string`, `validValues?`: readonly `string`[]) => `string` |
| `InvalidItem` | (`item`: `unknown`, `itemName`: `string`) => `string` |
| `InvalidJSON` | () => `string` |
| `InvalidNumberValue` | (`property`: `string`, `min`: `string` \| `number`, `max`: ``null`` \| `string` \| `number`, `type`: ``"number"`` \| ``"integer"``, `nullable`: `boolean`, `isArray`: `boolean`) => `string` |
| `InvalidObjectId` | (`id`: `string`) => `string` |
| `InvalidObjectKeyValue` | (`property`: `string`, `value?`: `string`, `validValues?`: readonly `string`[]) => `string` |
| `InvalidRegexString` | (`property`: `string`) => `string` |
| `InvalidSecret` | (`secretType`: `string`) => `string` |
| `InvalidSpecifierValueType` | (`property`: `string`, `type`: `string`, `sub`: `boolean`) => `string` |
| `InvalidStringLength` | (`property`: `string`, `min`: `string` \| `number`, `max`: ``null`` \| `string` \| `number`, `syntax`: `LiteralUnion`<``"string"`` \| ``"alphanumeric"`` \| ``"hexadecimal"`` \| ``"bytes"``, `string`\>, `nullable`: `boolean`, `isArray`: `boolean`) => `string` |
| `ItemNotFound` | (`item`: `unknown`, `itemName`: `string`) => `string` |
| `ItemOrItemsNotFound` | (`itemsName`: `string`) => `string` |
| `NotAuthenticated` | () => `string` |
| `NotAuthorized` | () => `string` |
| `NotFound` | () => `string` |
| `NotImplemented` | () => `string` |
| `TooMany` | (`resource?`: `string`, `max?`: `string` \| `number`) => `string` |
| `UnknownField` | (`property`: `string`) => `string` |
| `UnknownSpecifier` | (`property`: `string`, `sub`: `boolean`) => `string` |
| `ValidationFailure` | () => `string` |

#### Defined in

[src/error.ts:10](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/src/error.ts#L10)

## Functions

### makeNamedError

▸ **makeNamedError**(`ErrorClass`, `name`): `void`

Defines a special `name` property on an error class that improves DX.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ErrorClass` | (...`args`: `any`[]) => `Error` |
| `name` | `string` |

#### Returns

`void`

#### Defined in

node_modules/named-app-errors/dist/modules/make-named-error.d.ts:4
