import { ObjectId } from 'mongodb';
import { asMockedFunction } from '@xunnamius/jest-types';

import {
  authAppUser,
  createPage,
  createUser,
  deleteSession,
  deletePage,
  deleteUser,
  getAllUsers,
  getBlogPagesMetadata,
  getBlog,
  getInfo,
  getPage,
  getPageSessionsCount,
  getUser,
  updatePage,
  createSession,
  updateUser,
  updateBlog,
  renewSession
} from 'universe/backend';

import V1EndpointUsers, {
  config as V1ConfigUsers,
  metadata as V1MetadataUsers
} from 'universe/pages/api/v1/users';

import V1EndpointUsersUsernameoremail, {
  config as V1ConfigUsersUsernameoremail,
  metadata as V1MetadataUsersUsernameoremail
} from 'universe/pages/api/v1/users/[usernameOrEmail]';

import V1EndpointUsersUsernameoremailAuth, {
  config as V1ConfigUsersUsernameoremailAuth,
  metadata as V1MetadataUsersUsernameoremailAuth
} from 'universe/pages/api/v1/users/[usernameOrEmail]/auth';

import V1EndpointBlogsBlogname, {
  config as V1ConfigBlogsBlogname,
  metadata as V1MetadataBlogsBlogname
} from 'universe/pages/api/v1/blogs/[blogName]';

import V1EndpointBlogsBlognamePages, {
  config as V1ConfigBlogsBlognamePages,
  metadata as V1MetadataBlogsBlognamePages
} from 'universe/pages/api/v1/blogs/[blogName]/pages';

import V1EndpointBlogsBlognamePagesPagename, {
  config as V1ConfigBlogsBlognamePagesPagename,
  metadata as V1MetadataBlogsBlognamePagesPagename
} from 'universe/pages/api/v1/blogs/[blogName]/pages/[pageName]';

import V1EndpointBlogsBlognamePagesPagenameSessions, {
  config as V1ConfigBlogsBlognamePagesPagenameSessions,
  metadata as V1MetadataBlogsBlognamePagesPagenameSessions
} from 'universe/pages/api/v1/blogs/[blogName]/pages/[pageName]/sessions';

import V1EndpointBlogsBlognamePagesPagenameSessionsSessionid, {
  config as V1ConfigBlogsBlognamePagesPagenameSessionsSessionid,
  metadata as V1MetadataBlogsBlognamePagesPagenameSessionsSessionid
} from 'universe/pages/api/v1/blogs/[blogName]/pages/[pageName]/sessions/[session_id]';

import V1EndpointInfo, {
  config as V1ConfigInfo,
  metadata as V1MetadataInfo
} from 'universe/pages/api/v1/info';

import type { NextApiHandler, PageConfig } from 'next';
import type {
  PublicBlog,
  PublicInfo,
  PublicPage,
  PublicPageMetadata,
  PublicUser,
  SessionId
} from 'universe/backend/db';

export type NextApiHandlerMixin = NextApiHandler & {
  config?: PageConfig;
  uri: string;
};

// TODO: make a package that automatically generates/regenerates this file

/**
 * The entire live API topology gathered together into one convenient object.
 */
export const api = {
  v1: {
    users: V1EndpointUsers as NextApiHandlerMixin,
    usersUsernameoremail: V1EndpointUsersUsernameoremail as NextApiHandlerMixin,
    usersUsernameoremailAuth:
      V1EndpointUsersUsernameoremailAuth as NextApiHandlerMixin,
    blogsBlogname: V1EndpointBlogsBlogname as NextApiHandlerMixin,
    blogsBlognamePages: V1EndpointBlogsBlognamePages as NextApiHandlerMixin,
    blogsBlognamePagesPagename:
      V1EndpointBlogsBlognamePagesPagename as NextApiHandlerMixin,
    blogsBlognamePagesPagenameSessions:
      V1EndpointBlogsBlognamePagesPagenameSessions as NextApiHandlerMixin,
    blogsBlognamePagesPagenameSessionsSessionid:
      V1EndpointBlogsBlognamePagesPagenameSessionsSessionid as NextApiHandlerMixin,
    info: V1EndpointInfo as NextApiHandlerMixin
  }
};

api.v1.users.config = V1ConfigUsers;
api.v1.usersUsernameoremail.config = V1ConfigUsersUsernameoremail;
api.v1.usersUsernameoremailAuth.config = V1ConfigUsersUsernameoremailAuth;
api.v1.blogsBlogname.config = V1ConfigBlogsBlogname;
api.v1.blogsBlognamePages.config = V1ConfigBlogsBlognamePages;
api.v1.blogsBlognamePagesPagename.config = V1ConfigBlogsBlognamePagesPagename;
api.v1.blogsBlognamePagesPagenameSessions.config =
  V1ConfigBlogsBlognamePagesPagenameSessions;
