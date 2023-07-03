/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import assert from 'node:assert';
import { ObjectId } from 'mongodb';

import * as Backend from 'universe/backend';
import { getEnv } from 'universe/backend/env';
import { ErrorMessage, TrialError } from 'universe/error';

import {
  type InternalUser,
  type InternalSession,
  type InternalOpportunity,
  type InternalArticle,
  type NewUser,
  type NewSession,
  type NewOpportunity,
  type NewArticle,
  type PublicUser,
  type PublicOpportunity,
  type PublicInfo,
  type PublicArticle,
  type PatchUser,
  type PatchOpportunity,
  type PatchArticle,
  type UserId,
  toPublicUser,
  toPublicSession,
  toPublicOpportunity,
  toPublicInfo,
  toPublicArticle,
  userTypes,
  makeSessionQueryTtlFilter,
  getUsersDb,
  getSessionsDb,
  getOpportunitiesDb,
  getArticlesDb,
  getInfoDb
} from 'universe/backend/db';

import { mockDateNowMs, useMockDateNow } from 'multiverse/mongo-common';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';
import { type IdItem, itemToObjectId, itemToStringId } from 'multiverse/mongo-item';
import { expectExceptionsWithMatchingErrors } from 'multiverse/jest-expect-matching-errors';

import { mockEnvFactory } from 'testverse/setup';

import {
  dummyAppData,
  updatedAtHighValue,
  updatedAtLowValue,
  updatedAtMidValue
} from 'testverse/db';
import { toss } from 'toss-expression';
import { isPlainObject } from 'multiverse/is-plain-object';

setupMemoryServerOverride();
useMockDateNow();

const withMockedEnv = mockEnvFactory({ NODE_ENV: 'test' });
const dummyActiveSessions = dummyAppData.sessions.filter((session) => {
  return (
    session.lastRenewedDate.getTime() >
    makeSessionQueryTtlFilter(mockDateNowMs).lastRenewedDate.$gt.getTime()
  );
});

// * If this assertion is true, then all session-returning functions in the
// * tests below are ignoring inactive sessions properly! Yay!
assert(dummyActiveSessions.length < dummyAppData.sessions.length);

const getActiveSessionCount = <T extends ObjectId>(idItem: IdItem<T>) => {
  return dummyActiveSessions.filter(({ viewed_id }) =>
    viewed_id?.equals(itemToObjectId(idItem))
  ).length;
};

describe('::getAllUsers', () => {
  it('returns all users in FIFO order', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.users.map((internalUser) =>
        toPublicUser(internalUser, {
          activeSessionCount: undefined,
          withFullName: false
        })
      )
    );
  });

  it('returns accurate active session count', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 2,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toContainEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.users[0]),
        withFullName: true
      })
    );

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'profile',
      viewed_id: dummyAppData.users[0]._id
    });

    await expect(
      Backend.getAllUsers({
        apiVersion: 2,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toContainEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.users[0]) + 1,
        withFullName: true
      })
    );
  });

  it('does not crash when database is empty', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.not.toStrictEqual([]);

    await (await getUsersDb()).deleteMany({});

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual([]);
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const expectedResults = dummyAppData.users.map((user) => [
          toPublicUser(user, {
            activeSessionCount: undefined,
            withFullName: false
          })
        ]);

        assert(expectedResults.length === 3);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: undefined,
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[0]);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: itemToStringId(dummyAppData.users[0]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[1]);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: itemToStringId(dummyAppData.users[1]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[2]);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: itemToStringId(dummyAppData.users[2]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('supports updateAfter', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtLowValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyAppData.users.map((user) =>
        toPublicUser(user, { activeSessionCount: undefined, withFullName: false })
      )
    );

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtMidValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyAppData.users
        .filter((user) => user.updatedAt > updatedAtMidValue)
        .map((user) =>
          toPublicUser(user, { activeSessionCount: undefined, withFullName: false })
        )
    );

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([]);

    const internalUser: InternalUser = {
      ...dummyAppData.users[0],
      _id: new ObjectId(),
      username: 'fake',
      email: 'fake',
      updatedAt: updatedAtHighValue + 1
    };

    await (await getUsersDb()).insertOne(internalUser);

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([
      toPublicUser(internalUser, {
        activeSessionCount: undefined,
        withFullName: false
      })
    ]);
  });

  it('supports updateAfter + pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const targetUsers = dummyAppData.users
          .filter((user) => user.updatedAt > updatedAtMidValue)
          .map((user) =>
            toPublicUser(user, { activeSessionCount: undefined, withFullName: false })
          );

        const internalUser: InternalUser = {
          ...dummyAppData.users[0],
          _id: new ObjectId(),
          username: 'fake',
          email: 'fake',
          updatedAt: updatedAtHighValue + 1
        };

        assert(targetUsers.length === 2);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: undefined,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([targetUsers[0]]);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: targetUsers[0].user_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([targetUsers[1]]);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: targetUsers[1].user_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);

        await (await getUsersDb()).insertOne(internalUser);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: targetUsers[1].user_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([
          toPublicUser(internalUser, {
            activeSessionCount: undefined,
            withFullName: false
          })
        ]);

        await expect(
          Backend.getAllUsers({
            apiVersion: 1,
            after_id: itemToStringId(internalUser),
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('adds session and fullName properties to output if and only if apiVersion === 2', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.users.map((internalUser) =>
        toPublicUser(internalUser, {
          activeSessionCount: undefined,
          withFullName: false
        })
      )
    );

    await expect(
      Backend.getAllUsers({
        apiVersion: 2,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.users.map((internalUser) =>
        toPublicUser(internalUser, {
          activeSessionCount: getActiveSessionCount(internalUser),
          withFullName: true
        })
      )
    );
  });

  it('rejects if after_id is invalid (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: 'fake-oid',
        updatedAfter: undefined
      })
    ).rejects.toMatchObject({ message: ErrorMessage.InvalidObjectId('fake-oid') });
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(
      Backend.getAllUsers({ apiVersion: 1, after_id, updatedAfter: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'after_id')
    });
  });

  it('rejects if updatedAfter is not a number (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({ apiVersion: 1, after_id: undefined, updatedAfter: 'NaN' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('NaN', 'updatedAfter')
    });
  });

  it('rejects if updatedAfter is not a safe integer (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: (Number.MAX_SAFE_INTEGER + 1).toString()
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem(
        (Number.MAX_SAFE_INTEGER + 1).toString(),
        'updatedAfter'
      )
    });
  });
});

describe('::getAllSessions', () => {
  it('returns all active sessions in FIFO order', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyActiveSessions.map((internalSession) => toPublicSession(internalSession))
    );
  });

  it('does not crash when database is empty', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.not.toStrictEqual([]);

    await (await getSessionsDb()).deleteMany({});

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual([]);
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        assert(dummyActiveSessions.length === 2);

        await expect(
          Backend.getAllSessions({
            after_id: undefined,
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual([toPublicSession(dummyActiveSessions[0])]);

        await expect(
          Backend.getAllSessions({
            after_id: itemToStringId(dummyActiveSessions[0]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual([toPublicSession(dummyActiveSessions[1])]);

        await expect(
          Backend.getAllSessions({
            after_id: itemToStringId(dummyActiveSessions[1]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('supports updateAfter', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: updatedAtLowValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyActiveSessions.map((session) => toPublicSession(session))
    );

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: updatedAtMidValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyActiveSessions
        .filter((session) => session.updatedAt > updatedAtMidValue)
        .map((session) => toPublicSession(session))
    );

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([]);

    const internalSession: InternalSession = {
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      updatedAt: updatedAtHighValue + 1
    };

    await (await getSessionsDb()).insertOne(internalSession);

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([toPublicSession(internalSession)]);
  });

  it('supports updateAfter + pagination', async () => {
    expect.hasAssertions();

    const targetSessions = dummyActiveSessions.filter(
      (session) => session.updatedAt > updatedAtMidValue
    );

    const internalSession: InternalSession = {
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      updatedAt: updatedAtHighValue + 1
    };

    await withMockedEnv(
      async () => {
        assert(targetSessions.length === 1);

        await expect(
          Backend.getAllSessions({
            after_id: undefined,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([toPublicSession(targetSessions[0])]);

        await expect(
          Backend.getAllSessions({
            after_id: itemToStringId(targetSessions[0]),
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);

        await (await getSessionsDb()).insertOne(internalSession);

        await expect(
          Backend.getAllSessions({
            after_id: itemToStringId(targetSessions[0]),
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([toPublicSession(internalSession)]);

        await expect(
          Backend.getAllSessions({
            after_id: itemToStringId(internalSession),
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('rejects if after_id is invalid (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllSessions({
        after_id: 'fake-oid',
        updatedAfter: undefined
      })
    ).rejects.toMatchObject({ message: ErrorMessage.InvalidObjectId('fake-oid') });
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(
      Backend.getAllSessions({ after_id, updatedAfter: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'after_id')
    });
  });

  it('rejects if updatedAfter is not a number (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: 'NaN'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('NaN', 'updatedAfter')
    });
  });

  it('rejects if updatedAfter is not a safe integer (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllSessions({
        after_id: undefined,
        updatedAfter: (Number.MAX_SAFE_INTEGER + 1).toString()
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem(
        (Number.MAX_SAFE_INTEGER + 1).toString(),
        'updatedAfter'
      )
    });
  });
});

describe('::getAllOpportunities', () => {
  it('returns all opportunities in FIFO order', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.opportunities.map((internalOpportunity) =>
        toPublicOpportunity(internalOpportunity, { activeSessionCount: undefined })
      )
    );
  });

  it('returns accurate active session count', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 2,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toContainEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.opportunities[0])
      })
    );

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'opportunity',
      viewed_id: dummyAppData.opportunities[0]._id
    });

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 2,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toContainEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.opportunities[0]) + 1
      })
    );
  });

  it('does not crash when database is empty', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.not.toStrictEqual([]);

    await (await getOpportunitiesDb()).deleteMany({});

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual([]);
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const expectedResults = dummyAppData.opportunities.map((opportunity) => [
          toPublicOpportunity(opportunity, { activeSessionCount: undefined })
        ]);

        assert(expectedResults.length === 3);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: undefined,
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[0]);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: itemToStringId(dummyAppData.opportunities[0]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[1]);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: itemToStringId(dummyAppData.opportunities[1]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[2]);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: itemToStringId(dummyAppData.opportunities[2]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('supports updateAfter', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtLowValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyAppData.opportunities.map((opportunity) =>
        toPublicOpportunity(opportunity, { activeSessionCount: undefined })
      )
    );

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtMidValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyAppData.opportunities
        .filter((opportunity) => opportunity.updatedAt > updatedAtMidValue)
        .map((opportunity) =>
          toPublicOpportunity(opportunity, { activeSessionCount: undefined })
        )
    );

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([]);

    const internalOpportunity: InternalOpportunity = {
      ...dummyAppData.opportunities[0],
      _id: new ObjectId(),
      updatedAt: updatedAtHighValue + 1
    };

    await (await getOpportunitiesDb()).insertOne(internalOpportunity);

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([
      toPublicOpportunity(internalOpportunity, { activeSessionCount: undefined })
    ]);
  });

  it('supports updateAfter + pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const targetOpportunities = dummyAppData.opportunities
          .filter((opportunity) => opportunity.updatedAt > updatedAtMidValue)
          .map((opportunity) =>
            toPublicOpportunity(opportunity, { activeSessionCount: undefined })
          );

        const internalOpportunity: InternalOpportunity = {
          ...dummyAppData.opportunities[0],
          _id: new ObjectId(),
          updatedAt: updatedAtHighValue + 1
        };

        assert(targetOpportunities.length === 2);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: undefined,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([targetOpportunities[0]]);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: targetOpportunities[0].opportunity_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([targetOpportunities[1]]);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: targetOpportunities[1].opportunity_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);

        await (await getOpportunitiesDb()).insertOne(internalOpportunity);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: targetOpportunities[1].opportunity_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([
          toPublicOpportunity(internalOpportunity, {
            activeSessionCount: undefined
          })
        ]);

        await expect(
          Backend.getAllOpportunities({
            apiVersion: 1,
            after_id: itemToStringId(internalOpportunity),
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('adds session property to output if and only if apiVersion === 2', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.opportunities.map((internalOpportunity) =>
        toPublicOpportunity(internalOpportunity, {
          activeSessionCount: undefined
        })
      )
    );

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 2,
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.opportunities.map((internalOpportunity) =>
        toPublicOpportunity(internalOpportunity, {
          activeSessionCount: getActiveSessionCount(internalOpportunity)
        })
      )
    );
  });

  it('rejects if after_id is invalid (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: 'fake-oid',
        updatedAfter: undefined
      })
    ).rejects.toMatchObject({ message: ErrorMessage.InvalidObjectId('fake-oid') });
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id,
        updatedAfter: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'after_id')
    });
  });

  it('rejects if updatedAfter is not a number (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: 'NaN'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('NaN', 'updatedAfter')
    });
  });

  it('rejects if updatedAfter is not a safe integer (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllOpportunities({
        apiVersion: 1,
        after_id: undefined,
        updatedAfter: (Number.MAX_SAFE_INTEGER + 1).toString()
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem(
        (Number.MAX_SAFE_INTEGER + 1).toString(),
        'updatedAfter'
      )
    });
  });
});

