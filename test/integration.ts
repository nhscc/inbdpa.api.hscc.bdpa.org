import { name as pkgName } from 'package';
import assert from 'node:assert';
import { toss } from 'toss-expression';
import { ObjectId } from 'mongodb';
import debugFactory from 'debug';

import { GuruMeditationError, ValidationError } from 'universe/error';
import { defaultNavLinks } from 'universe/backend';
import { getEnv } from 'universe/backend/env';

import {
  type NewPage,
  type PatchBlog,
  type PatchPage,
  type PublicBlog,
  type PublicInfo,
  type PublicPage,
  type PublicPageMetadata,
  type NewUser,
  type PatchUser,
  type PublicUser,
  toPublicUser
} from 'universe/backend/db';

import { dummyAppData } from 'testverse/db';

import type { Promisable } from 'type-fest';
import type { NextApiHandlerMixin } from 'testverse/util';

// TODO: XXX: turn a lot of this into some kind of package; needs to be generic
// TODO: XXX: enough to handle various use cases though :) Maybe
// TODO: XXX: @xunnamius/fable for the generic version, along with
// TODO: XXX: @xunnamius/fable-next, @xunnamius/fable-next-api (below),
// TODO: XXX: @xunnamius/fable-X plugins. Initial version of @xunnamius/fable
// TODO: XXX: would just be the next API version.

// TODO: XXX: add an `id` param that allows getResultAt using that `id` (along
// TODO: XXX:  with index)

// TODO: XXX: document functionality: RUN_ONLY='#, ##,###,...'
// TODO: XXX: "fail fast" should be optional

const debug = debugFactory(`${pkgName}:integration-fixtures`);

/**
 * A single test result stored in `memory`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TestResult<T = any> = {
  status: number;
  json: T | undefined;
};

/**
 * Stored results from past fixtures runs made available for future fixtures
 * runs via `memory`.
 */
export type TestResultset = TestResult[] & {
  /**
   * A property containing a mapping between optional test ids and their
   * results.
   */
  idMap: Record<string, TestResult>;
  /**
   * A property containing the most previous resultset.
   */
  latest: TestResult;
  /**
   * Get the HTTP response status and json result from previously run tests by
   * index. You can pass a negative index to begin counting backwards from the
   * current test. Tests are zero-indexed, i.e. use `getResultAt(0)` to refer to
   * the very first resultset. `getResultAt(1)` will return the second
   * resultset. `getResultAt(-1)` will return the immediately previous resultset
   * (same as what the `latest` property returns).
   *
   * @param index Specify a previous test result index starting at 1 (not zero!)
   */
  getResultAt<T = unknown>(index: number): TestResult<T>;
  getResultAt<T = unknown>(index: number, prop: string): T;
  getResultAt<T = unknown>(index: string): TestResult<T>;
  getResultAt<T = unknown>(index: string, prop: string): T;
};

/**
 * Represents a test that executes an HTTP request and evaluate the response
 * for correctness.
 */
export type TestFixture = {
  /**
   * An optional id that can be used to reference the result from this fixture
   * directly as opposed to by index.
   *
   * @example getResultAt('my-id') === getResultAt(22)
   */
  id?: string;
  /**
   * If `invisible === true`, the test is not counted when generating positional
   * fixtures.
   *
   * @default false
   */
  invisible?: boolean;
  /**
   * The test index X (as in "#X") that is reported to the user when a test
   * fails.
   */
  displayIndex: number;
  /**
   * A very brief couple of words added to the end of the test title.
   */
  subject?: string;
  /**
   * The handler under test.
   */
  handler?: NextApiHandlerMixin;
  /**
   * The method of the mock request.
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /**
   * Represents mock "processed" dynamic route components and query params.
   */
  params?:
    | Record<string, string | string[]>
    | ((
        previousResults: TestResultset
      ) => Promisable<Record<string, string | string[]>>);
  /**
   * The body of the mock request. Automatically stringified.
   */
  body?:
    | Record<string, unknown>
    | ((previousResults: TestResultset) => Promisable<Record<string, unknown>>);
  /**
   * The expected shape of the HTTP response.
   */
  response?: {
    /**
     * The expected response status. If status !== 200, we expect `json.success`
     * to be `false`. Otherwise, we expect it to be `true`. All status-related
     * checks are skipped if a callback is provided that returns `undefined`.
     */
    status?:
      | number
      | ((
          status: number,
          previousResults: TestResultset
        ) => Promisable<number | undefined>);
    /**
     * The expected JSON response body. No need to test for `success` as that is
     * handled automatically (unless a status callback was used and it returned
     * `undefined`). Jest async matchers are also supported. All json-related
     * checks are skipped if a callback is provided that returns `undefined` or
     * `json` itself is `undefined`.
     */
    json?:
      | Record<string, unknown>
      | jest.AsymmetricMatcher
      | ((
          json: Record<string, unknown> | undefined,
          previousResults: TestResultset
        ) => Promisable<
          Record<string, unknown> | jest.AsymmetricMatcher | undefined
        >);
  };
};

