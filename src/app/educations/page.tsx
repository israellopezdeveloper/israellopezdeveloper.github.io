'use client';

import { Container, Heading, SimpleGrid, VStack } from '@chakra-ui/react';

import { useLanguage } from '../components/context/LanguageContext';
import EducationCard from '../components/EducationCard';
import { useCvData } from '../hooks/useCvData';
import { useI18n } from '../i18n/useI18n';
import {
  getUniversitySlug,
  getComplementarySlug,
  getLanguageSlug,
} from '../lib/slug';

import type { JSX } from 'react';

export default function EducationsPage(): JSX.Element {
  const { lang, short } = useLanguage();
  const { data, loading } = useCvData(lang, short);
  const t = useI18n();

  if (loading || !data) {
    return (
      <Container maxW="container.lg" py={8}>
        <Heading size="md">Cargando…</Heading>
      </Container>
    );
  }

  const uni = data.educations?.university ?? [];
  const comp = data.educations?.complementary ?? [];
  const langs = data.educations?.languages ?? [];

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" gap={8}>
        <section>
          <Heading mb={4} mt={'0px'} pt={'0px'}>
            {t('university')}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {uni.map((u, i) => (
              <EducationCard
                key={`u-${i}`}
                href={`/educations/university/${getUniversitySlug(u)}`}
                title={u.title ?? u.university_name ?? 'Untitled'}
                {...(u.university_name ? { subtitle: u.university_name } : {})}
                {...(u.period_time ? { period: u.period_time } : {})}
                {...(u.thumbnail
                  ? { thumbnail: `/images/educations/${u.thumbnail}` }
                  : {})}
                {...(u.summary?.length ? { summary: u.summary } : {})}
              />
            ))}
          </SimpleGrid>
        </section>

        <section>
          <Heading mb={4}>{t('complementary')}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {comp.map((c, i) => (
              <EducationCard
                key={`c-${i}`}
                href={`/educations/complementary/${getComplementarySlug(c)}`}
                title={c.title ?? 'Untitled'}
                {...(c.institution ? { subtitle: c.institution } : {})}
                {...(c.period_time ? { period: c.period_time } : {})}
                {...(c.thumbnail
                  ? { thumbnail: `/images/educations/${c.thumbnail}` }
                  : {})}
                {...(c.summary?.length ? { summary: c.summary } : {})}
              />
            ))}
          </SimpleGrid>
        </section>

        <section>
          <Heading mb={4}>{t('languages')}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {langs.map((language, i) => {
              const subtitle = [
                language.spoken && `${t('spoken')}: ${language.spoken}`,
                language.writen && `${t('writen')}: ${language.writen}`,
                language.read && `${t('read')}: ${language.read}`,
              ]
                .filter(Boolean)
                .join(' • ');
              return (
                <EducationCard
                  key={`l-${i}`}
                  href={`/educations/languages/${getLanguageSlug(language)}`}
                  title={language.language ?? t('languages')}
                  {...(subtitle ? { subtitle } : {})}
                  {...(language.thumbnail
                    ? { thumbnail: `/images/educations/${language.thumbnail}` }
                    : {})}
                  {...(language.acreditations?.length
                    ? {
                        summary: [
                          `${language.acreditations.length} ${t('accreditations')}`,
                        ],
                      }
                    : {})}
                />
              );
            })}
          </SimpleGrid>
        </section>
      </VStack>
    </Container>
  );
}
