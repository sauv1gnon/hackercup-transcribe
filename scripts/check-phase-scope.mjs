import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repositoryRoot = process.cwd();
const ignoredDirectories = new Set(['.git', 'coverage', 'dist', 'node_modules']);
const phaseZeroModuleFiles = new Set(['.gitkeep', 'AGENTS.md', 'README.md']);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries
      .filter((entry) => !ignoredDirectories.has(entry.name))
      .map(async (entry) => {
        const absolutePath = path.join(directory, entry.name);
        return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
      }),
  );

  return nestedFiles.flat();
}

function toRepositoryPath(absolutePath) {
  return path.relative(repositoryRoot, absolutePath).replaceAll(path.sep, '/');
}

const statusPath = path.join(repositoryRoot, 'docs', 'delivery', 'status.json');
const status = JSON.parse(await readFile(statusPath, 'utf8'));
const repositoryFiles = await listFiles(repositoryRoot);
const failures = [];

for (const absolutePath of repositoryFiles) {
  const fileName = path.basename(absolutePath);
  if (fileName === '.env' || fileName.startsWith('.env.')) {
    failures.push(`Dotenv file is forbidden: ${toRepositoryPath(absolutePath)}`);
  }
}

if (status.currentPhase === 0 && status.phases.phase1.status === 'not_started') {
  const featureFiles = repositoryFiles
    .map(toRepositoryPath)
    .filter((filePath) => filePath.startsWith('apps/') || filePath.startsWith('packages/'))
    .filter((filePath) => !phaseZeroModuleFiles.has(path.basename(filePath)));

  for (const featureFile of featureFiles) {
    failures.push(`Phase 1 implementation is not allowed while Phase 0 is active: ${featureFile}`);
  }
}

const runtimeConfigurationPath = path.join(repositoryRoot, 'specs', 'runtime-configuration.json');
const runtimeConfiguration = JSON.parse(await readFile(runtimeConfigurationPath, 'utf8'));

if (runtimeConfiguration.dotenvFilesAllowed !== false) {
  failures.push('The runtime configuration contract must forbid dotenv files.');
}

for (const variable of runtimeConfiguration.variables) {
  if ('value' in variable || 'default' in variable) {
    failures.push(`Runtime configuration must not store a value or default: ${variable.name}`);
  }

  if (
    variable.kind === 'secret' &&
    (variable.exposure !== 'server_only' || variable.source !== 'runtime_injection')
  ) {
    failures.push(`Secret must be server-only and runtime-injected: ${variable.name}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Phase scope and runtime-secret policy are valid.');
}
