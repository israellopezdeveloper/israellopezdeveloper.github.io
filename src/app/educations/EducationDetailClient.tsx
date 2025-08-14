"use client";

import {
  Container,
  Heading,
  Text,
  Box,
  Image,
  Link,
  chakra,
} from "@chakra-ui/react";
import {
  useLanguage
} from "../components/context/LanguageContext";
import {
  useCvData
} from "../hooks/useCvData";
import {
  getUniversitySlug,
  getComplementarySlug,
  getLanguageSlug,
} from "../lib/slug";
import {
  CVAcreditation,
  CVComplementary,
  CVEducations,
  CVLang,
  CVUniversity,
} from "../types/cv";
import NextLink from "next/link";
import { useI18n } from "../i18n/useI18n";

type Category = "university" | "complementary" | "languages";

// Type guards
function isUniversity(
  x: CVUniversity | CVComplementary | CVLang
): x is CVUniversity {
  return (x as CVUniversity).university_name !== undefined;
}

function isComplementary(
  x: CVUniversity | CVComplementary | CVLang
): x is CVComplementary {
  return (x as CVComplementary).title !== undefined &&
    (x as CVComplementary).institution !== undefined;
}

function isLang(x: CVUniversity | CVComplementary | CVLang): x is CVLang {
  return (x as CVLang).language !== undefined;
}

export default function EducationDetailClient({
  category,
  id,
}: {
  category: Category;
  id: string;
}) {
  const { lang, short } = useLanguage();
  const { data, loading } = useCvData(lang, short);
  const t = useI18n();

  if (loading || !data) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">Cargando…</Heading>
      </Container>
    );
  }

  const store: CVEducations = data.educations ?? {};
  const list = (store[category] ?? []) as (CVUniversity | CVComplementary | CVLang)[];

  // Un único predicado sobre la UNIÓN
  const finder = (x: CVUniversity | CVComplementary | CVLang) => {
    switch (category) {
      case "university":
        console.log(x);
        return isUniversity(x) && getUniversitySlug(x) === id;
      case "complementary":
        return isComplementary(x) && getComplementarySlug(x) === id;
      case "languages":
        return isLang(x) && getLanguageSlug(x) === id;
      default:
        return false;
    }
  };

  const item = list.find(finder);
  if (!item) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">{t("notFound")}</Heading>
      </Container>
    );
  }

  // Título seguro por categoría
  const title =
    category === "languages"
      ? (isLang(item) ? item.language : "Untitled")
      : isComplementary(item)
        ? item.institution
        : isUniversity(item)
          ? item.university_name
          : "Untitled";

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={4} style={{ display: "inline" }}>
        <Link as={NextLink} href="/educations" target="_self" rel="noreferrer">
          {t("education")}
        </Link>{" "}
        &gt; {title}
      </Heading>

      {/* Periodo — solo si existe en este tipo */}
      {"period_time" in item && item.period_time ? (
        <Text className="periodTime" fontSize="sm" color="gray.500" mb={4}>
          {item.period_time}
        </Text>
      ) : null}

      {/* Universidad — no aplica a CVLang y puede no existir en Complementary */}
      {isUniversity(item) && item.university_name ? (
        <Text fontSize="sm" color="fg.muted" mb={1}>
          {item.university_name}
        </Text>
      ) : null}

      {/* Thumbnail si existe en el objeto */}
      {"thumbnail" in item && item.thumbnail ? (
        <Box mb={6} rounded="xl" overflow="hidden" mt={"10px"}>
          <Image
            src={`/images/educations/${item.thumbnail}`}
            alt={title}
            objectFit="contain"
            bg="blackAlpha.50"
            left={"50%"}
            transform={"translate(-50%)"}
            style={{ position: "relative" }}
            w="60%"
          />
        </Box>
      ) : null}

      {/* Summary solo existe en University/Complementary */}
      {("summary" in item && Array.isArray(item.summary)) &&
        item.summary!.map((p: string, i: number) => (
          <Text key={`p-${i}`} mb={3}>
            {p}
          </Text>
        ))}

      {/* ===== Solo Idiomas: niveles ===== */}
      {category === "languages" && isLang(item) ? (
        <Box mt={6}>
          <Heading as="h4" size="sm" mb={3}>
            {t("levels")}
          </Heading>
          <chakra.table
            w="full"
            borderWidth="1px"
            rounded="lg"
            overflow="hidden"
            borderCollapse="separate"
            // usa style en lugar de sx para evitar el error de tipos
            style={{ borderSpacing: 0 }}
          >
            <chakra.thead bg="blackAlpha.50">
              <chakra.tr>
                <chakra.th textAlign="left" p={3}>
                  {t("spoken")}
                </chakra.th>
                <chakra.th textAlign="left" p={3}>
                  {t("writen")}
                </chakra.th>
                <chakra.th textAlign="left" p={3}>
                  {t("read")}
                </chakra.th>
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

      {/* ===== Solo Idiomas: acreditaciones ===== */}
      {category === "languages" &&
        isLang(item) &&
        Array.isArray(item.acreditations) &&
        item.acreditations.length > 0 ? (
        <Box mt={6}>
          <Heading as="h4" size="sm" mb={3}>
            {t("accreditations")}
          </Heading>
          <chakra.table
            w="full"
            borderWidth="1px"
            rounded="lg"
            overflow="hidden"
            borderCollapse="separate"
            style={{ borderSpacing: 0 }}
          >
            <chakra.thead bg="blackAlpha.50">
              <chakra.tr>
                <chakra.th textAlign="left" p={3}>
                  {t("institution")}
                </chakra.th>
                <chakra.th textAlign="left" p={3}>
                  {t("title")}
                </chakra.th>
                <chakra.th textAlign="left" p={3}>
                  {t("date")}
                </chakra.th>
              </chakra.tr>
            </chakra.thead>
            <chakra.tbody>
              {item.acreditations!.map((a: CVAcreditation, i: number) => (
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
    </Container>
  );
}

