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
  InternalSession,
  InternalOpportunity,
  InternalInfo,
  InternalArticle
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
  sessions: InternalSession[];
  opportunities: InternalOpportunity[];
  info: [InternalInfo];
  articles: InternalArticle[];
};

// ! Order matters in unit and integration tests, so APPEND ONLY ! \\

const users: InternalUser[] = [
  // ? Dummy users' passwords are the same as their usernames
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: 'v1-user-1',
    salt: '91db41c494502f9ebb6217e4590cccc2',
    key: '17660270f4c4c1741ab9d43e6fb800bc784f0a3bc2f4cd31f0e26bf821ef2ae788f83af134d8c3824f5e0552f8cd432d6b23963d2ffbceb6a7c91b0f59533206',
    email: 'v1-user-1@fake-email.com',
    type: 'administrator',
    fullName: null,
    connections: [],
    sections: {
      about: 'Hi! I am me! Me am I!',
      education: [
        {
          title: 'Something Something College',
          location: 'Somewhere, USA',
          description: 'Did college stuff.',
          startedAt: Date.now() - 10 ** 100,
          endedAt: Date.now() - 10 ** 10
        }
      ],
      experience: [
        {
          title: 'Something Something Company',
          location: 'Somewhere, USA',
          description: 'Did company stuff.',
          startedAt: Date.now() - 10 ** 100,
          endedAt: Date.now() - 10 ** 10
        }
      ],
      skills: ['Something Something Skill'],
      volunteering: [
        {
          title: 'Something Something Place',
          location: 'Somewhere, USA',
          description: 'Did volunteering stuff.',
          startedAt: Date.now() - 10 ** 100,
          endedAt: Date.now() - 10 ** 10
        }
      ]
    },
    views: 125,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: 'v1-user-2',
    salt: 'bfe69b665a1ae64bb7d76c32347adecb',
    key: 'e71e8bbd23df52bec8af8280ad7901ddd0ecd5cc43371915f7a95cd17ce0a8515127bfcd433435425c4d245f4a18efcb08e4484682aeb53fcfce5b536d79e4e4',
    email: 'user2@fake-email.com',
    type: 'staff',
    fullName: null,
    connections: [],
    sections: {
      about: "I'm user two, nice to meet you :)",
      education: [
        {
          title: 'Something Something College',
          location: 'Somewhere, USA',
          description: 'Did college stuff.',
          startedAt: Date.now() - 10 ** 100,
          endedAt: Date.now() - 10 ** 50
        },
        {
          title: 'Something Something Secondary College',
          location: 'Somewhere Else, USA',
          description: 'Did more college stuff.',
          startedAt: Date.now() - 10 ** 50,
          endedAt: Date.now() - 10 ** 25
        },
        {
          title: 'Something Something Graduate School',
          location: 'Someplace, USA',
          description: 'Did even more college stuff.',
          startedAt: Date.now() - 10 ** 25,
          endedAt: Date.now() - 10 ** 5
        }
      ],
      experience: [
        {
          title: 'Something Something Company',
          location: 'Somewhere, USA',
          description: 'Did company stuff.',
          startedAt: Date.now() - 10 ** 100,
          endedAt: Date.now() - 10 ** 10
        },
        {
          title: 'Something Something Else Company',
          location: 'Somewhere Else, USA',
          description: 'Doing different company stuff.',
          startedAt: Date.now() - 10 ** 50,
          endedAt: null
        },
        {
          title: 'Third Company',
          location: 'Third Location, USA',
          description: 'Doing different company stuff.',
          startedAt: Date.now() - 10 ** 25,
          endedAt: Date.now() - 10 ** 5
        },
        {
          title: 'Fourth Company',
          location: 'Fourth Location, USA',
          description: 'Doing different company stuff.',
          startedAt: Date.now(),
          endedAt: null
        }
      ],
      skills: [
        'Skill One',
        'Skill Two',
        'Skill Three',
        'Skill Four',
        'Skill Five',
        'Skill Six',
        'Skill Seven',
        'Skill Eight'
      ],
      volunteering: [
        {
          title: 'Something Something Place 1',
          location: 'Somewhere, USA',
          description: 'Did volunteering stuff.',
          startedAt: Date.now() - 10 ** 100,
          endedAt: Date.now() - 10 ** 80
        },
        {
          title: 'Something Something Place 2',
          location: 'Somewhere, USA',
          description: 'Did volunteering stuff.',
          startedAt: Date.now() - 10 ** 80,
          endedAt: Date.now() - 10 ** 60
        },
        {
          title: 'Something Something Place 3',
          location: 'Somewhere, USA',
          description: 'Did volunteering stuff.',
          startedAt: Date.now() - 10 ** 60,
          endedAt: Date.now() - 10 ** 40
        },
        {
          title: 'Something Something Place 4',
          location: 'Wakanda',
          description: 'Did volunteering stuff.',
          startedAt: Date.now() - 10 ** 40,
          endedAt: Date.now() - 10 ** 20
        },
        {
          title: 'Something Something Place 5',
          location: 'Somewhere, USA',
          description: 'Did volunteering stuff.',
          startedAt: Date.now() - 10 ** 20,
          endedAt: Date.now()
        }
      ]
    },
    views: 125_024,
    createdAt: Date.now() - 10 ** 10,
    updatedAt: Date.now()
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    username: 'v2-user-x',
    salt: '91db41c494502f9ebb6217e4590cccc2',
    key: '17660270f4c4c1741ab9d43e6fb800bc784f0a3bc2f4cd31f0e26bf821ef2ae788f83af134d8c3824f5e0552f8cd432d6b23963d2ffbceb6a7c91b0f59533206',
    email: 'v2-user-x@fake-email.com',
    type: 'inner',
    fullName: 'Robert "Bobby" Axelrod',
    connections: [],
    sections: {
      about: "Me? I'm worth a billion bucks!",
      education: [],
      experience: [],
      skills: [],
      volunteering: []
    },
    views: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const sessions: InternalSession[] = [
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    lastRenewedDate: new Date(mockDateNowMs),
    user_id: null,
    view: 'auth',
    viewed_id: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    lastRenewedDate: new Date(
      mockDateNowMs - Math.floor(getEnv().SESSION_EXPIRE_AFTER_SECONDS / 2) * 1000
    ),
    user_id: users[0]._id,
    view: 'home',
    viewed_id: null,
    createdAt: Date.now() - 10 ** 3,
    updatedAt: Date.now() - 1000
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    lastRenewedDate: new Date(
      mockDateNowMs - getEnv().SESSION_EXPIRE_AFTER_SECONDS * 2000
    ),
    user_id: users[0]._id,
    view: 'profile',
    viewed_id: users[0]._id,
    createdAt: Date.now() - 100,
    updatedAt: Date.now() - 100
  }
];

