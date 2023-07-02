/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-await-in-loop */
import { ObjectId } from 'mongodb';
import { AppError } from 'named-app-errors';
import inquirer, { type PromptModule } from 'inquirer';

import { debugNamespace as namespace } from 'universe/constants';
import { getEnv } from 'universe/backend/env';

import { debugFactory } from 'multiverse/debug-extended';
import { getDb } from 'multiverse/mongo-schema';

import type { InternalInfo } from 'universe/backend/db';

const debugNamespace = `${namespace}:initialize-data`;

const log = debugFactory(debugNamespace);
const debug = debugFactory(`${debugNamespace}:debug`);
const logOrDebug = () => {
  return log.enabled ? log : debug;
};

// eslint-disable-next-line no-console
log.log = console.info.bind(console);

// ? Ensure this next line survives Webpack
if (!globalThis.process.env.DEBUG && getEnv().NODE_ENV !== 'test') {
  debugFactory.enable(
    `${debugNamespace},${debugNamespace}:*,-${debugNamespace}:debug`
  );
}

/**
 * Returns the `inquirer` instance unless a string `testPrompterParams` is given
 * (passed to URLSearchParams, usually provided by a TEST_PROMPTER_X environment
 * variable), in which case a passthrough promise that resolves to a simulated
 * answer object based on `testPrompterParams` is returned as the resolved
 * result of calling `prompt()` instead.
 */
const getPrompter = (testPrompterParams?: string): { prompt: PromptModule } => {
  return testPrompterParams
    ? {
        prompt: (() => {
          debug(
            `using simulated inquirer prompt based on params: ${testPrompterParams}`
          );

          return Promise.resolve(
            Object.fromEntries(
              Array.from(new URLSearchParams(testPrompterParams).entries())
            )
          );
        }) as unknown as PromptModule
      }
    : inquirer;
};

/**
 * Setups up a database from scratch by creating collections (only if they do
 * not already exist) and populating them with a large amount of data. Suitable
 * for initializing local machines or production instances alike.
 *
 * This function is data-preserving (all actions are non-destructive: data is
 * never overwritten or deleted)
 */
const invoked = async () => {
  try {
    const answers = await getPrompter(process.env.TEST_PROMPTER_INITIALIZER).prompt<{
      action: string;
      token: string;
    }>([
      {
        name: 'action',
        message: 'select an initializer action',
        type: 'list',
        choices: [
          {
            name: 'commit initial state to database',
            value: 'commit'
          },
          { name: 'exit', value: 'exit' }
        ]
      }
    ]);

    switch (answers.action) {
      case 'exit': {
        break;
      }

      case 'commit': {
        const [, infoDb] = await Promise.all([
          getDb({ name: 'root' }),
          (await getDb({ name: 'app' })).collection<InternalInfo>('info')
        ]);

        if ((await infoDb.countDocuments()) === 0) {
          await infoDb.insertOne({
            _id: new ObjectId(),
            blogs: 0,
            pages: 0,
            users: 0
          });
        }

        await getPrompter(process.env.TEST_PROMPTER_FINALIZER).prompt<{
          action: string;
          token: string;
        }>([
          {
            name: 'action',
            message: 'what now?',
            type: 'list',
            choices: [{ name: 'exit', value: 'exit' }]
          }
        ]);
        break;
      }
    }

    logOrDebug()('execution complete');
    process.exit(0);
  } catch (error) {
    throw new AppError(`${error}`);
  }
};

export default invoked().catch((error: Error) => {
  log.error(error.message);
  process.exit(2);
});