describe('::getAllArticles', () => {
  it('returns all articles in FIFO order', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual(
      dummyAppData.articles.map((internalArticle) =>
        toPublicArticle(internalArticle, {
          activeSessionCount: getActiveSessionCount(internalArticle)
        })
      )
    );
  });

  it('returns accurate active session count', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({ after_id: undefined, updatedAfter: undefined })
    ).resolves.toContainEqual(
      toPublicArticle(dummyAppData.articles[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.articles[0])
      })
    );

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'article',
      viewed_id: dummyAppData.articles[0]._id
    });

    await expect(
      Backend.getAllArticles({ after_id: undefined, updatedAfter: undefined })
    ).resolves.toContainEqual(
      toPublicArticle(dummyAppData.articles[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.articles[0]) + 1
      })
    );
  });

  it('does not crash when database is empty', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.not.toStrictEqual([]);

    await (await getArticlesDb()).deleteMany({});

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: undefined
      })
    ).resolves.toStrictEqual([]);
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const expectedResults = dummyAppData.articles.map((article) => [
          toPublicArticle(article, {
            activeSessionCount: getActiveSessionCount(article)
          })
        ]);

        assert(expectedResults.length === 3);

        await expect(
          Backend.getAllArticles({
            after_id: undefined,
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[0]);

        await expect(
          Backend.getAllArticles({
            after_id: itemToStringId(dummyAppData.articles[0]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[1]);

        await expect(
          Backend.getAllArticles({
            after_id: itemToStringId(dummyAppData.articles[1]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual(expectedResults[2]);

        await expect(
          Backend.getAllArticles({
            after_id: itemToStringId(dummyAppData.articles[2]),
            updatedAfter: undefined
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('supports updateAfter', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: updatedAtLowValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyAppData.articles.map((article) =>
        toPublicArticle(article, {
          activeSessionCount: getActiveSessionCount(article)
        })
      )
    );

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: updatedAtMidValue.toString()
      })
    ).resolves.toStrictEqual(
      dummyAppData.articles
        .filter((article) => article.updatedAt > updatedAtMidValue)
        .map((article) =>
          toPublicArticle(article, {
            activeSessionCount: getActiveSessionCount(article)
          })
        )
    );

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([]);

    const internalArticle: InternalArticle = {
      ...dummyAppData.articles[0],
      _id: new ObjectId(),
      updatedAt: updatedAtHighValue + 1
    };

    await (await getArticlesDb()).insertOne(internalArticle);

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: updatedAtHighValue.toString()
      })
    ).resolves.toStrictEqual([
      toPublicArticle(internalArticle, {
        activeSessionCount: getActiveSessionCount(internalArticle)
      })
    ]);
  });

  it('supports updateAfter + pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const targetArticles = dummyAppData.articles
          .filter((article) => article.updatedAt > updatedAtMidValue)
          .map((article) =>
            toPublicArticle(article, {
              activeSessionCount: getActiveSessionCount(article)
            })
          );

        const internalArticle: InternalArticle = {
          ...dummyAppData.articles[0],
          _id: new ObjectId(),
          updatedAt: updatedAtHighValue + 1
        };

        assert(targetArticles.length === 2);

        await expect(
          Backend.getAllArticles({
            after_id: undefined,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([targetArticles[0]]);

        await expect(
          Backend.getAllArticles({
            after_id: targetArticles[0].article_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([targetArticles[1]]);

        await expect(
          Backend.getAllArticles({
            after_id: targetArticles[1].article_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);

        await (await getArticlesDb()).insertOne(internalArticle);

        await expect(
          Backend.getAllArticles({
            after_id: targetArticles[1].article_id,
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([
          toPublicArticle(internalArticle, {
            activeSessionCount: getActiveSessionCount(internalArticle)
          })
        ]);

        await expect(
          Backend.getAllArticles({
            after_id: itemToStringId(internalArticle),
            updatedAfter: updatedAtMidValue.toString()
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('rejects if after_id is invalid (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({
        after_id: 'fake-oid',
        updatedAfter: undefined
      })
    ).rejects.toMatchObject({ message: ErrorMessage.InvalidObjectId('fake-oid') });
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(
      Backend.getAllArticles({
        after_id,
        updatedAfter: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'after_id')
    });
  });

  it('rejects if updatedAfter is not a number (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: 'NaN'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('NaN', 'updatedAfter')
    });
  });

  it('rejects if updatedAfter is not a safe integer (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllArticles({
        after_id: undefined,
        updatedAfter: (Number.MAX_SAFE_INTEGER + 1).toString()
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem(
        (Number.MAX_SAFE_INTEGER + 1).toString(),
        'updatedAfter'
      )
    });
  });
});

describe('::getUser', () => {
  it('returns user by username or user_id', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getUser({ apiVersion: 1, usernameOrId: dummyAppData.users[0].username })
    ).resolves.toStrictEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: undefined,
        withFullName: false
      })
    );

    await expect(
      Backend.getUser({
        apiVersion: 1,
        usernameOrId: itemToStringId(dummyAppData.users[0])
      })
    ).resolves.toStrictEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: undefined,
        withFullName: false
      })
    );
  });

  it('returned user has session property if and only if apiVersion === 2', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getUser({ apiVersion: 1, usernameOrId: dummyAppData.users[0].username })
    ).resolves.toStrictEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: undefined,
        withFullName: false
      })
    );

    await expect(
      Backend.getUser({
        apiVersion: 2,
        usernameOrId: itemToStringId(dummyAppData.users[0])
      })
    ).resolves.toStrictEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.users[0]),
        withFullName: true
      })
    );
  });

  it('returns accurate active session count', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getUser({
        apiVersion: 2,
        usernameOrId: itemToStringId(dummyAppData.users[0])
      })
    ).resolves.toStrictEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.users[0]),
        withFullName: true
      })
    );

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'profile',
      viewed_id: dummyAppData.users[0]._id
    });

    await expect(
      Backend.getUser({
        apiVersion: 2,
        usernameOrId: itemToStringId(dummyAppData.users[0])
      })
    ).resolves.toStrictEqual(
      toPublicUser(dummyAppData.users[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.users[0]) + 1,
        withFullName: true
      })
    );
  });

  it('rejects if username/user_id undefined or not found', async () => {
    expect.hasAssertions();
    const usernameOrId = 'does-not-exist';

    await expect(
      Backend.getUser({ apiVersion: 1, usernameOrId: usernameOrId })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(usernameOrId, 'user')
    });

    await expect(
      Backend.getUser({ apiVersion: 1, usernameOrId: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('usernameOrId', 'parameter')
    });
  });
});

describe('::getSession', () => {
  it('returns active session by session_id', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getSession({
        session_id: itemToStringId(dummyAppData.sessions[0])
      })
    ).resolves.toStrictEqual(toPublicSession(dummyAppData.sessions[0]));
  });

  it('rejects if session exists but is inactive', async () => {
    expect.hasAssertions();

    const session_id = await (
      await getSessionsDb()
    )
      .insertOne({
        ...dummyActiveSessions[0],
        _id: new ObjectId(),
        lastRenewedDate: new Date(Date.now() - 10 ** 6)
      })
      .then(({ insertedId }) => itemToStringId(insertedId));

    await expect(Backend.getSession({ session_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(session_id, 'session')
    });
  });

  it('rejects if session_id undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(Backend.getSession({ session_id: 'bad-id' })).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad-id')
    });

    const session_id = new ObjectId().toString();

    await expect(Backend.getSession({ session_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(session_id, 'session')
    });

    await expect(Backend.getSession({ session_id: undefined })).rejects.toMatchObject(
      {
        message: ErrorMessage.InvalidItem('session_id', 'parameter')
      }
    );
  });
});

describe('::getOpportunity', () => {
  it('returns opportunity by opportunity_id', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getOpportunity({
        apiVersion: 1,
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toStrictEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: undefined
      })
    );
  });

  it('returned opportunity has session property if and only if apiVersion === 2', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getOpportunity({
        apiVersion: 1,
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toStrictEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: undefined
      })
    );

    await expect(
      Backend.getOpportunity({
        apiVersion: 2,
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toStrictEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.opportunities[0])
      })
    );
  });

  it('returns accurate active session count', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getOpportunity({
        apiVersion: 2,
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toStrictEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.opportunities[0])
      })
    );

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'opportunity',
      viewed_id: dummyAppData.opportunities[0]._id
    });

    await expect(
      Backend.getOpportunity({
        apiVersion: 2,
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toStrictEqual(
      toPublicOpportunity(dummyAppData.opportunities[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.opportunities[0]) + 1
      })
    );
  });

  it('rejects if opportunity_id undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getOpportunity({ apiVersion: 1, opportunity_id: 'bad-id' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad-id')
    });

    const opportunity_id = new ObjectId().toString();

    await expect(
      Backend.getOpportunity({ apiVersion: 1, opportunity_id })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(opportunity_id, 'opportunity')
    });

    await expect(
      Backend.getOpportunity({ apiVersion: 1, opportunity_id: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('opportunity_id', 'parameter')
    });
  });
});

describe('::getInfo', () => {
  it('returns system information wrt apiVersion and only counting active sessions', async () => {
    expect.hasAssertions();

    const info = dummyAppData.info[0];

    await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual(
      toPublicInfo(info, {
        activeSessionCount: dummyActiveSessions.length,
        allowArticles: false
      })
    );

    await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual(
      toPublicInfo(info, {
        activeSessionCount: dummyActiveSessions.length,
        allowArticles: true
      })
    );
  });

  it('rejects if system info is missing', async () => {
    expect.hasAssertions();

    await (await getInfoDb()).deleteMany();
    await expect(Backend.getInfo({ apiVersion: 2 })).rejects.toMatchObject({
      message: expect.stringContaining('system info is missing')
    });
  });
});

describe('::getArticle', () => {
  it('returns article by article_id', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getArticle({
        article_id: itemToStringId(dummyAppData.articles[0])
      })
    ).resolves.toStrictEqual(
      toPublicArticle(dummyAppData.articles[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.articles[0])
      })
    );
  });

  it('returns accurate active session count', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getArticle({
        article_id: itemToStringId(dummyAppData.articles[0])
      })
    ).resolves.toStrictEqual(
      toPublicArticle(dummyAppData.articles[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.articles[0])
      })
    );

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'article',
      viewed_id: dummyAppData.articles[0]._id
    });

    await expect(
      Backend.getArticle({
        article_id: itemToStringId(dummyAppData.articles[0])
      })
    ).resolves.toStrictEqual(
      toPublicArticle(dummyAppData.articles[0], {
        activeSessionCount: getActiveSessionCount(dummyAppData.articles[0]) + 1
      })
    );
  });

  it('rejects if article_id undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(Backend.getArticle({ article_id: 'bad-id' })).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad-id')
    });

    const article_id = new ObjectId().toString();

    await expect(Backend.getArticle({ article_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(article_id, 'article')
    });

    await expect(Backend.getArticle({ article_id: undefined })).rejects.toMatchObject(
      {
        message: ErrorMessage.InvalidItem('article_id', 'parameter')
      }
    );
  });
});

