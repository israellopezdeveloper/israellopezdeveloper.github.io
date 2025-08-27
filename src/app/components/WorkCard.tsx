'use client';

import { Box, Image, Text, Link, HStack } from '@chakra-ui/react';
import NextLink from 'next/link';

import TechBadge from './TechBadge';
import { Tooltip } from './ui/tooltip';
import { useI18n } from '../i18n/useI18n';

import type { CVPeriod } from '../types/cv';
import type { Work } from '../types/work';
import type { JSX } from 'react';

// Si usas la función de meses, impórtala:
// import { parsePeriodToMonths } from '../utils/parsePeriodToMonths';

function isPeriodObject(v: unknown): v is CVPeriod {
  return (
    !!v &&
    typeof v === 'object' &&
    ('start' in (v as CVPeriod) ||
      'end' in (v as CVPeriod) ||
      'current' in (v as CVPeriod))
  );
}

export default function WorkCard({ work }: { work: Work }): JSX.Element {
  const t = useI18n();

  function formatPeriod(p: CVPeriod): string {
    const start = (p.start ?? '').toString().trim();
    const end = p.current ? t('present') : (p.end ?? '').toString().trim();
    if (start && end) return `${start} – ${end}`;
    if (start) return `${start} – ${end || t('present')}`;
    return end || '';
  }

  const yearText = isPeriodObject(work.year)
    ? formatPeriod(work.year)
    : work.year != null
      ? ''
      : '';
  return (
    <Box
      as="article"
      rounded="xl"
      overflow="hidden"
      borderWidth="1px"
      _hover={{ shadow: 'md' }}
      className="workcard"
    >
      {work.thumbnail && (
        <Link
          as={NextLink}
          href={`/works/${work.id}`}
          style={{ width: '100%' }}
        >
          <Image
            src={work.thumbnail}
            alt={work.title}
            w="full"
            h="180px"
            objectFit="contain"
          />
        </Link>
      )}
      <Box p={4}>
        <Link as={NextLink} href={`/works/${work.id}`}>
          {work.title}
        </Link>

        {!!yearText && (
          <Text fontSize="sm" color="gray.500" mb={2}>
            {yearText}
          </Text>
        )}

        <Tooltip content={work.description} showArrow>
          <Text lineClamp={2}>{work.description || ''}</Text>
        </Tooltip>

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
