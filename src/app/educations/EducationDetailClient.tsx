"use client";

import {
  Container,
  Heading,
  Text,
  Box,
  Image,
  VStack,
  Link,
  chakra, // 👈 para tablas HTML estiladas con Chakra
} from "@chakra-ui/react";
import { useLanguage } from "../components/context/LanguageContext";
import { useCvData } from "../hooks/useCvData";
import {
  getUniversitySlug,
  getComplementarySlug,
  getLanguageSlug,
} from "../lib/slug";

type Category = "university" | "complementary" | "languages";

export default function EducationDetailClient({
  category,
  id,
}: {
  category: Category;
  id: string;
}) {
  const { lang, short } = useLanguage();
  const { data, loading } = useCvData(lang, short);

  if (loading || !data) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">Cargando…</Heading>
      </Container>
    );
  }

  const store = data.educations ?? {};
  const list = (store as any)[category] as any[] | undefined;

  const finder =
    {
      university: (x: any) => getUniversitySlug(x) === id,
      complementary: (x: any) => getComplementarySlug(x) === id,
      languages: (x: any) => getLanguageSlug(x) === id,
    }[category] || ((_: any) => false);

  const item = list?.find(finder);
  if (!item) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">No encontrado</Heading>
      </Container>
    );
  }

  const title =
    (category === "languages" ? item.language : item.title) ??
    item.university_name ??
    "Untitled";

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={2}>{title}</Heading>

      {category !== "languages" && item.university_name ? (
        <Text fontSize="sm" color="fg.muted" mb={1}>
          {item.university_name}
        </Text>
      ) : null}

      {item.period_time ? (
        <Text fontSize="sm" color="fg.muted" mb={4}>
          {item.period_time}
        </Text>
      ) : null}

      {item.thumbnail ? (
        <Box mb={6} rounded="xl" overflow="hidden" borderWidth="1px">
          <Image
            src={`/images/educations/${item.thumbnail}`}
            alt={title}
            w="full"
            objectFit="contain"
            bg="blackAlpha.50"
          />
        </Box>
      ) : null}

      {/* Descripción / resumen */}
      {item.summary?.map((p: string, i: number) => (
        <Text key={`p-${i}`} mb={3}>
          {p}
        </Text>
      ))}

      {/* ===== Solo para Idiomas: Tabla de niveles ===== */}
      {category === "languages" ? (
        <Box mt={6}>
          <Heading as="h4" size="sm" mb={3}>
            Niveles
          </Heading>
          <chakra.table
            w="full"
            borderWidth="1px"
            rounded="lg"
            overflow="hidden"
            borderCollapse="separate"
            sx={{ borderSpacing: 0 }}
          >
            <chakra.thead bg="blackAlpha.50">
              <chakra.tr>
                <chakra.th textAlign="left" p={3}>Hablado</chakra.th>
                <chakra.th textAlign="left" p={3}>Escrito</chakra.th>
                <chakra.th textAlign="left" p={3}>Leído</chakra.th>
              </chakra.tr>
            </chakra.thead>
            <chakra.tbody>
              <chakra.tr>
                <chakra.td p={3}>{item.spoken ?? "-"}</chakra.td>
                <chakra.td p={3}>{item.writen ?? "-"}</chakra.td>
                <chakra.td p={3}>{item.read ?? "-"}</chakra.td>
              </chakra.tr>
            </chakra.tbody>
          </chakra.table>
        </Box>
      ) : null}

      {/* ===== Solo para Idiomas: Tabla de acreditaciones (si existen) ===== */}
      {category === "languages" && Array.isArray(item.acreditations) && item.acreditations.length > 0 ? (
        <Box mt={6}>
          <Heading as="h4" size="sm" mb={3}>
            Acreditaciones
          </Heading>
          <chakra.table
            w="full"
            borderWidth="1px"
            rounded="lg"
            overflow="hidden"
            borderCollapse="separate"
            sx={{ borderSpacing: 0 }}
          >
            <chakra.thead bg="blackAlpha.50">
              <chakra.tr>
                <chakra.th textAlign="left" p={3}>Institución</chakra.th>
                <chakra.th textAlign="left" p={3}>Título</chakra.th>
                <chakra.th textAlign="left" p={3}>Fecha</chakra.th>
              </chakra.tr>
            </chakra.thead>
            <chakra.tbody>
              {item.acreditations.map((a: any, i: number) => (
                <chakra.tr key={i} _odd={{ bg: "blackAlpha.50" }}>
                  <chakra.td p={3}>{a.institution ?? "-"}</chakra.td>
                  <chakra.td p={3}>{a.title ?? "-"}</chakra.td>
                  <chakra.td p={3}>{a.period_time ?? "-"}</chakra.td>
                </chakra.tr>
              ))}
            </chakra.tbody>
          </chakra.table>
        </Box>
      ) : null}

      {/* Links opcionales */}
      {item.links?.length ? (
        <Box mt={6}>
          <Heading as="h4" size="sm" mb={3}>
            Links
          </Heading>
          <VStack align="start" gap={2}>
            {item.links.map((l: any, idx: number) => (
              <Box key={idx}>
                <Text as="span" fontWeight="semibold" mr={2}>
                  {l.tag}
                </Text>
                <Link href={l.url} target="_blank" rel="noreferrer">
                  {l.text}
                </Link>
              </Box>
            ))}
          </VStack>
        </Box>
      ) : null}
    </Container>
  );
}