export function getFixtures(api: typeof import('testverse/util').api): TestFixture[] {
  // TODO: delete next line in real implementation
  assert(dummyAppData.users[2].username);

  const runOnly = process.env.RUN_ONLY?.split(',')
    .flatMap((n) => {
      const range = n
        .split('-')
        .map((m) => Number.parseInt(m))
        .filter((m) => !Number.isNaN(m));

      const min = Math.min(...range);
      const max = Math.max(...range);

      debug(`min: ${min}`);
      debug(`max: ${max}`);
      debug(`range: ${range}`);

      if (!(0 < min && min <= max && max < Number.POSITIVE_INFINITY)) {
        throw new ValidationError(`invalid RUN_ONLY range "${min}-${max}"`);
      } else {
        const finalRange = Array.from({ length: max - min + 1 }).map(
          (_, ndx) => min + ndx
        );
        debug(`final range: ${finalRange}`);
        return finalRange;
      }
    })
    .sort((a, b) => a - b);

  // TODO: add headers property to TestFixture

  // * Note: user passwords are their usernames
  const fixtures: Omit<TestFixture, 'displayIndex'>[] = [
    // * Creating, retrieving, authenticating, updating, and deleting users
    {
      id: 'user-hillary',
      subject: 'create new blogger user "the-hill" (h@hillaryclinton.com)',
      handler: api.v1.users,
      method: 'POST',
      body: {
        username: 'the-hill',
        email: 'h@hillaryclinton.com',
        key: '3ffd270e595ef1e485437d90e788d2965acb602a7412f50760140304f4b1f039998ee471de8ddb7c3115f3dee86ba487a213be9604db0ef23ccb99414e47d452',
        salt: 'd63a897a76ece8b9a503913db68c95af',
        blogName: 'the-hill',
        type: 'blogger'
      } satisfies NewUser,
      response: {
        status: 200,
        json: {
          user: {
            user_id: expect.any(String),
            username: 'the-hill',
            email: 'h@hillaryclinton.com',
            salt: 'd63a897a76ece8b9a503913db68c95af',
            type: 'blogger',
            banned: false,
            blogName: 'the-hill'
          } satisfies PublicUser
        }
      }
    },
    {
      subject: 'verify user the-hill can be fetched',
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: 'the-hill' },
      method: 'GET',
      response: {
        status: 200,
        json: (_json, { getResultAt }) => {
          return { user: getResultAt('user-hillary', 'user') };
        }
      }
    },
    {
      subject: 'verify the-hill appears in LIFO list of all users',
      handler: api.v1.users,
      method: 'GET',
      response: {
        status: 200,
        json: (_json, { getResultAt }) => {
          return {
            users: [
              getResultAt('user-hillary', 'user'),
              ...dummyAppData.users
                .slice()
                .reverse()
                .map((u) => toPublicUser(u))
            ]
          };
        }
      }
    },
    {
      subject: 'update the-hill (salt, key, and banned)',
      handler: api.v1.usersUsernameoremail,
      method: 'PATCH',
      params: { usernameOrEmail: 'the-hill' },
      body: {
        salt: '2a9e8128c6641c2fe7642abd14b09e14',
        key: '8df1042284e5cc64ff722e473bba9deebb7ef06927c96a004faa1f4dc60f3b1c01fc42612f495cd91ac7041060860b4626e6a5af04b6e31104e6f896b4e3d153',
        banned: true
      } satisfies PatchUser,
      response: { status: 200 }
    },
    {
      id: 'updated-user-hillary',
      subject: 'verify the-hill was updated',
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: 'the-hill' },
      method: 'GET',
      response: {
        status: 200,
        json: {
          user: expect.objectContaining({
            salt: '2a9e8128c6641c2fe7642abd14b09e14',
            banned: true
          })
        }
      }
    },
    {
      subject: 'authenticate the-hill',
      handler: api.v1.usersUsernameoremailAuth,
      method: 'POST',
      params: { usernameOrEmail: 'the-hill' },
      body: {
        key: '8df1042284e5cc64ff722e473bba9deebb7ef06927c96a004faa1f4dc60f3b1c01fc42612f495cd91ac7041060860b4626e6a5af04b6e31104e6f896b4e3d153'
      },
      response: { status: 200 }
    },
    {
      subject: 'authenticate the-hill case-insensitively',
      handler: api.v1.usersUsernameoremailAuth,
      method: 'POST',
      params: { usernameOrEmail: 'the-hill' },
      body: {
        key: '8DF1042284E5CC64FF722E473BBA9DEEBB7EF06927C96A004FAA1F4DC60F3B1C01FC42612F495CD91AC7041060860B4626E6A5AF04B6E31104E6F896B4E3D153'
      },
      response: { status: 200 }
    },
    {
      subject: 'attempt to authenticate the-hill with bad key',
      handler: api.v1.usersUsernameoremailAuth,
      method: 'POST',
      params: { usernameOrEmail: 'the-hill' },
      body: { key: 'x' },
      response: { status: 403 }
    },
    {
      subject: 'attempt to update a non-existent user',
      handler: api.v1.usersUsernameoremail,
      method: 'PATCH',
      params: { usernameOrEmail: 'does-not-exist' },
      body: { username: 'should-not-be-seen' },
      response: { status: 404 }
    },
    {
      subject: 'attempt to delete a non-existent user',
      handler: api.v1.usersUsernameoremail,
      method: 'DELETE',
      params: { usernameOrEmail: 'does-not-exist' },
      response: { status: 404 }
    },
    {
      subject: `delete ${dummyAppData.users[0].email}`,
      handler: api.v1.usersUsernameoremail,
      method: 'DELETE',
      params: { usernameOrEmail: dummyAppData.users[0].email },
      response: { status: 200 }
    },
    {
      subject: `verify ${dummyAppData.users[0].email} is not present in LIFO list of all users`,
      handler: api.v1.users,
      method: 'GET',
      response: {
        status: 200,
        json: (_json, { getResultAt }) => {
          return {
            users: [
              getResultAt<PublicUser>('updated-user-hillary', 'user'),
              ...dummyAppData.users
                .slice(1)
                .reverse()
                .map((u) => toPublicUser(u))
            ]
          };
        }
      }
    },
    {
      subject: `verify ${dummyAppData.users[0].email} cannot be fetched`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[0].email },
      method: 'GET',
      response: { status: 404 }
    },
    {
      id: 'user-obama',
      subject: 'create new administrator user "baracko" (o@barackobama.com)',
      handler: api.v1.users,
      method: 'POST',
      body: {
        username: 'baracko',
        email: 'o@barackobama.com',
        key: 'ac4ab7f9f19fb198a0e1ec3c3970d8b8a2a47e19127a988c02299807210927dfb915d66af69f4a8b53c7610b31604eed6ebe0273a9dc73831892a86250082ebf',
        salt: 'e1a3593dbf0ff964292398251f3b47ad',
        type: 'administrator'
      } satisfies NewUser,
      response: {
        status: 200,
        json: {
          user: {
            user_id: expect.any(String),
            username: 'baracko',
            email: 'o@barackobama.com',
            salt: 'e1a3593dbf0ff964292398251f3b47ad',
            type: 'administrator'
          } satisfies PublicUser
        }
      }
    },
    {
      subject: 'attempt to create another user named "baracko"',
      handler: api.v1.users,
      method: 'POST',
      body: {
        username: 'baracko',
        email: 'xyz@abc.def',
        key: 'ac4ab7f9f19fb198a0e1ec3c3970d8b8a2a47e19127a988c02299807210927dfb915d66af69f4a8b53c7610b31604eed6ebe0273a9dc73831892a86250082ebf',
        salt: 'e1a3593dbf0ff964292398251f3b47ad',
        type: 'blogger',
        blogName: 'the-o-blog'
      } satisfies NewUser,
      response: { status: 400 }
    },
    {
      subject: 'attempt to create a user with a duplicate email',
      handler: api.v1.users,
      method: 'POST',
      body: {
        username: 'xyz-abc',
        email: 'o@barackobama.com',
        key: 'ac4ab7f9f19fb198a0e1ec3c3970d8b8a2a47e19127a988c02299807210927dfb915d66af69f4a8b53c7610b31604eed6ebe0273a9dc73831892a86250082ebf',
        salt: 'e1a3593dbf0ff964292398251f3b47ad',
        type: 'administrator'
      } satisfies NewUser,
      response: { status: 400 }
    },
    {
      subject: 'attempt to create a user with a duplicate blogName',
      handler: api.v1.users,
      method: 'POST',
      body: ({ getResultAt }) =>
        ({
          username: 'xyz-abc',
          email: 'xyz@abc.com',
          key: 'ac4ab7f9f19fb198a0e1ec3c3970d8b8a2a47e19127a988c02299807210927dfb915d66af69f4a8b53c7610b31604eed6ebe0273a9dc73831892a86250082ebf',
          salt: 'e1a3593dbf0ff964292398251f3b47ad',
          type: 'blogger',
          blogName: getResultAt('updated-user-hillary', 'user.blogName')
        } satisfies NewUser),
      response: { status: 400 }
    },
    {
      subject: 'verify baracko can be fetched',
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: 'baracko' },
      method: 'GET',
      response: {
        status: 200,
        json: (_json, { getResultAt }) => {
          return { user: getResultAt('user-obama', 'user') };
        }
      }
    },
    {
      subject: 'verify baracko appears in LIFO list of all users',
      handler: api.v1.users,
      method: 'GET',
      response: {
        status: 200,
        json: (_json, { getResultAt }) => {
          return {
            users: [
              getResultAt('user-obama', 'user'),
              getResultAt<PublicUser>('updated-user-hillary', 'user'),
              ...dummyAppData.users
                .slice(1)
                .reverse()
                .map((u) => toPublicUser(u))
            ]
          };
        }
      }
    },
    {
      subject: 'attempt to update baracko with bad salt',
      handler: api.v1.usersUsernameoremail,
      method: 'PATCH',
      params: { usernameOrEmail: 'baracko' },
      body: {
        salt: '2',
        key: 'dfb915d66af69f4a8b53c7610b31604eed6e2a47e19127a988c022998072109273831892a86250082ebfbe0273a9dc7ac4ab7f9f19fb198a0e1ec3c3970d8b8a'
      } satisfies PatchUser,
      response: { status: 400 }
    },
    {
      subject: 'attempt to update baracko with bad key',
      handler: api.v1.usersUsernameoremail,
      method: 'PATCH',
      params: { usernameOrEmail: 'baracko' },
      body: {
        salt: '2a9e8128c6641c2fe7642abd14b09e14',
        key: 'a'
      } satisfies PatchUser,
      response: { status: 400 }
    },
    {
      subject: 'attempt to update baracko salt without key',
      handler: api.v1.usersUsernameoremail,
      method: 'PATCH',
      params: { usernameOrEmail: 'baracko' },
      body: { salt: '2a9e8128c6641c2fe7642abd14b09e14' } satisfies PatchUser,
      response: { status: 400 }
    },
    {
      subject: 'attempt to update baracko key without salt',
      handler: api.v1.usersUsernameoremail,
      method: 'PATCH',
      params: { usernameOrEmail: 'baracko' },
      body: {
        key: 'dfb915d66af69f4a8b53c7610b31604eed6e2a47e19127a988c022998072109273831892a86250082ebfbe0273a9dc7ac4ab7f9f19fb198a0e1ec3c3970d8b8a'
      } satisfies PatchUser,
      response: { status: 400 }
    },
    {
      subject: 'verify baracko was not updated',
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: 'baracko' },
      method: 'GET',
      response: {
        status: 200,
        json(_json, { getResultAt }) {
          return { user: getResultAt('user-obama', 'user') };
        }
      }
    },
    {
      subject: 'authenticate baracko',
      handler: api.v1.usersUsernameoremailAuth,
      method: 'POST',
      params: { usernameOrEmail: 'baracko' },
      body: {
        key: 'ac4ab7f9f19fb198a0e1ec3c3970d8b8a2a47e19127a988c02299807210927dfb915d66af69f4a8b53c7610b31604eed6ebe0273a9dc73831892a86250082ebf'
      },
      response: { status: 200 }
    },
    {
      subject: 'attempt to authenticate baracko with no key',
      handler: api.v1.usersUsernameoremailAuth,
      method: 'POST',
      params: { usernameOrEmail: 'baracko' },
      body: { key: undefined },
      response: { status: 403 }
    },
    {
      subject: 'attempt to fetch all users in LIFO order using bad after_id',
      handler: api.v1.users,
      method: 'GET',
      params: { after: 'bad-id' },
      response: { status: 400 }
    },
    {
      subject: 'attempt to fetch all users in LIFO order using non-existent after_id',
      handler: api.v1.users,
      method: 'GET',
      params: { after: new ObjectId().toString() },
      response: { status: 404 }
    },
    {
      subject: `attempt to update deleted ${dummyAppData.users[0].email}`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[0].email },
      method: 'PATCH',
      body: { email: 'some@new.email' },
      response: { status: 404 }
    },
    {
      subject: `attempt to update ${dummyAppData.users[2].username} using a bad email`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[2].username },
      method: 'PATCH',
      body: { email: 'bad email address' },
      response: { status: 400 }
    },
    {
      subject: `attempt to update ${dummyAppData.users[2].username} using a too-long email`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[2].username },
      method: 'PATCH',
      body: { email: 'x'.repeat(getEnv().MAX_USER_EMAIL_LENGTH) + '@aol.com' },
      response: { status: 400 }
    },
    {
      subject: `attempt to update ${dummyAppData.users[2].username} using a short non-hex salt`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[2].username },
      method: 'PATCH',
      body: { salt: 'xyz' },
      response: { status: 400 }
    },
    {
      subject: `attempt to update ${dummyAppData.users[2].username} using a short non-hex key`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[2].username },
      method: 'PATCH',
      body: { key: 'xyz' },
      response: { status: 400 }
    },
    {
      subject: `attempt to update ${dummyAppData.users[2].username} using an empty request body`,
      handler: api.v1.usersUsernameoremail,
      params: { usernameOrEmail: dummyAppData.users[2].username },
      method: 'PATCH',
      body: {},
      response: { status: 400 }
    },
    {
      subject: 'fetch all users in LIFO order using pagination',
      handler: api.v1.users,
      method: 'GET',
      params: ({ getResultAt }) => {
        return { after: getResultAt<string>('updated-user-hillary', 'user.user_id') };
      },
      response: {
        status: 200,
        json: {
          users: dummyAppData.users
            .slice(1)
            .reverse()
            .map((u) => toPublicUser(u))
        }
      }
    },

    // * Retrieving and patching a blog
    {
      subject: 'fetch the-hill blog',
      handler: api.v1.blogsBlogname,
      method: 'GET',
      params: { blogName: 'the-hill' },
      response: {
        status: 200,
        json: {
          blog: {
            name: 'the-hill',
            rootPage: 'home',
            navLinks: defaultNavLinks,
            createdAt: expect.any(Number)
          } satisfies PublicBlog
        }
      }
    },
    {
      subject: 'update the-hill blog name',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-hill' },
      body: {
        name: 'the-new-hill'
      } satisfies PatchBlog,
      response: { status: 200 }
    },
    {
      subject: 'update the-new-hill blog rootPage to non-existent page name',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: {
        rootPage: 'dne'
      } satisfies PatchBlog,
      response: { status: 200 }
    },
    {
      subject: 'update the-new-hill blog navLinks',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: {
        navLinks: []
      } satisfies PatchBlog,
      response: { status: 200 }
    },
    {
      subject: 'verify the-new-hill blog has been updated',
      id: 'updated-blog-hill',
      handler: api.v1.blogsBlogname,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: {
          blog: {
            name: 'the-new-hill',
            rootPage: 'dne',
            navLinks: [],
            createdAt: expect.any(Number)
          } satisfies PublicBlog
        }
      }
    },
    {
      subject: 'attempt to update the-new-hill blog navLinks with bad href',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: { navLinks: [{ href: null, text: 'illegal' }] },
      response: { status: 400 }
    },
    {
      subject: 'attempt to update the-new-hill blog navLinks with empty href',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: {
        navLinks: [{ href: '', text: 'illegal' }]
      } satisfies PatchBlog,
      response: { status: 400 }
    },
    {
      subject: 'attempt to update the-new-hill blog navLinks with malformed href',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: {
        navLinks: [{ href: '#illegal', text: 'illegal' }]
      } satisfies PatchBlog,
      response: { status: 400 }
    },
    {
      subject: 'attempt to update the-new-hill blog navLinks with bad text',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: { navLinks: [{ href: 'legal', text: 5 }] },
      response: { status: 400 }
    },
    {
      subject: 'attempt to update the-new-hill blog navLinks with empty text',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: {
        navLinks: [{ href: 'legal', text: '' }]
      } satisfies PatchBlog,
      response: { status: 400 }
    },
    {
      subject:
        'attempt to update the-new-hill blog navLinks with empty object element',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: { navLinks: [{}] },
      response: { status: 400 }
    },
    {
      subject: 'attempt to update the-new-hill blog navLinks with null element',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: { navLinks: [null] },
      response: { status: 400 }
    },
    {
      subject: 'attempt to update the-new-hill blog rootPage to an empty string',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: { rootPage: '' },
      response: { status: 400 }
    },
    {
      subject: 'verify the-new-hill blog has not been updated',
      handler: api.v1.blogsBlogname,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: (_json, { getResultAt }) => {
          return { blog: getResultAt<PublicBlog>('updated-blog-hill', 'blog') };
        }
      }
    },
    {
      subject:
        'update the-new-hill blog navLinks with both protocol-relative and page name hrefs with query strings and fragments',
      handler: api.v1.blogsBlogname,
      method: 'PATCH',
      params: { blogName: 'the-new-hill' },
      body: {
        navLinks: [
          { href: '//google.com', text: 'google-1' },
          { href: '//google.com#fragment', text: 'google-2' },
          { href: '//google.com?query-string', text: 'google-3' },
          { href: 'page-name?query=string#fragment', text: 'page-1' },
          { href: 'page-name', text: 'page-2' }
        ]
      } satisfies PatchBlog,
      response: { status: 200 }
    },
    {
      subject: 'verify the-new-hill blog has been updated',
      id: 'updated-blog-hill',
      handler: api.v1.blogsBlogname,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: {
          blog: {
            name: 'the-new-hill',
            rootPage: 'dne',
            navLinks: [
              { href: '//google.com', text: 'google-1' },
              { href: '//google.com#fragment', text: 'google-2' },
              { href: '//google.com?query-string', text: 'google-3' },
              { href: 'page-name?query=string#fragment', text: 'page-1' },
              { href: 'page-name', text: 'page-2' }
            ],
            createdAt: expect.any(Number)
          } satisfies PublicBlog
        }
      }
    },

    // * Creating, retrieving, updating, and deleting pages; retrieving the page
    // * metadata of a blog
    {
      subject: 'verify the-new-hill blog page metadata',
      id: 'updated-blog-hill',
      handler: api.v1.blogsBlogname,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: {
          blog: {
            name: 'the-new-hill',
            rootPage: 'dne',
            navLinks: [
              { href: '//google.com', text: 'google-1' },
              { href: '//google.com#fragment', text: 'google-2' },
              { href: '//google.com?query-string', text: 'google-3' },
              { href: 'page-name?query=string#fragment', text: 'page-1' },
              { href: 'page-name', text: 'page-2' }
            ],
            createdAt: expect.any(Number)
          } satisfies PublicBlog
        }
      }
    },
    {
      subject: 'create new the-new-hill blog page "new-page"',
      handler: api.v1.blogsBlognamePages,
      method: 'POST',
      params: { blogName: 'the-new-hill' },
      body: {
        name: 'new-page',
        contents: ''
      } satisfies NewPage,
      response: {
        status: 200,
        json: {
          page: {
            name: 'new-page',
            contents: '',
            totalViews: 0,
            createdAt: expect.any(Number)
          } satisfies PublicPage
        }
      }
    },
    {
      subject:
        'create new the-new-hill blog page "new-page-2" with the same contents',
      handler: api.v1.blogsBlognamePages,
      method: 'POST',
      params: { blogName: 'the-new-hill' },
      body: {
        name: 'new-page-2',
        contents: ''
      } satisfies NewPage,
      response: {
        status: 200,
        json: {
          page: {
            name: 'new-page-2',
            contents: '',
            totalViews: 0,
            createdAt: expect.any(Number)
          } satisfies PublicPage
        }
      }
    },
    {
      subject: 'attempt to create a new the-new-hill blog page with the same name',
      handler: api.v1.blogsBlognamePages,
      method: 'POST',
      params: { blogName: 'the-new-hill' },
      body: {
        name: 'new-page-2',
        contents: '# Another New Page'
      } satisfies NewPage,
      response: { status: 400 }
    },
    {
      subject: 'verify blog metadata #1',
      handler: api.v1.blogsBlognamePages,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: {
          pages: [
            { name: 'new-page-2', totalViews: 0, createdAt: expect.any(Number) },
            { name: 'new-page', totalViews: 0, createdAt: expect.any(Number) },
            { name: 'home', totalViews: 0, createdAt: expect.any(Number) }
          ] satisfies PublicPageMetadata[]
        }
      }
    },
    {
      subject: 'retrieve page new-page',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      response: {
        status: 200,
        json: {
          page: {
            name: 'new-page',
            createdAt: expect.any(Number),
            contents: '',
            totalViews: 0
          } satisfies PublicPage
        }
      }
    },
    {
      subject: 'attempt to update new-page totalViews with an invalid value',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'PATCH',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      body: { totalViews: 1 },
      response: { status: 400 }
    },
    {
      subject: 'attempt to update new-page contents with a value that is too large',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'PATCH',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      body: {
        contents: 'x'.repeat(getEnv().MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES + 1)
      } satisfies PatchPage,
      response: { status: 400 }
    },
    {
      subject: 'verify page new-page was not updated',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      response: {
        status: 200,
        json: {
          page: {
            name: 'new-page',
            createdAt: expect.any(Number),
            contents: '',
            totalViews: 0
          } satisfies PublicPage
        }
      }
    },
    {
      subject: 'update new-page contents and totalViews',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'PATCH',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      body: { totalViews: 'increment' } satisfies PatchPage,
      response: { status: 200 }
    },
    {
      subject:
        'update new-page contents with a value pushing up against the length limit',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'PATCH',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      body: { contents: 'x'.repeat(getEnv().MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES) },
      response: { status: 200 }
    },
    {
      subject: 'verify page new-page was updated',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      response: {
        status: 200,
        json: {
          page: {
            name: 'new-page',
            createdAt: expect.any(Number),
            contents: 'x'.repeat(getEnv().MAX_BLOG_PAGE_CONTENTS_LENGTH_BYTES),
            totalViews: 1
          } satisfies PublicPage
        }
      }
    },
    {
      subject: 'verify blog metadata #2',
      handler: api.v1.blogsBlognamePages,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: {
          pages: [
            { name: 'new-page-2', totalViews: 0, createdAt: expect.any(Number) },
            { name: 'new-page', totalViews: 1, createdAt: expect.any(Number) },
            { name: 'home', totalViews: 0, createdAt: expect.any(Number) }
          ] satisfies PublicPageMetadata[]
        }
      }
    },
    {
      subject: 'delete new-page',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'DELETE',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      response: { status: 200 }
    },
    {
      subject: 'verify new-page was deleted',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      response: { status: 404 }
    },
    {
      subject: 'attempt to delete non-existent page',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'DELETE',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      response: { status: 404 }
    },
    {
      subject: 'attempt to update non-existent page',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'PATCH',
      params: { blogName: 'the-new-hill', pageName: 'new-page' },
      body: { totalViews: 'increment' } satisfies PatchPage,
      response: { status: 404 }
    },
    {
      subject: 'verify blog metadata #3',
      handler: api.v1.blogsBlognamePages,
      method: 'GET',
      params: { blogName: 'the-new-hill' },
      response: {
        status: 200,
        json: {
          pages: [
            { name: 'new-page-2', totalViews: 0, createdAt: expect.any(Number) },
            { name: 'home', totalViews: 0, createdAt: expect.any(Number) }
          ] satisfies PublicPageMetadata[]
        }
      }
    },

    // * Creating, updating (renewing), and deleting (manually expiring)
    // * sessions; retrieving a page's active session count
    {
      subject: 'verify no sessions associated with new-page',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { active: 0 }
      }
    },
    {
      id: 'session-new',
      subject: 'create new session associated with new-page-2 #1',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'POST',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { session_id: expect.any(String) }
      }
    },
    {
      subject: 'verify sessions associated with new-page-2',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { active: 1 }
      }
    },
    {
      subject: 'renew the new session',
      handler: api.v1.blogsBlognamePagesPagenameSessionsSessionid,
      method: 'PUT',
      params: ({ getResultAt }) => ({
        blogName: 'the-new-hill',
        pageName: 'new-page-2',
        session_id: getResultAt<string>('session-new', 'session_id')
      }),
      response: { status: 200 }
    },
    {
      subject: 'create new session associated with new-page-2 #2',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'POST',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { session_id: expect.any(String) }
      }
    },
    {
      subject: 'create new session associated with new-page-2 #3',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'POST',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { session_id: expect.any(String) }
      }
    },
    {
      subject: 'verify sessions associated with new-page-2',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { active: 3 }
      }
    },
    {
      subject: 'delete the first new session',
      handler: api.v1.blogsBlognamePagesPagenameSessionsSessionid,
      method: 'DELETE',
      params: ({ getResultAt }) => ({
        blogName: 'the-new-hill',
        pageName: 'new-page-2',
        session_id: getResultAt<string>('session-new', 'session_id')
      }),
      response: { status: 200 }
    },
    {
      subject: 'verify sessions associated with new-page-2',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { active: 2 }
      }
    },
    {
      subject: 'attempt to delete non-existent session',
      handler: api.v1.blogsBlognamePagesPagenameSessionsSessionid,
      method: 'DELETE',
      params: ({ getResultAt }) => ({
        blogName: 'the-new-hill',
        pageName: 'new-page-2',
        session_id: getResultAt<string>('session-new', 'session_id')
      }),
      response: { status: 404 }
    },
    {
      subject: 'attempt to renew non-existent session',
      handler: api.v1.blogsBlognamePagesPagenameSessionsSessionid,
      method: 'PUT',
      params: ({ getResultAt }) => ({
        blogName: 'the-new-hill',
        pageName: 'new-page-2',
        session_id: getResultAt<string>('session-new', 'session_id')
      }),
      response: { status: 404 }
    },
    {
      subject: 'attempt to delete session using bad session_id',
      handler: api.v1.blogsBlognamePagesPagenameSessionsSessionid,
      method: 'DELETE',
      params: {
        blogName: 'the-new-hill',
        pageName: 'new-page-2',
        session_id: 'bad'
      },
      response: { status: 400 }
    },
    {
      subject: 'attempt to renew session using bad session_id',
      handler: api.v1.blogsBlognamePagesPagenameSessionsSessionid,
      method: 'PUT',
      params: {
        blogName: 'the-new-hill',
        pageName: 'new-page-2',
        session_id: 'bad'
      },
      response: { status: 400 }
    },
    {
      subject: 'verify sessions associated with new-page-2',
      handler: api.v1.blogsBlognamePagesPagenameSessions,
      method: 'GET',
      params: { blogName: 'the-new-hill', pageName: 'new-page-2' },
      response: {
        status: 200,
        json: { active: 2 }
      }
    },

    // * Reported system information actively updates in response to API events
    {
      id: 'initial-info',
      subject: 'verify reported system information #1',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 1,
            pages: dummyAppData.info[0].pages + 2,
            users: dummyAppData.info[0].users + 1
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'add administrator user "test-admin"',
      handler: api.v1.users,
      method: 'POST',
      body: {
        username: 'test-admin',
        email: 'test-admin@email.com',
        key: '60140304f4b1f039998ee471de8ddb7c3102a7412f50787a213be9604db0ef23ccb99414e47d45215f3dee86ba43ffd270e595ef1e485437d90e788d2965acb6',
        salt: 'e8b9a503913db68c95afd63a897a76ec',
        type: 'administrator'
      } satisfies NewUser,
      response: { status: 200 }
    },
    {
      subject: 'verify reported system information #2',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 1,
            pages: dummyAppData.info[0].pages + 2,
            users: dummyAppData.info[0].users + 2
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'add blogger user "test-blogger"',
      handler: api.v1.users,
      method: 'POST',
      body: {
        username: 'test-blogger',
        email: 'test-blogger@email.com',
        key: '60140304f4b1f039998ee471de8ddb7c3102a7412f50787a213be9604db0ef23ccb99414e47d45215f3dee86ba43ffd270e595ef1e485437d90e788d2965acb6',
        salt: 'e8b9a503913db68c95afd63a897a76ec',
        type: 'blogger',
        blogName: 'test-blogger'
      } satisfies NewUser,
      response: { status: 200 }
    },
    {
      subject: 'verify reported system information #3',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 2,
            pages: dummyAppData.info[0].pages + 3,
            users: dummyAppData.info[0].users + 3
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'add page "test-page" to test-blogger',
      handler: api.v1.blogsBlognamePages,
      method: 'POST',
      params: { blogName: 'test-blogger' },
      body: { name: 'test-page', contents: '# Test Blog' } satisfies NewPage,
      response: { status: 200 }
    },
    {
      subject: 'verify reported system information #4',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 2,
            pages: dummyAppData.info[0].pages + 4,
            users: dummyAppData.info[0].users + 3
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'attempt to add duplicate user',
      handler: api.v1.users,
      method: 'POST',
      params: { blogName: 'test-blogger' },
      body: {
        username: 'test-blogger',
        email: 'test-blogger@email.com',
        key: '60140304f4b1f039998ee471de8ddb7c3102a7412f50787a213be9604db0ef23ccb99414e47d45215f3dee86ba43ffd270e595ef1e485437d90e788d2965acb6',
        salt: 'e8b9a503913db68c95afd63a897a76ec',
        type: 'blogger',
        blogName: 'test-blogger'
      } satisfies NewUser,
      response: { status: 400 }
    },
    {
      subject: 'attempt to add duplicate page',
      handler: api.v1.blogsBlognamePages,
      method: 'POST',
      params: { blogName: 'test-blogger' },
      body: { name: 'test-page', contents: '# Test Blog' } satisfies NewPage,
      response: { status: 400 }
    },
    {
      subject: 'verify reported system information #5',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 2,
            pages: dummyAppData.info[0].pages + 4,
            users: dummyAppData.info[0].users + 3
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'attempt to remove non-existent page',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'DELETE',
      params: { blogName: 'test-blogger', pageName: 'non-existent-page' },
      response: { status: 404 }
    },
    {
      subject: 'attempt to remove non-existent user',
      handler: api.v1.usersUsernameoremail,
      method: 'DELETE',
      params: { usernameOrEmail: 'does-not-exist' },
      response: { status: 404 }
    },
    {
      subject: 'verify reported system information #6',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 2,
            pages: dummyAppData.info[0].pages + 4,
            users: dummyAppData.info[0].users + 3
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'remove test-page from test-blogger',
      handler: api.v1.blogsBlognamePagesPagename,
      method: 'DELETE',
      params: { blogName: 'test-blogger', pageName: 'test-page' },
      response: { status: 200 }
    },
    {
      subject: 'verify reported system information #7',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 2,
            pages: dummyAppData.info[0].pages + 3,
            users: dummyAppData.info[0].users + 3
          } satisfies PublicInfo
        }
      }
    },
    {
      subject: 'remove test-blogger user',
      handler: api.v1.usersUsernameoremail,
      method: 'DELETE',
      params: { usernameOrEmail: 'test-blogger' },
      response: { status: 200 }
    },
    {
      subject: 'remove test-admin user',
      handler: api.v1.usersUsernameoremail,
      method: 'DELETE',
      params: { usernameOrEmail: 'test-admin' },
      response: { status: 200 }
    },
    {
      subject: 'verify reported system information has returned to initial values',
      handler: api.v1.info,
      method: 'GET',
      response: {
        status: 200,
        json: {
          info: {
            blogs: dummyAppData.info[0].blogs + 1,
            pages: dummyAppData.info[0].pages + 2,
            users: dummyAppData.info[0].users + 1
          } satisfies PublicInfo
        }
      }
    }
  ];

  // TODO: XXX: ability to specify "depends" via index or name/id vv
  // TODO: XXX: ability to specify "dependents" key to reverse-map the above ^^

  const willSkipFixture = (fixture: (typeof fixtures)[number]) => {
    const shouldSkip =
      !fixture.subject ||
      !fixture.handler ||
      !fixture.method ||
      (!fixture.invisible &&
        (!fixture.response ||
          !['number', 'function'].includes(typeof fixture.response.status)));

    return shouldSkip;
  };

  const filteredFixtures = fixtures.filter<TestFixture>(
    (fixture, ndx): fixture is TestFixture => {
      const displayIndex = ndx + 1;

      if (runOnly && !runOnly.includes(displayIndex)) {
        return false;
      }

      (fixture as TestFixture).displayIndex = !runOnly
        ? displayIndex
        : runOnly.shift() ??
          toss(new GuruMeditationError('ran out of RUN_ONLY indices'));

      return true;
    }
  );

  // TODO: XXX: add ability to capture/suppress output via fixture option (even better: selectively use mock plugins like withMockEnv and withMockOutput via config options)

  // TODO: XXX: with @xunnamius/fable, have an "every X" type construct (the below is "every reqPerContrived")
  // TODO: XXX: also allow middleware
  // TODO: XXX: also custom props for fixtures

  const reqPerContrived = getEnv().REQUESTS_PER_CONTRIVED_ERROR;

  if (reqPerContrived) {
    for (let index = 0, noSkipCount = 0; index < filteredFixtures.length; index++) {
      if (
        !willSkipFixture(filteredFixtures[index]) &&
        noSkipCount++ % reqPerContrived === 0
      ) {
        filteredFixtures.splice(index, 0, {
          displayIndex: -1,
          subject: 'handle contrived',
          handler: api.v1.users,
          method: 'POST',
          body: {},
          response: {
            status: 555,
            json: { error: expect.stringContaining('contrived') }
          }
        });
      }
    }
  }

  return filteredFixtures;
}
