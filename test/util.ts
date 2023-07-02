import { ObjectId } from 'mongodb';
import { asMockedFunction } from '@xunnamius/jest-types';

import {
  authAppUser,
  createArticle,
  createOpportunity,
  createSession,
  createUser,
  createUserConnection,
  deleteArticle,
  deleteOpportunity,
  deleteSession,
  deleteUser,
  deleteUserConnection,
  getAllArticles,
  getAllOpportunities,
  getAllSessions,
  getAllUsers,
  getArticle,
  getInfo,
  getOpportunity,
  getSession,
  getSessionsCountFor,
  getSessionsFor,
  getUser,
  getUserConnections,
  renewSession,
  updateArticle,
  updateOpportunity,
  updateUser
} from 'universe/backend';

import V1EndpointUsers, {
  config as V1ConfigUsers,
  metadata as V1MetadataUsers
} from 'universe/pages/api/v1/users';

import V1EndpointUsersUsernameorid, {
  config as V1ConfigUsersUsernameorid,
  metadata as V1MetadataUsersUsernameorid
} from 'universe/pages/api/v1/users/[usernameOrId]';

import V1EndpointUsersUsernameoridAuth, {
  config as V1ConfigUsersUsernameoridAuth,
  metadata as V1MetadataUsersUsernameoridAuth
} from 'universe/pages/api/v1/users/[usernameOrId]/auth';

import V1EndpointUsersUsernameoridConnections, {
  config as V1ConfigUsersUsernameoridConnections,
  metadata as V1MetadataUsersUsernameoridConnections
} from 'universe/pages/api/v1/users/[usernameOrId]/connections';

import V1EndpointUsersUsernameoridConnectionsConnectionid, {
  config as V1ConfigUsersUsernameoridConnectionsConnectionid,
  metadata as V1MetadataUsersUsernameoridConnectionsConnectionid
} from 'universe/pages/api/v1/users/[usernameOrId]/connections/[connection_id]';

import V1EndpointSessions, {
  config as V1ConfigSessions,
  metadata as V1MetadataSessions
} from 'universe/pages/api/v1/sessions';

import V1EndpointSessionsSessionid, {
  config as V1ConfigSessionsSessionid,
  metadata as V1MetadataSessionsSessionid
} from 'universe/pages/api/v1/sessions/[session_id]';

import V1EndpointSessionsCountforOpportunityOpportunityid, {
  config as V1ConfigSessionsCountforOpportunityOpportunityid,
  metadata as V1MetadataSessionsCountforOpportunityOpportunityid
} from 'universe/pages/api/v1/sessions/count-for/opportunity/[opportunity_id]';

import V1EndpointSessionsCountforUserUserid, {
  config as V1ConfigSessionsCountforUserUserid,
  metadata as V1MetadataSessionsCountforUserUserid
} from 'universe/pages/api/v1/sessions/count-for/user/[user_id]';

import V1EndpointOpportunities, {
  config as V1ConfigOpportunities,
  metadata as V1MetadataOpportunities
} from 'universe/pages/api/v1/opportunities';

import V1EndpointOpportunitiesOpportunityid, {
  config as V1ConfigOpportunitiesOpportunityid,
  metadata as V1MetadataOpportunitiesOpportunityid
} from 'universe/pages/api/v1/opportunities/[opportunity_id]';

import V1EndpointInfo, {
  config as V1ConfigInfo,
  metadata as V1MetadataInfo
} from 'universe/pages/api/v1/info';

import V2EndpointUsers, {
  config as V2ConfigUsers,
  metadata as V2MetadataUsers
} from 'universe/pages/api/v2/users';

import V2EndpointUsersUsernameorid, {
  config as V2ConfigUsersUsernameorid,
  metadata as V2MetadataUsersUsernameorid
} from 'universe/pages/api/v2/users/[usernameOrId]';

import V2EndpointUsersUsernameoridAuth, {
  config as V2ConfigUsersUsernameoridAuth,
  metadata as V2MetadataUsersUsernameoridAuth
} from 'universe/pages/api/v2/users/[usernameOrId]/auth';

