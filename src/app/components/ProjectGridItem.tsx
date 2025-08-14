"use client";

import NextLink from "next/link";
import {
  Box,
  Image,
  Text,
  Heading,
  Link,
  HStack,
} from "@chakra-ui/react";
import type { PersonalProject } from "../hooks/usePersonalProjects";
import TechBadge from "./TechBadge";

type Props = {
  project: PersonalProject;
  lang: "en" | "es" | "zh";
  maxBadges?: number;
};

export default function ProjectGridItem({
  project,
  lang,
  maxBadges = 6,
}: Props) {
  const title = project.lang[lang]?.name ?? "Untitled";
  const desc = project.lang[lang]?.desc;

  const badges = (project.technologies ?? [])
    .slice()
    .sort((a, b) => b.time - a.time)
    .slice(0, maxBadges);

  return (
    <Box
      as="article"
      rounded="xl"
      overflow="hidden"
      borderWidth="1px"
      _hover={{ shadow: "md" }}
      className="workcard"
    >
      {project.thumbnail ? (
        <Image
          src={project.thumbnail}
          alt={title}
          w="full"
          h="180px"
          objectFit="contain"
        />
      ) : (
        <Box h="180px" bg="blackAlpha.100" />
      )}

      <Box p={4}>
        <Heading size="md" mb={1} lineClamp={2}>
          <Link
            as={NextLink}
            href={project.url}
            target="_blank"
            rel="noreferrer"
          >
            {title}
          </Link>
        </Heading>

        {desc ? <Text lineClamp={3}>{desc}</Text> : null}

        {badges.length ? (
          <HStack gap={2} mt={3} flexWrap="wrap">
            {badges.map((t) => (
              <TechBadge key={t.tech} label={t.tech} count={t.time} />
            ))}
          </HStack>
        ) : null}
      </Box>
    </Box>
  );
}

