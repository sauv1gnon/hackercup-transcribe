import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

interface DeliveryStatus {
  currentPhase: number;
  phases: Record<string, { status: string }>;
}

interface ModuleBoundary {
  id: string;
  path: string;
  allowedInternalDependencies: string[];
}

interface ModuleBoundaryContract {
  modules: ModuleBoundary[];
}

interface RuntimeVariable {
  name: string;
  kind: 'configuration' | 'public_configuration' | 'secret';
  exposure: 'browser_safe' | 'server_only';
  source?: 'runtime_injection';
  value?: unknown;
  default?: unknown;
}

interface RuntimeConfigurationContract {
  dotenvFilesAllowed: boolean;
  credentialFilesAllowed: boolean;
  variables: RuntimeVariable[];
}

interface OpenApiDocument {
  openapi: string;
  paths: Record<string, unknown>;
}

const repositoryRoot = process.cwd();

async function readJson<T>(repositoryPath: string): Promise<T> {
  const contents = await readFile(path.join(repositoryRoot, repositoryPath), 'utf8');
  return JSON.parse(contents) as T;
}

describe('Delivery foundation', () => {
  it('opens Phase 1 explicitly while keeping later phases closed', async () => {
    const status = await readJson<DeliveryStatus>('docs/delivery/status.json');

    expect(status.currentPhase).toBe(1);
    expect(status.phases['phase0']?.status).toBe('complete');
    expect(status.phases['phase1']?.status).toBe('in_progress');
    expect(status.phases['phase2']?.status).toBe('not_started');
  });

  it('reserves every declared module path', async () => {
    const boundaries = await readJson<ModuleBoundaryContract>('specs/module-boundaries.json');

    await Promise.all(
      boundaries.modules.map(async (module) => {
        await expect(access(path.join(repositoryRoot, module.path, 'README.md'))).resolves.toBe(
          undefined,
        );
      }),
    );
  });

  it('defines a complete acyclic internal dependency graph', async () => {
    const boundaries = await readJson<ModuleBoundaryContract>('specs/module-boundaries.json');
    const ids = boundaries.modules.map((module) => module.id);
    const knownIds = new Set(ids);

    expect(knownIds.size).toBe(ids.length);

    for (const module of boundaries.modules) {
      for (const dependency of module.allowedInternalDependencies) {
        expect(knownIds.has(dependency)).toBe(true);
        expect(dependency).not.toBe(module.id);
      }
    }

    const dependencies = new Map(
      boundaries.modules.map((module) => [module.id, module.allowedInternalDependencies]),
    );
    const visited = new Set<string>();
    const active = new Set<string>();

    function visit(moduleId: string): void {
      if (active.has(moduleId)) {
        throw new Error(`Circular module dependency contains ${moduleId}.`);
      }

      if (visited.has(moduleId)) {
        return;
      }

      active.add(moduleId);
      for (const dependency of dependencies.get(moduleId) ?? []) {
        visit(dependency);
      }
      active.delete(moduleId);
      visited.add(moduleId);
    }

    for (const moduleId of ids) {
      visit(moduleId);
    }

    expect(visited.size).toBe(ids.length);
  });

  it('validates machine-readable foundation contracts against their schemas', async () => {
    const ajv = new Ajv({
      allErrors: true,
      strict: true,
      validateFormats: false,
    });
    const pairs = [
      {
        instance: 'specs/module-boundaries.json',
        schema: 'specs/schemas/module-boundaries.schema.json',
      },
      {
        instance: 'specs/runtime-configuration.json',
        schema: 'specs/schemas/runtime-configuration.schema.json',
      },
      {
        instance: 'docs/delivery/status.json',
        schema: 'docs/delivery/status.schema.json',
      },
    ];

    for (const pair of pairs) {
      const schema = await readJson<object>(pair.schema);
      const instance = await readJson<unknown>(pair.instance);
      const validate = ajv.compile(schema);
      const isValid = validate(instance);

      expect(validate.errors, `${pair.instance} must conform to ${pair.schema}`).toBeNull();
      expect(isValid).toBe(true);
    }

    const evaluationSchema = await readJson<object>('specs/schemas/evaluation-record.schema.json');
    expect(() => ajv.compile(evaluationSchema)).not.toThrow();
  });

  it('declares only runtime-injected, server-only secrets with no values', async () => {
    const runtime = await readJson<RuntimeConfigurationContract>(
      'specs/runtime-configuration.json',
    );
    const names = runtime.variables.map((variable) => variable.name);

    expect(runtime.dotenvFilesAllowed).toBe(false);
    expect(runtime.credentialFilesAllowed).toBe(false);
    expect(new Set(names).size).toBe(names.length);

    for (const variable of runtime.variables) {
      expect(variable).not.toHaveProperty('value');
      expect(variable).not.toHaveProperty('default');

      if (variable.kind === 'secret') {
        expect(variable.exposure).toBe('server_only');
        expect(variable.source).toBe('runtime_injection');
        expect(variable.name.startsWith('VITE_')).toBe(false);
      }
    }
  });

  it('keeps OCR review separate from localisation in the planned API', async () => {
    const contents = await readFile(path.join(repositoryRoot, 'specs/openapi.yaml'), 'utf8');
    const document = parseYaml(contents) as OpenApiDocument;

    expect(document.openapi).toBe('3.1.0');
    expect(Object.keys(document.paths)).toEqual(
      expect.arrayContaining([
        '/api/v1/health',
        '/api/v1/languages',
        '/api/v1/localisations',
        '/api/v1/ocr/extractions',
      ]),
    );
    expect(document.paths).not.toHaveProperty('/api/v1/localise/image');
  });

  it('creates a workspace manifest for each Phase 1 owning module', async () => {
    const boundaries = await readJson<ModuleBoundaryContract>('specs/module-boundaries.json');

    await Promise.all(
      boundaries.modules.map(async (module) => {
        await expect(
          access(path.join(repositoryRoot, module.path, 'package.json')),
        ).resolves.toBeUndefined();
      }),
    );
  });
});
