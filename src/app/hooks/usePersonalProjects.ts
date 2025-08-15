'use client';

import * as React from 'react';

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

export type PersonalProject = {
  id: number;
  url: string;
  thumbnail?: string;
  lang: Record<LangKey, { name: string; desc?: string }>;
  technologies?: { tech: string; time: number }[];
};

function monthsSince(dateISO: string): number {
  const start = new Date(dateISO);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(1, months);
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed ${url}: ${r.status}`);
  return r.json() as Promise<T>;
}

async function fetchRepoMeta(
  repo: RepoAPI,
): Promise<{ meta?: RepoMeta; thumb?: string }> {
  const rawBase = repo.html_url.replace(
    'github.com',
    'raw.githubusercontent.com',
  );
  const metaUrl = `${rawBase}/metadata-branch/metadata.json`;
  const logoUrl = `${rawBase}/metadata-branch/logo.png`;

  try {
    const meta = await fetchJson<RepoMeta>(metaUrl);
    // Con exactOptionalPropertyTypes, evita { meta: undefined }
    return { ...(meta ? { meta } : {}), ...(meta ? { thumb: logoUrl } : {}) };
  } catch {
    return {}; // sin claves → no meta/thumbnail
  }
}

type BackupItem = {
  technologies?: { tech: string; time: number }[];
  lang: Record<LangKey, { name: string; desc?: string }>;
  url: string;
  thumbnail?: string;
};

// hash estable a partir de la URL para generar un id numérico
function idFromUrl(url: string): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h * 31 + url.charCodeAt(i)) | 0;
  }
  // fuerza positivo
  return Math.abs(h) || 1;
}

async function loadBackup(): Promise<PersonalProject[]> {
  const data = await fetchJson<BackupItem[]>('/backup.repos.json');
  return (data || []).map((b) => ({
    id: idFromUrl(b.url),
    url: b.url,
    ...(b.thumbnail ? { thumbnail: b.thumbnail } : {}),
    lang: {
      en: {
        name: b.lang.en.name,
        ...(b.lang.en.desc ? { desc: b.lang.en.desc } : {}),
      },
      es: {
        name: b.lang.es.name,
        ...(b.lang.es.desc ? { desc: b.lang.es.desc } : {}),
      },
      zh: {
        name: b.lang.zh.name,
        ...(b.lang.zh.desc ? { desc: b.lang.zh.desc } : {}),
      },
    },
    ...(b.technologies?.length ? { technologies: b.technologies } : {}),
  }));
}

export function usePersonalProjects(username = 'israellopezdeveloper'): {
  data: PersonalProject[];
  loading: boolean;
  error: unknown;
} {
  const [data, setData] = React.useState<PersonalProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        // 1) Repos del usuario
        let repos: RepoAPI[];
        try {
          repos = await fetchJson<RepoAPI[]>(
            `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
          );
        } catch {
          // fallo completo de GitHub → usa backup
          const backup = await loadBackup();
          if (!cancelled) {
            setData(backup);
            setLoading(false);
            setError(null); // tenemos datos de respaldo
          }
          return;
        }

        // Si GitHub devolvió 0 (rate-limit raro o usuario sin repos) → backup
        if (!repos || repos.length === 0) {
          const backup = await loadBackup();
          if (!cancelled) {
            setData(backup);
            setLoading(false);
            setError(null);
          }
          return;
        }

        // 2) Enriquecer cada repo
        const enriched = await Promise.all(
          repos.map(async (repo: RepoAPI): Promise<PersonalProject> => {
            const time = monthsSince(repo.created_at);

            // Lenguajes del repo
            let languages: string[] = [];
            try {
              const langsObj = await fetchJson<Record<string, number>>(
                repo.languages_url,
              );
              languages = Object.keys(langsObj || {});
            } catch {
              /* si falla languages_url, seguimos sin tirar toda la carga */
            }

            // Metadatos opcionales
            const { meta, thumb } = await fetchRepoMeta(repo);

            // Techs fusionadas (únicas)
            const techsSet = new Set<string>([
              ...languages,
              ...(meta?.technologies ?? []),
            ]);
            const technologies = Array.from(techsSet).map((tech) => ({
              tech,
              time,
            }));

            const fallbackName = repo.name;
            const fallbackDesc = repo.description ?? undefined;

            const makeLang = (
              k: LangKey,
            ): {
              desc?: string;
              name: string;
            } => {
              const name = meta?.lang?.[k]?.name ?? fallbackName;
              const desc = meta?.lang?.[k]?.desc ?? fallbackDesc;
              return { name, ...(desc ? { desc } : {}) };
            };

            const item: PersonalProject = {
              id: repo.id,
              url: repo.html_url,
              ...(thumb ? { thumbnail: thumb } : {}),
              lang: {
                en: makeLang('en'),
                es: makeLang('es'),
                zh: makeLang('zh'),
              },
              ...(technologies.length ? { technologies } : {}),
            };

            return item;
          }),
        );

        if (!cancelled) {
          console.warn(enriched);
          setData(enriched);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        // Cualquier otro error inesperado → intenta backup
        try {
          const backup = await loadBackup();
          if (!cancelled) {
            setData(backup);
            setLoading(false);
            setError(null);
          }
        } catch (fallbackErr) {
          if (!cancelled) {
            setError(err ?? fallbackErr);
            setLoading(false);
          }
        }
      }
    }

    run().catch((err: Error): void => {
      console.error(err);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  return { data, loading, error };
}