import V2EndpointUsersUsernameoridConnections, {
  config as V2ConfigUsersUsernameoridConnections,
  metadata as V2MetadataUsersUsernameoridConnections
} from 'universe/pages/api/v2/users/[usernameOrId]/connections';

import V2EndpointUsersUsernameoridConnectionsConnectionid, {
  config as V2ConfigUsersUsernameoridConnectionsConnectionid,
  metadata as V2MetadataUsersUsernameoridConnectionsConnectionid
} from 'universe/pages/api/v2/users/[usernameOrId]/connections/[connection_id]';

import V2EndpointUsersUsernameoridSessions, {
  config as V2ConfigUsersUsernameoridSessions,
  metadata as V2MetadataUsersUsernameoridSessions
} from 'universe/pages/api/v2/users/[usernameOrId]/sessions';

import V2EndpointSessions, {
  config as V2ConfigSessions,
  metadata as V2MetadataSessions
} from 'universe/pages/api/v2/sessions';

import V2EndpointSessionsSessionid, {
  config as V2ConfigSessionsSessionid,
  metadata as V2MetadataSessionsSessionid
} from 'universe/pages/api/v2/sessions/[session_id]';

import V2EndpointOpportunities, {
  config as V2ConfigOpportunities,
  metadata as V2MetadataOpportunities
} from 'universe/pages/api/v2/opportunities';

import V2EndpointOpportunitiesOpportunityid, {
  config as V2ConfigOpportunitiesOpportunityid,
  metadata as V2MetadataOpportunitiesOpportunityid
} from 'universe/pages/api/v2/opportunities/[opportunity_id]';

import V2EndpointOpportunitiesOpportunityidSessions, {
  config as V2ConfigOpportunitiesOpportunityidSessions,
  metadata as V2MetadataOpportunitiesOpportunityidSessions
} from 'universe/pages/api/v2/opportunities/[opportunity_id]/sessions';

import V2EndpointArticles, {
  config as V2ConfigArticles,
  metadata as V2MetadataArticles
} from 'universe/pages/api/v2/articles';

import V2EndpointArticlesArticleid, {
  config as V2ConfigArticlesArticleid,
  metadata as V2MetadataArticlesArticleid
} from 'universe/pages/api/v2/articles/[article_id]';

import V2EndpointArticlesArticleidSessions, {
  config as V2ConfigArticlesArticleidSessions,
  metadata as V2MetadataArticlesArticleidSessions
} from 'universe/pages/api/v2/articles/[article_id]/sessions';

import V2EndpointInfo, {
  config as V2ConfigInfo,
  metadata as V2MetadataInfo
} from 'universe/pages/api/v2/info';

import type { NextApiHandler, PageConfig } from 'next';

import type {
  PublicArticle,
  PublicInfo,
  PublicOpportunity,
  PublicSession,
  PublicUser
} from 'universe/backend/db';

export type NextApiHandlerMixin = NextApiHandler & {
  config?: PageConfig;
  uri: string;
};

// TODO: make a package that automatically generates/regenerates this file !!!

/**
 * The entire live API topology gathered together into one convenient object.
 */
