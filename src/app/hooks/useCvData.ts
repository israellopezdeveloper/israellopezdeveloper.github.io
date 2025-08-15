'use client';

import * as React from 'react';

import { getCvUrl, type Lang } from '../lib/i18n';
import { slugify } from '../lib/slug';

import type {
  CV,
  CVComplementary,
  CVLang,
  CVUniversity,
  CVWork,
} from '../types/cv';

const cache = new Map<string, CV>();

export function useCvData(
  lang: Lang,
  short: boolean,
): {
  data: CV | null;
  loading: boolean;
  error: unknown;
} {
  const [data, setData] = React.useState<CV | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    const url = getCvUrl(lang, short);
    if (cache.has(url)) {
      setData(cache.get(url)!);
      setLoading(false);
      return;
    }
    const urlen = getCvUrl('en', true);
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(url, { cache: 'no-cache' }),
      fetch(urlen, { cache: 'no-cache' }),
    ])
      .then(([res1, res2]) => {
        if (!res1.ok || !res2.ok) throw new Error(`Failed to load ${url}`);
        return Promise.all([res1.json(), res2.json()]);
      })
      .then(([json1, jsonen]: CV[]) => {
        if (cancelled || !json1 || !jsonen) return;
        const json: CV = json1;
        json?.educations.complementary.forEach(
          (comp: CVComplementary, i: number) => {
            comp.slug = slugify(
              jsonen?.educations.complementary[i]?.title || '',
            );
          },
        );
        json?.educations.university.forEach((uni: CVUniversity, i: number) => {
          uni.slug = slugify(jsonen?.educations.university[i]?.title || '');
        });
        json?.educations.languages.forEach((lang: CVLang, i: number) => {
          lang.slug = slugify(jsonen?.educations.languages[i]?.language || '');
        });
        json?.works.forEach((work: CVWork, i: number) => {
          work.slug = slugify(jsonen?.works[i]?.name || '');
        });
        cache.set(url, json);
        setData(json);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        if (cancelled) return;
        setError(error);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, short]);

  return { data, loading, error };
}
