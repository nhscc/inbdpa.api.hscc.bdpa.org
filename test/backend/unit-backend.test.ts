/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import assert from 'node:assert';
import { ObjectId } from 'mongodb';

import * as Backend from 'universe/backend';
import { getEnv } from 'universe/backend/env';
import { ErrorMessage } from 'universe/error';

import {
  type InternalUser,
  type InternalSession,
  type NewUser,
  type NewPage,
  type PublicUserAdministrator,
  type PublicUserBlogger,
  type PublicPage,
  type PatchUser,
  type PatchBlog,
  type PatchPage,
  type NavigationLink,
  type PublicInfo,
  userTypes,
  toPublicUser,
  toPublicPage,
  toPublicBlog
} from 'universe/backend/db';

import { mockDateNowMs, useMockDateNow } from 'multiverse/mongo-common';
import { getDb } from 'multiverse/mongo-schema';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';
import { itemToObjectId, itemToStringId } from 'multiverse/mongo-item';
import { expectExceptionsWithMatchingErrors } from 'multiverse/jest-expect-matching-errors';

import { dummyAppData } from 'testverse/db';
import { mockEnvFactory } from 'testverse/setup';

setupMemoryServerOverride();
useMockDateNow();

const withMockedEnv = mockEnvFactory({ NODE_ENV: 'test' });
const sortedUsers = dummyAppData.users.slice().reverse();

describe('::getAllUsers', () => {
  it('returns all users in order (latest first)', async () => {
    expect.hasAssertions();

    await expect(Backend.getAllUsers({ after_id: undefined })).resolves.toStrictEqual(
      sortedUsers.map((internalUser) => toPublicUser(internalUser))
    );
  });

  it('does not crash when database is empty', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getAllUsers({ after_id: undefined })
    ).resolves.not.toStrictEqual([]);

    await (await getDb({ name: 'app' })).collection('users').deleteMany({});
    await expect(Backend.getAllUsers({ after_id: undefined })).resolves.toStrictEqual(
      []
    );
  });

  it('supports pagination', async () => {
    expect.hasAssertions();

    await withMockedEnv(
      async () => {
        expect([
          await Backend.getAllUsers({ after_id: undefined }),
          await Backend.getAllUsers({
            after_id: itemToStringId(sortedUsers[0])
          }),
          await Backend.getAllUsers({
            after_id: itemToStringId(sortedUsers[1])
          }),
          await Backend.getAllUsers({
            after_id: itemToStringId(sortedUsers[2])
          }),
          await Backend.getAllUsers({
            after_id: itemToStringId(sortedUsers[3])
          })
        ]).toStrictEqual([...sortedUsers.map((user) => [toPublicUser(user)]), []]);
      },
      { RESULTS_PER_PAGE: '1' }
    );
  });

  it('rejects if after_id is not a valid ObjectId (undefined is okay)', async () => {
    expect.hasAssertions();

    await expect(Backend.getAllUsers({ after_id: 'fake-oid' })).rejects.toMatchObject(
      { message: ErrorMessage.InvalidObjectId('fake-oid') }
    );
  });

  it('rejects if after_id not found', async () => {
    expect.hasAssertions();

    const after_id = new ObjectId().toString();

    await expect(Backend.getAllUsers({ after_id })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(after_id, 'user_id')
    });
  });
});

describe('::getBlogPagesMetadata', () => {
  it('returns metadata for all pages belonging to a blog in order (latest first)', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[3].blogName);

    await expect(
      Backend.getBlogPagesMetadata({ blogName: dummyAppData.users[3].blogName })
    ).resolves.toStrictEqual(
      dummyAppData.pages
        .filter((internalPage) =>
          internalPage.blog_id.equals(dummyAppData.users[3]._id)
        )
        .reverse()
        .map((internalPage) => toPublicPage(internalPage))
    );
  });

  it('returns empty array if blog has no pages', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[3].blogName);

    await expect(
      (await getDb({ name: 'app' }))
        .collection('pages')
        .countDocuments({ blog_id: dummyAppData.users[3]._id })
    ).resolves.toBe(0);

    await expect(
      Backend.getBlogPagesMetadata({ blogName: dummyAppData.users[3].blogName })
    ).resolves.toStrictEqual([]);
  });

  it('rejects if blogName undefined or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getBlogPagesMetadata({ blogName: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });

    await expect(
      Backend.getBlogPagesMetadata({ blogName: 'dne-blog' })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound('dne-blog', 'blog')
    });
  });
});

