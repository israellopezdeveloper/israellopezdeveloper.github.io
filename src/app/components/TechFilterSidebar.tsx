// src/app/components/TechFilterSidebar.tsx
"use client";

import * as React from "react";
import {
  VStack,
  HStack,
  Heading,
  Badge,
  Box,
  Button,
} from "@chakra-ui/react";
import { useI18n } from "../i18n/useI18n";
import { LabelKey } from "../i18n/labels";

export type AggregatedTech = { tech: string; months: number };

function formatTime(months: number, t: (x: LabelKey) => string) {
  if (months < 12) return `${months} ${months > 1 ? t("months") : t("month")}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const y = `${years} ${years > 1 ? t("years") : t("year")}`;
  return rem ? `${y} ${rem} ${rem > 1 ? t("months") : t("month")}` : y;
}

export default function TechFilterSidebar({
  items,
  active,
  onToggleAction,
  onActivateAllAction,
  onClearAction,
  stickyOffset = 32,
}: {
  items: AggregatedTech[];
  active: Set<string>;
  onToggleAction: (tech: string) => void;
  onActivateAllAction: () => void;
  onClearAction: () => void;
  title?: string;
  stickyOffset?: number;
}) {
  const t = useI18n(); // ✅ Hook siempre al principio

  if (!items.length) return null; // ✅ early return después del hook

  return (
    <Box position="sticky" top={`${stickyOffset}px`} borderWidth="1px" rounded="xl" p={4}>
      <Heading as="h3" size="sm" mb={2} mt="0px" pt="0px">
        {t("usedTechnologies")}
      </Heading>

      <HStack gap={2} mb={3}>
        <Button size="xs" onClick={onActivateAllAction}>
          {t("activateAll")}
        </Button>
        <Button size="xs" variant="outline" onClick={onClearAction}>
          {t("clear")}
        </Button>
      </HStack>

      <VStack align="stretch" gap={2}>
        {items.map((it) => {
          const isActive = active.has(it.tech);
          return (
            <HStack
              key={it.tech}
              justify="space-between"
              gap={3}
              cursor="pointer"
              onClick={() => onToggleAction(it.tech)}
              userSelect="none"
            >
              <Badge variant={isActive ? "solid" : "outline"} opacity={isActive ? 1 : 0.6}>
                {it.tech}
              </Badge>
              <Box fontSize="xs" color="fg.muted">
                {formatTime(it.months, t)}
              </Box>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}

