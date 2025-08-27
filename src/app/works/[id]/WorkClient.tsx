'use client';

import {
  Container,
  Heading,
  Text,
  Box,
  Image,
  VStack,
  Link,
  Center,
} from '@chakra-ui/react';
import NextLink from 'next/link';

import TechBadge from '@/app/components/TechBadge';
import { useI18n } from '@/app/i18n/useI18n';

import { useLanguage } from '../../components/context/LanguageContext';
import { useCvData } from '../../hooks/useCvData';
import { getItemSlug } from '../../lib/slug';

import type { CVLink, CVPeriod, CVProject, CVWork } from '@/app/types/cv';
import type { JSX } from 'react';

type WorkClientProps = { id: string };

type PeriodObj = {
  start?: string | null;
  end?: string | null;
  current?: boolean | null;
};

function isPeriodObject(v: unknown): v is PeriodObj {
  return (
    !!v &&
    typeof v === 'object' &&
    ('start' in (v as CVPeriod) ||
      'end' in (v as CVPeriod) ||
      'current' in (v as CVPeriod))
  );
}

function findById<T extends { name: string; slug?: string }>(
  arr: T[] | undefined,
  id: string,
): T | undefined {
  return arr?.find((x) => getItemSlug(x) === id);
}

export default function WorkClient({ id }: WorkClientProps): JSX.Element {
  const t = useI18n();

  function formatPeriod(p: PeriodObj): string {
    const start = (p.start ?? '').toString().trim();
    const end = p.current ? t('present') : (p.end ?? '').toString().trim();
    if (start && end) return `${start} – ${end}`;
    if (start) return `${start} – ${end || t('present')}`;
    return end || '';
  }

  const { lang, short } = useLanguage();
  const { data, loading } = useCvData(lang, short);

  if (loading || !data) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">Cargando…</Heading>
      </Container>
    );
  }

  const work =
    findById<CVWork>(data.works, id) ??
    findById<CVWork>(data.personal_projects as unknown as CVWork[], id);

  if (!work) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">No encontrado</Heading>
      </Container>
    );
  }

  const w: CVWork = work;
  const yearText = isPeriodObject(w.period_time)
    ? formatPeriod(w.period_time)
    : w.period_time != null
      ? String(w.period_time)
      : '';

  return (
    <Container maxW="container.md" py={8} className="DetailPage">
      <Heading mb={4} style={{ display: 'inline' }}>
        <Link as={NextLink} href="/works" target="_self" rel="noreferrer">
          {t('jobsAndProjects')}
        </Link>{' '}
        &gt; {w.name}
      </Heading>
      {w.period_time && (
        <Text className="periodTime" fontSize="sm" color="gray.500" mb={4}>
          {yearText}
        </Text>
      )}
      <Text
        key={'full_description'}
        mb={3}
        style={{ marginTop: '10px', textAlign: 'justify' }}
        dangerouslySetInnerHTML={{ __html: w.full_description }}
      />
      {w.thumbnail && (
        <Box mb={6} rounded="xl" overflow="hidden">
          <Image
            src={`/images/works/${w.thumbnail}`}
            alt={w.name}
            left={'50%'}
            transform={'translate(-50%)'}
            style={{ position: 'relative' }}
            w="60%"
            objectFit="contain"
          />
        </Box>
      )}
      {w.links?.length ? (
        <Box mt={6}>
          <Center>
            <VStack align="start" gap={2}>
              {w.links.map((link: CVLink, idx: number) => (
                <Box key={idx}>
                  <Text as="span" fontWeight="semibold" mr={2}>
                    {link.tag}
                  </Text>
                  <Link href={link.url} target="_blank" rel="noreferrer">
                    {link.text}
                  </Link>
                </Box>
              ))}
            </VStack>
          </Center>
        </Box>
      ) : null}
      <Heading mb={4} className="subtitle1">
        {t('contributions')}
      </Heading>
      <Text
        key={'contribution'}
        mb={3}
        style={{ marginTop: '10px', textAlign: 'justify' }}
        dangerouslySetInnerHTML={{ __html: w.contribution || '' }}
      />
      {w.projects?.map((project: CVProject, index: number) => (
        <div key={'project' + index}>
          <Heading mb={4} className="subtitle1">
            Project {index + 1}: {project.name}
          </Heading>
          <Text
            key={'description'}
            mb={3}
            style={{ marginTop: '10px', textAlign: 'justify' }}
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
          <Heading mb={4} className="subtitle2">
            {t('technologies')}
          </Heading>
          {project.technologies?.map((technology: string, i: number) => (
            <TechBadge label={technology} key={'tech' + i} />
          ))}
          {project.images && project.images?.length > 0 ? (
            <Heading mb={4} className="subtitle2">
              {t('images')}
            </Heading>
          ) : null}
          {project.images?.map((image: string, i: number) => (
            <Box
              mb={6}
              rounded="xl"
              overflow="hidden"
              left={'50%'}
              transform={'translate(-50%)'}
              style={{ margin: '20px', width: '60%', position: 'relative' }}
              key={'pr' + index + '_' + i}
            >
              <Image
                src={`/images/works/${image}`}
                alt={image}
                w="full"
                objectFit="contain"
              />
            </Box>
          ))}
          {project.links && project.links?.length > 0 ? (
            <Heading mb={4} className="subtitle2">
              {t('links')}
            </Heading>
          ) : null}
          {project.links?.map((link: CVLink, i: number) => (
            <span key={'link' + i}>
              <label>
                {link.icon}
                {link.tag}:
              </label>
              <Link
                as={NextLink}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.text}
              </Link>
            </span>
          ))}
        </div>
      ))}
      {w.images && w.images?.length > 0 ? (
        <Heading mb={4} className="subtitle1">
          {t('jobImages')}
        </Heading>
      ) : null}
      {w.images?.map((image: string, i: number) => (
        <Box
          key={'pro_img' + i}
          mb={6}
          rounded="xl"
          overflow="hidden"
          style={{ margin: '20px' }}
        >
          <Image
            src={`/images/works/${image}`}
            alt={image}
            w="full"
            objectFit="cover"
          />
        </Box>
      ))}
    </Container>
  );
}
