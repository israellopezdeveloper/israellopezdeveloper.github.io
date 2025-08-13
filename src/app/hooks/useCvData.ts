"use client";

import * as React from "react";
import type { CV } from "../types/cv";
import { getCvUrl, type Lang } from "../lib/i18n";

const cache = new Map<string, CV>();

export function useCvData(lang: Lang, short: boolean) {
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
    let cancelled = false;
    setLoading(true);
    fetch(url, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${url}`);
        return r.json();
      })
      .then((json: CV) => {
        if (cancelled) return;
        cache.set(url, json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, short]);

  return { data, loading, error };
}
