import { getEnv } from 'universe/backend/env';
import { getCommonSchemaConfig } from 'multiverse/mongo-common';

import type { ObjectId, WithId, WithoutId } from 'mongodb';
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
            // ? Collation allows for case-insensitive searching. See: ?
            // https://stackoverflow.com/a/40914924/1367414
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
              // ? Lets us filter out account types for more optimal operations
              { spec: 'type' },
              // ? Lets us filter by updated timestamp
              { spec: 'updatedAt' }
            ]
          },
          {
            name: 'sessions',
            indices: [
              { spec: 'user_id' },
              { spec: 'view' },
              { spec: 'view_id' },
              {
                spec: 'lastRenewedDate',
                // ? When stepping through code, don't expire stuff out of db
                options: process.env.VSCODE_INSPECTOR_OPTIONS
                  ? {}
                  : { expireAfterSeconds: getEnv().SESSION_EXPIRE_AFTER_SECONDS }
              },
              // ? Lets us filter by updated timestamp
              { spec: 'updatedAt' }
            ]
          },
          {
            name: 'opportunities',
            indices: [
              // ? Lets us filter by updated timestamp
              { spec: 'updatedAt' }
            ]
          },
          { name: 'info' },
          {
            name: 'articles',
            indices: [
              // ? Lets us filter by updated timestamp
              { spec: 'updatedAt' }
            ]
          }
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
export type TokenAttributeOwner = TokenAttributes['owner'];
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserId extends ObjectId {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SessionId extends ObjectId {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OpportunityId extends ObjectId {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ArticleId extends ObjectId {}

/**
 * An array of valid authenticated user types.
 */
export const userTypes = ['inner', 'staff', 'administrator'] as const;

/**
 * Represents the type of authenticated user.
 */
export type UserType = (typeof userTypes)[number];

/**
 * Represents an object that tracks time.
 */
export type WithTimeTracking<T> = {
  createdAt: EpochTimeStamp;
  updatedAt: EpochTimeStamp;
} & T;

/**
 * Represents an object that counts views.
 */
export type WithViewCounts<T> = {
  views: number;
} & T;

/**
 * Represents an object that counts active sessions.
 */
export type WithSessionCounts<T> = {
  sessions: number;
} & T;

/**
 * Represents an object representing incrementing `views` by one.
 */
export type WithIncrementableViews<T> = {
  views?: 'increment';
} & T;

/**
 * Represents an object that tracks provenance.
 */
export type WithProvenance<T> = {
  __provenance: TokenAttributeOwner;
} & T;

/**
 * Represents an entry in a user section.
 */
export type UserSectionEntry = {
  title: string;
  startedAt: EpochTimeStamp;
  endedAt: EpochTimeStamp | null;
  location: string;
  description: string;
};

/**
 * Represents a collection of user sections and their entries.
 */
export type UserSectionEntries = {
  about: string | null;
  experience: UserSectionEntry[];
  education: UserSectionEntry[];
  volunteering: UserSectionEntry[];
  skills: string[];
};

/**
 * The shape of an internal application user.
 */
export type InternalUser = WithProvenance<
  WithViewCounts<
    WithTimeTracking<
      WithId<{
        salt: string;
        key: string;
        username: Username;
        email: string;
        fullName: string | null;
        type: UserType;
        sections: UserSectionEntries;
      }>
    >
  >
>;

/**
 * The shape of a public application user.
 */
export type PublicUser = WithSessionCounts<
  Pick<
    InternalUser,
    'username' | 'salt' | 'email' | 'type' | 'createdAt' | 'updatedAt'
  > & {
    user_id: string;
  }
>;

/**
 * The shape of a new application user.
 */
export type NewUser = Pick<
  InternalUser,
  'username' | 'salt' | 'email' | 'key' | 'type' | 'fullName'
>;

/**
 * The shape of a patch application user.
 */
export type PatchUser = WithIncrementableViews<
  Partial<Pick<InternalUser, 'salt' | 'email' | 'key' | 'fullName'>> & {
    sections?: Partial<UserSectionEntries>;
  }
>;

/**
 * The shape of an internal session.
 */
export type InternalSession = WithProvenance<
  WithTimeTracking<
    WithId<{
      user_id: UserId | null;
      view: 'home' | 'profile' | 'opportunity' | 'admin' | 'auth';
      viewed_id: UserId | OpportunityId | null;
      lastRenewedDate: Date;
    }>
  >
>;

/**
 * The shape of a public session.
 */
export type PublicSession = Pick<
  InternalSession,
  'view' | 'createdAt' | 'updatedAt'
> & {
  session_id: string;
  user_id: string | null;
  viewed_id: string | null;
};

/**
 * The shape of a new session.
 */
export type NewSession = Partial<
  Pick<PublicSession, 'user_id' | 'view' | 'viewed_id'>
>;

/**
 * The shape of an internal opportunity.
 */
export type InternalOpportunity = WithProvenance<
  WithViewCounts<
    WithTimeTracking<
      WithId<{
        title: string;
        contents: string;
      }>
    >
  >
>;

/**
 * The shape of a public opportunity.
 */
export type PublicOpportunity = WithSessionCounts<
  Pick<InternalOpportunity, 'title' | 'contents' | 'createdAt' | 'updatedAt'> & {
    opportunity_id: string;
  }
>;

/**
 * The shape of a new opportunity.
 */
export type NewOpportunity = Pick<InternalOpportunity, 'title' | 'contents'>;

/**
 * The shape of a patch opportunity.
 */
export type PatchOpportunity = WithIncrementableViews<
  Partial<Pick<InternalOpportunity, 'title' | 'contents'>>
>;

/**
 * The shape of internal info.
 */
export type InternalInfo = WithId<{
  articles: number;
  opportunities: number;
  sessions: number;
  users: number;
  views: number;
}>;

/**
 * The shape of public info.
 */
export type PublicInfo = WithoutId<InternalInfo>;

/**
 * The shape of an internal article.
 */
export type InternalArticle = WithProvenance<
  WithViewCounts<
    WithTimeTracking<
      WithId<{
        title: string;
        contents: string;
        keywords: string[];
      }>
    >
  >
>;

/**
 * The shape of a public article.
 */
export type PublicArticle = WithSessionCounts<
  Pick<
    InternalArticle,
    'title' | 'contents' | 'keywords' | 'createdAt' | 'updatedAt'
  > & {
    article_id: string;
  }
>;

/**
 * The shape of a new article.
 */
export type NewArticle = Pick<InternalArticle, 'title' | 'contents' | 'keywords'>;

/**
 * The shape of a patch article.
 */
export type PatchArticle = WithIncrementableViews<
  Partial<Pick<InternalArticle, 'title' | 'contents' | 'keywords'>>
>;

/**
 * Transforms an internal user into a public user.
 */
export function toPublicUser(
  internalUser: InternalUser,
  activeSessionCount: number
): PublicUser {
  return {
    user_id: internalUser._id.toString(),
    username: internalUser.username,
    email: internalUser.email,
    salt: internalUser.salt,
    type: internalUser.type,
    sessions: activeSessionCount,
    createdAt: internalUser.createdAt,
    updatedAt: internalUser.updatedAt
  };
}

/**
 * Transforms an internal session into a public session.
 */
export function toPublicSession(internalSession: InternalSession): PublicSession {
  return {
    session_id: internalSession._id.toString(),
    user_id: internalSession.user_id?.toString() ?? null,
    view: internalSession.view,
    viewed_id: internalSession.viewed_id?.toString() ?? null,
    createdAt: internalSession.createdAt,
    updatedAt: internalSession.updatedAt
  };
}

/**
 * Transforms an internal opportunity into a public opportunity.
 */
export function toPublicOpportunity(
  internalOpportunity: InternalOpportunity,
  activeSessionCount: number
): PublicOpportunity {
  return {
    opportunity_id: internalOpportunity._id.toString(),
    contents: internalOpportunity.contents,
    title: internalOpportunity.title,
    sessions: activeSessionCount,
    createdAt: internalOpportunity.createdAt,
    updatedAt: internalOpportunity.updatedAt
  };
}

/**
 * Transforms the internal info data into a publicly consumable info.
 */
export function toPublicInfo(internalInfo: InternalInfo): PublicInfo {
  return {
    articles: internalInfo.articles,
    opportunities: internalInfo.opportunities,
    sessions: internalInfo.sessions,
    users: internalInfo.users,
    views: internalInfo.views
  };
}

/**
 * Transforms an internal article into a public article.
 */
export function toPublicArticle(
  internalArticle: InternalArticle,
  activeSessionCount: number
): PublicArticle {
  return {
    article_id: internalArticle._id.toString(),
    contents: internalArticle.contents,
    title: internalArticle.title,
    keywords: internalArticle.keywords,
    sessions: activeSessionCount,
    createdAt: internalArticle.createdAt,
    updatedAt: internalArticle.updatedAt
  };
}

/**
 * A MongoDB cursor projection that transforms an internal user into a public
 * user.
 */
export const publicUserProjection = {
  _id: false,
  user_id: { $toString: '$_id' },
  username: true,
  salt: true,
  email: true,
  type: true,
  createdAt: true,
  updatedAt: true
} as const;

/**
 * A MongoDB cursor projection that transforms an internal session into a public
 * session.
 */
export const publicSessionProjection = {
  _id: false,
  session_id: { $toString: '$_id' },
  user_id: { $toString: '$user_id' },
  view: true,
  viewed_id: { $toString: '$viewed_id' },
  createdAt: true,
  updatedAt: true
} as const;

/**
 * A MongoDB cursor projection that transforms an internal opportunity into a
 * public opportunity.
 */
export const publicOpportunityProjection = {
  _id: false,
  opportunity_id: { $toString: '$_id' },
  title: true,
  contents: true,
  createdAt: true,
  updatedAt: true
} as const;

/**
 * A MongoDB cursor projection that transforms the internal info data into a
 * publicly consumable data.
 */
export const publicInfoProjection = { _id: false } as const;

/**
 * A MongoDB cursor projection that transforms an internal article into a public
 * article.
 */
export const publicArticleProjection = {
  _id: false,
  article_id: { $toString: '$_id' },
  title: true,
  contents: true,
  keywords: true,
  createdAt: true,
  updatedAt: true
} as const;
