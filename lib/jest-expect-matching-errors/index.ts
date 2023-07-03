import { isPromise } from 'node:util/types';
import { TrialError } from 'named-app-errors';

import type { Promisable } from 'type-fest';

// TODO: make this into a package alongside the other helpers like itemExists
// TODO: and some of the jest multiverse libs. Add a descriptor/error msg
// TODO: functionality too!

/**
 * Maps each element of the `spec` array into a Jest expectation asserting that
 * `errorFn` either throws an error or rejects. If an assertion fails, a
 * helpful error message is thrown.
 */
export async function expectExceptionsWithMatchingErrors<
  T extends [params: unknown, errorMessage: string][]
>(spec: T, errorFn: (params: T[number][0]) => Promisable<unknown>) {
  await Promise.all(
    spec.map(async ([params, message], index) => {
      let result = undefined;
      let error = undefined;
      let errored = false;

      try {
        result = errorFn(params);
        if (isPromise(result)) {
          result = await result;
        }
      } catch (error_) {
        errored = true;
        error = error_;
      }

      if (!errored) {
        throw new TrialError(
          `assertion failed: an exception did not occur for spec element at index #${index}: ${JSON.stringify(
            params,
            undefined,
            2
          )}\n\nExpected error message: ${message}`
        );
      }

      return expect({ index, params, error }).toMatchObject({
        index,
        error: { message }
      });
    })
  );
}
