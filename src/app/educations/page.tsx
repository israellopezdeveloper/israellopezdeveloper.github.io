"use client";

import { Container, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import { useLanguage } from "../components/context/LanguageContext";
import { useCvData } from "../hooks/useCvData";
import EducationCard from "../components/EducationCard";
import { getUniversitySlug, getComplementarySlug, getLanguageSlug } from "../lib/slug";

export default function EducationsPage() {
  const { lang, short } = useLanguage();
  const { data, loading } = useCvData(lang, short);

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
          <Heading mb={4}>University</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {uni.map((u, i) => (
              <EducationCard
                key={`u-${i}`}
                href={`/educations/university/${getUniversitySlug(u)}`}
                title={u.title ?? u.university_name ?? "Untitled"}
                subtitle={u.university_name}
                period={u.period_time}
                thumbnail={u.thumbnail ? `/images/educations/${u.thumbnail}` : undefined}
                summary={u.summary}
              />
            ))}
          </SimpleGrid>
        </section>

        <section>
          <Heading mb={4}>Complementary</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {comp.map((c, i) => (
              <EducationCard
                key={`c-${i}`}
                href={`/educations/complementary/${getComplementarySlug(c)}`}
                title={c.title ?? "Untitled"}
                subtitle={c.institution}
                period={c.period_time}
                thumbnail={c.thumbnail ? `/images/educations/${c.thumbnail}` : undefined}
                summary={c.summary}
              />
            ))}
          </SimpleGrid>
        </section>

        <section>
          <Heading mb={4}>Languages</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {langs.map((l, i) => (
              <EducationCard
                key={`l-${i}`}
                href={`/educations/languages/${getLanguageSlug(l)}`}
                title={l.language ?? "Language"}
                subtitle={[
                  l.spoken && `Spoken: ${l.spoken}`,
                  l.writen && `Written: ${l.writen}`,
                  l.read && `Read: ${l.read}`,
                ].filter(Boolean).join(" • ") || undefined}
                thumbnail={l.thumbnail ? `/images/educations/${l.thumbnail}` : undefined}
                summary={
                  l.acreditations?.length
                    ? [`${l.acreditations.length} accreditations`]
                    : undefined
                }
              />
            ))}
          </SimpleGrid>
        </section>
      </VStack>
    </Container>
  );
}

