"use client";
import { Container, Heading, Text, Box, Image, VStack, Button, ListItem } from "@chakra-ui/react";
import { useLanguage } from "./components/context/LanguageContext";
import { useCvData } from "./hooks/useCvData";
import { ChevronRightIcon, Link, List } from "lucide-react";

export default function HomePage() {
  const { lang, short } = useLanguage();
  const { data, loading, error } = useCvData(lang, short);

  if (loading) return <Container maxW="container.md" py={10}><Text>Cargando…</Text></Container>;
  if (error || !data) return <Container maxW="container.md" py={10}><Text>Ups, no pude cargar el CV.</Text></Container>;

  const intro = data.intro;
  return (
    <Container maxW="container.md" py={8}>
      <Box
        borderRadius="lg"
        mb={6}
        p={3}
        textAlign="center"
        background={"bg"}
        position={"relative"}
        zIndex={"overlay"}
      >
        {intro.greeting}
      </Box>

      <Box
        mt={-8}
        ml={"50%"}
        transform={"translate(-50%)"}
        borderColor="whiteAlpha.800"
        borderWidth={2}
        borderStyle="solid"
        w="150px"
        h="150px"
        display="inline-block"
        borderRadius="full"
        overflow="hidden"
        alignSelf={"center"}
      >
        <Image src={"/images/israel.png"} alt="Profile Image" />
      </Box>
      <Box>
        <Box alignItems={'center'}>
          <Heading>
            {intro.name}
          </Heading>
          <p style={{ textAlign: 'center' }}>{intro.title}</p>
        </Box>
        <Box
          flexShrink={0}
          mt={{ base: 4, md: 0 }}
          ml={{ md: 6 }}
          textAlign="center"
        >
        </Box>
      </Box>

      <Heading>
        About me
      </Heading>
      <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: intro.summary?.join('') || "" }} />

      <Heading>
        Mi bio
      </Heading>

      <Heading>
        Mis hobbies
      </Heading>
      {intro.hobbies}

    </Container>
  );
}




/*
    <Container maxW="container.md" py={8}>
      <VStack align="start" gap={4}>
        <Heading>{intro.greeting}</Heading>
        <Text fontSize="lg">{intro.name} — {intro.title}</Text>
        {intro.profile_image && (
          <Image src={`/images/${intro.profile_image}`} alt={intro.name} w="160px" rounded="full" />
        )}
        {intro.summary?.map((html, i) => (
          <Box key={i} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </VStack>
    </Container>

*/


/*
      <Container>
        <Box
          borderRadius="lg"
          mb={6}
          p={3}
          textAlign="center"
          bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
          css={{ backdropFilter: 'blur(10px)' }}
        >
          {cvData.intro.greeting}
        </Box>

        <Box
          mt={-8}
          borderColor="whiteAlpha.800"
          borderWidth={2}
          borderStyle="solid"
          w="150px"
          h="150px"
          display="inline-block"
          borderRadius="full"
          overflow="hidden"
        >
          <WorkImage src={"/images/israel.png"} alt="Profile Image" />
        </Box>
        <Box>
          <Box alignItems={'center'}>
            <Heading as="h2" variant="page-title">
              {cvData.intro.name}
            </Heading>
            <P style={{ textAlign: 'center' }}>{cvData.intro.title}</P>
          </Box>
          <Box
            flexShrink={0}
            mt={{ base: 4, md: 0 }}
            ml={{ md: 6 }}
            textAlign="center"
          >
          </Box>
        </Box>

        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            {gui.intro.aboutme}
          </Heading>
          <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: cvData.intro.summary.join('') }} />
          <Box align="center" my={4}>
            <Button
              as={NextLink}
              href="/works"
              scroll={false}
              rightIcon={<ChevronRightIcon />}
              colorScheme="teal"
            >
              {gui.intro.my_portfolio}
            </Button>
          </Box>
          <Box align="center" my={4}>
            <Button
              as={NextLink}
              href={"/CV-" + language.split('.')[0] + ".pdf"}
              scroll={false}
              rightIcon={<ChevronRightIcon />}
              colorScheme="teal"
              target='_blank'
            >
              CV
            </Button>
          </Box>
        </Section>

        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            {gui.intro.bio}
          </Heading>
          {
            cvData.intro.bio.map((bio, index) => (
              <BioSection key={index}>
                <BioYear>{bio.dates}</BioYear>
                {bio.text}
              </BioSection>
            ))
          }
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            {gui.intro.hobbies}
          </Heading>
          {cvData.intro.hobbies}
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            {gui.intro.links}
          </Heading>
          <List>
            {
              cvData.intro.links.map((link, index) => (
                <ListItem key={index}>
                  <Link href={link.url} target="_blank">
                    <Button
                      variant="ghost"
                      colorScheme="teal"
                      leftIcon={link.icon}
                    >
                      {link.text}
                    </Button>
                  </Link>
                </ListItem>
              ))
            }
          </List>
        </Section>
      </Container>
*/