describe('::getUser', () => {
  it('returns user by username or email', async () => {
    expect.hasAssertions();

    assert(dummyAppData.users[0].username !== null);

    await expect(
      Backend.getUser({ usernameOrEmail: dummyAppData.users[0].username })
    ).resolves.toStrictEqual(toPublicUser(dummyAppData.users[0]));
  });

  it('rejects if username/email undefined or not found', async () => {
    expect.hasAssertions();
    const usernameOrEmail = 'does-not-exist';

    await expect(Backend.getUser({ usernameOrEmail })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(usernameOrEmail, 'user')
    });

    await expect(
      Backend.getUser({ usernameOrEmail: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('usernameOrEmail', 'parameter')
    });
  });
});

describe('::getBlog', () => {
  it('returns blog by blogName', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getBlog({ blogName: dummyAppData.users[2].blogName })
    ).resolves.toStrictEqual(toPublicBlog(dummyAppData.users[2]));
  });

  it('rejects if blogName undefined or not found', async () => {
    expect.hasAssertions();
    const blogName = 'does-not-exist';

    await expect(Backend.getBlog({ blogName })).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(blogName, 'blog')
    });

    await expect(Backend.getBlog({ blogName: undefined })).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });
});

describe('::getPage', () => {
  it('returns page by blogName and pageName', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getPage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name
      })
    ).resolves.toStrictEqual(toPublicPage(dummyAppData.pages[0]));
  });

  it('rejects if pageName exists but belongs to different blog', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getPage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[1].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dummyAppData.pages[1].name, 'page')
    });
  });

  it('rejects if blogName or pageName undefined or not found', async () => {
    expect.hasAssertions();
    const dne = 'does-not-exist';

    await expect(
      Backend.getPage({ blogName: dne, pageName: dummyAppData.pages[0].name })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'blog')
    });

    await expect(
      Backend.getPage({ blogName: dummyAppData.users[2].blogName, pageName: dne })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'page')
    });

    await expect(
      Backend.getPage({
        blogName: dummyAppData.users[2].blogName,
        pageName: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('pageName', 'parameter')
    });

    await expect(
      Backend.getPage({ blogName: undefined, pageName: dummyAppData.pages[0].name })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });

    await expect(
      Backend.getPage({ blogName: undefined, pageName: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });
});

describe('::getInfo', () => {
  it('returns information about the entire system', async () => {
    expect.hasAssertions();

    const { _id, ...info } = dummyAppData.info[0];
    await expect(Backend.getInfo()).resolves.toStrictEqual(info);
  });
});

