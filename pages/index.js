import NextLink from 'next/link'
import { Container, Box, Heading, useColorModeValue, Button, List, ListItem } from "@chakra-ui/react"
import Section from '../components/section'
import P from '../components/paragraph'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { BioSection, BioYear } from '../components/bio'
import Layout from '../components/layouts/article'
import Link from 'next/link'

import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'
import { WorkImage } from '../components/work'
import cvDataEN from '../data/CV.en.json'
import cvDataENS from '../data/CV.en.s.json'
import cvDataES from '../data/CV.es.json'
import cvDataESS from '../data/CV.es.s.json'
import cvDataZH from '../data/CV.zh.json'
import cvDataZHS from '../data/CV.zh.s.json'
import guiEN from '../data/gui.en.json'
import guiES from '../data/gui.es.json'
import guiZH from '../data/gui.zh.json'
import { useLanguage } from '../components/context/language_context'

const Home = () => {
  const voxel = useContext(VoxelKoalaContext)

  const cvDataArray = useMemo(() => ({
    'en': cvDataEN,
    'en.s': cvDataENS,
    'es': cvDataES,
    'es.s': cvDataESS,
    'zh': cvDataZH,
    'zh.s': cvDataZHS
  }), [])

  const guiArray = useMemo(() => ({
    'en': guiEN,
    'en.s': guiEN,
    'es': guiES,
    'es.s': guiES,
    'zh': guiZH,
    'zh.s': guiZH
  }), [])

  const { language } = useLanguage()
  const [cvData, setCvData] = useState(cvDataEN)
  const [gui, setGui] = useState(guiEN)
  useEffect(() => {
    setCvData(cvDataArray[language])
    setGui(guiArray[language])
  }, [language, cvDataArray, guiArray])

  useEffect(() => {
    voxel.current.to_main()
  }, [voxel])


  return (
    <Layout>
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
    </Layout >
  )
}
export default Home
