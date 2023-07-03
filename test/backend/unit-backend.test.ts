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
  type PublicSession,
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

    assert(dummyAppData.users[0].username !== null);

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

    assert(dummyAppData.users[0].username !== null);

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

  it('creating a user is reflected in the system info', async () => {
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

    assert(dummyAppData.users[0].username);

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
          key: '0'.repeat(keyLength)
        } as NewUser,
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

  it('creating a session is reflected in the system info', async () => {
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

// TODO: createOpportunity/createArticle creator_id needs to be checked for existence
describe('::createOpportunity', () => {
  it('creates and returns a new blog page', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newPage: NewPage = {
      name: 'contact',
      contents: '# Contact us\n\nA contact form goes here!'
    };

    await expect(
      Backend.createPage({
        blogName: dummyAppData.users[3].blogName,
        __provenance,
        data: newPage
      })
    ).resolves.toStrictEqual<PublicPage>({
      name: newPage.name!,
      createdAt: mockDateNowMs,
      totalViews: 0,
      contents: newPage.contents!
    });

    await expect(
      (await getDb({ name: 'app' }))
        .collection('pages')
        .countDocuments({ blog_id: dummyAppData.users[3]._id, ...newPage })
    ).resolves.toBe(1);
  });

  it('allows creation of empty pages', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createPage({
        blogName: dummyAppData.users[3].blogName,
        __provenance: 'fake-owner',
        data: {
          name: 'new-page',
          contents: ''
        }
      })
    ).resolves.toBeDefined();

    await expect(
      (await getDb({ name: 'app' }))
        .collection('pages')
        .countDocuments({ __provenance: 'fake-owner' })
    ).resolves.toBe(1);
  });

  it('allows creation of pages with duplicate pageName on different blogs', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createPage({
        blogName: dummyAppData.users[3].blogName,
        __provenance: 'fake-owner',
        data: {
          name: dummyAppData.pages[0].name,
          contents: '# Duplicate page name diff blog'
        }
      })
    ).resolves.toBeDefined();

    await expect(
      (await getDb({ name: 'app' }))
        .collection('pages')
        .countDocuments({ __provenance: 'fake-owner' })
    ).resolves.toBe(1);
  });

  it('rejects when attempting to create a page with a duplicate pageName on same blog', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createPage({
        blogName: dummyAppData.users[2].blogName,
        __provenance: 'fake-owner',
        data: {
          name: dummyAppData.pages[0].name,
          contents: '# Duplicate page name same blog'
        }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.DuplicateFieldValue('pageName')
    });
  });

  it('rejects when creating a page would put user over MAX_USER_BLOG_PAGES', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        await expect(
          Backend.createPage({
            blogName: dummyAppData.users[2].blogName,
            __provenance: 'fake-owner',
            data: {
              name: 'new-page',
              contents: '# A brand new page'
            }
          })
        ).rejects.toMatchObject({
          message: ErrorMessage.TooMany('pages', getEnv().MAX_USER_BLOG_PAGES)
        });
      },
      { MAX_USER_BLOG_PAGES: '2' },
      { replace: false }
    );
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createPage({
        blogName: dummyAppData.users[2].blogName,
        __provenance: undefined as unknown as string,
        data: {
          name: 'new-page',
          contents: '# A brand new page'
        }
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid provenance/)
    });
  });

  it('rejects if blogName not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createPage({
        blogName: 'does-not-exist',
        __provenance: 'fake-owner',
        data: {
          name: 'new-page',
          contents: '# A brand new page'
        }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound('does-not-exist', 'blog')
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();
    // TODO: rejects on bad/too long/too short name
    // TODO: rejects on bad/too long/too short contents

    const {
      MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES: maxCLength,
      MAX_BLOG_PAGE_NAME_LENGTH: maxNLength
    } = getEnv();

    const newPages: [Parameters<typeof Backend.createPage>[0]['data'], string][] = [
      [undefined as unknown as NewPage, ErrorMessage.InvalidJSON()],
      ['string data', ErrorMessage.InvalidJSON()],
      [
        {} as NewPage,
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ],
      [
        { contents: null as unknown as string },
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ],
      [
        { contents: 5 as unknown as string },
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ],
      [
        { contents: 'x'.repeat(maxCLength + 1) },
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ],
      [
        { contents: '', name: null as unknown as string },
        ErrorMessage.InvalidStringLength('name', 1, maxNLength, 'alphanumeric')
      ],
      [
        { contents: '', name: '' },
        ErrorMessage.InvalidStringLength('name', 1, maxNLength, 'alphanumeric')
      ],
      [
        { contents: '', name: 'x'.repeat(maxNLength + 1) },
        ErrorMessage.InvalidStringLength('name', 1, maxNLength, 'alphanumeric')
      ],
      [
        { contents: '', name: 'not-@lphanumeric' },
        ErrorMessage.InvalidStringLength('name', 1, maxNLength, 'alphanumeric')
      ],
      [
        { contents: '', name: 'not alphanumeric' },
        ErrorMessage.InvalidStringLength('name', 1, maxNLength, 'alphanumeric')
      ],
      [
        { contents: '', name: 'name', email: 'x@x.x' } as unknown as NewPage,
        ErrorMessage.UnknownField('email')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newPages, (data) =>
      Backend.createPage({
        data,
        __provenance: 'fake-owner',
        blogName: dummyAppData.users[2].blogName
      })
    );
  });
});

