'use client';

import {
  Box,
  Image,
  Text,
  Link,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import NextLink from 'next/link';

import { Tooltip } from './ui/tooltip';
import { useI18n } from '../i18n/useI18n';

import type { CVPeriod } from '../types/cv';
import type { JSX } from 'react';

type Props = {
  href: string; // enlace interno a la página de detalle
  title: string; // título principal
  subtitle?: string; // uni/institución o idioma
  period?: string; // periodo
  thumbnail?: string; // /images/educations/...
  summary: string; // primeras líneas
  badges?: string[]; // extras (por ejemplo skills/keywords)
};

function isPeriodObject(v: unknown): v is CVPeriod {
  return (
    !!v &&
    typeof v === 'object' &&
    ('start' in (v as CVPeriod) ||
      'end' in (v as CVPeriod) ||
      'current' in (v as CVPeriod))
  );
}

export default function EducationCard({
  href,
  title,
  subtitle,
  period,
  thumbnail,
  summary,
  badges,
}: Props): JSX.Element {
  const t = useI18n();

  function formatPeriod(p: CVPeriod): string {
    const start = (p.start ?? '').toString().trim();
    const end = p.current ? t('present') : (p.end ?? '').toString().trim();
    if (start && end) return `${start} – ${end}`;
    if (start) return `${start} – ${end || t('present')}`;
    return end || '';
  }

  const yearText = isPeriodObject(period)
    ? formatPeriod(period)
    : period != null
      ? String(period)
      : '';
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
            {yearText}
          </Text>
        ) : null}
        {summary ? (
          <VStack align="start" gap={1}>
            <Tooltip content={summary} showArrow>
              <Text lineClamp={2}>{summary}</Text>
            </Tooltip>
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
