import assert from 'node:assert';

import { getEnv } from 'universe/backend/env';
import { getCommonSchemaConfig } from 'multiverse/mongo-common';

import type { Exact } from 'type-fest';
import type { ObjectId, WithId, WithoutId } from 'mongodb';
import type { UnixEpochMs } from '@xunnamius/types';
import type { TokenAttributes } from 'multiverse/next-auth';
import type { DbSchema } from 'multiverse/mongo-schema';

/**
 * A JSON representation of the backend Mongo database structure. This is used
 * for consistent app-wide db access across projects and to generate transient
 * versions of the db during testing.
 */
export function getSchemaConfig(): DbSchema {
  return getCommonSchemaConfig({
    databases: {
      'hscc-api-inbdpa': {
        collections: [
          {
            name: 'users',
            // ? Collation allows for case-insensitive searching. See:
            // ? https://stackoverflow.com/a/40914924/1367414
            createOptions: { collation: { locale: 'en', strength: 2 } },
            indices: [
              { spec: 'key' },
              {
                spec: 'username'
                // * Uniqueness is handled at the application level since
                // * usernames are nullable
              },
              {
                spec: 'email',
                options: { unique: true }
              },
              {
                spec: 'blogName'
                // * Uniqueness is handled at the application level since
                // * blogName could be undefined
              },
              // ? Lets us filter out account types for more optimal operations
              { spec: 'type' }
            ]
          },
          {
            name: 'pages',
            // * Order matters because blog_id is queried alone sometimes
            indices: [{ spec: ['blog_id', 'name'], options: { unique: true } }]
          },
          {
            name: 'sessions',
            indices: [
              {
                // * Order matters because this is the comparison order
                spec: ['blog_id', 'page_id']
              },
              {
                spec: 'lastRenewedDate',
                // ? When stepping through code, don't expire stuff out of db
                options: process.env.VSCODE_INSPECTOR_OPTIONS
                  ? {}
                  : { expireAfterSeconds: getEnv().SESSION_EXPIRE_AFTER_SECONDS }
              }
            ]
          },
          { name: 'info' }
        ]
      }
    },
    aliases: {
      app: 'hscc-api-inbdpa'
    }
  });
}