export const api = {
  v1: {
    users: V1EndpointUsers as NextApiHandlerMixin,
    usersUsernameorid: V1EndpointUsersUsernameorid as NextApiHandlerMixin,
    usersUsernameoridAuth: V1EndpointUsersUsernameoridAuth as NextApiHandlerMixin,
    usersUsernameoridConnections:
      V1EndpointUsersUsernameoridConnections as NextApiHandlerMixin,
    usersUsernameoridConnectionsConnectionid:
      V1EndpointUsersUsernameoridConnectionsConnectionid as NextApiHandlerMixin,

    sessions: V1EndpointSessions as NextApiHandlerMixin,
    sessionsSessionid: V1EndpointSessionsSessionid as NextApiHandlerMixin,
    sessionsCountforOpportunityOpportunityid:
      V1EndpointSessionsCountforOpportunityOpportunityid as NextApiHandlerMixin,
    sessionsCountforUserUserid:
      V1EndpointSessionsCountforUserUserid as NextApiHandlerMixin,

    opportunities: V1EndpointOpportunities as NextApiHandlerMixin,
    opportunitiesOpportunityid:
      V1EndpointOpportunitiesOpportunityid as NextApiHandlerMixin,

    info: V1EndpointInfo as NextApiHandlerMixin
  },
  v2: {
    users: V2EndpointUsers as NextApiHandlerMixin,
    usersUsernameorid: V2EndpointUsersUsernameorid as NextApiHandlerMixin,
    usersUsernameoridAuth: V2EndpointUsersUsernameoridAuth as NextApiHandlerMixin,
    usersUsernameoridConnections:
      V2EndpointUsersUsernameoridConnections as NextApiHandlerMixin,
    usersUsernameoridConnectionsConnectionid:
      V2EndpointUsersUsernameoridConnectionsConnectionid as NextApiHandlerMixin,
    usersUsernameoridSessions:
      V2EndpointUsersUsernameoridSessions as NextApiHandlerMixin,

    sessions: V2EndpointSessions as NextApiHandlerMixin,
    sessionsSessionid: V2EndpointSessionsSessionid as NextApiHandlerMixin,

    opportunities: V2EndpointOpportunities as NextApiHandlerMixin,
    opportunitiesOpportunityid:
      V2EndpointOpportunitiesOpportunityid as NextApiHandlerMixin,
    opportunitiesOpportunityidSessions:
      V2EndpointOpportunitiesOpportunityidSessions as NextApiHandlerMixin,

    info: V2EndpointInfo as NextApiHandlerMixin,

    articles: V2EndpointArticles as NextApiHandlerMixin,
    articlesArticleid: V2EndpointArticlesArticleid as NextApiHandlerMixin,
    articlesArticleidSessions:
      V2EndpointArticlesArticleidSessions as NextApiHandlerMixin
  }
};

// **                           **
// ** Add configuration objects **
// **                           **

api.v1.users.config = V1ConfigUsers;
api.v1.usersUsernameorid.config = V1ConfigUsersUsernameorid;
api.v1.usersUsernameoridAuth.config = V1ConfigUsersUsernameoridAuth;
api.v1.usersUsernameoridConnections.config = V1ConfigUsersUsernameoridConnections;
api.v1.usersUsernameoridConnectionsConnectionid.config =
  V1ConfigUsersUsernameoridConnectionsConnectionid;

api.v1.sessions.config = V1ConfigSessions;
api.v1.sessionsSessionid.config = V1ConfigSessionsSessionid;
api.v1.sessionsCountforOpportunityOpportunityid.config =
  V1ConfigSessionsCountforOpportunityOpportunityid;
api.v1.sessionsCountforUserUserid.config = V1ConfigSessionsCountforUserUserid;

api.v1.opportunities.config = V1ConfigOpportunities;
api.v1.opportunitiesOpportunityid.config = V1ConfigOpportunitiesOpportunityid;

api.v1.info.config = V1ConfigInfo;

api.v2.users.config = V2ConfigUsers;
api.v2.usersUsernameorid.config = V2ConfigUsersUsernameorid;
api.v2.usersUsernameoridAuth.config = V2ConfigUsersUsernameoridAuth;
api.v2.usersUsernameoridConnections.config = V2ConfigUsersUsernameoridConnections;
api.v2.usersUsernameoridConnectionsConnectionid.config =
  V2ConfigUsersUsernameoridConnectionsConnectionid;
api.v2.usersUsernameoridSessions.config = V2ConfigUsersUsernameoridSessions;

api.v2.sessions.config = V2ConfigSessions;
api.v2.sessionsSessionid.config = V2ConfigSessionsSessionid;

api.v2.opportunities.config = V2ConfigOpportunities;
api.v2.opportunitiesOpportunityid.config = V2ConfigOpportunitiesOpportunityid;
api.v2.opportunitiesOpportunityidSessions.config =
  V2ConfigOpportunitiesOpportunityidSessions;

api.v2.info.config = V2ConfigInfo;

api.v2.articles.config = V2ConfigArticles;
api.v2.articlesArticleid.config = V2ConfigArticlesArticleid;
api.v2.articlesArticleidSessions.config = V2ConfigArticlesArticleidSessions;

