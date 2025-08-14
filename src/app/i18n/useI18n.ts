// src/app/i18n/useI18n.ts
"use client";

import * as React from "react";
import { useLanguage } from "../components/context/LanguageContext";
import { LABELS, type LabelKey, type Locale } from "./labels";

export function useI18n() {
  const { lang } = useLanguage(); // debe devolver "es" | "en"
  return React.useCallback(
    (key: LabelKey) => {
      const l = (lang as Locale) ?? "en";
      return LABELS[l]?.[key] ?? LABELS.en[key] ?? key;
    },
    [lang],
  );
}
