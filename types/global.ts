// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LiteralUnion } from 'type-fest';

// TODO: add this to @xunnamius/types

/**
 * An extension of type-fest's {@link LiteralUnion} that functions with
 * `unknown` as `BaseType`.
 *
 * The point of this function is to make intellisense suggestions available for
 * parameters that expect a certain shape but initially accept any (i.e.
 * `unknown`) shape. For example, a function that accepts user input where said
 * function asserts its input parameter is of a specific type, even though the
 * argument passed through that parameter could technically be of any type.
 */
export type LiteralUnknownUnion<LiteralType> =
  | LiteralType
  | (unknown & Record<never, never>)
  | null
  | undefined;