describe('::getSessionsFor', () => {
  it('returns the active sessions associated with users', async () => {
    expect.hasAssertions();

    const userId = itemToObjectId(dummyAppData.users[0]);
    const user_id = itemToStringId(userId);

    const userSessions = dummyActiveSessions
      .filter((session) => session._id.equals(userId))
      .map((session) => toPublicSession(session));

    await expect(
      Backend.getSessionsFor('profile', {
        viewed_id: user_id,
        after_id: undefined
      })
    ).resolves.toStrictEqual(userSessions);

    const internalSession: InternalSession = {
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'profile',
      viewed_id: dummyAppData.users[0]._id
    };

    await (await getSessionsDb()).insertOne(internalSession);

    await expect(
      Backend.getSessionsFor('profile', {
        viewed_id: itemToStringId(dummyAppData.users[0]),
        after_id: undefined
      })
    ).resolves.toStrictEqual([...userSessions, toPublicSession(internalSession)]);
  });

  it('returns the active sessions associated with opportunities', async () => {
    expect.hasAssertions();

    const opportunityId = itemToObjectId(dummyAppData.opportunities[0]);
    const opportunity_id = itemToStringId(opportunityId);

    const opportunitySessions = dummyActiveSessions
      .filter((session) => session._id.equals(opportunityId))
      .map((session) => toPublicSession(session));

    await expect(
      Backend.getSessionsFor('opportunity', {
        viewed_id: opportunity_id,
        after_id: undefined
      })
    ).resolves.toStrictEqual(opportunitySessions);

    const internalSession: InternalSession = {
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'opportunity',
      viewed_id: dummyAppData.opportunities[0]._id
    };

    await (await getSessionsDb()).insertOne(internalSession);

    await expect(
      Backend.getSessionsFor('opportunity', {
        viewed_id: itemToStringId(dummyAppData.opportunities[0]),
        after_id: undefined
      })
    ).resolves.toStrictEqual([
      ...opportunitySessions,
      toPublicSession(internalSession)
    ]);
  });

  it('returns the active sessions associated with articles', async () => {
    expect.hasAssertions();

    const articleId = itemToObjectId(dummyAppData.articles[0]);
    const article_id = itemToStringId(articleId);

    const articleSessions = dummyActiveSessions
      .filter((session) => session._id.equals(articleId))
      .map((session) => toPublicSession(session));

    await expect(
      Backend.getSessionsFor('article', {
        viewed_id: article_id,
        after_id: undefined
      })
    ).resolves.toStrictEqual(articleSessions);

    const internalSession: InternalSession = {
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'article',
      viewed_id: dummyAppData.articles[0]._id
    };

    await (await getSessionsDb()).insertOne(internalSession);

    await expect(
      Backend.getSessionsFor('article', {
        viewed_id: itemToStringId(dummyAppData.articles[0]),
        after_id: undefined
      })
    ).resolves.toStrictEqual([...articleSessions, toPublicSession(internalSession)]);
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        const userId = itemToObjectId(dummyAppData.users[0]);
        const user_id = itemToStringId(dummyAppData.users[0]);

        const newInternalSessions: InternalSession[] = Array.from({ length: 3 }).map(
          () => {
            return {
              ...dummyActiveSessions[0],
              _id: new ObjectId(),
              viewed_id: userId
            };
          }
        );

        await (await getSessionsDb()).insertMany(newInternalSessions);

        const expectedResults = newInternalSessions.map((session) => [
          toPublicSession(session)
        ]);

        await expect(
          Backend.getSessionsFor('profile', {
            after_id: undefined,
            viewed_id: user_id
          })
        ).resolves.toStrictEqual(expectedResults[0]);

        await expect(
          Backend.getSessionsFor('profile', {
            after_id: itemToStringId(newInternalSessions[0]),
            viewed_id: user_id
          })
        ).resolves.toStrictEqual(expectedResults[1]);

        await expect(
          Backend.getSessionsFor('profile', {
            after_id: itemToStringId(newInternalSessions[1]),
            viewed_id: user_id
          })
        ).resolves.toStrictEqual(expectedResults[2]);

        await expect(
          Backend.getSessionsFor('profile', {
            after_id: itemToStringId(newInternalSessions[2]),
            viewed_id: user_id
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('rejects if viewed_id undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getSessionsFor('opportunity', {
        viewed_id: 'bad-id',
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad-id')
    });

    await expect(
      Backend.getSessionsFor('opportunity', {
        viewed_id: undefined,
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('opportunity_id', 'parameter')
    });

    await expect(
      Backend.getSessionsFor('profile', {
        viewed_id: undefined,
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    const viewed_id = itemToStringId(new ObjectId());

    await expect(
      Backend.getSessionsFor('opportunity', {
        viewed_id,
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(viewed_id, 'opportunity')
    });

    await expect(
      Backend.getSessionsFor('profile', {
        viewed_id,
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(viewed_id, 'user')
    });
  });

  it('rejects if after_id is invalid (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getSessionsFor('article', {
        after_id: 'fake-oid',
        viewed_id: itemToStringId(new ObjectId())
      })
    ).rejects.toMatchObject({ message: ErrorMessage.InvalidObjectId('fake-oid') });
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(
      Backend.getSessionsFor('profile', {
        after_id,
        viewed_id: after_id
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'after_id')
    });
  });
});

describe('::getSessionsCountFor', () => {
  it('returns the number of active sessions associated with opportunities', async () => {
    expect.hasAssertions();

    const opportunitySessionsCount = getActiveSessionCount(
      dummyAppData.opportunities[0]
    );

    await expect(
      Backend.getSessionsCountFor('opportunity', {
        viewed_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toBe(opportunitySessionsCount);

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'opportunity',
      viewed_id: dummyAppData.opportunities[0]._id
    });

    await expect(
      Backend.getSessionsCountFor('opportunity', {
        viewed_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toBe(opportunitySessionsCount + 1);
  });

  it('returns the number of active sessions associated with users (profiles)', async () => {
    expect.hasAssertions();

    const userSessionsCount = getActiveSessionCount(dummyAppData.users[0]);

    await expect(
      Backend.getSessionsCountFor('profile', {
        viewed_id: itemToStringId(dummyAppData.users[0])
      })
    ).resolves.toBe(userSessionsCount);

    await (
      await getSessionsDb()
    ).insertOne({
      ...dummyActiveSessions[0],
      _id: new ObjectId(),
      view: 'profile',
      viewed_id: dummyAppData.users[0]._id
    });

    await expect(
      Backend.getSessionsCountFor('profile', {
        viewed_id: itemToStringId(dummyAppData.users[0])
      })
    ).resolves.toBe(userSessionsCount + 1);
  });

  it('rejects if viewed_id undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getSessionsCountFor('profile', { viewed_id: 'bad-id' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad-id')
    });

    await expect(
      Backend.getSessionsCountFor('opportunity', { viewed_id: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('opportunity_id', 'parameter')
    });

    await expect(
      Backend.getSessionsCountFor('profile', { viewed_id: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    const viewed_id = itemToStringId(new ObjectId());

    await expect(
      Backend.getSessionsCountFor('profile', { viewed_id })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(viewed_id, 'user')
    });

    await expect(
      Backend.getSessionsCountFor('opportunity', { viewed_id })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(viewed_id, 'opportunity')
    });
  });
});

describe('::getUserConnections', () => {
  it("returns a user's connections", async () => {
    expect.hasAssertions();

    assert(dummyAppData.users[0].connections.length !== 0);
    assert(dummyAppData.users[2].connections.length !== 0);

    let connections = await Backend.getUserConnections({
      user_id: itemToStringId(dummyAppData.users[0]),
      after_id: undefined
    });

    expect(itemToStringId(connections)).toStrictEqual(
      itemToStringId(dummyAppData.users[0].connections)
    );

    connections = await Backend.getUserConnections({
      user_id: itemToStringId(dummyAppData.users[2]),
      after_id: undefined
    });

    expect(itemToStringId(connections)).toStrictEqual(
      itemToStringId(dummyAppData.users[2].connections)
    );
  });

  it('returns empty when a user has no connections', async () => {
    expect.hasAssertions();

    assert(dummyAppData.users[1].connections.length === 0);

    await expect(
      Backend.getUserConnections({
        user_id: itemToStringId(dummyAppData.users[1]),
        after_id: undefined
      })
    ).resolves.toStrictEqual([]);
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    assert(dummyAppData.users[1].connections.length === 0);

    await withMockedEnv(
      async () => {
        const usersDb = await getUsersDb();
        const userId = itemToObjectId(dummyAppData.users[1]);
        const user_id = itemToStringId(dummyAppData.users[1]);

        const connections: UserId[] = Array.from({ length: 3 }).map(() => {
          return new ObjectId();
        });

        await usersDb.updateOne({ _id: userId }, { $set: { connections } });

        await usersDb.insertMany(
          connections.map((id, index): InternalUser => {
            return {
              ...dummyAppData.users[0],
              _id: id,
              username: `fake-user-${index}`,
              email: `fake-email-${index}`,
              connections: []
            };
          })
        );

        const expectedResults = connections.map((id) => [String(id)]);

        await expect(
          Backend.getUserConnections({
            after_id: undefined,
            user_id
          })
        ).resolves.toStrictEqual(expectedResults[0]);

        await expect(
          Backend.getUserConnections({
            after_id: itemToStringId(connections[0]),
            user_id
          })
        ).resolves.toStrictEqual(expectedResults[1]);

        await expect(
          Backend.getUserConnections({
            after_id: itemToStringId(connections[1]),
            user_id
          })
        ).resolves.toStrictEqual(expectedResults[2]);

        await expect(
          Backend.getUserConnections({
            after_id: itemToStringId(connections[2]),
            user_id
          })
        ).resolves.toStrictEqual([]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('rejects if user_id undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getUserConnections({
        user_id: undefined,
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    await expect(
      Backend.getUserConnections({
        user_id: 'bad-id',
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad-id')
    });

    const user_id = itemToStringId(new ObjectId());

    await expect(
      Backend.getUserConnections({
        user_id,
        after_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(user_id, 'user')
    });
  });

  it('rejects if after_id is invalid (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getUserConnections({
        after_id: 'fake-oid',
        user_id: itemToStringId(new ObjectId())
      })
    ).rejects.toMatchObject({ message: ErrorMessage.InvalidObjectId('fake-oid') });
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(
      Backend.getUserConnections({
        after_id,
        user_id: after_id
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'after_id')
    });
  });
});

describe('::createUser', () => {
  it('creates and returns a new V1 user without sessions or fullName', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newUser: NewUser = {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'administrator'
    };

    await expect(
      Backend.createUser({ apiVersion: 1, __provenance, data: newUser })
    ).resolves.toStrictEqual<PublicUser>({
      user_id: expect.any(String),
      username: newUser.username,
      email: newUser.email,
      salt: newUser.salt,
      type: 'administrator',
      sections: {
        about: null,
        education: [],
        experience: [],
        skills: [],
        volunteering: []
      },
      views: 0,
      createdAt: mockDateNowMs,
      updatedAt: mockDateNowMs
    });

    await expect((await getUsersDb()).countDocuments(newUser)).resolves.toBe(1);
  });

  it('creates and returns a new V2 user with sessions and fullName', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newUser: NewUser = {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'administrator',
      fullName: 'Elizabeth Warren'
    };

    await expect(
      Backend.createUser({ apiVersion: 2, __provenance, data: newUser })
    ).resolves.toStrictEqual<PublicUser>({
      user_id: expect.any(String),
      username: newUser.username,
      email: newUser.email,
      salt: newUser.salt,
      type: 'administrator',
      fullName: 'Elizabeth Warren',
      sections: {
        about: null,
        education: [],
        experience: [],
        skills: [],
        volunteering: []
      },
      views: 0,
      sessions: 0,
      createdAt: mockDateNowMs,
      updatedAt: mockDateNowMs
    });

    await expect((await getUsersDb()).countDocuments(newUser)).resolves.toBe(1);
  });

  test('creating a user is reflected in the system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();
    const __provenance = 'fake-owner';
    const newUser: NewUser = {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'administrator'
    };

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'users',
      dummyAppData.users.length
    );

    await Backend.createUser({ apiVersion: 1, __provenance, data: newUser });

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'users',
      dummyAppData.users.length + 1
    );
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createUser({
        apiVersion: 1,
        data: {
          username: 'test-user',
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'administrator'
        },
        __provenance: undefined as unknown as string
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid provenance/)
    });
  });

  it('rejects when attempting to create a user with a duplicate username or email', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createUser({
        apiVersion: 1,
        data: {
          username: dummyAppData.users[0].username,
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'staff'
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.DuplicateFieldValue('username')
    });

    await expect(
      Backend.createUser({
        apiVersion: 1,
        data: {
          username: 'new-user',
          email: dummyAppData.users[0].email,
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'inner'
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({ message: ErrorMessage.DuplicateFieldValue('email') });
  });

  it('rejects if fullName passed in V1 mode or fullName is not string in V2 mode', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createUser({
        apiVersion: 1,
        data: {
          username: dummyAppData.users[0].username,
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'inner',
          fullName: 'big dog'
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.UnknownField('fullName')
    });

    await expect(
      Backend.createUser({
        apiVersion: 1,
        data: {
          username: dummyAppData.users[0].username,
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'inner',
          fullName: null
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.UnknownField('fullName')
    });

    await expect(
      Backend.createUser({
        apiVersion: 2,
        data: {
          username: 'new-user',
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'inner'
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidStringLength(
        'fullName',
        1,
        getEnv().MAX_USER_FULLNAME_LENGTH,
        'alphanumeric (with spaces)'
      )
    });

    await expect(
      Backend.createUser({
        apiVersion: 2,
        data: {
          username: 'new-user',
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'inner',
          fullName: null
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidStringLength(
        'fullName',
        1,
        getEnv().MAX_USER_FULLNAME_LENGTH,
        'alphanumeric (with spaces)'
      )
    });

    await expect(
      Backend.createUser({
        apiVersion: 2,
        data: {
          username: 'new-user',
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'inner',
          fullName: 'x'.repeat(getEnv().MAX_USER_FULLNAME_LENGTH + 1)
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidStringLength(
        'fullName',
        1,
        getEnv().MAX_USER_FULLNAME_LENGTH,
        'alphanumeric (with spaces)'
      )
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const {
      MIN_USER_NAME_LENGTH: minULength,
      MAX_USER_NAME_LENGTH: maxULength,
      MIN_USER_EMAIL_LENGTH: minELength,
      MAX_USER_EMAIL_LENGTH: maxELength,
      USER_SALT_LENGTH: saltLength,
      USER_KEY_LENGTH: keyLength
    } = getEnv();

    const newUsers: [Parameters<typeof Backend.createUser>[0]['data'], string][] = [
      [undefined, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [
        {} as NewUser,
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: null } as unknown as NewUser,
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'x'.repeat(minELength - 1) },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'x'.repeat(maxELength + 1) },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'x'.repeat(maxELength) },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'valid@email.address' },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength - 1)
        },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        {
          email: 'valid@email.address',
          salt: null
        } as unknown as NewUser,
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        {
          email: 'valid@email.address',
          salt: 'x'.repeat(saltLength)
        },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength)
        },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength - 1)
        },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          // * Not hexadecimal
          key: 'x'.repeat(keyLength)
        },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      [
        {
          username: 'must be alphanumeric',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator'
        },
        ErrorMessage.InvalidStringLength(
          'username',
          minULength,
          maxULength,
          'lowercase alphanumeric'
        )
      ],
      [
        {
          username: 'must-be-@lphanumeric',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator'
        },
        ErrorMessage.InvalidStringLength(
          'username',
          minULength,
          maxULength,
          'lowercase alphanumeric'
        )
      ],
      [
        {
          username: 'must-be-LOWERCASE',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator'
        },
        ErrorMessage.InvalidStringLength(
          'username',
          minULength,
          maxULength,
          'lowercase alphanumeric'
        )
      ],
      [
        {
          username: '#&*@^(#@(^$&*#',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator'
        },
        ErrorMessage.InvalidStringLength(
          'username',
          minULength,
          maxULength,
          'lowercase alphanumeric'
        )
      ],
      [
        {
          username: 'x'.repeat(minULength - 1),
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator'
        },
        ErrorMessage.InvalidStringLength(
          'username',
          minULength,
          maxULength,
          'lowercase alphanumeric'
        )
      ],
      [
        {
          username: 'x'.repeat(maxULength + 1),
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator'
        },
        ErrorMessage.InvalidStringLength(
          'username',
          minULength,
          maxULength,
          'lowercase alphanumeric'
        )
      ],
      [
        {
          username: 'user',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength)
        },
        ErrorMessage.InvalidFieldValue('type', 'undefined', userTypes)
      ],
      [
        {
          username: 'user',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'bad-type'
        },
        ErrorMessage.InvalidFieldValue('type', 'bad-type', userTypes)
      ],
      [
        {
          username: 'user',
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator',
          blogName: 'some-blog'
        } as unknown as NewUser,
        ErrorMessage.UnknownField('blogName')
      ]
    ];

    await expectExceptionsWithMatchingErrors(
      [
        ...newUsers,
        [
          {
            username: 'user',
            email: 'valid@email.address',
            salt: '0'.repeat(saltLength),
            key: '0'.repeat(keyLength),
            type: 'administrator',
            fullName: 'my name'
          } as NewUser,
          ErrorMessage.UnknownField('fullName')
        ],
        [
          {
            username: 'user',
            email: 'valid@email.address',
            salt: '0'.repeat(saltLength),
            key: '0'.repeat(keyLength),
            type: 'administrator',
            fullName: 5
          } as unknown as NewUser,
          ErrorMessage.UnknownField('fullName')
        ],
        [
          {
            username: 'user',
            email: 'valid@email.address',
            salt: '0'.repeat(saltLength),
            key: '0'.repeat(keyLength),
            type: 'administrator',
            fullName: true
          } as unknown as NewUser,
          ErrorMessage.UnknownField('fullName')
        ]
      ],
      (data) =>
        Backend.createUser({ apiVersion: 1, data, __provenance: 'fake-owner' })
    );

    await expectExceptionsWithMatchingErrors(
      [
        ...newUsers.map(([data, error]) => {
          return [
            isPlainObject(data) ? { ...data, fullName: 'The Rock' } : data,
            error
          ] as (typeof newUsers)[number];
        }),
        [
          {
            username: 'user',
            email: 'valid@email.address',
            salt: '0'.repeat(saltLength),
            key: '0'.repeat(keyLength),
            type: 'administrator',
            fullName: 5
          } as unknown as NewUser,
          ErrorMessage.InvalidStringLength(
            'fullName',
            1,
            getEnv().MAX_USER_FULLNAME_LENGTH,
            'alphanumeric (with spaces)'
          )
        ],
        [
          {
            username: 'user',
            email: 'valid@email.address',
            salt: '0'.repeat(saltLength),
            key: '0'.repeat(keyLength),
            type: 'administrator',
            fullName: true
          } as unknown as NewUser,
          ErrorMessage.InvalidStringLength(
            'fullName',
            1,
            getEnv().MAX_USER_FULLNAME_LENGTH,
            'alphanumeric (with spaces)'
          )
        ]
      ],
      (data) =>
        Backend.createUser({ apiVersion: 2, data, __provenance: 'fake-owner' })
    );
  });
});

describe('::createSession', () => {
  it('creates a new session', async () => {
    expect.hasAssertions();

    const user_id = itemToStringId(dummyAppData.users[0]._id);
    const view = 'profile';
    const viewed_id = itemToStringId(dummyAppData.users[1]._id);

    const __provenance = 'fake-owner';
    const newSession: NewSession = {
      user_id,
      view,
      viewed_id
    };

    const sessionId = await Backend.createSession({
      apiVersion: 1,
      __provenance,
      data: newSession
    });

    expect(sessionId).toBeInstanceOf(ObjectId);

    await expect(
      (await getSessionsDb()).countDocuments({ _id: sessionId })
    ).resolves.toBe(1);
  });

  test('creating a session is reflected in the system info', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newSession: NewSession = {
      user_id: itemToStringId(dummyAppData.users[0]._id),
      view: 'profile',
      viewed_id: itemToStringId(dummyAppData.users[1]._id)
    };

    await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toHaveProperty(
      'sessions',
      dummyActiveSessions.length
    );

    await Backend.createSession({
      apiVersion: 1,
      __provenance,
      data: newSession
    });

    await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toHaveProperty(
      'sessions',
      dummyActiveSessions.length + 1
    );
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createSession({
        apiVersion: 1,
        data: {},
        __provenance: undefined as unknown as string
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid provenance/)
    });
  });

  it('rejection results in error message crafted with respect to apiVersion', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createSession({
        apiVersion: 1,
        data: { user_id: null, view: 'bad' },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: expect.not.stringContaining('article')
    });

    await expect(
      Backend.createSession({
        apiVersion: 2,
        data: { user_id: null, view: 'bad' },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('article')
    });

    await expect(
      Backend.createSession({
        apiVersion: 1,
        data: { user_id: null, view: 'article', viewed_id: null },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: expect.not.stringContaining('article')
    });

    await expect(
      Backend.createSession({
        apiVersion: 2,
        data: { user_id: null, view: 'article', viewed_id: null },
        __provenance: 'fake-owner'
      })
    ).resolves.toBeDefined();

    await expect(
      Backend.createSession({
        apiVersion: 1,
        data: { user_id: null, view: 'profile', viewed_id: 5 },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: expect.not.stringContaining('article')
    });

    await expect(
      Backend.createSession({
        apiVersion: 2,
        data: { user_id: null, view: 'profile', viewed_id: 5 },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('article')
    });

    await expect(
      Backend.createSession({
        apiVersion: 1,
        data: {
          user_id: null,
          view: 'admin',
          viewed_id: itemToStringId(new ObjectId())
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: expect.not.stringContaining('article')
    });

    await expect(
      Backend.createSession({
        apiVersion: 2,
        data: {
          user_id: null,
          view: 'admin',
          viewed_id: itemToStringId(new ObjectId())
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidSessionViewCombination()
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const fake_id = itemToStringId(new ObjectId());

    const newSessions: [
      Parameters<typeof Backend.createSession>[0]['data'],
      string
    ][] = [
      [undefined, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [{} as NewSession, ErrorMessage.InvalidFieldValue('user_id', 'undefined')],
      [
        { user_id: 5 } as unknown as NewSession,
        ErrorMessage.InvalidFieldValue('user_id', '5')
      ],
      [
        { user_id: true } as unknown as NewSession,
        ErrorMessage.InvalidFieldValue('user_id', 'true')
      ],
      [
        { user_id: itemToStringId(dummyAppData.users[0]._id) } as NewSession,
        expect.stringContaining(': home, auth, admin')
      ],
      [
        {
          user_id: itemToStringId(dummyAppData.users[0]._id),
          view: null
        } as unknown as NewSession,
        expect.stringContaining(': home, auth, admin')
      ],
      [
        {
          user_id: itemToStringId(dummyAppData.users[0]._id),
          view: false
        } as unknown as NewSession,
        expect.stringContaining(': home, auth, admin')
      ],
      [
        {
          user_id: itemToStringId(dummyAppData.users[0]._id),
          view: 5
        } as unknown as NewSession,
        expect.stringContaining(': home, auth, admin')
      ],
      [
        {
          user_id: itemToStringId(dummyAppData.users[0]._id),
          view: 'bad'
        } as unknown as NewSession,
        expect.stringContaining(': home, auth, admin')
      ],
      [
        { user_id: null, view: 'admin' } as NewSession,
        expect.stringContaining(': a user_id, an opportunity_id')
      ],
      [
        { user_id: null, view: 'admin', viewed_id: 5 } as unknown as NewSession,
        expect.stringContaining(': a user_id, an opportunity_id')
      ],
      [
        { user_id: null, view: 'admin', viewed_id: true } as unknown as NewSession,
        expect.stringContaining(': a user_id, an opportunity_id')
      ],
      [
        { user_id: 'bad', view: 'admin', viewed_id: null } as unknown as NewSession,
        ErrorMessage.InvalidObjectId('bad')
      ],
      [
        { user_id: null, view: 'profile', viewed_id: 'bad' } as NewSession,
        ErrorMessage.InvalidObjectId('bad')
      ],
      [
        { user_id: fake_id, view: 'admin', viewed_id: null } as NewSession,
        ErrorMessage.ItemNotFound(fake_id, 'user')
      ],
      [
        { user_id: null, view: 'profile', viewed_id: fake_id } as NewSession,
        ErrorMessage.ItemNotFound(fake_id, 'user')
      ],
      [
        { user_id: null, view: 'opportunity', viewed_id: fake_id } as NewSession,
        ErrorMessage.ItemNotFound(fake_id, 'opportunity')
      ],
      [
        {
          user_id: null,
          view: 'admin',
          viewed_id: fake_id
        } as unknown as NewSession,
        ErrorMessage.InvalidSessionViewCombination()
      ],
      [
        {
          user_id: null,
          view: 'admin',
          viewed_id: null,
          type: 'administrator'
        } as NewSession,
        ErrorMessage.UnknownField('type')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newSessions, (data) =>
      Backend.createSession({ apiVersion: 1, data, __provenance: 'fake-owner' })
    );

    await expectExceptionsWithMatchingErrors(newSessions, (data) =>
      Backend.createSession({ apiVersion: 2, data, __provenance: 'fake-owner' })
    );
  });
});

describe('::createOpportunity', () => {
  it('creates and returns a new V1 opportunity without sessions', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newOpportunity: NewOpportunity = {
      title: 'new opportunity',
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0])
    };

    await expect(
      Backend.createOpportunity({ apiVersion: 1, __provenance, data: newOpportunity })
    ).resolves.toStrictEqual<PublicOpportunity>({
      ...newOpportunity,
      opportunity_id: expect.any(String),
      views: 0,
      createdAt: mockDateNowMs,
      updatedAt: mockDateNowMs
    });

    // @ts-expect-error: for testing purposes
    delete newOpportunity.creator_id;

    await expect(
      (await getOpportunitiesDb()).countDocuments(newOpportunity)
    ).resolves.toBe(1);
  });

  it('creates and returns a new V2 opportunity with sessions', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newOpportunity: NewOpportunity = {
      title: 'new opportunity',
      contents: 'stuff',
      creator_id: itemToStringId(dummyAppData.users[0])
    };

    await expect(
      Backend.createOpportunity({ apiVersion: 2, __provenance, data: newOpportunity })
    ).resolves.toStrictEqual<PublicOpportunity>({
      ...newOpportunity,
      opportunity_id: expect.any(String),
      views: 0,
      sessions: 0,
      createdAt: mockDateNowMs,
      updatedAt: mockDateNowMs
    });

    // @ts-expect-error: for testing purposes
    delete newOpportunity.creator_id;

    await expect(
      (await getOpportunitiesDb()).countDocuments(newOpportunity)
    ).resolves.toBe(1);
  });

  test('creating an opportunity is reflected in the system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();

    const __provenance = 'fake-owner';
    const newOpportunity: NewOpportunity = {
      title: 'new opportunity',
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0])
    };

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'opportunities',
      dummyAppData.opportunities.length
    );

    await Backend.createOpportunity({
      apiVersion: 1,
      __provenance,
      data: newOpportunity
    });

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'opportunities',
      dummyAppData.opportunities.length + 1
    );
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createOpportunity({
        apiVersion: 1,
        data: {
          title: 'new opportunity',
          contents: '',
          creator_id: itemToStringId(dummyAppData.users[0])
        },
        __provenance: undefined as unknown as string
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid provenance/)
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const fake_id = itemToStringId(new ObjectId());

    const {
      MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES: maxContentLength,
      MAX_OPPORTUNITY_TITLE_LENGTH: maxTitleLength
    } = getEnv();

    const newOpportunities: [
      Parameters<typeof Backend.createOpportunity>[0]['data'],
      string
    ][] = [
      [undefined, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [
        {} as NewOpportunity,
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: null } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: false } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxContentLength + 1) } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxContentLength) } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { contents: 'x', title: '' } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { contents: 'x', title: 5 } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { contents: 'x', title: null } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength + 1)
        } as unknown as NewOpportunity,
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength)
        } as unknown as NewOpportunity,
        ErrorMessage.InvalidFieldValue('creator_id')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: null
        } as unknown as NewOpportunity,
        ErrorMessage.InvalidFieldValue('creator_id')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: 5
        } as unknown as NewOpportunity,
        ErrorMessage.InvalidFieldValue('creator_id')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: 'bad'
        } as unknown as NewOpportunity,
        ErrorMessage.InvalidObjectId('bad')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: fake_id
        } as unknown as NewOpportunity,
        ErrorMessage.ItemNotFound(fake_id, 'user')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: itemToStringId(dummyAppData.users[0]),
          type: 'administrator'
        } as NewOpportunity,
        ErrorMessage.UnknownField('type')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newOpportunities, (data) =>
      Backend.createOpportunity({ apiVersion: 1, data, __provenance: 'fake-owner' })
    );

    await expectExceptionsWithMatchingErrors(newOpportunities, (data) =>
      Backend.createOpportunity({ apiVersion: 2, data, __provenance: 'fake-owner' })
    );
  });
});

