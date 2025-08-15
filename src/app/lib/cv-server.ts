import { promises as fs } from 'fs';
import path from 'path';

import {
  getItemSlug,
  getUniversitySlug,
  getComplementarySlug,
  getLanguageSlug,
} from './slug';

export type Lang = 'en' | 'es' | 'zh';
export const ALL_LANGS: Lang[] = ['en', 'es', 'zh'];

type WorkLite = { slug?: string; name: string };
type UnivLite = {
  slug?: string;
  title?: string;
  university_name?: string;
  thumbnail?: string;
  period_time?: string;
  summary?: string[];
};
type CompLite = {
  slug?: string;
  title?: string;
  institution?: string;
  thumbnail?: string;
  period_time?: string;
  summary?: string[];
};
type AcreditationLite = {
  institution: string;
  title: string;
  period_time?: string;
};
type LangLite = {
  slug?: string;
  language?: string;
  thumbnail?: string;
  spoken?: string;
  writen?: string;
  read?: string;
  acreditations?: AcreditationLite[];
};
type EducationsLite = {
  university?: UnivLite[];
  complementary?: CompLite[];
  languages?: LangLite[];
};
type CvLite = {
  works?: WorkLite[];
  personal_projects?: WorkLite[];
  educations?: EducationsLite;
};

async function readIfExists(filePath: string): Promise<CvLite | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as CvLite;
  } catch {
    return null;
  }
}

/** Lee CV.<lang>.json y CV.<lang>.s.json y fusiona educations */
export async function readCvJsonAny(lang: Lang): Promise<{
  works: WorkLite[];
  personal_projects: WorkLite[];
  university: UnivLite[];
  complementary: CompLite[];
  languages: LangLite[];
}> {
  const base = path.join(process.cwd(), 'public', 'cv');
  const longPath = path.join(base, `CV.${lang}.json`);
  const shortPath = path.join(base, `CV.${lang}.s.json`);

  const longData = await readIfExists(longPath);
  const shortData = await readIfExists(shortPath);

  const works = [...(longData?.works ?? []), ...(shortData?.works ?? [])];
  const personal_projects = [
    ...(longData?.personal_projects ?? []),
    ...(shortData?.personal_projects ?? []),
  ];
  const u = [
    ...(longData?.educations?.university ?? []),
    ...(shortData?.educations?.university ?? []),
  ];
  const c = [
    ...(longData?.educations?.complementary ?? []),
    ...(shortData?.educations?.complementary ?? []),
  ];
  const l = [
    ...(longData?.educations?.languages ?? []),
    ...(shortData?.educations?.languages ?? []),
  ];

  return {
    works,
    personal_projects,
    university: u,
    complementary: c,
    languages: l,
  };
}

export async function collectUniversityIds(): Promise<string[]> {
  const ids = new Set<string>();
  for (const lang of ALL_LANGS) {
    const cv = await readCvJsonAny(lang);
    for (const it of cv.university) ids.add(getUniversitySlug(it));
  }
  return Array.from(ids);
}

export async function collectComplementaryIds(): Promise<string[]> {
  const ids = new Set<string>();
  const cv = await readCvJsonAny('en');
  for (const it of cv.complementary) ids.add(getComplementarySlug(it));
  return Array.from(ids);
}

export async function collectLanguageIds(): Promise<string[]> {
  const ids = new Set<string>();
  for (const lang of ALL_LANGS) {
    const cv = await readCvJsonAny(lang);
    for (const it of cv.languages) ids.add(getLanguageSlug(it));
  }
  return Array.from(ids);
}

/** Junta TODOS los slugs de works y personal_projects en TODOS los idiomas */
export async function collectWorkIds(): Promise<string[]> {
  const ids = new Set<string>();
  for (const lang of ALL_LANGS) {
    const cv = await readCvJsonAny(lang);
    for (const w of cv.works) ids.add(getItemSlug(w));
    for (const p of cv.personal_projects) ids.add(getItemSlug(p));
  }
  return Array.from(ids);
}
