import { readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const containerName = 'fynda-db-test';
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDirectory = join(repositoryRoot, 'supabase', 'migrations');
const testsDirectory = join(repositoryRoot, 'supabase', 'tests');
const passLines = [];
let containerStarted = false;

function runDocker(args, { inspectOutput = false } = {}) {
  const result = spawnSync('docker', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    shell: false,
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n');

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`docker ${args[0]} failed with exit code ${result.status}:\n${output}`);
  }
  if (inspectOutput && /\b(?:FAIL|ERROR)\b/i.test(output)) {
    throw new Error(`Database test output contains FAIL or ERROR:\n${output}`);
  }

  if (inspectOutput) {
    for (const line of output.split(/\r?\n/)) {
      if (/\bPASS\b/.test(line)) {
        const cleanLine = line.trim();
        passLines.push(cleanLine);
        console.log(cleanLine);
      }
    }
  }

  return output;
}

function waitForPostgres() {
  const deadline = Date.now() + 60_000;
  let consecutiveReadyChecks = 0;

  while (Date.now() < deadline) {
    const result = spawnSync(
      'docker',
      ['exec', containerName, 'pg_isready', '-U', 'postgres'],
      { cwd: repositoryRoot, encoding: 'utf8', shell: false },
    );

    if (!result.error && result.status === 0) {
      consecutiveReadyChecks += 1;
      if (consecutiveReadyChecks === 5) {
        return;
      }
    } else {
      consecutiveReadyChecks = 0;
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }

  throw new Error('Postgres did not become ready within 60 seconds.');
}

function applySqlFile(filePath) {
  const fileName = basename(filePath);
  const containerPath = `/tmp/${fileName}`;

  runDocker(['cp', filePath, `${containerName}:${containerPath}`]);
  runDocker(
    [
      'exec',
      containerName,
      'psql',
      '-U',
      'postgres',
      '-d',
      'fynda_test',
      '-v',
      'ON_ERROR_STOP=1',
      '-f',
      containerPath,
    ],
    { inspectOutput: true },
  );
}

try {
  runDocker([
    'run',
    '-d',
    '--rm',
    '--name',
    containerName,
    '-e',
    'POSTGRES_PASSWORD=test',
    '-p',
    '55432:5432',
    'postgis/postgis:16-3.4',
  ]);
  containerStarted = true;

  waitForPostgres();
  runDocker(
    [
      'exec',
      containerName,
      'psql',
      '-U',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      'create database fynda_test template template0',
    ],
    { inspectOutput: true },
  );

  const migrationFiles = readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => join(migrationsDirectory, fileName));

  for (const migrationFile of migrationFiles) {
    applySqlFile(migrationFile);
  }
  // Every test file in supabase/tests, so adding a suite needs no runner change.
  const testFiles = readdirSync(testsDirectory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => join(testsDirectory, fileName));

  if (testFiles.length === 0) {
    throw new Error('no test files found in supabase/tests');
  }

  for (const testFile of testFiles) {
    applySqlFile(testFile);
  }

  console.log(`\n${passLines.length} PASS lines across ${testFiles.length} suite(s); database schema tests passed.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (containerStarted) {
    const stopResult = spawnSync('docker', ['stop', containerName], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      shell: false,
    });

    if (stopResult.error || stopResult.status !== 0) {
      const output = [stopResult.stdout, stopResult.stderr].filter(Boolean).join('\n');
      console.error(`Failed to stop ${containerName}:\n${output}`);
      process.exitCode = 1;
    }
  }
}