describe('::createArticle', () => {
  it('todo', () => {
    expect.hasAssertions();
  });
});

// TODO: also updates updatedAt
describe('::createUserConnection', () => {
  it('todo', () => {
    expect.hasAssertions();
  });
});

// TODO: also updates updatedAt
describe('::updateUser', () => {
  it('updates an existing user by username', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].username);
    assert(dummyAppData.users[2].type === 'blogger');

    const usersDb = (await getDb({ name: 'app' })).collection('users');

    const patchUser: PatchUser = {
      email: 'fake@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      banned: true
    };

    await expect(
      usersDb.countDocuments({
        username: dummyAppData.users[2].username,
        ...patchUser
      })
    ).resolves.toBe(0);

    await expect(
      Backend.updateUser({
        usernameOrEmail: dummyAppData.users[2].username,
        data: patchUser
      })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({
        username: dummyAppData.users[2].username,
        ...patchUser
      })
    ).resolves.toBe(1);
  });

  it('updates an existing user by email', async () => {
    expect.hasAssertions();

    const usersDb = (await getDb({ name: 'app' })).collection('users');

    const patchUser: PatchUser = {
      email: 'fake@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH)
    };

    await expect(
      usersDb.countDocuments({
        email: dummyAppData.users[0].email,
        ...patchUser
      })
    ).resolves.toBe(0);

    await expect(
      Backend.updateUser({
        usernameOrEmail: dummyAppData.users[0].email,
        data: patchUser
      })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({
        email: dummyAppData.users[0].email,
        ...patchUser
      })
    ).resolves.toBe(1);
  });

  it('rejects if no data passed in', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateUser({
        usernameOrEmail: dummyAppData.users[0].email,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.EmptyJSONBody()
    });
  });

  it('rejects if attempting to update user with incorrect params for type', async () => {
    expect.hasAssertions();

    assert(dummyAppData.users[0].type === 'administrator');
    assert(dummyAppData.users[2].type === 'blogger');

    await expect(
      Backend.updateUser({
        usernameOrEmail: dummyAppData.users[2].email,
        data: { banned: true }
      })
    ).resolves.toBeUndefined();

    await expect(
      Backend.updateUser({
        usernameOrEmail: dummyAppData.users[0].email,
        data: { banned: true }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.UnknownField('banned')
    });
  });

  it('rejects if the username or email undefined or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateUser({
        usernameOrEmail: 'fake-user',
        data: {
          email: 'fake@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH)
        }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound('fake-user', 'user')
    });

    await expect(
      Backend.updateUser({
        usernameOrEmail: undefined,
        data: {
          email: 'fake@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH)
        }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('usernameOrEmail', 'parameter')
    });
  });

  it('rejects when attempting to update a user to a duplicate email', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[1].username);

    await expect(
      Backend.updateUser({
        usernameOrEmail: dummyAppData.users[1].username,
        data: {
          email: dummyAppData.users[0].email
        }
      })
    ).rejects.toMatchObject({ message: ErrorMessage.DuplicateFieldValue('email') });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const {
      MIN_USER_EMAIL_LENGTH: minELength,
      MAX_USER_EMAIL_LENGTH: maxELength,
      USER_SALT_LENGTH: saltLength,
      USER_KEY_LENGTH: keyLength
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
      assert(dummyAppData.users[0].username);
      return Backend.updateUser({
        usernameOrEmail: dummyAppData.users[0].username,
        data
      });
    });

    await expectExceptionsWithMatchingErrors(
      [
        [
          { banned: 'true' as unknown as boolean },
          ErrorMessage.InvalidFieldValue('banned', 'true', ['true', 'false'])
        ],
        [
          { banned: null as unknown as boolean },
          ErrorMessage.InvalidFieldValue('banned', null, ['true', 'false'])
        ]
      ],
      (data) => {
        return Backend.updateUser({
          usernameOrEmail: dummyAppData.users[2].email,
          data
        });
      }
    );
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

