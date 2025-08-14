"use client";

import NextLink from "next/link";
import { Box, Image, Text, Link, HStack } from "@chakra-ui/react";
import type { Work } from "../types/work";
import TechBadge from "./TechBadge";

export default function WorkCard({ work }: { work: Work }) {
  return (
    <Box as="article" rounded="xl" overflow="hidden" borderWidth="1px" _hover={{ shadow: "md" }} className="workcard">
      {work.thumbnail && (
        <Link as={NextLink} href={`/works/${work.id}`} style={{ width: "100%" }}>
          <Image src={work.thumbnail} alt={work.title} w="full" h="180px" objectFit="contain" />
        </Link>
      )}
      <Box p={4}>
        <Link as={NextLink} href={`/works/${work.id}`}>
          {work.title}
        </Link>
        {work.year && (
          <Text fontSize="sm" color="gray.500" mb={2}>
            {work.year}
          </Text>
        )}
        {work.description && (
          <Text lineClamp={3}>{work.description}</Text>
        )}
        {work.techs && work.techs.length ? (
          <HStack gap={2} mt={3} flexWrap="wrap">
            {work.techs.map((t) => (
              <TechBadge key={t} label={t} />
            ))}
          </HStack>
        ) : null}
      </Box>
    </Box>
  );
}

