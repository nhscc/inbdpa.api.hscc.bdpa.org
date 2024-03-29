import cloneDeep from 'clone-deep';
import { ObjectId } from 'mongodb';
import { InvalidAppConfigurationError } from 'named-app-errors';

import { mockDateNowMs } from 'multiverse/jest-mock-date';

import {
  BANNED_BEARER_TOKEN,
  DEV_BEARER_TOKEN,
  DUMMY_BEARER_TOKEN
} from 'multiverse/next-auth';

import type { DbSchema } from 'multiverse/mongo-schema';
import type { DummyData } from 'multiverse/mongo-test';
import type { InternalAuthEntry } from 'multiverse/next-auth';
import type { InternalLimitedLogEntry } from 'multiverse/next-limit';
import type { InternalRequestLogEntry } from 'multiverse/next-log';

export * from 'multiverse/jest-mock-date';

/**
 * A JSON representation of the backend Mongo database structure. This is used
 * for common consistent "well-known" db structure across projects.
 *
 * Well-known databases and their well-known collections currently include:
 *   - `root` (collections: `auth`, `request-log`, `limited-log`)
 */
export function getCommonSchemaConfig(additionalSchemaConfig?: DbSchema): DbSchema {
  const schema: DbSchema = {
    databases: {
      root: {
        collections: [
          {
            name: 'auth',
            indices: [
              { spec: 'attributes.owner' },
              { spec: 'deleted' },
              // ! When performing equality matches on embedded documents, field
              // ! order matters and the embedded documents must match exactly.
              // * https://xunn.at/mongo-docs-query-embedded-docs
              // ! Additionally, field order determines internal sort order.
              { spec: ['scheme', 'token'], options: { unique: true } }
            ]
          },
          {
            name: 'request-log',
            indices: [{ spec: 'header' }, { spec: 'ip' }, { spec: 'durationMs' }]
          },
          {
            name: 'limited-log',
            indices: [{ spec: 'header' }, { spec: 'ip' }, { spec: { until: -1 } }]
          }
        ]
      },
      ...additionalSchemaConfig?.databases
    },
    aliases: { ...additionalSchemaConfig?.aliases }
  };

  const actualDatabaseNames = Object.keys(schema.databases);

  Object.entries(schema.aliases).every(([alias, actual]) => {
    if (!actualDatabaseNames.includes(actual)) {
      throw new InvalidAppConfigurationError(
        `aliased database "${actual}" (referred to by alias "${alias}") does not exist in database schema or is not aliasable. Existing aliasable databases: ${actualDatabaseNames.join(
          ', '
        )}`
      );
    }

    if (actualDatabaseNames.includes(alias)) {
      throw new InvalidAppConfigurationError(
        `database alias "${alias}" (referring to actual database "${actual}") is invalid: an actual database with that name already exists in the database schema. You must choose a different alias`
      );
    }
  });

  return schema;
}

/**
 * Returns data used to hydrate well-known databases and their well-known
 * collections.
 *
 * Well-known databases and their well-known collections currently include:
 *   - `root` (collections: `auth`, `request-log`, `limited-log`)
 */
export function getCommonDummyData(additionalDummyData?: DummyData): DummyData {
  return cloneDeep({ root: dummyRootData, ...additionalDummyData });
}

/**
 * Calls `new ObjectId(...)` explicitly passing {@link mockDateNowMs} as the
 * inception time, which is the same thing that {@link ObjectId} does internally
 * with the real `Date.now`.
 *
 * **This should only be used in modules with import side-effects that execute
 * before `useMockDateNow` is called** later in downstream code. If you are
 * unsure, you probably don't need to use this function and should just call
 * `new ObjectId()` instead.
 *
 * The point of this function is to avoid race conditions when mocking parts of
 * the {@link Date} object that _sometimes_ resulted in _later_ calls to
 * {@link ObjectId} generating IDs that were _less_ than the IDs generated
 * _before_ it.
 */
export function generateMockSensitiveObjectId() {
  // * Adopted from ObjectId::generate function. Turns out this is the cause of
  // * some flakiness with tests where order is determined by ObjectId.
  return new ObjectId(Math.floor(mockDateNowMs / 1000));
}

/**
 * The shape of the well-known `root` database's collections and their test
 * data.
 */
export type DummyRootData = {
  _generatedAt: number;
  auth: InternalAuthEntry[];
  'request-log': InternalRequestLogEntry[];
  'limited-log': InternalLimitedLogEntry[];
};

/**
 * Test data for the well-known `root` database.
 */
export const dummyRootData: DummyRootData = {
  _generatedAt: mockDateNowMs,
  auth: [
    // ! Must maintain order or various unit tests across projects will fail !
    {
      _id: generateMockSensitiveObjectId(),
      deleted: false,
      attributes: { owner: 'local developer', isGlobalAdmin: true },
      scheme: 'bearer',
      token: { bearer: DEV_BEARER_TOKEN }
    },
    {
      _id: generateMockSensitiveObjectId(),
      deleted: false,
      attributes: { owner: 'dummy owner' },
      scheme: 'bearer',
      token: { bearer: DUMMY_BEARER_TOKEN }
    },
    {
      _id: generateMockSensitiveObjectId(),
      deleted: false,
      attributes: { owner: 'banned dummy owner' },
      scheme: 'bearer',
      token: { bearer: BANNED_BEARER_TOKEN }
    }
  ],
  'request-log': Array.from({ length: 22 }).map((_, ndx) => ({
    _id: generateMockSensitiveObjectId(),
    ip: '1.2.3.4',
    header: ndx % 2 ? null : `bearer ${BANNED_BEARER_TOKEN}`,
    method: ndx % 3 ? 'GET' : 'POST',
    route: 'fake/route',
    endpoint: '/fake/:route',
    createdAt: mockDateNowMs + 10 ** 6,
    resStatusCode: 200,
    durationMs: 1234
  })),
  'limited-log': [
    // ! Must maintain order or various unit tests will fail
    {
      _id: generateMockSensitiveObjectId(),
      ip: '1.2.3.4',
      until: mockDateNowMs + 1000 * 60 * 15
    },
    {
      _id: generateMockSensitiveObjectId(),
      ip: '5.6.7.8',
      until: mockDateNowMs + 1000 * 60 * 15
    },
    {
      _id: generateMockSensitiveObjectId(),
      header: `bearer ${BANNED_BEARER_TOKEN}`,
      until: mockDateNowMs + 1000 * 60 * 60
    }
  ]
};
