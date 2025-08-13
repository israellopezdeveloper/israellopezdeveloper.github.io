"use client";

import { Container, Heading, Text, Box, Image, VStack, Link, Center } from "@chakra-ui/react";
import { useLanguage } from "../../components/context/LanguageContext";
import { useCvData } from "../../hooks/useCvData";
import { getItemSlug } from "../../lib/slug";
import NextLink from "next/link";
import { CVLink, CVProject } from "@/app/types/cv";
import TechBadge from "@/app/components/TechBadge";

type WorkClientProps = { id: string };

export default function WorkClient({ id }: WorkClientProps) {
  const { lang, short } = useLanguage();
  const { data, loading } = useCvData(lang, short);

  if (loading || !data) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">Cargando…</Heading>
      </Container>
    );
  }

  const findById = (arr?: Array<{ name: string; slug?: string }>) =>
    arr?.find((x) => getItemSlug(x) === id);

  const work = findById(data.works) || findById(data.personal_projects);
  if (!work) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading size="md">No encontrado</Heading>
      </Container>
    );
  }

  const w: any = work;

  return (
    <Container maxW="container.md" py={8} className="DetailPage">
      <Heading mb={4} style={{ display: "inline" }}>
        <Link
          as={NextLink}
          href="/works"
          target="_self"
          rel="noreferrer"
        >Works</Link> &gt; {w.name}</Heading>
      {w.period_time && <Text className="periodTime" fontSize="sm" color="gray.500" mb={4}>{w.period_time}</Text>}
      {
        w.full_description?.map((p: string, i: number) => (
          <Text
            key={`d-${i}`}
            mb={3}
            style={{ marginTop: "10px", textAlign: "justify" }}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))
      }
      {
        w.thumbnail && (
          <Box mb={6} rounded="xl" overflow="hidden" style={{ margin: "20px" }}>
            <Image
              src={`/images/works/${w.thumbnail}`}
              alt={w.name}
              w="full"
              objectFit="contain"
            />
          </Box>
        )
      }
      {
        w.links?.length ? (
          <Box mt={6}>
            <Center>
              <VStack align="start" gap={2}>
                {w.links.map((l: any, idx: number) => (
                  <Box key={idx}>
                    <Text as="span" fontWeight="semibold" mr={2}>{l.tag}</Text>
                    <Link href={l.url} target="_blank" rel="noreferrer">{l.text}</Link>
                  </Box>
                ))}
              </VStack>
            </Center>
          </Box>
        ) : null
      }
      <Heading mb={4} className="subtitle1">
        Contributions
      </Heading>
      {
        w.contribution?.map((p: string, i: number) => (
          <Text
            key={`c-${i}`}
            mb={3}
            style={{ marginTop: "10px", textAlign: "justify" }}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))
      }
      {
        w.projects?.map((project: CVProject, index: number) => (
          <div key={"project" + index}>
            <Heading mb={4} className="subtitle1">
              Project {index + 1}: {project.name}
            </Heading>
            {project.description?.map((description: string, i: number) => (
              <Text
                key={`desc-${i}`}
                mb={3}
                style={{ marginTop: "10px", textAlign: "justify" }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ))}
            <Heading mb={4} className="subtitle2">
              Technologies
            </Heading>
            {project.technologies?.map((technology: string) => (
              <TechBadge label={technology} />
            ))}
            {project.images && project.images?.length > 0 ? (
              <Heading mb={4} className="subtitle2">
                Images
              </Heading>
            ) : null}
            {project.images?.map((image: string) => (
              <Box mb={6} rounded="xl" overflow="hidden" style={{ margin: "20px" }}>
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
                Links
              </Heading>
            ) : null}
            {project.links?.map((link: CVLink) => (
              <>
                <label>
                  {link.icon}{link.tag}:
                </label>
                <Link
                  as={NextLink}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >{link.text}</Link>
              </>
            ))}
          </div>
        ))
      }
      {
        w.images && w.images?.length > 0 ? (
          <Heading mb={4} className="subtitle1">
            Job Images
          </Heading>
        ) : null
      }
      {
        w.images?.map((image: string) => (
          <Box mb={6} rounded="xl" overflow="hidden" style={{ margin: "20px" }}>
            <Image
              src={`/images/works/${image}`}
              alt={image}
              w="full"
              objectFit="cover"
            />
          </Box>
        ))
      }
    </Container >
  );
}