describe('::createArticle', () => {
  it('creates and returns a new article with sessions', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newArticle: NewArticle = {
      title: 'new article',
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0]),
      keywords: []
    };

    await expect(
      Backend.createArticle({ __provenance, data: newArticle })
    ).resolves.toStrictEqual<PublicArticle>({
      ...newArticle,
      article_id: expect.any(String),
      views: 0,
      sessions: 0,
      createdAt: mockDateNowMs,
      updatedAt: mockDateNowMs
    });

    // @ts-expect-error: for testing purposes
    delete newArticle.creator_id;

    await expect((await getArticlesDb()).countDocuments(newArticle)).resolves.toBe(1);
  });

  it('lowercases and de-duplicates keywords', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newArticle: NewArticle = {
      title: 'new article',
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0]),
      keywords: ['one', 'ONE', 'One', 'OnE', '1', '1', '1', 'sAmEneSs']
    };

    await expect(
      Backend.createArticle({ __provenance, data: newArticle })
    ).resolves.toStrictEqual<PublicArticle>(
      expect.objectContaining({
        keywords: ['one', '1', 'sameness']
      })
    );
  });

  test('creating an article is reflected in the system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();

    const __provenance = 'fake-owner';
    const newArticle: NewArticle = {
      title: 'new article',
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0]),
      keywords: []
    };

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'articles',
      dummyAppData.articles.length
    );

    await Backend.createArticle({ __provenance, data: newArticle });

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'articles',
      dummyAppData.articles.length + 1
    );
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createArticle({
        data: {
          title: 'new article',
          contents: '',
          keywords: [],
          creator_id: itemToStringId(dummyAppData.users[0])
        },
        __provenance: undefined as unknown as string
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid provenance/)
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const fake_id = itemToStringId(new ObjectId());

    const {
      MAX_ARTICLE_CONTENTS_LENGTH_BYTES: maxContentLength,
      MAX_ARTICLE_TITLE_LENGTH: maxTitleLength,
      MAX_ARTICLE_KEYWORDS: maxKeywords,
      MAX_ARTICLE_KEYWORD_LENGTH: maxKeywordLength
    } = getEnv();

    const newArticles: [
      Parameters<typeof Backend.createArticle>[0]['data'],
      string
    ][] = [
      [undefined, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [
        {} as NewArticle,
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: null },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: false },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxContentLength + 1) },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxContentLength) },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { contents: 'x', title: '' },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { contents: 'x', title: 5 },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { contents: 'x', title: null },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength + 1)
        },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength)
        },
        ErrorMessage.InvalidFieldValue('keywords')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: null
        },
        ErrorMessage.InvalidFieldValue('keywords')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: 5
        },
        ErrorMessage.InvalidFieldValue('keywords')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: Array.from({ length: maxKeywords + 1 }).map((_, index) =>
            index.toString()
          )
        },
        ErrorMessage.TooMany('keywords', maxKeywords)
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: Array.from({ length: maxKeywords }).map((_, index) =>
            index.toString().repeat(maxKeywordLength + 1)
          )
        },
        ErrorMessage.InvalidArrayValue(
          'keywords',
          '0'.repeat(maxKeywordLength + 1),
          0
        )
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: ['ok', 'ok', 5]
        },
        ErrorMessage.InvalidArrayValue('keywords', '5', 2)
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: ['ok', null, 'ok']
        },
        ErrorMessage.InvalidArrayValue('keywords', 'null', 1)
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: ['ok', '', 'ok']
        },
        ErrorMessage.InvalidArrayValue('keywords', '', 1)
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: ['not alphanumeric']
        },
        ErrorMessage.InvalidArrayValue('keywords', 'not alphanumeric', 0)
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          keywords: []
        },
        ErrorMessage.InvalidFieldValue('creator_id')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: null,
          keywords: []
        },
        ErrorMessage.InvalidFieldValue('creator_id')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: 5,
          keywords: []
        },
        ErrorMessage.InvalidFieldValue('creator_id')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: 'bad',
          keywords: []
        },
        ErrorMessage.InvalidObjectId('bad')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: fake_id,
          keywords: []
        },
        ErrorMessage.ItemNotFound(fake_id, 'user')
      ],
      [
        {
          contents: 'x',
          title: 'x'.repeat(maxTitleLength),
          creator_id: itemToStringId(dummyAppData.users[0]),
          type: 'administrator',
          keywords: []
        } as NewArticle,
        ErrorMessage.UnknownField('type')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newArticles, (data) =>
      Backend.createArticle({ data, __provenance: 'fake-owner' })
    );
  });
});