// **                           **
// ** Add metadata descriptors  **
// **                           **

api.v1.users.uri = V1MetadataUsers.descriptor;
api.v1.usersUsernameorid.uri = V1MetadataUsersUsernameorid.descriptor;
api.v1.usersUsernameoridAuth.uri = V1MetadataUsersUsernameoridAuth.descriptor;
api.v1.usersUsernameoridConnections.uri =
  V1MetadataUsersUsernameoridConnections.descriptor;
api.v1.usersUsernameoridConnectionsConnectionid.uri =
  V1MetadataUsersUsernameoridConnectionsConnectionid.descriptor;

api.v1.sessions.uri = V1MetadataSessions.descriptor;
api.v1.sessionsSessionid.uri = V1MetadataSessionsSessionid.descriptor;
api.v1.sessionsCountforOpportunityOpportunityid.uri =
  V1MetadataSessionsCountforOpportunityOpportunityid.descriptor;
api.v1.sessionsCountforUserUserid.uri =
  V1MetadataSessionsCountforUserUserid.descriptor;

api.v1.opportunities.uri = V1MetadataOpportunities.descriptor;
api.v1.opportunitiesOpportunityid.uri =
  V1MetadataOpportunitiesOpportunityid.descriptor;

api.v1.info.uri = V1MetadataInfo.descriptor;

api.v2.users.uri = V2MetadataUsers.descriptor;
api.v2.usersUsernameorid.uri = V2MetadataUsersUsernameorid.descriptor;
api.v2.usersUsernameoridAuth.uri = V2MetadataUsersUsernameoridAuth.descriptor;
api.v2.usersUsernameoridConnections.uri =
  V2MetadataUsersUsernameoridConnections.descriptor;
api.v2.usersUsernameoridConnectionsConnectionid.uri =
  V2MetadataUsersUsernameoridConnectionsConnectionid.descriptor;
api.v2.usersUsernameoridSessions.uri = V2MetadataUsersUsernameoridSessions.descriptor;

api.v2.sessions.uri = V2MetadataSessions.descriptor;
api.v2.sessionsSessionid.uri = V2MetadataSessionsSessionid.descriptor;

api.v2.opportunities.uri = V2MetadataOpportunities.descriptor;
api.v2.opportunitiesOpportunityid.uri =
  V2MetadataOpportunitiesOpportunityid.descriptor;
api.v2.opportunitiesOpportunityidSessions.uri =
  V2MetadataOpportunitiesOpportunityidSessions.descriptor;

api.v2.info.uri = V2MetadataInfo.descriptor;

api.v2.articles.uri = V2MetadataArticles.descriptor;
api.v2.articlesArticleid.uri = V2MetadataArticlesArticleid.descriptor;
api.v2.articlesArticleidSessions.uri = V2MetadataArticlesArticleidSessions.descriptor;

/**
 * A convenience function that mocks the entire backend and returns the mock
 * functions. Uses `beforeEach` under the hood.
 *
 * **WARNING: YOU MUST CALL `jest.mock('universe/backend')` before calling this
 * function!**
 */
