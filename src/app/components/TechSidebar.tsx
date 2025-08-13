"use client";

import * as React from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Box,
} from "@chakra-ui/react";
import type { PersonalProject } from "../hooks/usePersonalProjects";

import type { CVWork } from "../types/cv";
import { parsePeriodToMonths } from "../lib/period";

type Item = { tech: string; months: number };

function formatTime(months: number) {
  if (months < 12) return `${months} mes${months > 1 ? "es" : ""}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const y = `${years} año${years > 1 ? "s" : ""}`;
  return rem ? `${y} ${rem} mes${rem > 1 ? "es" : ""}` : y;
}

export default function TechSidebar({
  personalProjects,
  companyWorks,
  title = "Tecnologías usadas",
  max = 50,
  stickyOffset = 32, // px
}: {
  personalProjects: PersonalProject[];
  companyWorks?: CVWork[];
  title?: string;
  max?: number;
  stickyOffset?: number;
}) {
  const items = React.useMemo<Item[]>(() => {
    const acc = new Map<string, number>();

    // 1) Acumular desde proyectos personales (cada tech trae su "time" en meses)
    for (const p of personalProjects ?? []) {
      for (const t of p.technologies ?? []) {
        acc.set(t.tech, (acc.get(t.tech) ?? 0) + (t.time ?? 0));
      }
    }

    // 2) Acumular desde Experience (CV works)
    for (const w of companyWorks ?? []) {
      const months = parsePeriodToMonths(w.period_time);
      if (!months) continue;

      // Junta tecnologías de todos los projects del work
      const techs = new Set<string>();
      for (const proj of w.projects ?? []) {
        for (const tech of proj.technologies ?? []) {
          techs.add(tech);
        }
      }

      // Suma la duración del trabajo a cada tecnología usada ahí
      for (const tech of techs) {
        acc.set(tech, (acc.get(tech) ?? 0) + months);
      }
    }

    return Array.from(acc.entries())
      .map(([tech, months]) => ({ tech, months }))
      .sort((a, b) => b.months - a.months)
      .slice(0, max);
  }, [personalProjects, companyWorks, max]);

  if (!items.length) return null;

  return (
    <Box
      position="sticky"
      top={`${stickyOffset}px`}
      borderWidth="1px"
      rounded="xl"
      p={4}
    >
      <Heading as="h3" size="sm" mb={2}>
        {title}
      </Heading>
      <VStack align="stretch" gap={2}>
        {items.sort((it1, it2) => {
          return (
            it1.tech.toLowerCase() < it2.tech.toLowerCase()
              ? -1
              : (it1.tech.toLowerCase() === it2.tech.toLowerCase()
                ? 0
                : 1
              )
          );
        }).map((it) => (
          <HStack key={it.tech} justify="space-between" gap={3}>
            <Badge variant="subtle">{it.tech}</Badge>
            <Text fontSize="xs" color="fg.muted">
              {formatTime(it.months)}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