describe('::createUserConnection', () => {
  it('creates a connection between two users', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();
    const userZeroId = itemToObjectId(dummyAppData.users[0]);
    const userOneId = itemToObjectId(dummyAppData.users[1]);

    const { connections: connections1 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { connections: connections2 } =
      (await usersDb.findOne({ _id: userOneId })) || toss(new TrialError());

    expect(connections1.some((id) => id.equals(userOneId))).toBeFalse();
    expect(connections2.some((id) => id.equals(userZeroId))).toBeFalse();

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(userZeroId),
        connection_id: itemToStringId(userOneId)
      })
    ).resolves.toBeUndefined();

    const { connections: connections3 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { connections: connections4 } =
      (await usersDb.findOne({ _id: userOneId })) || toss(new TrialError());

    expect(connections3.some((id) => id.equals(userOneId))).toBeTrue();
    expect(connections4.some((id) => id.equals(userZeroId))).toBeTrue();
  });

  it("updates both users' updatedAt property", async () => {
    expect.hasAssertions();

    const expectedUpdatedAt = mockDateNowMs + 10 ** 5;

    jest.spyOn(Date, 'now').mockImplementation(() => expectedUpdatedAt);

    const usersDb = await getUsersDb();
    const userZeroId = itemToObjectId(dummyAppData.users[0]);
    const userOneId = itemToObjectId(dummyAppData.users[1]);

    const { updatedAt: updatedAt1 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { updatedAt: updatedAt2 } =
      (await usersDb.findOne({ _id: userOneId })) || toss(new TrialError());

    expect(updatedAt1).not.toBe(expectedUpdatedAt);
    expect(updatedAt2).not.toBe(expectedUpdatedAt);

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(userZeroId),
        connection_id: itemToStringId(userOneId)
      })
    ).resolves.toBeUndefined();

    const { updatedAt: updatedAt3 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { updatedAt: updatedAt4 } =
      (await usersDb.findOne({ _id: userOneId })) || toss(new TrialError());

    expect(updatedAt3).toBe(expectedUpdatedAt);
    expect(updatedAt4).toBe(expectedUpdatedAt);
  });

  it('is a no-op (on connections) if the users are already connected', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();
    const userZeroId = itemToObjectId(dummyAppData.users[0]);
    const userTwoId = itemToObjectId(dummyAppData.users[2]);

    const { connections: connections1 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { connections: connections2 } =
      (await usersDb.findOne({ _id: userTwoId })) || toss(new TrialError());

    expect(connections1).toStrictEqual(dummyAppData.users[0].connections);
    expect(connections2).toStrictEqual(dummyAppData.users[2].connections);

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(userZeroId),
        connection_id: itemToStringId(userTwoId)
      })
    ).resolves.toBeUndefined();

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(userTwoId),
        connection_id: itemToStringId(userZeroId)
      })
    ).resolves.toBeUndefined();

    const { connections: connections3 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { connections: connections4 } =
      (await usersDb.findOne({ _id: userTwoId })) || toss(new TrialError());

    expect(connections3).toStrictEqual(dummyAppData.users[0].connections);
    expect(connections4).toStrictEqual(dummyAppData.users[2].connections);
  });

  it('rejects if attempting to connect a user to themselves', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.IllegalCyclicalConnection()
    });
  });

  it('rejects if user_id or connection_id are undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createUserConnection({
        user_id: 'does-not-exist',
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.createUserConnection({
        user_id: undefined,
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    const user_id = itemToStringId(new ObjectId());

    await expect(
      Backend.createUserConnection({
        user_id,
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(user_id, 'user')
    });

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id: 'does-not-exist'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('connection_id', 'parameter')
    });

    const connection_id = itemToStringId(new ObjectId());

    await expect(
      Backend.createUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(connection_id, 'user')
    });

    await expect(
      Backend.createUserConnection({
        user_id: connection_id,
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(connection_id, 'user')
    });
  });
});