const opportunities: InternalOpportunity[] = [
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    creator_id: users[0]._id,
    title: 'Opportunity #1',
    contents: 'This is the **Markdown Text** for Opportunity One.',
    views: 0,
    createdAt: Date.now() - 1000,
    updatedAt: Date.now()
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    creator_id: users[0]._id,
    title: 'Opportunity #2',
    contents: 'This is the **Markdown Text** for Opportunity Two!',
    views: 987,
    createdAt: Date.now() - 10 ** 5,
    updatedAt: Date.now() - 10 ** 3
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    creator_id: users[2]._id,
    title: 'Opportunity #3',
    contents: 'This is the **Markdown Text** for Opportunity Three!',
    views: 10 ** 7,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const articles: InternalArticle[] = [
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    creator_id: users[0]._id,
    title: 'Article #1',
    contents: 'This is the **Markdown Text** for Article One.',
    views: 0,
    keywords: [],
    createdAt: Date.now() - 1000,
    updatedAt: Date.now()
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    creator_id: users[1]._id,
    title: 'Article #2',
    contents: 'This is the **Markdown Text** for Article Two!',
    views: 789,
    keywords: ['article', 'two'],
    createdAt: Date.now() - 10 ** 5,
    updatedAt: Date.now() - 10 ** 3
  },
  {
    _id: new ObjectId(),
    __provenance: dummyRootData.auth[0].attributes.owner,
    creator_id: users[1]._id,
    title: 'Article #3',
    contents: 'This is the **Markdown Text** for Article Three!',
    views: 10 ** 7 - 4,
    keywords: ['article', 'three'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const info: [InternalInfo] = [
  {
    _id: new ObjectId(),
    articles: articles.length,
    opportunities: opportunities.length,
    users: users.length,
    // eslint-disable-next-line unicorn/no-array-reduce
    views: [...articles, ...opportunities, ...users].reduce((total, obj) => {
      return total + obj.views;
    }, 0)
  }
];

// * The first user and the third user are connected
users[0].connections.push(users[2]._id);
users[2].connections.push(users[0]._id);

/**
 * Test data for the application database.
 */
export const dummyAppData: DummyAppData = {
  _generatedAt: mockDateNowMs,
  articles,
  info,
  opportunities,
  sessions,
  users
};