describe('::getPageSessionsCount', () => {
  it('returns the number of active entries associated with the blog page', async () => {
    expect.hasAssertions();

    await expect(
      Backend.getPageSessionsCount({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name
      })
    ).resolves.toBe(
      dummyAppData.sessions.filter((s) => {
        return (
          s.page_id.equals(dummyAppData.pages[0]._id) &&
          s.lastRenewedDate.getTime() >
            Date.now() - getEnv().SESSION_EXPIRE_AFTER_SECONDS * 1000
        );
      }).length
    );
  });

  it('rejects if blogName or pageName undefined or not found', async () => {
    expect.hasAssertions();
    const dne = 'does-not-exist';

    await expect(
      Backend.getPageSessionsCount({
        blogName: dne,
        pageName: dummyAppData.pages[0].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'blog')
    });

    await expect(
      Backend.getPageSessionsCount({
        blogName: dummyAppData.users[2].blogName,
        pageName: dne
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'page')
    });

    await expect(
      Backend.getPageSessionsCount({
        blogName: dummyAppData.users[2].blogName,
        pageName: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('pageName', 'parameter')
    });

    await expect(
      Backend.getPageSessionsCount({
        blogName: undefined,
        pageName: dummyAppData.pages[0].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });

    await expect(
      Backend.getPageSessionsCount({ blogName: undefined, pageName: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });
});

describe('::createUser', () => {
  it('creates and returns a new administrator user', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newUser: Omit<Required<NewUser>, 'blogName'> = {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'administrator'
    };

    await expect(
      Backend.createUser({ __provenance, data: newUser })
    ).resolves.toStrictEqual<PublicUserAdministrator>({
      user_id: expect.any(String),
      username: newUser.username,
      email: newUser.email,
      salt: newUser.salt,
      type: 'administrator'
    });

    await expect(
      (await getDb({ name: 'app' })).collection('users').countDocuments(newUser)
    ).resolves.toBe(1);
  });

  it('creates and returns a new blogger user', async () => {
    expect.hasAssertions();

    const __provenance = 'fake-owner';
    const newUser: Required<NewUser> = {
      username: 'new-user',
      email: 'new-user@email.com',
      key: '0'.repeat(getEnv().USER_KEY_LENGTH),
      salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
      type: 'blogger',
      blogName: 'blog-name'
    };

    await expect(
      Backend.createUser({ __provenance, data: newUser })
    ).resolves.toStrictEqual<PublicUserBlogger>({
      user_id: expect.any(String),
      username: newUser.username,
      email: newUser.email,
      salt: newUser.salt,
      type: 'blogger',
      banned: false,
      blogName: newUser.blogName
    });

    await expect(
      (await getDb({ name: 'app' })).collection('users').countDocuments(newUser)
    ).resolves.toBe(1);
  });

  it('creates default home page for and adds default navigation link to new blogger user', async () => {
    expect.hasAssertions();

    const db = await getDb({ name: 'app' });
    const usersDb = db.collection<InternalUser>('users');
    const pagesDb = db.collection<InternalPage>('pages');

    const { user_id: userId } = await Backend.createUser({
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

    await expect(
      usersDb.countDocuments({
        username: 'new-user',
        navLinks: Backend.defaultNavLinks
      })
    ).resolves.toBe(1);

    await expect(
      pagesDb.countDocuments({
        blog_id: itemToObjectId(userId),
        ...Backend.defaultHomePage
      })
    ).resolves.toBe(1);

    const { user_id: adminId } = await Backend.createUser({
      __provenance: 'fake-owner',
      data: {
        username: 'new-admin',
        email: 'new-admin@email.com',
        key: '0'.repeat(getEnv().USER_KEY_LENGTH),
        salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
        type: 'administrator'
      }
    });

    await expect(
      pagesDb.countDocuments({
        blog_id: itemToObjectId(adminId)
      })
    ).resolves.toBe(0);

    await expect(
      usersDb.countDocuments({
        _id: itemToObjectId(adminId),
        navLinks: { $exists: false }
      })
    ).resolves.toBe(1);
  });

  it('creates and returns new users without usernames', async () => {
    expect.hasAssertions();

    const usersDb = (await getDb({ name: 'app' })).collection('users');

    await expect(usersDb.countDocuments({ username: null })).resolves.toBe(1);

    await Backend.createUser({
      __provenance: 'fake-owner',
      data: {
        email: 'new-user@email.com',
        key: '0'.repeat(getEnv().USER_KEY_LENGTH),
        salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
        type: 'blogger',
        blogName: 'blog-name'
      }
    });

    await expect(usersDb.countDocuments({ username: null })).resolves.toBe(2);

    await Backend.createUser({
      __provenance: 'fake-owner',
      data: {
        email: 'new-user-2@email.com',
        key: '0'.repeat(getEnv().USER_KEY_LENGTH),
        salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
        type: 'administrator'
      }
    });

    await expect(usersDb.countDocuments({ username: null })).resolves.toBe(3);
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createUser({
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
        data: {
          username: dummyAppData.users[0].username,
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'administrator'
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.DuplicateFieldValue('username')
    });

    await expect(
      Backend.createUser({
        data: {
          username: 'new-user',
          email: dummyAppData.users[0].email,
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'blogger',
          blogName: 'some-blog'
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({ message: ErrorMessage.DuplicateFieldValue('email') });
  });

  it('rejects when attempting to create a user with a duplicate blog name', async () => {
    expect.hasAssertions();

    assert(dummyAppData.users[2].blogName !== undefined);

    await expect(
      Backend.createUser({
        data: {
          username: 'new-user',
          email: 'new-user@email.com',
          key: '0'.repeat(getEnv().USER_KEY_LENGTH),
          salt: '0'.repeat(getEnv().USER_SALT_LENGTH),
          type: 'blogger',
          blogName: dummyAppData.users[2].blogName
        },
        __provenance: 'fake-owner'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.DuplicateFieldValue('blogName')
    });
  });

  it('rejects if data is invalid or contains properties that violates limits', async () => {
    expect.hasAssertions();

    const {
      MIN_USER_NAME_LENGTH: minULength,
      MAX_USER_NAME_LENGTH: maxULength,
      MIN_USER_EMAIL_LENGTH: minELength,
      MAX_USER_EMAIL_LENGTH: maxELength,
      MAX_BLOG_NAME_LENGTH: maxBLength,
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
          username: 'x'.repeat(maxULength - 1),
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator',
          user_id: 1
        } as NewUser,
        ErrorMessage.UnknownField('user_id')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          blogName: 'some-blog'
        } as NewUser,
        ErrorMessage.InvalidFieldValue('type', undefined, userTypes)
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength)
        } as NewUser,
        ErrorMessage.InvalidFieldValue('type', undefined, userTypes)
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'administrator',
          blogName: 'some-blog'
        } as unknown as NewUser,
        ErrorMessage.UnknownField('blogName')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'blogger',
          blogName: 'not alphanumeric'
        } as NewUser,
        ErrorMessage.InvalidStringLength('blogName', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'blogger',
          blogName: 'not-@lphanumeric'
        } as NewUser,
        ErrorMessage.InvalidStringLength('blogName', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'blogger',
          blogName: null
        } as unknown as NewUser,
        ErrorMessage.InvalidStringLength('blogName', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'blogger',
          blogName: 'x'.repeat(maxBLength + 1)
        } as NewUser,
        ErrorMessage.InvalidStringLength('blogName', 1, maxBLength, 'alphanumeric')
      ],
      [
        {
          email: 'valid@email.address',
          salt: '0'.repeat(saltLength),
          key: '0'.repeat(keyLength),
          type: 'blogger',
          blogName: ''
        } as NewUser,
        ErrorMessage.InvalidStringLength('blogName', 1, maxBLength, 'alphanumeric')
      ]
    ];

    await expectExceptionsWithMatchingErrors(newUsers, (data) =>
      Backend.createUser({ data, __provenance: 'fake-owner' })
    );
  });
});

describe('::createPage', () => {
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

  it('rejects if data is invalid or contains properties that violates limits', async () => {
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

describe('::createSession', () => {
  it('creates a new session', async () => {
    expect.hasAssertions();

    const session_id = await Backend.createSession({
      blogName: dummyAppData.users[2].blogName,
      pageName: dummyAppData.pages[0].name,
      __provenance: 'fake-owner'
    });

    await expect(
      (await getDb({ name: 'app' }))
        .collection('sessions')
        .findOne({ _id: session_id })
    ).resolves.toStrictEqual<InternalSession>({
      __provenance: 'fake-owner',
      _id: expect.any(ObjectId),
      lastRenewedDate: expect.toSatisfy(
        (d) => new Date(d).getTime() === mockDateNowMs
      ),
      page_id: dummyAppData.pages[0]._id
    });
  });

  it('rejects if __provenance is not a string', async () => {
    expect.hasAssertions();

    await expect(
      Backend.createSession({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name,
        __provenance: undefined as unknown as string
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid provenance/)
    });
  });

  it('rejects if blogName or pageName undefined or not found', async () => {
    expect.hasAssertions();
    const dne = 'does-not-exist';

    await expect(
      Backend.createSession({
        __provenance: 'fake-owner',
        blogName: dne,
        pageName: dummyAppData.pages[0].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'blog')
    });

    await expect(
      Backend.createSession({
        __provenance: 'fake-owner',
        blogName: dummyAppData.users[2].blogName,
        pageName: dne
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'page')
    });

    await expect(
      Backend.createSession({
        __provenance: 'fake-owner',
        blogName: dummyAppData.users[2].blogName,
        pageName: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('pageName', 'parameter')
    });

    await expect(
      Backend.createSession({
        __provenance: 'fake-owner',
        blogName: undefined,
        pageName: dummyAppData.pages[0].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });

    await expect(
      Backend.createSession({
        __provenance: 'fake-owner',
        blogName: undefined,
        pageName: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });
});

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

  it('rejects if data is invalid or contains properties that violates limits', async () => {
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

describe('::updateBlog', () => {
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

  it('rejects if data is invalid or contains properties that violates limits', async () => {
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

describe('::updatePage', () => {
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

  it('rejects if data is invalid or contains properties that violates limits', async () => {
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

describe('::renewSession', () => {
  it('renews an existing session, preventing it from being deleted', async () => {
    expect.hasAssertions();

    const expireAfterSecondsMs = getEnv().SESSION_EXPIRE_AFTER_SECONDS * 1000;
    const sessionsDb = (await getDb({ name: 'app' })).collection<InternalSession>(
      'sessions'
    );

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
      session_id: dummyAppData.sessions[0]._id.toString()
    });

    await expect(
      sessionsDb.countDocuments({
        lastRenewedDate: {
          $gt: new Date(Date.now() - expireAfterSecondsMs)
        }
      })
    ).resolves.toBe(1);
  });

  it('rejects if session_id undefined or not found', async () => {
    expect.hasAssertions();

    const sessionId = new ObjectId().toString();

    await expect(
      Backend.renewSession({ session_id: sessionId })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(sessionId, 'session')
    });

    await expect(
      Backend.renewSession({
        session_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId(String(undefined))
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

describe('::deleteUser', () => {
  it('deletes a user by username', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[0].username !== null);

    const usersDb = (await getDb({ name: 'app' })).collection('users');

    await expect(
      usersDb.countDocuments({ _id: dummyAppData.users[0]._id })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteUser({ usernameOrEmail: dummyAppData.users[0].username })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({ _id: dummyAppData.users[0]._id })
    ).resolves.toBe(0);
  });

  it('deletes a user by email', async () => {
    expect.hasAssertions();

    const usersDb = (await getDb({ name: 'app' })).collection('users');

    await expect(
      usersDb.countDocuments({ _id: dummyAppData.users[0]._id })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteUser({ usernameOrEmail: dummyAppData.users[0].email })
    ).resolves.toBeUndefined();

    await expect(
      usersDb.countDocuments({ _id: dummyAppData.users[0]._id })
    ).resolves.toBe(0);
  });

  it('deletes all associated pages when deleting a user', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[2].username);

    const pagesDb = (await getDb({ name: 'app' })).collection('pages');

    await expect(
      pagesDb.countDocuments({ blog_id: dummyAppData.users[2]._id })
    ).resolves.toBe(2);

    await expect(
      Backend.deleteUser({ usernameOrEmail: dummyAppData.users[2].username })
    ).resolves.toBeUndefined();

    await expect(
      pagesDb.countDocuments({ blog_id: dummyAppData.users[2]._id })
    ).resolves.toBe(0);
  });

  it('does not error when attempting to delete user with no pages', async () => {
    expect.hasAssertions();
    assert(dummyAppData.users[0].username);

    const db = await getDb({ name: 'app' });

    await expect(
      Backend.deleteUser({ usernameOrEmail: dummyAppData.users[0].username })
    ).resolves.toBeUndefined();

    await expect(
      Backend.deleteUser({ usernameOrEmail: dummyAppData.users[3].email })
    ).resolves.toBeUndefined();

    await expect(db.collection('users').countDocuments()).resolves.toBe(
      dummyAppData.users.length - 2
    );

    await expect(db.collection('pages').countDocuments()).resolves.toBe(
      dummyAppData.pages.length
    );
  });

  it('rejects if the username/email undefined or not found', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteUser({ usernameOrEmail: 'does-not-exist' })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound('does-not-exist', 'user')
    });

    await expect(
      Backend.deleteUser({ usernameOrEmail: undefined })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('usernameOrEmail', 'parameter')
    });

    await expect(
      Backend.deleteUser({ usernameOrEmail: null as unknown as string })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('usernameOrEmail', 'parameter')
    });
  });
});

describe('::deletePage', () => {
  it('deletes a blog page', async () => {
    expect.hasAssertions();

    const pagesDb = (await getDb({ name: 'app' })).collection('pages');

    await expect(
      pagesDb.countDocuments({ _id: dummyAppData.pages[0]._id })
    ).resolves.toBe(1);

    await expect(
      Backend.deletePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dummyAppData.pages[0].name
      })
    ).resolves.toBeUndefined();

    await expect(
      pagesDb.countDocuments({ _id: dummyAppData.pages[0]._id })
    ).resolves.toBe(0);
  });

  it('rejects if blogName or pageName undefined or not found', async () => {
    expect.hasAssertions();
    const dne = 'does-not-exist';

    await expect(
      Backend.deletePage({
        blogName: dne,
        pageName: dummyAppData.pages[0].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'blog')
    });

    await expect(
      Backend.deletePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: dne
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(dne, 'page')
    });

    await expect(
      Backend.deletePage({
        blogName: dummyAppData.users[2].blogName,
        pageName: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('pageName', 'parameter')
    });

    await expect(
      Backend.deletePage({
        blogName: undefined,
        pageName: dummyAppData.pages[0].name
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });

    await expect(
      Backend.deletePage({
        blogName: undefined,
        pageName: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidItem('blogName', 'parameter')
    });
  });
});

describe('::deleteSession', () => {
  it('deletes a session', async () => {
    expect.hasAssertions();

    const sessionsDb = (await getDb({ name: 'app' })).collection('sessions');

    await expect(
      sessionsDb.countDocuments({ _id: dummyAppData.sessions[0]._id })
    ).resolves.toBe(1);

    await expect(
      Backend.deleteSession({
        session_id: dummyAppData.sessions[0]._id.toString()
      })
    ).resolves.toBeUndefined();

    await expect(
      sessionsDb.countDocuments({ _id: dummyAppData.sessions[0]._id })
    ).resolves.toBe(0);
  });

  it('rejects if session_id undefined or not found', async () => {
    expect.hasAssertions();

    const sessionId = new ObjectId().toString();

    await expect(
      Backend.deleteSession({ session_id: sessionId })
    ).rejects.toMatchObject({
      message: ErrorMessage.ItemNotFound(sessionId, 'session')
    });

    await expect(
      Backend.deleteSession({
        session_id: undefined
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId(String(undefined))
    });
  });

  it('rejects if session_id not a valid ObjectId', async () => {
    expect.hasAssertions();

    await expect(
      Backend.deleteSession({
        session_id: 'not-a-valid-object-id'
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidObjectId('not-a-valid-object-id')
    });
  });
});

describe('::authAppUser', () => {
  it('returns true iff application-level key matches', async () => {
    expect.hasAssertions();

    await expect(
      Backend.authAppUser({
        usernameOrEmail: 'user1',
        key: dummyAppData.users[0].key
      })
    ).resolves.toBeTrue();

    await expect(
      Backend.authAppUser({ usernameOrEmail: 'user1', key: 'bad' })
    ).resolves.toBeFalse();
  });

  it('returns false if application-level key is empty, null, or undefined', async () => {
    expect.hasAssertions();

    await expect(
      Backend.authAppUser({ usernameOrEmail: 'user1', key: '' })
    ).resolves.toBeFalse();

    await expect(
      Backend.authAppUser({
        usernameOrEmail: 'user1',
        key: null as unknown as undefined
      })
    ).resolves.toBeFalse();

    await expect(
      Backend.authAppUser({
        usernameOrEmail: 'user1',
        key: undefined
      })
    ).resolves.toBeFalse();
  });
});

test('system info is updated when users/blogs and pages are created and deleted', async () => {
  expect.hasAssertions();

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
