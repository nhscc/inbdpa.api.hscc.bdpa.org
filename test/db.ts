import { ObjectId } from 'mongodb';

import { getEnv } from 'universe/backend/env';

import {
  dummyRootData,
  getCommonDummyData,
  mockDateNowMs
} from 'multiverse/mongo-common';

import type { DummyData } from 'multiverse/mongo-test';

import type {
  InternalUser,
  InternalPage,
  InternalInfo,
  InternalSession
} from 'universe/backend/db';

/**
 * Returns data used to hydrate databases and their collections.
 */
export function getDummyData(): DummyData {
  return getCommonDummyData({ app: dummyAppData });
}

/**
 * The shape of the application database's test data.
 */
export type DummyAppData = {
  _generatedAt: number;
  users: InternalUser[];
  pages: InternalPage[];
  sessions: InternalSession[];
  info: [InternalInfo];
};

// ! Order matters in unit and integration tests, so APPEND ONLY ! \\

const users: InternalUser[] = [
  // ? Dummy users' passwords are the same as their usernames
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: 'user1',
    salt: '91db41c494502f9ebb6217e4590cccc2',
    key: '17660270f4c4c1741ab9d43e6fb800bc784f0a3bc2f4cd31f0e26bf821ef2ae788f83af134d8c3824f5e0552f8cd432d6b23963d2ffbceb6a7c91b0f59533206',
    email: 'user1@fake-email.com',
    type: 'administrator'
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: 'user2',
    salt: 'bfe69b665a1ae64bb7d76c32347adecb',
    key: 'e71e8bbd23df52bec8af8280ad7901ddd0ecd5cc43371915f7a95cd17ce0a8515127bfcd433435425c4d245f4a18efcb08e4484682aeb53fcfce5b536d79e4e4',
    email: 'user2@fake-email.com',
    type: 'administrator'
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: 'user3',
    salt: '12ef85b518da764294abf0a2095bb5ec',
    key: 'e745893e064e26d4349b1639b1596c14bc9b5d050b56bf31ff3ef0dfce6f959aef8a3722a35bc35b2d142169e75ca3e1967cd6ee4818af0813d8396a724fdd22',
    email: 'user3@fake-email.com',
    banned: false,
    blogName: 'user3-blog',
    blogRootPage: 'home',
    createdAt: mockDateNowMs - 10_000,
    navLinks: [{ href: 'home', text: 'Home' }],
    type: 'blogger'
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: null,
    salt: '12ef85b518da764294abf0a2095bb5ec',
    key: 'e745893e064e26d4349b1639b1596c14bc9b5d050b56bf31ff3ef0dfce6f959aef8a3722a35bc35b2d142169e75ca3e1967cd6ee4818af0813d8396a724fdd22',
    email: 'user4@fake-email.com',
    banned: false,
    blogName: 'user4-blog',
    blogRootPage: 'home',
    createdAt: mockDateNowMs - 100_000,
    navLinks: [],
    type: 'blogger'
  }
];

const pages: InternalPage[] = [
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    blog_id: users[2]._id,
    createdAt: mockDateNowMs - 10_000,
    name: 'contact',
    contents: '# Contact us\n\nA contact form goes here!',
    totalViews: 10
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    blog_id: new ObjectId(),
    createdAt: mockDateNowMs - 1000,
    name: 'orphan',
    contents: '# Orphan\n\nThis page is strangely unattached to anything.',
    totalViews: 0
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    blog_id: users[2]._id,
    createdAt: mockDateNowMs - 100_000,
    name: 'home',
    contents:
      '# COOL-BLOGIO\n\nWelcome to my **cool** *blogio*! Have you seen our [contact page](./contact)?',
    totalViews: 1000
  }
];

const sessions: InternalSession[] = [
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    lastRenewedDate: new Date(mockDateNowMs),
    page_id: pages[0]._id
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    lastRenewedDate: new Date(
      mockDateNowMs - Math.floor(getEnv().SESSION_EXPIRE_AFTER_SECONDS / 2) * 1000
    ),
    page_id: pages[0]._id
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    lastRenewedDate: new Date(
      mockDateNowMs - getEnv().SESSION_EXPIRE_AFTER_SECONDS * 2000
    ),
    page_id: pages[0]._id
  }
];

const info: [InternalInfo] = [
  {
    _id: new ObjectId(),
    blogs: users.filter((u) => u.type === 'blogger').length,
    pages: pages.length,
    users: users.length
  }
];

/**
 * Test data for the application database.
 */
export const dummyAppData: DummyAppData = {
  _generatedAt: mockDateNowMs,
  users,
  pages,
  sessions,
  info
};
