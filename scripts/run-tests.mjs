import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const [modeArg, ...restArgs] = args;

const mode = modeArg ?? 'dev';
const envName = restArgs[0] ?? 'dev';
let playwrightArgs = restArgs;

const env = {
  ...process.env,
};

if (mode === 'all') {
  env.TEST_ENV_MODE = 'all';
  playwrightArgs = restArgs;
} else if (mode === 'env') {
  env.TEST_ENV_MODE = 'single';
  env.TEST_ENV_NAME = envName;
  playwrightArgs = restArgs.slice(1);
} else {
  env.TEST_ENV_MODE = 'single';
  env.TEST_ENV_NAME = mode;
  playwrightArgs = restArgs;
}

const playwrightCli = require.resolve('@playwright/test/cli');
const result = spawnSync(process.execPath, [playwrightCli, 'test', ...playwrightArgs], {
  stdio: 'inherit',
  env,
  shell: false,
});

process.exit(result.status ?? 1);