describe('::updateUser', () => {
  it('updates an existing user', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();
    const userId = itemToObjectId(dummyAppData.users[2]);
    const patchUser: PatchUser = { type: 'staff' };

    await expect(
      usersDb.countDocuments({
        _id: userId,
        ...patchUser
      })
    ).resolves.toBe(0);

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: patchUser
      })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({
        _id: userId,
        ...patchUser
      })
    ).resolves.toBe(1);
  });

  it('applies updates to sections at the sub-key level', async () => {
    expect.hasAssertions();

    const {
      MAX_SECTION_DESCRIPTION_LENGTH: maxDescLength,
      MAX_SECTION_LOCATION_LENGTH: maxLocationLength,
      MAX_SECTION_TITLE_LENGTH: maxTitleLength,
      MAX_USER_SECTION_ITEMS: maxSectionItems,
      MAX_USER_ABOUT_SECTION_LENGTH_BYTES: maxAboutLength,
      MAX_USER_SKILLS_SECTION_ITEMS: maxSkills,
      MAX_USER_SKILLS_SECTION_ITEM_LENGTH: maxSkillLength
    } = getEnv();

    const usersDb = await getUsersDb();
    const userId = itemToObjectId(dummyAppData.users[2]);

    const patchUser: PatchUser = {
      sections: {
        about: 'a'.repeat(maxAboutLength)
      }
    };

    await expect(usersDb.findOne({ _id: userId })).resolves.not.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: { sections: { about: patchUser.sections?.about } }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    patchUser.sections!.education = [
      {
        title: 'education',
        description: 'education',
        location: 'education',
        startedAt: mockDateNowMs,
        endedAt: mockDateNowMs
      }
    ];

    await expect(usersDb.findOne({ _id: userId })).resolves.not.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: { sections: { education: patchUser.sections?.education } }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    patchUser.sections!.experience = [
      {
        title: 'e'.repeat(maxTitleLength),
        description: 'e'.repeat(maxDescLength),
        location: 'e'.repeat(maxLocationLength),
        startedAt: mockDateNowMs,
        endedAt: null
      }
    ];

    await expect(usersDb.findOne({ _id: userId })).resolves.not.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: { sections: { experience: patchUser.sections?.experience } }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    patchUser.sections!.volunteering = [
      {
        title: 'volunteering',
        description: 'volunteering',
        location: 'volunteering',
        startedAt: mockDateNowMs,
        endedAt: null
      }
    ];

    await expect(usersDb.findOne({ _id: userId })).resolves.not.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: { sections: { volunteering: patchUser.sections?.volunteering } }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    patchUser.sections!.skills = ['leet', 'code', 'skills'];

    await expect(usersDb.findOne({ _id: userId })).resolves.not.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: { sections: { skills: patchUser.sections?.skills } }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections }
    );

    const newSections = {
      about: null,
      skills: Array.from({ length: maxSkills }).map((_, index) =>
        `${index}`.repeat(maxSkillLength)
      ),
      experience: Array.from({ length: maxSectionItems }).map(
        () => patchUser.sections?.experience?.[0]
      )
    };

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        data: { sections: newSections }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections, ...newSections }
    );

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(userId),
        // ? {about: ''} should be synonymous with {about: null}
        data: { sections: { about: '' } }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'sections',
      { ...dummyAppData.users[2].sections, ...patchUser.sections, ...newSections }
    );
  });

  test('incrementing views is reflected in the system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();
    const usersDb = await getUsersDb();

    const userId = itemToObjectId(dummyAppData.users[2]);
    const patchUser: PatchUser = { views: 'increment' };

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'views',
      dummyAppData.users[2].views
    );

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'views',
      dummyAppData.info[0].views
    );

    await Backend.updateUser({
      apiVersion: 1,
      user_id: itemToStringId(userId),
      data: patchUser
    });

    await expect(usersDb.findOne({ _id: userId })).resolves.toHaveProperty(
      'views',
      dummyAppData.users[2].views + 1
    );

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'views',
      dummyAppData.info[0].views + 1
    );
  });

  it('updates updatedAt', async () => {
    expect.hasAssertions();

    const expectedUpdatedAt = mockDateNowMs + 10 ** 5;

    jest.spyOn(Date, 'now').mockImplementation(() => expectedUpdatedAt);

    const usersDb = await getUsersDb();
    const userId = itemToObjectId(dummyAppData.users[0]);
    const user_id = itemToStringId(dummyAppData.users[0]);

    const { updatedAt: updatedAt1 } =
      (await usersDb.findOne({ _id: userId })) || toss(new TrialError());

    expect(updatedAt1).not.toBe(expectedUpdatedAt);

    await expect(
      Backend.updateUser({ apiVersion: 1, user_id, data: { type: 'inner' } })
    ).resolves.toBeUndefined();

    const { updatedAt: updatedAt2 } =
      (await usersDb.findOne({ _id: userId })) || toss(new TrialError());

    expect(updatedAt2).toBe(expectedUpdatedAt);
  });

  it('rejects if no data passed in', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(dummyAppData.users[0]),
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.EmptyJSONBody()
    });
  });

  it('rejects if the user_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: undefined,
        data: { email: 'fake@email.com' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: 'bad',
        data: { email: 'fake@email.com' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad')
    });

    const user_id = itemToStringId(new ObjectId());

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id,
        data: { email: 'fake@email.com' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(user_id, 'user')
    });
  });

  it('rejects when attempting to update a user to a duplicate email that is not their own', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(dummyAppData.users[1]),
        data: { email: dummyAppData.users[0].email }
      })
    ).rejects.toMatchObject({ message: ErrorMessage.DuplicateFieldValue('email') });

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id: itemToStringId(dummyAppData.users[1]),
        data: { email: dummyAppData.users[1].email }
      })
    ).resolves.toBeUndefined();
  });

  it('rejects if fullName passed in V1 mode or fullName is not string in V2 mode', async () => {
    expect.hasAssertions();

    const user_id = itemToStringId(dummyAppData.users[0]);

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id,
        data: { fullName: 'something' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.UnknownField('fullName')
    });

    await expect(
      Backend.updateUser({
        apiVersion: 1,
        user_id,
        data: { fullName: null }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.UnknownField('fullName')
    });

    await expect(
      Backend.updateUser({
        apiVersion: 2,
        user_id,
        data: { fullName: 5 }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidStringLength(
        'fullName',
        1,
        getEnv().MAX_USER_FULLNAME_LENGTH,
        'alphanumeric (with spaces)'
      )
    });

    await expect(
      Backend.updateUser({
        apiVersion: 2,
        user_id,
        data: { fullName: null }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidStringLength(
        'fullName',
        1,
        getEnv().MAX_USER_FULLNAME_LENGTH,
        'alphanumeric (with spaces)'
      )
    });

    await expect(
      Backend.updateUser({
        apiVersion: 2,
        user_id,
        data: { fullName: 'x'.repeat(getEnv().MAX_USER_FULLNAME_LENGTH + 1) }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidStringLength(
        'fullName',
        1,
        getEnv().MAX_USER_FULLNAME_LENGTH,
        'alphanumeric (with spaces)'
      )
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const {
      MIN_USER_EMAIL_LENGTH: minELength,
      MAX_USER_EMAIL_LENGTH: maxELength,
      USER_SALT_LENGTH: saltLength,
      USER_KEY_LENGTH: keyLength,
      MAX_SECTION_DESCRIPTION_LENGTH: maxDescLength,
      MAX_SECTION_LOCATION_LENGTH: maxLocationLength,
      MAX_SECTION_TITLE_LENGTH: maxTitleLength,
      MAX_USER_SECTION_ITEMS: maxSectionItems,
      MAX_USER_ABOUT_SECTION_LENGTH_BYTES: maxAboutLength,
      MAX_USER_SKILLS_SECTION_ITEMS: maxSkills,
      MAX_USER_SKILLS_SECTION_ITEM_LENGTH: maxSkillLength
    } = getEnv();

    const patchUsers: [Parameters<typeof Backend.updateUser>[0]['data'], string][] = [
      [undefined as unknown as PatchUser, ErrorMessage.InvalidJSON()],
      ['string data' as PatchUser, ErrorMessage.InvalidJSON()],
      [
        { email: '' },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'x'.repeat(minELength - 1) },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'x'.repeat(maxELength + 1) },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { email: 'x'.repeat(maxELength) },
        ErrorMessage.InvalidStringLength(
          'email',
          minELength,
          maxELength,
          'valid email address'
        )
      ],
      [
        { salt: '' },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        { salt: '0'.repeat(saltLength - 1) },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        { salt: 'x'.repeat(saltLength) },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      [
        { key: '' },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      [
        { key: '0'.repeat(keyLength - 1) },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      [
        // * Not hexadecimal
        { key: 'x'.repeat(keyLength) },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      // * Key must always be paired with salt and vice-versa
      [
        { key: 'a'.repeat(keyLength) },
        ErrorMessage.InvalidStringLength('salt', saltLength, null, 'hexadecimal')
      ],
      // * Key must always be paired with salt and vice-versa
      [
        { salt: 'a'.repeat(saltLength) },
        ErrorMessage.InvalidStringLength('key', keyLength, null, 'hexadecimal')
      ],
      [
        { views: null },
        ErrorMessage.InvalidFieldValue('views', 'null', ['increment'])
      ],
      [{ views: 5 }, ErrorMessage.InvalidFieldValue('views', '5', ['increment'])],
      [{ views: '+1' }, ErrorMessage.InvalidFieldValue('views', '+1', ['increment'])],
      [
        { views: 'decrement' },
        ErrorMessage.InvalidFieldValue('views', 'decrement', ['increment'])
      ],
      [
        { type: 'blogger' },
        ErrorMessage.InvalidFieldValue('type', 'blogger', userTypes)
      ],
      [{ type: null }, ErrorMessage.InvalidFieldValue('type', 'null', userTypes)],
      [{ sections: null }, ErrorMessage.InvalidFieldValue('sections')],
      [{ sections: [] }, ErrorMessage.InvalidFieldValue('sections')],
      [
        { sections: { about: true } },
        ErrorMessage.InvalidStringLength('sections.about', 0, maxAboutLength, 'bytes')
      ],
      [
        { sections: { about: 5 } },
        ErrorMessage.InvalidStringLength('sections.about', 0, maxAboutLength, 'bytes')
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength + 1),
                description: 'e'.repeat(maxDescLength),
                location: 'e'.repeat(maxLocationLength),
                startedAt: mockDateNowMs,
                endedAt: null
              }
            ]
          }
        },
        ErrorMessage.InvalidStringLength(
          'sections.education[0].title',
          1,
          maxTitleLength,
          'string'
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength),
                description: 'e'.repeat(maxDescLength + 1),
                location: 'e'.repeat(maxLocationLength),
                startedAt: mockDateNowMs,
                endedAt: null
              }
            ]
          }
        },
        ErrorMessage.InvalidStringLength(
          'sections.education[0].description',
          1,
          maxDescLength,
          'string'
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength),
                description: 'e'.repeat(maxDescLength),
                location: 'e'.repeat(maxLocationLength + 1),
                startedAt: mockDateNowMs,
                endedAt: null
              }
            ]
          }
        },
        ErrorMessage.InvalidStringLength(
          'sections.education[0].location',
          1,
          maxLocationLength,
          'string'
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength),
                description: 'e'.repeat(maxDescLength),
                location: 'e'.repeat(maxLocationLength),
                startedAt: null,
                endedAt: mockDateNowMs
              }
            ]
          }
        },
        ErrorMessage.InvalidNumberValue(
          'sections.education[0].startedAt',
          1,
          Number.MAX_SAFE_INTEGER,
          'integer'
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength),
                description: 'e'.repeat(maxDescLength),
                location: 'e'.repeat(maxLocationLength),
                startedAt: -1,
                endedAt: -1
              }
            ]
          }
        },
        ErrorMessage.InvalidNumberValue(
          'sections.education[0].startedAt',
          1,
          Number.MAX_SAFE_INTEGER,
          'integer'
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength),
                description: 'e'.repeat(maxDescLength),
                location: 'e'.repeat(maxLocationLength),
                startedAt: mockDateNowMs,
                endedAt: -1
              }
            ]
          }
        },
        ErrorMessage.InvalidNumberValue(
          'sections.education[0].endedAt',
          mockDateNowMs,
          Number.MAX_SAFE_INTEGER,
          'integer',
          true
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: [
              {
                title: 'e'.repeat(maxTitleLength),
                description: 'e'.repeat(maxDescLength),
                location: 'e'.repeat(maxLocationLength),
                startedAt: mockDateNowMs,
                endedAt: mockDateNowMs - 1
              }
            ]
          }
        },
        ErrorMessage.InvalidNumberValue(
          'sections.education[0].endedAt',
          mockDateNowMs,
          Number.MAX_SAFE_INTEGER,
          'integer',
          true
        )
      ],
      [
        {
          sections: {
            about: 'something',
            education: Array.from({ length: maxSectionItems + 1 }).map((_, index) => {
              return {
                title: `${index}`,
                description: `${index}`,
                location: `${index}`,
                startedAt: mockDateNowMs,
                endedAt: mockDateNowMs
              };
            })
          }
        },
        ErrorMessage.TooMany(`sections.education items`, maxSectionItems)
      ],
      [
        {
          sections: {
            about: 'something',
            skills: Array.from({ length: maxSkills + 1 }).map((_, index) =>
              `${index}`.repeat(maxSkillLength)
            )
          }
        },
        ErrorMessage.TooMany('skills', maxSkills)
      ],
      [
        {
          sections: { about: 'something', skills: ['x'.repeat(maxSkillLength + 1)] }
        },
        ErrorMessage.InvalidArrayValue(
          'sections.skills',
          'x'.repeat(maxSkillLength + 1),
          0
        )
      ],
      [{ banned: 'true' as unknown as boolean }, ErrorMessage.UnknownField('banned')],
      [{ banned: null as unknown as boolean }, ErrorMessage.UnknownField('banned')],
      [{ data: 1 } as PatchUser, ErrorMessage.UnknownField('data')],
      [
        { blogName: 'new-blog-name' } as PatchUser,
        ErrorMessage.UnknownField('blogName')
      ],
      [{ name: 'username' } as PatchUser, ErrorMessage.UnknownField('name')],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          username: 'new-username'
        } as PatchUser,
        ErrorMessage.UnknownField('username')
      ]
    ];

    await expectExceptionsWithMatchingErrors(patchUsers, (data) => {
      return Backend.updateUser({
        apiVersion: 1,
        user_id: dummyAppData.users[0].username,
        data
      });
    });

    await expectExceptionsWithMatchingErrors(patchUsers, (data) => {
      return Backend.updateUser({
        apiVersion: 2,
        user_id: dummyAppData.users[0].username,
        data
      });
    });
  });
});

describe('::renewSession', () => {
  it('renews an existing session, preventing it from being deleted', async () => {
    expect.hasAssertions();

    const expireAfterSecondsMs = getEnv().SESSION_EXPIRE_AFTER_SECONDS * 1000;
    const sessionsDb = await getSessionsDb();

    await expect(
      sessionsDb.countDocuments({
        lastRenewedDate: {
          $gt: new Date(Date.now() - expireAfterSecondsMs)
        }
      })
    ).resolves.toBe(2);

    jest
      .spyOn(Date, 'now')
      .mockImplementation(() => mockDateNowMs + expireAfterSecondsMs * 2);

    await expect(
      sessionsDb.countDocuments({
        lastRenewedDate: {
          $gt: new Date(Date.now() - expireAfterSecondsMs)
        }
      })
    ).resolves.toBe(0);

    await Backend.renewSession({
      session_id: itemToStringId(dummyAppData.sessions[0])
    });

    await expect(
      sessionsDb.countDocuments({
        lastRenewedDate: {
          $gt: new Date(Date.now() - expireAfterSecondsMs)
        }
      })
    ).resolves.toBe(1);
  });

  it('rejects if session_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    const sessionId = new ObjectId().toString();

    await expect(
      Backend.renewSession({
        session_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('session_id', 'parameter')
    });

    await expect(Backend.renewSession({ session_id: 'bad' })).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad')
    });

    await expect(
      Backend.renewSession({ session_id: sessionId })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(sessionId, 'session')
    });
  });

  it('rejects if session_id not a valid ObjectId', async () => {
    expect.hasAssertions();

    await expect(
      Backend.renewSession({
        session_id: 'not-a-valid-object-id'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('not-a-valid-object-id')
    });
  });
});

