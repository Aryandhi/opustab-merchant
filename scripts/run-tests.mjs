import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const getEnvVar = (...names) => {
  for (const name of names) {
    if (process.env[name] !== undefined) {
      return process.env[name];
    }
  }

  const lowerNames = names.map((name) => name.toLowerCase());
  for (const [key, value] of Object.entries(process.env)) {
    if (lowerNames.includes(key.toLowerCase())) {
      return value;
    }
  }

  return undefined;
};

const args = process.argv.slice(2);
const [modeArg, ...restArgs] = args;

const npmArgvRaw = getEnvVar('npm_config_argv', 'NPM_CONFIG_ARGV');
const npmArgv = npmArgvRaw ? JSON.parse(npmArgvRaw) : undefined;
const npmOriginalArgs = Array.isArray(npmArgv?.original) ? npmArgv.original : [];
const hasOriginalFlag = (flag) => npmOriginalArgs.includes(flag);

const mode = modeArg ?? 'dev';
const envName = restArgs[0] ?? 'dev';
let playwrightArgs = restArgs;

const omitDev = getEnvVar('npm_config_omit', 'NPM_CONFIG_OMIT') === 'dev';
const npmConfig = hasOriginalFlag('--production') || omitDev ? 'production' : getEnvVar('npm_config_env', 'NPM_CONFIG_ENV');
const headed = hasOriginalFlag('--headed') || getEnvVar('npm_config_headed', 'NPM_CONFIG_HEADED') === 'true';
const ui = hasOriginalFlag('--ui') || getEnvVar('npm_config_ui', 'NPM_CONFIG_UI') === 'true';

const env = {
  ...process.env,
};

if (mode === 'all') {
  env.TEST_ENV_MODE = 'all';
  playwrightArgs = restArgs;
} else if (mode === 'env') {
  env.TEST_ENV_MODE = 'single';
  env.TEST_ENV_NAME = npmConfig ?? envName;
  playwrightArgs = restArgs.slice(1);
} else {
  env.TEST_ENV_MODE = 'single';
  env.TEST_ENV_NAME = mode;
  playwrightArgs = restArgs;
}

if (headed && !playwrightArgs.includes('--headed')) {
  playwrightArgs.push('--headed');
}

if (ui && !playwrightArgs.includes('--ui')) {
  playwrightArgs.push('--ui');
}

const playwrightCli = require.resolve('@playwright/test/cli');
const result = spawnSync(process.execPath, [playwrightCli, 'test', ...playwrightArgs], {
  stdio: 'inherit',
  env,
  shell: false,
});

process.exit(result.status ?? 1);