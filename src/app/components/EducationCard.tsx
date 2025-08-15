'use client';

import { Box, Image, Text, Link, VStack, HStack, Badge } from '@chakra-ui/react';
import NextLink from 'next/link';

import type { JSX } from 'react';

type Props = {
  href: string; // enlace interno a la página de detalle
  title: string; // título principal
  subtitle?: string; // uni/institución o idioma
  period?: string; // periodo
  thumbnail?: string; // /images/educations/...
  summary?: string[]; // primeras líneas
  badges?: string[]; // extras (por ejemplo skills/keywords)
};

export default function EducationCard({
  href,
  title,
  subtitle,
  period,
  thumbnail,
  summary,
  badges,
}: Props): JSX.Element {
  return (
    <Box
      as="article"
      borderWidth="1px"
      rounded="xl"
      overflow="hidden"
      _hover={{ shadow: 'md' }}
      className="workcard"
    >
      {thumbnail ? (
        <Link
          as={NextLink}
          href={href}
          left={'50%'}
          transform={'translate(-50%)'}
          style={{ position: 'relative' }}
        >
          <Image
            src={thumbnail}
            alt={title}
            w="full"
            h="140px"
            objectFit="contain"
            bg="blackAlpha.50"
          />
        </Link>
      ) : (
        <Box h="140px" bg="blackAlpha.100" />
      )}

      <Box p={4}>
        <Link as={NextLink} href={href}>
          {title}
        </Link>
        {subtitle ? (
          <Text fontSize="sm" color="fg.muted" mb={1}>
            {subtitle}
          </Text>
        ) : null}
        {period ? (
          <Text fontSize="sm" color="fg.muted" mb={2}>
            {period}
          </Text>
        ) : null}
        {summary?.length ? (
          <VStack align="start" gap={1}>
            <Text lineClamp={3}>{summary[0]}</Text>
          </VStack>
        ) : null}
        {badges?.length ? (
          <HStack mt={3} gap={2} flexWrap="wrap">
            {badges.map((b) => (
              <Badge key={b} variant="subtle">
                {b}
              </Badge>
            ))}
          </HStack>
        ) : null}
      </Box>
    </Box>
  );
}
