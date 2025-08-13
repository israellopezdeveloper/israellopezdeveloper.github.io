export type Lang = "en" | "es" | "zh";

export const LANGS: Lang[] = ["en", "es", "zh"];

export function getCvUrl(lang: Lang, short: boolean) {
  const postfix = short ? ".s" : "";
  return `/cv/CV.${lang}${postfix}.json`;
}