// TODO: also updates updatedAt
describe('::updateOpportunity', () => {
  it('updates an existing page', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].blogName);

    const usersDb = (await getDb({ name: 'app' })).collection('users');
    const { blogName } = dummyAppData.users[2];

    const patchBlog: PatchBlog = {
      name: 'new-name',
      navLinks: [{ href: '//google.com', text: 'new google link' }],
      rootPage: 'contact'
    };

    await expect(
      usersDb.countDocuments({ _id: dummyAppData.users[2]._id, blogName: 'new-name' })
    ).resolves.toBe(0);

    await expect(
      Backend.updateBlog({
        blogName,
        data: patchBlog
      })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({
        _id: dummyAppData.users[2]._id,
        blogName: 'new-name',
        navLinks: patchBlog.navLinks,
        blogRootPage: patchBlog.rootPage
      })
    ).resolves.toBe(1);
  });

  it('allows updating navLinks to an empty array', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].blogName);

    const usersDb = (await getDb({ name: 'app' })).collection('users');
    const { blogName, _id } = dummyAppData.users[2];

    await expect(usersDb.countDocuments({ _id, navLinks: [] })).resolves.toBe(0);

    await expect(
      Backend.updateBlog({
        blogName,
        data: { navLinks: [] }
      })
    ).resolves.toBeUndefined();

    await expect(usersDb.countDocuments({ _id, navLinks: [] })).resolves.toBe(1);
  });

  it('rejects if no data passed in', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateBlog({
        blogName: dummyAppData.users[2].blogName,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.EmptyJSONBody()
    });
  });

  it('rejects if the blogName undefined or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateBlog({
        blogName: 'dne',
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound('dne', 'blog')
    });

    await expect(
      Backend.updateBlog({
        blogName: undefined,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });

  it('rejects when attempting to update a blog to a duplicate blogName', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updateBlog({
        blogName: dummyAppData.users[2].blogName,
        data: { name: dummyAppData.users[3].blogName }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.DuplicateFieldValue('blogName')
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const {
      MAX_BLOG_NAME_LENGTH: maxBLength,
      MAX_NAV_LINK_HREF_LENGTH: maxHLength,
      MAX_NAV_LINK_TEXT_LENGTH: maxTLength
    } = getEnv();

    const patchBlogs: [Parameters<typeof Backend.updateBlog>[0]['data'], string][] = [
      [undefined as unknown as PatchBlog, ErrorMessage.InvalidJSON()],
      ['string data' as PatchBlog, ErrorMessage.InvalidJSON()],
      [
        {
          name: 'not alphanumeric'
        },
        ErrorMessage.InvalidStringLength('name', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          name: 'not-@lphanumeric'
        },
        ErrorMessage.InvalidStringLength('name', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          name: null as unknown as string
        },
        ErrorMessage.InvalidStringLength('name', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          name: 'x'.repeat(maxBLength + 1)
        },
        ErrorMessage.InvalidStringLength('name', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          name: ''
        },
        ErrorMessage.InvalidStringLength('name', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          rootPage: 'not alphanumeric'
        },
        ErrorMessage.InvalidStringLength('rootPage', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          rootPage: 'not-@lphanumeric'
        },
        ErrorMessage.InvalidStringLength('rootPage', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          rootPage: null as unknown as string
        },
        ErrorMessage.InvalidStringLength('rootPage', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          rootPage: 'x'.repeat(maxBLength + 1)
        },
        ErrorMessage.InvalidStringLength('rootPage', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          rootPage: ''
        },
        ErrorMessage.InvalidStringLength('rootPage', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          navLinks: null as unknown as NavigationLink[]
        },
        ErrorMessage.InvalidFieldValue('navLinks')
      ],
      [
        {
          navLinks: '[]' as unknown as NavigationLink[]
        },
        ErrorMessage.InvalidFieldValue('navLinks')
      ],
      [
        {
          navLinks: [null as unknown as NavigationLink]
        },
        ErrorMessage.InvalidArrayValue('navLinks', 'null')
      ],
      [
        {
          navLinks: [{ href: '//', text: 'yes' }, null as unknown as NavigationLink]
        },
        ErrorMessage.InvalidArrayValue('navLinks', 'null')
      ],
      [
        {
          navLinks: [new Date(Date.now()) as unknown as NavigationLink]
        },
        ErrorMessage.InvalidArrayValue(
          'navLinks',
          JSON.stringify(new Date(Date.now()))
        )
      ],
      [
        {
          navLinks: [
            { href: '//', text: 'yes', bad: 'bad' } as unknown as NavigationLink
          ]
        },
        ErrorMessage.InvalidArrayValue(
          'navLinks',
          JSON.stringify({ href: '//', text: 'yes', bad: 'bad' })
        )
      ],
      [
        {
          navLinks: [{ href: '//' } as unknown as NavigationLink]
        },
        ErrorMessage.InvalidArrayValue('navLinks', JSON.stringify({ href: '//' }))
      ],
      [
        {
          navLinks: [{ href: '+bad-link', text: 'bad' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.href', '+bad-link')
      ],
      [
        {
          navLinks: [{ href: '/bad-link', text: 'bad' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.href', '/bad-link')
      ],
      [
        {
          navLinks: [{ href: null as unknown as string, text: 'bad' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.href', 'null')
      ],
      [
        {
          navLinks: [{ href: 5 as unknown as string, text: 'bad' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.href', '5')
      ],
      [
        {
          navLinks: [{ href: 'x'.repeat(maxHLength + 1), text: 'bad' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.href', 'x'.repeat(maxHLength + 1))
      ],
      [
        {
          navLinks: [{ href: '', text: 'bad' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.href')
      ],
      [
        {
          navLinks: [{ href: '//bad', text: null as unknown as string }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.text', 'null')
      ],
      [
        {
          navLinks: [{ href: '//bad', text: 5 as unknown as string }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.text', '5')
      ],
      [
        {
          navLinks: [{ href: '//bad', text: 'x'.repeat(maxTLength + 1) }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.text', 'x'.repeat(maxTLength + 1))
      ],
      [
        {
          navLinks: [{ href: '//bad', text: '' }]
        },
        ErrorMessage.InvalidObjectKeyValue('navLink.text')
      ],
      [
        {
          navLinks: [
            { href: '//ok', text: 'ok' },
            { href: '//ok', text: 'ok' },
            { href: '//ok', text: 'ok' },
            { href: '//ok', text: 'ok' },
            { href: '//ok', text: 'ok' },
            { href: '//ok', text: 'ok' }
          ]
        },
        ErrorMessage.TooMany('navLinks', Backend.navLinkUpperLimit)
      ]
    ];

    await expectExceptionsWithMatchingErrors(patchBlogs, (data) => {
      return Backend.updateBlog({
        blogName: dummyAppData.users[2].blogName,
        data
      });
    });
  });
});

// TODO: also updates updatedAt
describe('::updateArticle', () => {
  it('updates an existing page', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].blogName);

    const pagesDb = (await getDb({ name: 'app' })).collection('pages');
    const { blogName } = dummyAppData.users[2];
    const { name: pageName, totalViews, _id } = dummyAppData.pages[0];

    const patchPage: PatchPage = {
      totalViews: 'increment',
      contents: 'new-contents'
    };

    const expectedDocument = {
      _id,
      contents: patchPage.contents,
      totalViews: totalViews + 1
    };

    await expect(pagesDb.countDocuments(expectedDocument)).resolves.toBe(0);

    await expect(
      Backend.updatePage({
        blogName,
        pageName,
        data: patchPage
      })
    ).resolves.toBeUndefined();

    await expect(pagesDb.countDocuments(expectedDocument)).resolves.toBe(1);
  });

  it('allows update to empty page contents', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].blogName);

    const pagesDb = (await getDb({ name: 'app' })).collection('pages');
    const { blogName } = dummyAppData.users[2];
    const { name: pageName, totalViews, _id } = dummyAppData.pages[0];

    const expectedDocument = {
      _id,
      contents: '',
      totalViews
    };

    await expect(pagesDb.countDocuments(expectedDocument)).resolves.toBe(0);

    await expect(
      Backend.updatePage({
        blogName,
        pageName,
        data: { contents: '' }
      })
    ).resolves.toBeUndefined();

    await expect(pagesDb.countDocuments(expectedDocument)).resolves.toBe(1);
  });

  it('allows incrementing totalViews', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].blogName);

    const pagesDb = (await getDb({ name: 'app' })).collection('pages');
    const { blogName } = dummyAppData.users[2];
    const { name: pageName, totalViews, _id } = dummyAppData.pages[0];

    const expectedDocument = {
      _id,
      totalViews: totalViews + 1
    };

    await expect(pagesDb.countDocuments(expectedDocument)).resolves.toBe(0);

    await expect(
      Backend.updatePage({
        blogName,
        pageName,
        data: { totalViews: 'increment' }
      })
    ).resolves.toBeUndefined();

    await expect(pagesDb.countDocuments(expectedDocument)).resolves.toBe(1);
  });

  it('rejects if totalViews is not the string "increment"', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name,
        data: { totalViews: 1 as unknown as 'increment' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidFieldValue('totalViews', '1', ['increment'])
    });

    await expect(
      Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name,
        data: { totalViews: null as unknown as 'increment' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidFieldValue('totalViews', null, ['increment'])
    });

    await expect(
      Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name,
        data: { totalViews: true as unknown as 'increment' }
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidFieldValue('totalViews', 'true', ['increment'])
    });
  });

  it('rejects if no data passed in', async () => {
    expect.hasAssertions();

    await expect(
      Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.EmptyJSONBody()
    });
  });

  it('rejects if blogName or pageName undefined or not found', async () => {
    expect.hasAssertions();
    const dne = 'does-not-exist';

    await expect(
      Backend.updatePage({
        blogName: dne,
        pageName: dummyAppData.pages[0].name,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'blog')
    });

    await expect(
      Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dne,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'page')
    });

    await expect(
      Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: undefined,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('pageName', 'parameter')
    });

    await expect(
      Backend.updatePage({
        blogName: undefined,
        pageName: dummyAppData.pages[0].name,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });

    await expect(
      Backend.updatePage({
        blogName: undefined,
        pageName: undefined,
        data: {}
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });

  it('rejects if data is invalid or contains properties that violate limits', async () => {
    expect.hasAssertions();

    const { MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES: maxCLength } = getEnv();

    const patchPage: [Parameters<typeof Backend.updatePage>[0]['data'], string][] = [
      [undefined as unknown as PatchPage, ErrorMessage.InvalidJSON()],
      ['string data' as PatchPage, ErrorMessage.InvalidJSON()],
      [
        {
          contents: null as unknown as string
        },
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ],
      [
        {
          contents: 5 as unknown as string
        },
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ],
      [
        {
          contents: 'x'.repeat(maxCLength + 1)
        },
        ErrorMessage.InvalidStringLength('contents', 0, maxCLength, 'bytes')
      ]
    ];

    await expectExceptionsWithMatchingErrors(patchPage, (data) => {
      return Backend.updatePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name,
        data
      });
    });
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

  it('deleting a user is reflected in system info', async () => {
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

  it('deleting a user disconnects their user_id from formerly-connected users', async () => {
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

  it('deleting a session is reflected in system info', async () => {
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

  it('deleting an opportunity is reflected in system info', async () => {
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

  it('deleting an article is reflected in system info', async () => {
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

  it("deleting a connection updates both users' updateAt property", async () => {
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

test('system info is updated when users, sessions, opportunities, and articles are successfully created and deleted', async () => {
  expect.hasAssertions();

  // TODO: emphasis on success! Failed things should not alter counts!

  const { _id, ...expectedSystemInfo } = dummyAppData.info[0];

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>(
    expectedSystemInfo
  );

  await Backend.createUser({
    __provenance: 'fake-owner',
    data: {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'blogger',
      blogName: 'blog-name'
    }
  });

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>({
    blogs: expectedSystemInfo.blogs + 1,
    pages: expectedSystemInfo.pages + 1,
    users: expectedSystemInfo.users + 1
  });

  await Backend.createPage({
    __provenance: 'fake-owner',
    blogName: 'blog-name',
    data: {
      name: 'page-name',
      contents: '# Contact us\n\nA contact form goes here!'
    }
  });

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>({
    blogs: expectedSystemInfo.blogs + 1,
    pages: expectedSystemInfo.pages + 2,
    users: expectedSystemInfo.users + 1
  });

  await Backend.createUser({
    __provenance: 'fake-owner',
    data: {
      // * We don't NEED to supply a username
      email: 'new-user-2@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'administrator'
    }
  });

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>({
    blogs: expectedSystemInfo.blogs + 1,
    pages: expectedSystemInfo.pages + 2,
    users: expectedSystemInfo.users + 2
  });

  await expect(
    Backend.deletePage({ blogName: 'blog-name', pageName: 'page-name' })
  ).resolves.toBeUndefined();

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>({
    blogs: expectedSystemInfo.blogs + 1,
    pages: expectedSystemInfo.pages + 1,
    users: expectedSystemInfo.users + 2
  });

  await expect(
    Backend.deleteUser({ usernameOrEmail: 'new-user-2@email.com' })
  ).resolves.toBeUndefined();

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>({
    blogs: expectedSystemInfo.blogs + 1,
    pages: expectedSystemInfo.pages + 1,
    users: expectedSystemInfo.users + 1
  });

  await expect(
    Backend.deleteUser({ usernameOrEmail: 'new-user' })
  ).resolves.toBeUndefined();

  await expect(Backend.getInfo()).resolves.toStrictEqual<PublicInfo>(
    expectedSystemInfo
  );
});

test('system info is updated when view counts on user profiles, opportunities, and articles are successfully updated', async () => {
  expect.hasAssertions();
  // TODO: emphasis on success! Failed things should not alter counts!
});