describe('::updateOpportunity', () => {
  it('updates an existing opportunity', async () => {
    expect.hasAssertions();

    const opportunitiesDb = await getOpportunitiesDb();
    const opportunityId = itemToObjectId(dummyAppData.opportunities[0]);
    const patchOpportunity: PatchOpportunity = { title: 'patch title' };

    await expect(
      opportunitiesDb.countDocuments({
        _id: opportunityId,
        ...patchOpportunity
      })
    ).resolves.toBe(0);

    await expect(
      Backend.updateOpportunity({
        opportunity_id: itemToStringId(opportunityId),
        data: patchOpportunity
      })
    ).resolves.toBeUndefined();

    await expect(
      opportunitiesDb.countDocuments({
        _id: opportunityId,
        ...patchOpportunity
      })
    ).resolves.toBe(1);
  });

  test('incrementing views is reflected in the system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();
    const opportunitiesDb = await getOpportunitiesDb();

    const opportunityId = itemToObjectId(dummyAppData.opportunities[2]);
    const patchOpportunity: PatchOpportunity = { views: 'increment' };

    await expect(
      opportunitiesDb.findOne({ _id: opportunityId })
    ).resolves.toHaveProperty('views', dummyAppData.opportunities[2].views);

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'views',
      dummyAppData.info[0].views
    );

    await Backend.updateOpportunity({
      opportunity_id: itemToStringId(opportunityId),
      data: patchOpportunity
    });

    await expect(
      opportunitiesDb.findOne({ _id: opportunityId })
    ).resolves.toHaveProperty('views', dummyAppData.opportunities[2].views + 1);

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'views',
      dummyAppData.info[0].views + 1
    );
  });

  it('updates updatedAt', async () => {
    expect.hasAssertions();

    const expectedUpdatedAt = mockDateNowMs + 10 ** 5;

    jest.spyOn(Date, 'now').mockImplementation(() => expectedUpdatedAt);

    const opportunitiesDb = await getOpportunitiesDb();
    const opportunityId = itemToObjectId(dummyAppData.opportunities[0]);
    const opportunity_id = itemToStringId(dummyAppData.opportunities[0]);

    const { updatedAt: updatedAt1 } =
      (await opportunitiesDb.findOne({ _id: opportunityId })) ||
      toss(new TrialError());

    expect(updatedAt1).not.toBe(expectedUpdatedAt);

    await expect(
      Backend.updateOpportunity({ opportunity_id, data: { title: 'new title' } })
    ).resolves.toBeUndefined();

    const { updatedAt: updatedAt2 } =
      (await opportunitiesDb.findOne({ _id: opportunityId })) ||
      toss(new TrialError());

    expect(updatedAt2).toBe(expectedUpdatedAt);
  });

  it('rejects if no data passed in', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateOpportunity({
        opportunity_id: itemToStringId(dummyAppData.opportunities[0]),
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.EmptyJSONBody()
    });
  });

  it('rejects if the opportunity_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateOpportunity({
        opportunity_id: undefined,
        data: { title: 'another update' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('opportunity_id', 'parameter')
    });

    await expect(
      Backend.updateOpportunity({
        opportunity_id: 'bad',
        data: { title: 'another update' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad')
    });

    const opportunity_id = itemToStringId(new ObjectId());

    await expect(
      Backend.updateOpportunity({
        opportunity_id,
        data: { title: 'another update' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(opportunity_id, 'opportunity')
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const {
      MAX_OPPORTUNITY_CONTENTS_LENGTH_BYTES: maxContentLength,
      MAX_OPPORTUNITY_TITLE_LENGTH: maxTitleLength
    } = getEnv();

    const newOpportunities: [
      Parameters<typeof Backend.createOpportunity>[0]['data'],
      string
    ][] = [
      [undefined, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [
        { contents: null },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: false },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxContentLength + 1) },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { title: '' },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { title: 5 },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { title: null },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { title: 'x'.repeat(maxTitleLength + 1) },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        {
          creator_id: 5
        },
        ErrorMessage.UnknownField('creator_id')
      ],
      [
        {
          creator_id: 'bad'
        },
        ErrorMessage.UnknownField('creator_id')
      ],
      [
        {
          contents: 'new content',
          type: 'administrator'
        },
        ErrorMessage.UnknownField('type')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newOpportunities, (data) =>
      Backend.updateOpportunity({
        opportunity_id: itemToStringId(dummyAppData.opportunities[0]),
        data
      })
    );
  });
});

describe('::updateArticle', () => {
  it('updates an existing article', async () => {
    expect.hasAssertions();

    const articlesDb = await getArticlesDb();
    const articleId = itemToObjectId(dummyAppData.articles[0]);
    const patchArticle: PatchArticle = { title: 'patch title' };

    await expect(
      articlesDb.countDocuments({
        _id: articleId,
        ...patchArticle
      })
    ).resolves.toBe(0);

    await expect(
      Backend.updateArticle({
        article_id: itemToStringId(articleId),
        data: patchArticle
      })
    ).resolves.toBeUndefined();

    await expect(
      articlesDb.countDocuments({
        _id: articleId,
        ...patchArticle
      })
    ).resolves.toBe(1);
  });

  test('incrementing views is reflected in the system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();
    const articlesDb = await getArticlesDb();

    const articleId = itemToObjectId(dummyAppData.articles[2]);
    const patchArticle: PatchArticle = { views: 'increment' };

    await expect(articlesDb.findOne({ _id: articleId })).resolves.toHaveProperty(
      'views',
      dummyAppData.articles[2].views
    );

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'views',
      dummyAppData.info[0].views
    );

    await Backend.updateArticle({
      article_id: itemToStringId(articleId),
      data: patchArticle
    });

    await expect(articlesDb.findOne({ _id: articleId })).resolves.toHaveProperty(
      'views',
      dummyAppData.articles[2].views + 1
    );

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'views',
      dummyAppData.info[0].views + 1
    );
  });

  it('updates updatedAt', async () => {
    expect.hasAssertions();

    const expectedUpdatedAt = mockDateNowMs + 10 ** 5;

    jest.spyOn(Date, 'now').mockImplementation(() => expectedUpdatedAt);

    const articlesDb = await getArticlesDb();
    const articleId = itemToObjectId(dummyAppData.articles[0]);
    const article_id = itemToStringId(dummyAppData.articles[0]);

    const { updatedAt: updatedAt1 } =
      (await articlesDb.findOne({ _id: articleId })) || toss(new TrialError());

    expect(updatedAt1).not.toBe(expectedUpdatedAt);

    await expect(
      Backend.updateArticle({ article_id, data: { title: 'new title' } })
    ).resolves.toBeUndefined();

    const { updatedAt: updatedAt2 } =
      (await articlesDb.findOne({ _id: articleId })) || toss(new TrialError());

    expect(updatedAt2).toBe(expectedUpdatedAt);
  });

  it('deduplicates and lowercases keywords', async () => {
    expect.hasAssertions();

    const articlesDb = await getArticlesDb();
    const articleId = itemToObjectId(dummyAppData.articles[0]);

    const duped = { keywords: ['1', '1', 'one', 'ONE', 'OnE'] };
    const deduped = { keywords: ['1', 'one'] };

    await expect(
      articlesDb.countDocuments({
        _id: articleId,
        ...deduped
      })
    ).resolves.toBe(0);

    await expect(
      Backend.updateArticle({
        article_id: itemToStringId(articleId),
        data: duped
      })
    ).resolves.toBeUndefined();

    await expect(
      articlesDb.countDocuments({
        _id: articleId,
        ...deduped
      })
    ).resolves.toBe(1);
  });

  it('rejects if no data passed in', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateArticle({
        article_id: itemToStringId(dummyAppData.articles[0]),
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.EmptyJSONBody()
    });
  });

  it('rejects if the article_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateArticle({
        article_id: undefined,
        data: { title: 'another update' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('article_id', 'parameter')
    });

    await expect(
      Backend.updateArticle({
        article_id: 'bad',
        data: { title: 'another update' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('bad')
    });

    const article_id = itemToStringId(new ObjectId());

    await expect(
      Backend.updateArticle({
        article_id,
        data: { title: 'another update' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(article_id, 'article')
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const {
      MAX_ARTICLE_CONTENTS_LENGTH_BYTES: maxContentLength,
      MAX_ARTICLE_TITLE_LENGTH: maxTitleLength,
      MAX_ARTICLE_KEYWORDS: maxKeywords,
      MAX_ARTICLE_KEYWORD_LENGTH: maxKeywordLength
    } = getEnv();

    const newArticles: [
      Parameters<typeof Backend.createArticle>[0]['data'],
      string
    ][] = [
      [undefined, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [
        { contents: null },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: false },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxContentLength + 1) },
        ErrorMessage.InvalidStringLength('contents', 0, maxContentLength, 'bytes')
      ],
      [
        { title: '' },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { title: 5 },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { title: null },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [
        { title: 'x'.repeat(maxTitleLength + 1) },
        ErrorMessage.InvalidStringLength('title', 1, maxTitleLength, 'string')
      ],
      [{ keywords: null }, ErrorMessage.InvalidFieldValue('keywords')],
      [{ keywords: 5 }, ErrorMessage.InvalidFieldValue('keywords')],
      [
        {
          keywords: Array.from({ length: maxKeywords + 1 }).map((_, index) =>
            index.toString()
          )
        },
        ErrorMessage.TooMany('keywords', maxKeywords)
      ],
      [
        {
          keywords: Array.from({ length: maxKeywords }).map((_, index) =>
            index.toString().repeat(maxKeywordLength + 1)
          )
        },
        ErrorMessage.InvalidArrayValue(
          'keywords',
          '0'.repeat(maxKeywordLength + 1),
          0
        )
      ],
      [
        { keywords: ['ok', 'ok', 5] },
        ErrorMessage.InvalidArrayValue('keywords', '5', 2)
      ],
      [
        { keywords: ['ok', null, 'ok'] },
        ErrorMessage.InvalidArrayValue('keywords', 'null', 1)
      ],
      [
        { keywords: ['ok', '', 'ok'] },
        ErrorMessage.InvalidArrayValue('keywords', '', 1)
      ],
      [
        { keywords: ['not alphanumeric'] },
        ErrorMessage.InvalidArrayValue('keywords', 'not alphanumeric', 0)
      ],
      [{ creator_id: 5 }, ErrorMessage.UnknownField('creator_id')],
      [{ creator_id: 'bad' }, ErrorMessage.UnknownField('creator_id')],
      [
        { contents: 'new content', type: 'administrator' },
        ErrorMessage.UnknownField('type')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newArticles, (data) =>
      Backend.updateArticle({
        article_id: itemToStringId(dummyAppData.articles[0]),
        data
      })
    );
  });
});

describe('::deleteUser', () => {
  it('deletes a user by user_id', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();

    await expect(
      usersDb.countDocuments({ _id: itemToObjectId(dummyAppData.users[0]) })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteUser({ user_id: itemToStringId(dummyAppData.users[0]) })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({ _id: itemToObjectId(dummyAppData.users[0]) })
    ).resolves.toBe(0);
  });

  test('deleting a user is reflected in system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'users',
      dummyAppData.users.length
    );

    await expect(
      Backend.deleteUser({ user_id: itemToStringId(dummyAppData.users[0]) })
    ).resolves.toBeUndefined();

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'users',
      dummyAppData.users.length - 1
    );
  });

  test('deleting a user disconnects their user_id from formerly-connected users', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();
    const userZeroId = itemToObjectId(dummyAppData.users[0]);
    const userTwoId = itemToObjectId(dummyAppData.users[2]);

    const { connections: connections1 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    expect(connections1.some((id) => id.equals(userTwoId))).toBeTrue();

    await expect(
      Backend.deleteUser({ user_id: itemToStringId(userTwoId) })
    ).resolves.toBeUndefined();

    const { connections: connections2 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    expect(connections2.some((id) => id.equals(userTwoId))).toBeFalse();
  });

  it('deletes all associated articles when deleting a user', async () => {
    expect.hasAssertions();

    const articlesDb = await getArticlesDb();

    await expect(
      articlesDb.countDocuments({ creator_id: dummyAppData.users[1]._id })
    ).resolves.toBe(2);

    await expect(
      Backend.deleteUser({ user_id: itemToStringId(dummyAppData.users[1]) })
    ).resolves.toBeUndefined();

    await expect(
      articlesDb.countDocuments({ creator_id: dummyAppData.users[1]._id })
    ).resolves.toBe(0);
  });

  it('does not error when attempting to delete user with no articles', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();
    const articlesDb = await getArticlesDb();

    await expect(
      Backend.deleteUser({ user_id: itemToStringId(dummyAppData.users[2]) })
    ).resolves.toBeUndefined();

    await expect(usersDb.countDocuments()).resolves.toBe(
      dummyAppData.users.length - 1
    );

    await expect(articlesDb.countDocuments()).resolves.toBe(
      dummyAppData.articles.length
    );
  });

  it('rejects if the user_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteUser({ user_id: 'does-not-exist' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(Backend.deleteUser({ user_id: undefined })).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    const user_id = itemToStringId(new ObjectId());
    await expect(Backend.deleteUser({ user_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(user_id, 'user')
    });
  });
});

describe('::deleteSession', () => {
  it('deletes a session by session_id', async () => {
    expect.hasAssertions();

    const sessionsDb = await getSessionsDb();

    await expect(
      sessionsDb.countDocuments({ _id: itemToObjectId(dummyAppData.sessions[0]) })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteSession({ session_id: itemToStringId(dummyAppData.sessions[0]) })
    ).resolves.toBeUndefined();

    await expect(
      sessionsDb.countDocuments({ _id: itemToObjectId(dummyAppData.sessions[0]) })
    ).resolves.toBe(0);
  });

  test('deleting a session is reflected in system info', async () => {
    expect.hasAssertions();

    // * Doing a wee bit of cheating here by using the getInfo() function

    await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toHaveProperty(
      'sessions',
      dummyActiveSessions.length
    );

    await expect(
      Backend.deleteSession({ session_id: itemToStringId(dummyActiveSessions[0]) })
    ).resolves.toBeUndefined();

    await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toHaveProperty(
      'sessions',
      dummyActiveSessions.length - 1
    );
  });

  it('rejects if the session_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteSession({ session_id: 'does-not-exist' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.deleteSession({ session_id: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('session_id', 'parameter')
    });

    const session_id = itemToStringId(new ObjectId());
    await expect(Backend.deleteSession({ session_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(session_id, 'session')
    });
  });
});

describe('::deleteOpportunity', () => {
  it('deletes an opportunity by opportunity_id', async () => {
    expect.hasAssertions();

    const opportunitiesDb = await getOpportunitiesDb();

    await expect(
      opportunitiesDb.countDocuments({
        _id: itemToObjectId(dummyAppData.opportunities[0])
      })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteOpportunity({
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toBeUndefined();

    await expect(
      opportunitiesDb.countDocuments({
        _id: itemToObjectId(dummyAppData.opportunities[0])
      })
    ).resolves.toBe(0);
  });

  test('deleting an opportunity is reflected in system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'opportunities',
      dummyAppData.opportunities.length
    );

    await expect(
      Backend.deleteOpportunity({
        opportunity_id: itemToStringId(dummyAppData.opportunities[0])
      })
    ).resolves.toBeUndefined();

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'opportunities',
      dummyAppData.opportunities.length - 1
    );
  });

  it('rejects if the opportunity_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteOpportunity({ opportunity_id: 'does-not-exist' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.deleteOpportunity({ opportunity_id: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('opportunity_id', 'parameter')
    });

    const opportunity_id = itemToStringId(new ObjectId());
    await expect(Backend.deleteOpportunity({ opportunity_id })).rejects.toMatchObject(
      {
        message: ErrorMessage.ItemNotFound(opportunity_id, 'opportunity')
      }
    );
  });
});

