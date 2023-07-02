import { ObjectId, type Document, type Collection, type WithId } from 'mongodb';
import { AppValidationError, ErrorMessage, ValidationError } from 'named-app-errors';

/**
 * Represents the value of the `_id` property of a MongoDB collection entry.
 * Optionally, a key other than `_id` can be specified using the `{ key: ...,
 * id: ... }` syntax.
 */
export type ItemExistsIdParam =
  | string
  | ObjectId
  | { key: string; id: string | ObjectId };

/**
 * Available options for the `itemExists` function.
 */
export type ItemExistsOptions = {
  /**
   * Items matching excludeId will be completely ignored by this function.
   *
   * @default undefined
   */
  excludeId?: ItemExistsIdParam;
  /**
   * If `true`, ids will be matched in a case-insensitive manner (via locale).
   *
   * @default false
   */
  caseInsensitive?: boolean;
  /**
   * When looking for an item matching `{ _id: id }`, where the descriptor key
   * is the string `"_id"`, `id` will be optimistically wrapped in a `new
   * ObjectId(id)` call. Set this to `false` to prevent this.
   *
   * @default true
   */
  optimisticCoercion?: boolean;
};

/**
 * Checks if an item matching `{ _id: id }` exists within `collection`.
 */
export async function itemExists<T extends Document>(
  collection: Collection<T>,
  id: string | ObjectId,
  options?: ItemExistsOptions
): Promise<boolean>;
/**
 * Checks if an item matching `{ [descriptor.key]: descriptor.id }` exists
 * within `collection`.
 */
export async function itemExists<T extends Document>(
  collection: Collection<T>,
  descriptor: { key: string; id: string | ObjectId },
  options?: ItemExistsOptions
): Promise<boolean>;
export async function itemExists<T extends Document>(
  collection: Collection<T>,
  id: ItemExistsIdParam,
  options?: ItemExistsOptions
): Promise<boolean> {
  let excludeIdProperty: string | null = null;
  let excludeId: string | ObjectId | null = null;
  const idProperty =
    typeof id === 'string' || id instanceof ObjectId ? '_id' : id.key;
  id = typeof id === 'string' || id instanceof ObjectId ? id : id.id;

  if (options?.excludeId) {
    excludeIdProperty =
      typeof options.excludeId === 'string' || options.excludeId instanceof ObjectId
        ? '_id'
        : options.excludeId.key;

    excludeId =
      typeof options.excludeId === 'string' || options.excludeId instanceof ObjectId
        ? options.excludeId
        : options.excludeId.id;
  }

  if (idProperty === excludeIdProperty) {
    throw new AppValidationError(
      `cannot lookup an item by property "${idProperty}" while also filtering results by that same property`
    );
  }

  if (
    options?.optimisticCoercion !== false &&
    typeof id === 'string' &&
    idProperty === '_id'
  ) {
    id = new ObjectId(id);
  }

  return (
    (await collection.countDocuments(
      {
        [idProperty]: id,
        ...(excludeIdProperty ? { [excludeIdProperty]: { $ne: excludeId } } : {})
      } as unknown as Parameters<typeof collection.countDocuments>[0],
      {
        ...(options?.caseInsensitive
          ? { collation: { locale: 'en', strength: 2 } }
          : {})
      }
    )) !== 0
  );
}

/**
 * The shape of an object that can be translated into an `ObjectId` (or `T`)
 * instance or is `null`/`undefined`.
 */
export type IdItem<T extends ObjectId> =
  | WithId<unknown>
  | string
  | T
  | null
  | undefined;

/**
 * The shape of an array of objects that can be translated into an array of
 * `ObjectId` (or `T`) instances or are `null`/`undefined`.
 */
export type IdItemArray<T extends ObjectId> = IdItem<T>[];

export type ItemToObjectIdOptions = {
  /**
   * If `true`, inputs that cannot be coerced into an {@link ObjectId} will be
   * replaced with `null` instead of throwing a {@link ValidationError}.
   *
   * @default false
   */
  ignoreInvalidId?: boolean;
};

/**
 * Reduces an `item` down to its `ObjectId` instance.
 *
 * When `options.ignoreInvalidId` is `true`, result may be `null`.
 */
export function itemToObjectId<T extends ObjectId>(
  item: IdItem<T>,
  options: Exclude<ItemToObjectIdOptions, 'ignoreInvalidId'> & {
    ignoreInvalidId: true;
  }
): T | null;
/**
 * Reduces an array of `items` down to their respective `ObjectId` instances.
 *
 * An attempt is made to eliminate duplicates via `new Set(...)`, but the
 * absence of duplicates is not guaranteed when `items` contains `WithId<...>`
 * objects.
 *
 * When `options.ignoreInvalidId` is `true`, result may contain `null`s.
 */
export function itemToObjectId<T extends ObjectId>(
  items: IdItemArray<T>,
  options: Exclude<ItemToObjectIdOptions, 'ignoreInvalidId'> & {
    ignoreInvalidId: true;
  }
): (T | null)[];
/**
 * Reduces an `item` down to its `ObjectId` instance.
 */
export function itemToObjectId<T extends ObjectId>(
  item: IdItem<T>,
  options?: ItemToObjectIdOptions
): T;
/**
 * Reduces an array of `items` down to their respective `ObjectId` instances.
 *
 * An attempt is made to eliminate duplicates via `new Set(...)`, but the
 * absence of duplicates is not guaranteed when `items` contains `WithId<...>`
 * objects.
 */
export function itemToObjectId<T extends ObjectId>(
  items: IdItemArray<T>,
  options?: ItemToObjectIdOptions
): T[];
export function itemToObjectId<T extends ObjectId>(
  item: IdItem<T> | IdItemArray<T>,
  options?: ItemToObjectIdOptions
): (T | null) | (T | null)[] {
  let _id: unknown = item;
  try {
    if (item instanceof ObjectId) {
      return item;
    } else if (Array.isArray(item)) {
      const objectIdArray = Array.from(new Set<(typeof item)[0]>(item));
      return objectIdArray.map((id) => {
        _id = id;

        if (id instanceof ObjectId) {
          return id;
        } else if (typeof id !== 'string' && id?._id instanceof ObjectId) {
          return id._id as T;
        } else {
          try {
            return new ObjectId(String(id)) as T;
          } catch (error) {
            if (options?.ignoreInvalidId) {
              return null;
            } else {
              throw error;
            }
          }
        }
      });
    } else if (typeof item !== 'string' && item?._id instanceof ObjectId) {
      return item._id as T;
    } else {
      try {
        return new ObjectId(String(item)) as T;
      } catch (error) {
        if (options?.ignoreInvalidId) {
          return null;
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    const throwable = new ValidationError(
      ErrorMessage.InvalidItem(String(_id), 'ObjectId')
    );
    throwable.cause = error;
    throw throwable;
  }
}

/**
 * Reduces an `item` down to the string representation of its `ObjectId`
 * instance.
 */
export function itemToStringId<T extends ObjectId>(item: IdItem<T>): string;
/**
 * Reduces an array of `items` down to the string representations of their
 * respective `ObjectId` instances.
 */
export function itemToStringId<T extends ObjectId>(items: IdItemArray<T>): string[];
export function itemToStringId<T extends ObjectId>(
  item: IdItem<T> | IdItemArray<T>
): string | string[] {
  return Array.isArray(item)
    ? itemToObjectId<T>(item).map(String)
    : itemToObjectId<T>(item).toString();
}
