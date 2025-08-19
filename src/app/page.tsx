'use client';
import { Container, Heading, Text, Box, Image } from '@chakra-ui/react';

import { useLanguage } from './components/context/LanguageContext';
import { useCvData } from './hooks/useCvData';
import { useI18n } from './i18n/useI18n';

import type { CVBio } from './types/cv';
import type { JSX } from 'react';

export default function HomePage(): JSX.Element {
  const { lang, short } = useLanguage();
  const { data, loading, error } = useCvData(lang, short);
  const t = useI18n();

  if (loading)
    return (
      <Container maxW="container.md" py={10}>
        <Text>Cargando…</Text>
      </Container>
    );
  if (error || !data)
    return (
      <Container maxW="container.md" py={10}>
        <Text>Ups, no pude cargar el CV.</Text>
      </Container>
    );

  const intro = data.intro;
  return (
    <Container maxW="container.md" py={8}>
      <Box
        borderRadius="lg"
        mb={6}
        p={3}
        textAlign="center"
        background={'bg'}
        position={'relative'}
        zIndex={'overlay'}
      >
        {intro.greeting}
      </Box>

      <Box
        mt={-8}
        ml={'50%'}
        transform={'translate(-50%)'}
        borderColor="whiteAlpha.800"
        borderWidth={2}
        borderStyle="solid"
        w="150px"
        h="150px"
        display="inline-block"
        borderRadius="full"
        overflow="hidden"
        alignSelf={'center'}
      >
        <Image src={'/images/israel.png'} alt="Profile Image" />
      </Box>
      <Box>
        <Box alignItems={'center'}>
          <Heading>
            {intro.name} - {intro.title}
          </Heading>
        </Box>
        <Box
          flexShrink={0}
          mt={{ base: 4, md: 0 }}
          ml={{ md: 6 }}
          textAlign="center"
        ></Box>
      </Box>

      <div
        style={{ textAlign: 'justify' }}
        dangerouslySetInnerHTML={{ __html: intro.summary || '' }}
      />

      <Heading>{t('myBio')}</Heading>

      <table>
        <tbody>
          {intro.bio?.map((item: CVBio, i: number) => (
            <tr key={'bio_' + i}>
              <td>
                <b>{item.dates}</b>
              </td>
              <td>{item.text}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Heading>{t('myHobbies')}</Heading>

      {intro.hobbies}
    </Container>
  );
}
