#!/usr/bin/env ts-node
/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';

// Output shape (compatible with your example)
type ModelNode = {
  id: string;
  label: string;
  layers: Array<{
    id: string;
    label: string;
    neurons: Array<{
      id: string;
      label: string;
    }>;
  }>;
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' || a === '-i') args.input = argv[++i];
    else if (a === '--output' || a === '-o') args.output = argv[++i];
  }
  if (!args.input || !args.output) {
    console.error(
      'Usage: cv-to-models.ts --input <cv.json> --output <models.ts>'
    );
    process.exit(1);
  }
  return args as { input: string; output: string };
}

function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base || 'item';
  if (!used.has(id)) {
    used.add(id);
    return id;
  }
  let n = 2;
  while (used.has(`${id}-${n}`)) n++;
  const out = `${id}-${n}`;
  used.add(out);
  return out;
}

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function ensureDir(outFile: string) {
  const dir = path.dirname(outFile);
  fs.mkdirSync(dir, { recursive: true });
}

function toModels(repos: any): ModelNode[] {
  const usedLayerIds = new Set<string>();
  const layers = repos.map((r: any, ri: number) => {
    const layerBase = slugify(r.lang.en.name) || `job-${ri + 1}`;
    const layerId = uniqueId(layerBase, usedLayerIds);
    return {
      id: layerId,
      label: r.lang.en.name,
      neurons: [
        { id: 'url', label: 'url' },
        { id: 'description', label: 'description' },
        { id: 'technologies', label: 'technologies' }
      ]
    };
  });
  return [
    {
      id: 'repositories',
      label: 'Repositories',
      layers
    }
  ];
}

function tsLiteral(obj: unknown): string {
  // Pretty JSON-like, but valid TS literal for simple objects
  return JSON.stringify(obj, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // unquote keys
    .replace(/"projects"/g, '"projects"') // keep string literal types as strings
    .replace(/"project"/g, '"project"');
}

function main() {
  const { input, output } = parseArgs(process.argv.slice(2));
  const cv = readJson<any>(input);

  const models = toModels(cv);

  const content = `import type { ModelNode } from '@israellopezdeveloper/nn3d';

export const nn_projects: ModelNode[] = ${tsLiteral(models)} as ModelNode[];
`;

  ensureDir(output);
  fs.writeFileSync(output, content, 'utf8');
  console.log(`✅ Generated: ${output}`);
}

main();