describe('::deleteArticle', () => {
  it('deletes an article by article_id', async () => {
    expect.hasAssertions();

    const articlesDb = await getArticlesDb();

    await expect(
      articlesDb.countDocuments({
        _id: itemToObjectId(dummyAppData.articles[0])
      })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteArticle({
        article_id: itemToStringId(dummyAppData.articles[0])
      })
    ).resolves.toBeUndefined();

    await expect(
      articlesDb.countDocuments({
        _id: itemToObjectId(dummyAppData.articles[0])
      })
    ).resolves.toBe(0);
  });

  test('deleting an article is reflected in system info', async () => {
    expect.hasAssertions();

    const infoDb = await getInfoDb();

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'articles',
      dummyAppData.articles.length
    );

    await expect(
      Backend.deleteArticle({
        article_id: itemToStringId(dummyAppData.articles[0])
      })
    ).resolves.toBeUndefined();

    await expect(infoDb.findOne()).resolves.toHaveProperty(
      'articles',
      dummyAppData.articles.length - 1
    );
  });

  it('rejects if the article_id is undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteArticle({ article_id: 'does-not-exist' })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.deleteArticle({ article_id: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('article_id', 'parameter')
    });

    const article_id = itemToStringId(new ObjectId());
    await expect(Backend.deleteArticle({ article_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(article_id, 'article')
    });
  });
});

describe('::deleteUserConnection', () => {
  it('deletes a connection between two users', async () => {
    expect.hasAssertions();

    const usersDb = await getUsersDb();
    const userZeroId = itemToObjectId(dummyAppData.users[0]);
    const userTwoId = itemToObjectId(dummyAppData.users[2]);

    const { connections: connections1 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { connections: connections2 } =
      (await usersDb.findOne({ _id: userTwoId })) || toss(new TrialError());

    expect(connections1.some((id) => id.equals(userTwoId))).toBeTrue();
    expect(connections2.some((id) => id.equals(userZeroId))).toBeTrue();

    await expect(
      Backend.deleteUserConnection({
        user_id: itemToStringId(userZeroId),
        connection_id: itemToStringId(userTwoId)
      })
    ).resolves.toBeUndefined();

    const { connections: connections3 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { connections: connections4 } =
      (await usersDb.findOne({ _id: userTwoId })) || toss(new TrialError());

    expect(connections3.some((id) => id.equals(userTwoId))).toBeFalse();
    expect(connections4.some((id) => id.equals(userZeroId))).toBeFalse();
  });

  it("updates both users' updatedAt property", async () => {
    expect.hasAssertions();

    const expectedUpdatedAt = mockDateNowMs + 10 ** 5;

    jest.spyOn(Date, 'now').mockImplementation(() => expectedUpdatedAt);

    const usersDb = await getUsersDb();
    const userZeroId = itemToObjectId(dummyAppData.users[0]);
    const userTwoId = itemToObjectId(dummyAppData.users[2]);

    const { updatedAt: updatedAt1 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { updatedAt: updatedAt2 } =
      (await usersDb.findOne({ _id: userTwoId })) || toss(new TrialError());

    expect(updatedAt1).not.toBe(expectedUpdatedAt);
    expect(updatedAt2).not.toBe(expectedUpdatedAt);

    await expect(
      Backend.deleteUserConnection({
        user_id: itemToStringId(userZeroId),
        connection_id: itemToStringId(userTwoId)
      })
    ).resolves.toBeUndefined();

    const { updatedAt: updatedAt3 } =
      (await usersDb.findOne({ _id: userZeroId })) || toss(new TrialError());

    const { updatedAt: updatedAt4 } =
      (await usersDb.findOne({ _id: userTwoId })) || toss(new TrialError());

    expect(updatedAt3).toBe(expectedUpdatedAt);
    expect(updatedAt4).toBe(expectedUpdatedAt);
  });

  it('rejects if user_id or connection_id are undefined, invalid, or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteUserConnection({
        user_id: 'does-not-exist',
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.deleteUserConnection({
        user_id: undefined,
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('user_id', 'parameter')
    });

    const user_id = itemToStringId(new ObjectId());

    await expect(
      Backend.deleteUserConnection({
        user_id,
        connection_id: itemToStringId(dummyAppData.users[0])
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(user_id, 'user')
    });

    await expect(
      Backend.deleteUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id: 'does-not-exist'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('does-not-exist')
    });

    await expect(
      Backend.deleteUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('connection_id', 'parameter')
    });

    const connection_id = itemToStringId(new ObjectId());

    await expect(
      Backend.deleteUserConnection({
        user_id: itemToStringId(dummyAppData.users[0]),
        connection_id
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(connection_id, 'user')
    });

    await expect(
      Backend.deleteUserConnection({
        user_id: connection_id,
        connection_id
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(connection_id, 'user')
    });
  });
});

describe('::authAppUser', () => {
  it('returns true iff application-level key matches', async () => {
    expect.hasAssertions();

    await expect(
      Backend.authAppUser({
        user_id: itemToStringId(dummyAppData.users[0]),
        key: dummyAppData.users[0].key
      })
    ).resolves.toBeTrue();

    await expect(
      Backend.authAppUser({
        user_id: itemToStringId(dummyAppData.users[0]),
        key: 'bad'
      })
    ).resolves.toBeFalse();
  });

  it('returns false if application-level key is empty, null, or undefined', async () => {
    expect.hasAssertions();

    await expect(
      Backend.authAppUser({ user_id: itemToStringId(dummyAppData.users[0]), key: '' })
    ).resolves.toBeFalse();

    await expect(
      Backend.authAppUser({
        user_id: itemToStringId(dummyAppData.users[0]),
        key: null as unknown as undefined
      })
    ).resolves.toBeFalse();

    await expect(
      Backend.authAppUser({
        user_id: itemToStringId(dummyAppData.users[0]),
        key: undefined
      })
    ).resolves.toBeFalse();
  });
});

test('system info is updated when users, sessions, opportunities, and articles are successfully created, updated, and deleted', async () => {
  expect.hasAssertions();

  // * Emphasis on success! Failed things should not alter counts!

  const expectedV1SystemInfo = toPublicInfo(dummyAppData.info[0], {
    activeSessionCount: dummyActiveSessions.length,
    allowArticles: false
  });

  const expectedV2SystemInfo = toPublicInfo(dummyAppData.info[0], {
    activeSessionCount: dummyActiveSessions.length,
    allowArticles: true
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    expectedV1SystemInfo
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    expectedV2SystemInfo
  );

  await Backend.createUser({
    apiVersion: 1,
    __provenance: 'fake-owner',
    data: {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'inner'
    } as NewUser
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      users: expectedV1SystemInfo.users + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      users: expectedV1SystemInfo.users + 1
    }
  );

  // * Ensure failures don't alter system info
  await expect(
    Backend.createUser({
      apiVersion: 1,
      __provenance: 'fake-owner',
      data: {
        username: 'duplicate-email',
        email: 'new-user@email.com',
        key: '0'.repeat(getEnv().USER_KEY_LENGTH),
        salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
        type: 'inner'
      } as NewUser
    })
  ).rejects.toMatchObject({ message: ErrorMessage.DuplicateFieldValue('email') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      users: expectedV1SystemInfo.users + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      users: expectedV1SystemInfo.users + 1
    }
  );

  await Backend.createSession({
    apiVersion: 1,
    __provenance: 'fake-owner',
    data: {
      user_id: null,
      view: 'auth',
      viewed_id: null
    } as NewSession
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      users: expectedV1SystemInfo.users + 1,
      sessions: expectedV1SystemInfo.sessions + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      users: expectedV1SystemInfo.users + 1,
      sessions: expectedV1SystemInfo.sessions + 1
    }
  );

  await Backend.createOpportunity({
    apiVersion: 1,
    __provenance: 'fake-owner',
    data: {
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0]),
      title: 'title'
    } as NewOpportunity
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      users: expectedV1SystemInfo.users + 1,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      users: expectedV1SystemInfo.users + 1,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await Backend.createArticle({
    __provenance: 'fake-owner',
    data: {
      contents: '',
      creator_id: itemToStringId(dummyAppData.users[0]),
      title: 'title',
      keywords: []
    } as NewArticle
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      users: expectedV1SystemInfo.users + 1,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      users: expectedV1SystemInfo.users + 1,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1,
      articles: expectedV2SystemInfo.articles! + 1
    }
  );

  // * Begin deletes

  await Backend.deleteUser({ user_id: itemToStringId(dummyAppData.users[0]) });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1,
      // ? The deleted user had 1 article + 1 one created above = -2 + 1 = -1
      articles: expectedV2SystemInfo.articles! - 1
    }
  );

  // * Ensure failures don't alter system info
  await expect(
    Backend.deleteUser({ user_id: itemToStringId(dummyAppData.users[0]) })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      sessions: expectedV1SystemInfo.sessions + 1,
      opportunities: expectedV1SystemInfo.opportunities + 1,
      articles: expectedV2SystemInfo.articles! - 1
    }
  );

  await Backend.deleteSession({ session_id: itemToStringId(dummyActiveSessions[0]) });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      opportunities: expectedV1SystemInfo.opportunities + 1,
      articles: expectedV2SystemInfo.articles! - 1
    }
  );

  // * Ensure failures don't alter system info
  await expect(
    Backend.deleteSession({ session_id: itemToStringId(dummyActiveSessions[0]) })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV1SystemInfo,
      opportunities: expectedV1SystemInfo.opportunities + 1
    }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      opportunities: expectedV1SystemInfo.opportunities + 1,
      articles: expectedV2SystemInfo.articles! - 1
    }
  );

  await Backend.deleteOpportunity({
    opportunity_id: itemToStringId(dummyAppData.opportunities[0])
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    expectedV1SystemInfo
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      articles: expectedV2SystemInfo.articles! - 1
    }
  );

  // * Ensure failures don't alter system info
  await expect(
    Backend.deleteOpportunity({
      opportunity_id: itemToStringId(dummyAppData.opportunities[0])
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    expectedV1SystemInfo
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      articles: expectedV2SystemInfo.articles! - 1
    }
  );

  await Backend.deleteArticle({
    article_id: itemToStringId(dummyAppData.articles[1])
  });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    expectedV1SystemInfo
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    { ...expectedV2SystemInfo, articles: expectedV2SystemInfo.articles! - 2 }
  );

  // * Ensure failures don't alter system info
  await expect(
    Backend.deleteArticle({
      article_id: itemToStringId(dummyAppData.articles[0])
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    expectedV1SystemInfo
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    { ...expectedV2SystemInfo, articles: expectedV2SystemInfo.articles! - 2 }
  );

  // * Ensure failures don't alter system info
  await expect(
    Backend.deleteArticle({
      article_id: itemToStringId(dummyAppData.articles[1])
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    expectedV1SystemInfo
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    { ...expectedV2SystemInfo, articles: expectedV2SystemInfo.articles! - 2 }
  );

  // * Begin updates

  await Backend.updateUser({
    apiVersion: 1,
    user_id: itemToStringId(dummyAppData.users[1]),
    data: { views: 'increment' }
  });

  // * Ensure failures don't alter system info
  await expect(
    Backend.updateUser({
      apiVersion: 1,
      user_id: itemToStringId(dummyAppData.articles[1]),
      data: { views: 'increment' }
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  // * Ensure failures don't alter system info
  await expect(
    Backend.updateUser({
      apiVersion: 1,
      user_id: itemToStringId(dummyAppData.users[1]),
      data: { views: 'increment', email: dummyAppData.users[2].email }
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('already exists') });

  await Backend.updateOpportunity({
    opportunity_id: itemToStringId(dummyAppData.opportunities[1]),
    data: { views: 'increment' }
  });

  // * Ensure failures don't alter system info
  await expect(
    Backend.updateOpportunity({
      opportunity_id: itemToStringId(dummyAppData.articles[1]),
      data: { views: 'increment' }
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await Backend.updateArticle({
    article_id: itemToStringId(dummyAppData.articles[2]),
    data: { views: 'increment' }
  });

  // * Ensure failures don't alter system info
  await expect(
    Backend.updateArticle({
      article_id: itemToStringId(dummyAppData.users[1]),
      data: { views: 'increment' }
    })
  ).rejects.toMatchObject({ message: expect.stringContaining('not found') });

  await expect(Backend.getInfo({ apiVersion: 1 })).resolves.toStrictEqual<PublicInfo>(
    { ...expectedV1SystemInfo, views: expectedV1SystemInfo.views + 3 }
  );

  await expect(Backend.getInfo({ apiVersion: 2 })).resolves.toStrictEqual<PublicInfo>(
    {
      ...expectedV2SystemInfo,
      views: expectedV1SystemInfo.views + 3,
      articles: expectedV2SystemInfo.articles! - 2
    }
  );
});
