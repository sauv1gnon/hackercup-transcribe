import { readRuntimeConfig } from '@salinaral/infrastructure';

import { buildApp } from './app.js';

try {
  const config = readRuntimeConfig(process.env);
  const app = await buildApp(config);
  await app.listen({ host: '0.0.0.0', port: config.port });
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      severity: 'info',
      service: 'salinaral-api',
      version: '0.1.0',
      operation: 'startup',
      resultCategory: 'ready',
    }),
  );
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'API startup failed.';
  console.error(message);
  process.exitCode = 1;
}
