"use client";

import * as React from "react";
import { HStack, chakra } from "@chakra-ui/react";
import { useLanguage } from "./context/LanguageContext";
import type { Lang } from "../lib/i18n";
import { useI18n } from "../i18n/useI18n";

// elementos nativos tipados, pero con props de Chakra
const SelectEl = chakra("select");
const CheckboxEl = chakra("input");
const LabelEl = chakra("label");

export default function LanguageSelector() {
  const { lang, setLang, short, setShort } = useLanguage();
  const t = useI18n();

  return (
    <HStack gap={3} align="center">
      <SelectEl
        id="lang"
        value={lang}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setLang(e.target.value as Lang)
        }
        fontSize="sm"
        px="2"
        py="1"
        borderWidth="1px"
        rounded="md"
        bg="bg"
      >
        <option value="en">🇬🇧</option>
        <option value="es">🇪🇸</option>
        <option value="zh">🇨🇳</option>
      </SelectEl>

      <LabelEl htmlFor="short-toggle" fontSize="xs" cursor="pointer">
        {t("short")}
      </LabelEl>

      <CheckboxEl
        id="short-toggle"
        type="checkbox"
        checked={short}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setShort(e.target.checked)
        }
      />
    </HStack>
  );
}

