#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

type LangKey = 'en' | 'es' | 'zh';

type RepoAPI = {
  id: number;
  name: string;
  html_url: string;
  created_at: string;
  languages_url: string;
  description: string | null;
};

type RepoMeta = {
  lang?: Partial<Record<LangKey, { name: string; desc?: string }>>;
  technologies?: string[];
};

type PersonalProject = {
  id: number;
  url: string;
  thumbnail?: string;
  lang: Record<LangKey, { name: string; desc?: string }>;
  technologies?: { tech: string; time: number }[];
};

/* -------------------------------- utilities ------------------------------- */

function monthsSince(dateISO: string): number {
  const start = new Date(dateISO);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(1, months);
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {})
    }
  });
  if (!r.ok) throw new Error(`Failed ${url}: ${r.status}`);
  return (await r.json()) as T;
}

async function fetchRepoMeta(
  repo: RepoAPI
): Promise<{ meta?: RepoMeta; thumb?: string }> {
  const rawBase = repo.html_url.replace(
    'github.com',
    'raw.githubusercontent.com'
  );
  const metaUrl = `${rawBase}/metadata-branch/metadata.json`;
  const logoUrl = `${rawBase}/metadata-branch/logo.png`;

  try {
    const meta = await fetchJson<RepoMeta>(metaUrl);
    return { meta, thumb: logoUrl };
  } catch {
    return {};
  }
}

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

/* ---------------------------------- main ---------------------------------- */

async function main(): Promise<void> {
  const username = parseArg('--username') ?? 'israellopezdeveloper';
  const outPath = parseArg('--out');

  if (!outPath) {
    console.error('❌ Missing --out <path>');
    process.exit(1);
  }

  console.log(`▶ Fetching repos for ${username}`);

  const repos = await fetchJson<RepoAPI[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
  );

  const projects: PersonalProject[] = await Promise.all(
    repos.map(async (repo): Promise<PersonalProject> => {
      const time = monthsSince(repo.created_at);

      // Languages
      let languages: string[] = [];
      try {
        const langs = await fetchJson<Record<string, number>>(
          repo.languages_url
        );
        languages = Object.keys(langs || {});
      } catch {}

      // Optional metadata
      const { meta, thumb } = await fetchRepoMeta(repo);

      const techs = new Set<string>([
        ...languages,
        ...(meta?.technologies ?? [])
      ]);

      const fallbackName = repo.name;
      const fallbackDesc = repo.description ?? undefined;

      const makeLang = (k: LangKey) => ({
        name: meta?.lang?.[k]?.name ?? fallbackName,
        ...(meta?.lang?.[k]?.desc || fallbackDesc
          ? { desc: meta?.lang?.[k]?.desc ?? fallbackDesc }
          : {})
      });

      return {
        id: repo.id,
        url: repo.html_url,
        ...(thumb ? { thumbnail: thumb } : {}),
        lang: {
          en: makeLang('en'),
          es: makeLang('es'),
          zh: makeLang('zh')
        },
        ...(techs.size
          ? {
              technologies: Array.from(techs).map((tech) => ({
                tech,
                time
              }))
            }
          : {})
      };
    })
  );

  const absOut = path.resolve(outPath);
  await fs.mkdir(path.dirname(absOut), { recursive: true });
  await fs.writeFile(absOut, JSON.stringify(projects, null, 2));

  console.log(`✅ Saved ${projects.length} projects to`);
  console.log(`   ${absOut}`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