export function setupMockBackend() {
  const mockedAuthAppUser = asMockedFunction(authAppUser);
  const mockedCreateArticle = asMockedFunction(createArticle);
  const mockedCreateOpportunity = asMockedFunction(createOpportunity);
  const mockedCreateSession = asMockedFunction(createSession);
  const mockedCreateUser = asMockedFunction(createUser);
  const mockedCreateUserConnection = asMockedFunction(createUserConnection);
  const mockedDeleteArticle = asMockedFunction(deleteArticle);
  const mockedDeleteOpportunity = asMockedFunction(deleteOpportunity);
  const mockedDeleteSession = asMockedFunction(deleteSession);
  const mockedDeleteUser = asMockedFunction(deleteUser);
  const mockedDeleteUserConnection = asMockedFunction(deleteUserConnection);
  const mockedGetAllArticles = asMockedFunction(getAllArticles);
  const mockedGetAllOpportunities = asMockedFunction(getAllOpportunities);
  const mockedGetAllSessions = asMockedFunction(getAllSessions);
  const mockedGetAllUsers = asMockedFunction(getAllUsers);
  const mockedGetArticle = asMockedFunction(getArticle);
  const mockedGetInfo = asMockedFunction(getInfo);
  const mockedGetOpportunity = asMockedFunction(getOpportunity);
  const mockedGetSession = asMockedFunction(getSession);
  const mockedGetSessionsCountFor = asMockedFunction(getSessionsCountFor);
  const mockedGetSessionsFor = asMockedFunction(getSessionsFor);
  const mockedGetUser = asMockedFunction(getUser);
  const mockedGetUserConnections = asMockedFunction(getUserConnections);
  const mockedRenewSession = asMockedFunction(renewSession);
  const mockedUpdateArticle = asMockedFunction(updateArticle);
  const mockedUpdateOpportunity = asMockedFunction(updateOpportunity);
  const mockedUpdateUser = asMockedFunction(updateUser);

  beforeEach(() => {
    mockedAuthAppUser.mockReturnValue(Promise.resolve(false));
    mockedCreateArticle.mockReturnValue(Promise.resolve({} as PublicArticle));
    mockedCreateOpportunity.mockReturnValue(Promise.resolve({} as PublicOpportunity));
    mockedCreateSession.mockReturnValue(Promise.resolve(new ObjectId()));
    mockedCreateUser.mockReturnValue(Promise.resolve({} as PublicUser));
    mockedCreateUserConnection.mockReturnValue(Promise.resolve());
    mockedDeleteArticle.mockReturnValue(Promise.resolve());
    mockedDeleteOpportunity.mockReturnValue(Promise.resolve());
    mockedDeleteSession.mockReturnValue(Promise.resolve());
    mockedDeleteUser.mockReturnValue(Promise.resolve());
    mockedDeleteUserConnection.mockReturnValue(Promise.resolve());
    mockedGetAllArticles.mockReturnValue(Promise.resolve([]));
    mockedGetAllOpportunities.mockReturnValue(Promise.resolve([]));
    mockedGetAllSessions.mockReturnValue(Promise.resolve([]));
    mockedGetAllUsers.mockReturnValue(Promise.resolve([]));
    mockedGetArticle.mockReturnValue(Promise.resolve({} as PublicArticle));
    mockedGetInfo.mockReturnValue(Promise.resolve({} as PublicInfo));
    mockedGetOpportunity.mockReturnValue(Promise.resolve({} as PublicOpportunity));
    mockedGetSession.mockReturnValue(Promise.resolve({} as PublicSession));
    mockedGetSessionsCountFor.mockReturnValue(Promise.resolve(0));
    mockedGetSessionsFor.mockReturnValue(Promise.resolve([]));
    mockedGetUser.mockReturnValue(Promise.resolve({} as PublicUser));
    mockedGetUserConnections.mockReturnValue(Promise.resolve([]));
    mockedRenewSession.mockReturnValue(Promise.resolve());
    mockedUpdateArticle.mockReturnValue(Promise.resolve());
    mockedUpdateOpportunity.mockReturnValue(Promise.resolve());
    mockedUpdateUser.mockReturnValue(Promise.resolve());
  });

  return {
    mockedAuthAppUser,
    mockedCreateArticle,
    mockedCreateOpportunity,
    mockedCreateSession,
    mockedCreateUser,
    mockedCreateUserConnection,
    mockedDeleteArticle,
    mockedDeleteOpportunity,
    mockedDeleteSession,
    mockedDeleteUser,
    mockedDeleteUserConnection,
    mockedGetAllArticles,
    mockedGetAllOpportunities,
    mockedGetAllSessions,
    mockedGetAllUsers,
    mockedGetArticle,
    mockedGetInfo,
    mockedGetOpportunity,
    mockedGetSession,
    mockedGetSessionsCountFor,
    mockedGetSessionsFor,
    mockedGetUser,
    mockedGetUserConnections,
    mockedRenewSession,
    mockedUpdateArticle,
    mockedUpdateOpportunity,
    mockedUpdateUser
  };
}