export type Username = string;
export type Email = string;
export type MaybeUsernameOrEmail = Username | Email | undefined;
export type TokenAttributeOwner = TokenAttributes['owner'];
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserId extends ObjectId {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PageId extends ObjectId {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SessionId extends ObjectId {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type BlogId = UserId;

/**
 * An array of valid authenticated user types.
 */
export const userTypes = ['blogger', 'administrator'] as const;

/**
 * Represents the type of authenticated user.
 */
export type UserType = (typeof userTypes)[number];

/**
 * The shape of a navigation link.
 */
export type NavigationLink = { href: string; text: string };

/**
 * The shape of a public blog page metadata object.
 */
export type PublicPageMetadata = Pick<
  InternalPage,
  'name' | 'createdAt' | 'totalViews'
>;

/**
 * The shape of an internal application user.
 */
export type InternalUser = WithId<{
  __provenance: TokenAttributeOwner;
  username: Username | null;
  salt: string;
  email: string;
  key: string;
  type: UserType;
}> &
  (
    | {
        type: 'blogger';
        createdAt: UnixEpochMs;
        blogName: string;
        blogRootPage: string;
        banned: boolean;
        navLinks: NavigationLink[];
      }
    | {
        type: 'administrator';
        createdAt?: never;
        blogName?: never;
        blogRootPage?: never;
        banned?: never;
        navLinks?: never;
      }
  );

/**
 * The shape of a public application user.
 */
export type PublicUser = PublicUserAdministrator | PublicUserBlogger;

/**
 * The shape of a public application administrator user.
 */
export type PublicUserAdministrator = Pick<
  InternalUser,
  'username' | 'salt' | 'email'
> & {
  user_id: string;
  type: 'administrator';
  blogName?: never;
  banned?: never;
};

/**
 * The shape of a public application user.
 */
export type PublicUserBlogger = Pick<InternalUser, 'username' | 'salt' | 'email'> & {
  user_id: string;
  type: 'blogger';
  blogName: InternalUser['blogName'];
  banned: InternalUser['banned'];
};

/**
 * The shape of a new application user.
 */
export type NewUser = NewUserBlogger | NewUserAdministrator;

/**
 * The shape of a new application blog user.
 */
export type NewUserBlogger = Partial<Pick<InternalUser, 'username'>> &
  Pick<InternalUser, 'salt' | 'email' | 'key'> & {
    type: 'blogger';
    blogName: string;
  };

/**
 * The shape of a new application administrator user.
 */
export type NewUserAdministrator = Partial<Pick<InternalUser, 'username'>> &
  Pick<InternalUser, 'salt' | 'email' | 'key'> & {
    type: 'administrator';
    blogName?: never;
  };

/**
 * The shape of a patch application user.
 */
export type PatchUser = PatchUserBlogger | PatchUserAdministrator;

/**
 * The shape of a patch application blogger user.
 */
export type PatchUserBlogger = Partial<
  Pick<InternalUser, 'salt' | 'email' | 'key' | 'banned'>
>;

/**
 * The shape of a patch application administrator user.
 */
export type PatchUserAdministrator = Partial<
  Pick<InternalUser, 'salt' | 'email' | 'key'> & { banned?: never }
>;

/**
 * The shape of a public blog.
 */
export type PublicBlog = Required<Pick<InternalUser, 'navLinks' | 'createdAt'>> & {
  name: NonNullable<InternalUser['blogName']>;
  rootPage: NonNullable<InternalUser['blogRootPage']>;
};

/**
 * The shape of a patch blog.
 */
export type PatchBlog = Partial<
  Pick<InternalUser, 'navLinks'> & {
    name: NonNullable<InternalUser['blogName']>;
    rootPage: NonNullable<InternalUser['blogRootPage']>;
  }
>;

/**
 * The shape of an internal blog page.
 */
export type InternalPage = WithId<{
  __provenance: TokenAttributeOwner;
  blog_id: BlogId;
  createdAt: UnixEpochMs;
  name: string;
  totalViews: number;
  contents: string;
}>;

/**
 * The shape of a public blog page.
 */
export type PublicPage = Pick<
  InternalPage,
  'contents' | 'createdAt' | 'name' | 'totalViews'
>;

/**
 * The shape of a new blog page.
 */
export type NewPage = Required<Pick<InternalPage, 'name' | 'contents'>>;

/**
 * The shape of a patch blog page.
 */
export type PatchPage = Partial<Pick<InternalPage, 'contents'>> & {
  totalViews?: 'increment';
};

/**
 * The shape of an internal active user entry.
 */
export type InternalSession = WithId<{
  __provenance: TokenAttributeOwner;
  page_id: PageId;
  lastRenewedDate: Date;
}>;

/**
 * The shape of internal info.
 */
export type InternalInfo = WithId<{
  blogs: number;
  pages: number;
  users: number;
}>;

/**
 * The shape of public info.
 */
export type PublicInfo = WithoutId<InternalInfo>;

/**
 * Transforms an internal user into a public user.
 */
export function toPublicUser(internalUser: InternalUser): PublicUser {
  const partialPublicUser: Pick<
    PublicUser,
    'user_id' | 'username' | 'email' | 'salt'
  > = {
    user_id: internalUser._id.toString(),
    username: internalUser.username,
    email: internalUser.email,
    salt: internalUser.salt
  };

  if (internalUser.type === 'blogger') {
    const result = {
      ...partialPublicUser,
      type: 'blogger' as const,
      banned: internalUser.banned,
      blogName: internalUser.blogName
    };

    return result satisfies Exact<PublicUserBlogger, typeof result>;
  } else {
    const result = {
      ...partialPublicUser,
      type: 'administrator' as const
    };

    return result satisfies Exact<PublicUserAdministrator, typeof result>;
  }
}

/**
 * Transforms an internal user into a public user.
 */
export function toPublicBlog({
  blogName,
  blogRootPage,
  navLinks,
  createdAt,
  type
}: InternalUser): PublicBlog {
  assert(type === 'blogger', 'expected type of user to be "blogger"');
  const result = {
    name: blogName,
    rootPage: blogRootPage,
    navLinks,
    createdAt
  };

  return result satisfies Exact<PublicBlog, typeof result>;
}

/**
 * Transforms an internal user into a public user.
 */
export function toPublicPage({
  contents,
  createdAt,
  name,
  totalViews
}: InternalPage): PublicPage {
  const result = {
    name,
    createdAt,
    totalViews,
    contents
  };

  return result satisfies Exact<PublicPage, typeof result>;
}

/**
 * Transforms an internal user into a public user.
 */
export function toPublicPageMetadata({
  createdAt,
  name,
  totalViews
}: InternalPage): PublicPageMetadata {
  const result = {
    name,
    createdAt,
    totalViews
  };

  return result satisfies Exact<PublicPageMetadata, typeof result>;
}

/**
 * A MongoDB cursor projection that transforms an internal user into a public
 * user.
 */
export const publicUserProjection = {
  _id: false,
  user_id: { $toString: '$_id' },
  salt: true,
  username: true,
  email: true,
  blogName: true,
  type: true,
  banned: true
} as const;

/**
 * A MongoDB cursor projection that transforms an internal user into a public
 * user.
 */
export const publicBlogProjection = {
  _id: false,
  name: '$blogName',
  rootPage: '$blogRootPage',
  navLinks: true,
  createdAt: true
} as const;

/**
 * A MongoDB cursor projection that transforms an internal user into a public
 * user.
 */
export const publicPageMetadataProjection = {
  _id: false,
  name: true,
  createdAt: true,
  totalViews: true
} as const;

/**
 * A MongoDB cursor projection that transforms an internal user into a public
 * user.
 */
export const publicPageProjection = {
  ...publicPageMetadataProjection,
  contents: true
} as const;