api.v1.blogsBlognamePagesPagenameSessionsSessionid.config =
  V1ConfigBlogsBlognamePagesPagenameSessionsSessionid;
api.v1.info.config = V1ConfigInfo;

api.v1.users.uri = V1MetadataUsers.descriptor;
api.v1.usersUsernameoremail.uri = V1MetadataUsersUsernameoremail.descriptor;
api.v1.usersUsernameoremailAuth.uri = V1MetadataUsersUsernameoremailAuth.descriptor;
api.v1.blogsBlogname.uri = V1MetadataBlogsBlogname.descriptor;
api.v1.blogsBlognamePages.uri = V1MetadataBlogsBlognamePages.descriptor;
api.v1.blogsBlognamePagesPagename.uri =
  V1MetadataBlogsBlognamePagesPagename.descriptor;
api.v1.blogsBlognamePagesPagenameSessions.uri =
  V1MetadataBlogsBlognamePagesPagenameSessions.descriptor;
api.v1.blogsBlognamePagesPagenameSessionsSessionid.uri =
  V1MetadataBlogsBlognamePagesPagenameSessionsSessionid.descriptor;
api.v1.info.uri = V1MetadataInfo.descriptor;

/**
 * A convenience function that mocks the entire backend and returns the mock
 * functions. Uses `beforeEach` under the hood.
 *
 * **WARNING: YOU MUST CALL `jest.mock('universe/backend')` before calling this
 * function!**
 */
export function setupMockBackend() {
  const mockedAuthAppUser = asMockedFunction(authAppUser);
  const mockedCreatePage = asMockedFunction(createPage);
  const mockedCreateUser = asMockedFunction(createUser);
  const mockedDeleteSession = asMockedFunction(deleteSession);
  const mockedDeletePage = asMockedFunction(deletePage);
  const mockedDeleteUser = asMockedFunction(deleteUser);
  const mockedGetAllUsers = asMockedFunction(getAllUsers);
  const mockedGetBlogPagesMetadata = asMockedFunction(getBlogPagesMetadata);
  const mockedGetBlog = asMockedFunction(getBlog);
  const mockedGetInfo = asMockedFunction(getInfo);
  const mockedGetPage = asMockedFunction(getPage);
  const mockedGetPageSessionCount = asMockedFunction(getPageSessionsCount);
  const mockedGetUser = asMockedFunction(getUser);
  const mockedUpdatePage = asMockedFunction(updatePage);
  const mockedCreateSession = asMockedFunction(createSession);
  const mockedUpdateUser = asMockedFunction(updateUser);
  const mockedUpdateBlog = asMockedFunction(updateBlog);
  const mockedRenewSession = asMockedFunction(renewSession);

  beforeEach(() => {
    mockedAuthAppUser.mockReturnValue(Promise.resolve(false));
    mockedCreatePage.mockReturnValue(Promise.resolve({} as PublicPage));
    mockedCreateUser.mockReturnValue(Promise.resolve({} as PublicUser));
    mockedDeleteSession.mockReturnValue(Promise.resolve());
    mockedDeletePage.mockReturnValue(Promise.resolve());
    mockedDeleteUser.mockReturnValue(Promise.resolve());
    mockedGetAllUsers.mockReturnValue(Promise.resolve([] as PublicUser[]));
    mockedGetBlogPagesMetadata.mockReturnValue(
      Promise.resolve([] as PublicPageMetadata[])
    );
    mockedGetBlog.mockReturnValue(Promise.resolve({} as PublicBlog));
    mockedGetInfo.mockReturnValue(Promise.resolve({} as PublicInfo));
    mockedGetPage.mockReturnValue(Promise.resolve({} as PublicPage));
    mockedGetPageSessionCount.mockReturnValue(Promise.resolve(0));
    mockedGetUser.mockReturnValue(Promise.resolve({} as PublicUser));
    mockedUpdatePage.mockReturnValue(Promise.resolve());
    mockedCreateSession.mockReturnValue(Promise.resolve(new ObjectId() as SessionId));
    mockedUpdateUser.mockReturnValue(Promise.resolve());
    mockedUpdateBlog.mockReturnValue(Promise.resolve());
    mockedRenewSession.mockReturnValue(Promise.resolve());
  });

  return {
    mockedAuthAppUser,
    mockedCreatePage,
    mockedCreateUser,
    mockedCreateSession,
    mockedDeleteSession,
    mockedDeletePage,
    mockedDeleteUser,
    mockedGetAllUsers,
    mockedGetBlogPagesMetadata,
    mockedGetBlog,
    mockedGetInfo,
    mockedGetPage,
    mockedGetPageSessionCount,
    mockedGetUser,
    mockedUpdatePage,
    mockedUpdateUser,
    mockedUpdateBlog,
    mockedRenewSession
  };
}
