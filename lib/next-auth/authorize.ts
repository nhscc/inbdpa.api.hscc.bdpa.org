import { isNativeError } from 'node:util/types';
import { InvalidAppConfigurationError, NotAuthorizedError } from 'named-app-errors';

import { debugFactory } from 'multiverse/debug-extended';
import { getTokenByDerivation } from './token';

const debug = debugFactory('next-auth:authenticate');

/**
 * An array of supported well-known authorization (Authorization header)
 * constraints.
 */
export const validAuthorizationConstraints = [
  /**
   * This constraint ensures that only "auth" entries that have the
   * `globalAdmin` field set to `true` are successfully authenticated.
   */
  'isGlobalAdmin'
] as const;

/**
 * A supported authorization constraint.
 */
export type AuthorizationConstraint = (typeof validAuthorizationConstraints)[number];

/**
 * Authorizes a client via their Authorization header using the well-known
 * "auth" MongoDB collection. Does not throw on invalid/missing header string.
 */
export async function authorizeHeader({
  header,
  constraints
}: {
  /**
   * Contents of the HTTP Authorization header.
   */
  header: string | undefined;
  /**
   * Constraints a client must satisfy to be considered authorized.
   */
  constraints?: AuthorizationConstraint | AuthorizationConstraint[];
}): Promise<{ authorized: boolean; error?: string }> {
  try {
    const { attributes } = await getTokenByDerivation({ from: header });

    if (
      typeof constraints !== 'string' &&
      (!Array.isArray(constraints) || !constraints.length)
    ) {
      debug.warn('header authorization was vacuous (no constraints)');
    } else {
      const constraintsArray = [constraints].flat();
      const finalConstraints = Array.from(new Set(constraintsArray));

      if (finalConstraints.length !== constraintsArray.length) {
        throw new InvalidAppConfigurationError(
          'encountered duplicate authorization constraints'
        );
      } else {
        await Promise.all(
          finalConstraints.map(async (constraint) => {
            debug(`evaluating authorization constraint "${constraint}"`);

            const failAuthorization = (constraint: AuthorizationConstraint) => {
              debug.warn(`authorization failed on constraint: ${constraint}`);
              throw new NotAuthorizedError(
                `failed to satisfy authorization constraint "${constraint}"`
              );
            };

            if (constraint === 'isGlobalAdmin') {
              if (!attributes.isGlobalAdmin) {
                failAuthorization('isGlobalAdmin');
              }
            } /*else if(constraint === '...') {
              ...
            }*/ else {
              throw new InvalidAppConfigurationError(
                `encountered unknown or unhandled authorization constraint "${constraint}"`
              );
            }
          })
        );
      }
    }
  } catch (error) {
    debug.error(`authorization failure: ${error}`);

    if (
      isNativeError(error) &&
      !['NotAuthorizedError', 'InvalidSecretError'].includes(error.name)
    ) {
      throw error;
    }

    return { authorized: false };
  }

  return { authorized: true };
}
