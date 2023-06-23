import { debugNamespace as namespace } from 'universe/constants';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';

import {
  mockEnvFactory,
  protectedImportFactory,
  withMockedOutput
} from 'testverse/setup';

void namespace;

// ? Ensure the isolated external picks up the memory server override
jest.mock('multiverse/mongo-schema', (): typeof import('multiverse/mongo-schema') => {
  return jest.requireActual('multiverse/mongo-schema');
});

const withMockedEnv = mockEnvFactory({
  // ! For max test perf, ensure this next line is commented out unless needed
  //DEBUG: `${namespace}:initialize-data,${namespace}:initialize-data:*`,

  // ? Use these to control the options auto-selected for inquirer. Note that
  // ? these values must either be empty/undefined or a valid URL query string.
  TEST_PROMPTER_INITIALIZER: 'action=commit',
  TEST_PROMPTER_FINALIZER: 'action=exit',

  NODE_ENV: 'test',
  MONGODB_URI: 'fake'
});

const importInitializeData = protectedImportFactory<
  typeof import('externals/initialize-data').default
>({
  path: 'externals/initialize-data',
  useDefault: true
});

setupMemoryServerOverride();

it('is verbose when no DEBUG environment variable set and compiled NODE_ENV is not test', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ infoSpy }) => {
    await withMockedEnv(() => importInitializeData({ expectedExitCode: 0 }), {
      DEBUG: undefined,
      NODE_ENV: 'something-else',
      OVERRIDE_EXPECT_ENV: 'force-no-check'
    });

    expect(infoSpy.mock.calls.at(-1)?.[0]).toStrictEqual(
      expect.stringContaining('execution complete')
    );
  });

  await withMockedOutput(async ({ infoSpy }) => {
    await withMockedEnv(() => importInitializeData({ expectedExitCode: 0 }));
    expect(infoSpy).not.toBeCalled();
  });
});
