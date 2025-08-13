// src/components/TechFilterSidebar.tsx
"use client";

import * as React from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Box,
  Button,
} from "@chakra-ui/react";

export type AggregatedTech = { tech: string; months: number };

function formatTime(months: number) {
  if (months < 12) return `${months} mes${months > 1 ? "es" : ""}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const y = `${years} año${years > 1 ? "s" : ""}`;
  return rem ? `${y} ${rem} mes${rem > 1 ? "es" : ""}` : y;
}

export default function TechFilterSidebar({
  items,
  active,
  onToggleAction,
  onActivateAllAction,
  onClearAction,
  title = "Tecnologías usadas",
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
  if (!items.length) return null;

  console.log(JSON.stringify(items.map(i => i.tech), null, 2));
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

      <HStack gap={2} mb={3}>
        <Button size="xs" onClick={onActivateAllAction}>
          Activar todo
        </Button>
        <Button size="xs" variant="outline" onClick={onClearAction}>
          Limpiar
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
              <Badge
                variant={isActive ? "solid" : "outline"}
                opacity={isActive ? 1 : 0.6}
              >
                {it.tech}
              </Badge>
              <Text fontSize="xs" color="fg.muted">
                {formatTime(it.months)}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}

