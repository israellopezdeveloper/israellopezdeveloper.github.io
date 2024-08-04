import NextLink from 'next/link'
import { Container, Box, Heading, Image, useColorModeValue, Button, List, ListItem } from "@chakra-ui/react"
import Section from '../components/section'
import Paragraph from '../components/paragraph'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { BioSection, BioYear } from '../components/bio'
import Layout from '../components/layouts/article'
import Link from 'next/link'

import { IoLogoGithub } from 'react-icons/io5'
import { useContext, useEffect } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'

// TODO: crear descripcion (ChatGPT)
const Home = () => {
  const voxel = useContext(VoxelKoalaContext)
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
          Hello, I'm a backend developer traveling around the world!
        </Box>

        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Israel López
            </Heading>
            <p>Poner aquí una descripción molona sacada de ChatGPT</p>
          </Box>
          <Box
            flexShrink={0}
            mt={{ base: 4, md: 0 }}
            ml={{ md: 6 }}
            textAlign="center"
          >
            <Box
              borderColor="whiteAlpha.800"
              borderWidth={2}
              borderStyle="solid"
              w="100px"
              h="100px"
              display="inline-block"
              borderRadius="full"
              overflow="hidden"
            >
              <Image borderColor="whiteAlpha.800" borderWidth={2} borderStyle="solid" maxWidth="100px" display="inline-block" borderRadius="full" src="/images/israel.png" alt="Profile Image" />
            </Box>
          </Box>
        </Box>

        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            Work
          </Heading>
          <Paragraph>
            Intro a mis trabajos.
          </Paragraph>
          <Box align="center" my={4}>
            <Button
              as={NextLink}
              href="/works"
              scroll={false}
              rightIcon={<ChevronRightIcon />}
              colorScheme="teal"
            >
              My portfolio
            </Button>
          </Box>
        </Section>

        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            Bio
          </Heading>
          <BioSection>
            <BioYear>1983</BioYear>
            Tachaaaaan aqui nacio un koala!!!
          </BioSection>
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            Hobbies 🧗 🏂   🤿
          </Heading>
          <Paragraph>
          </Paragraph>
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            On the web
          </Heading>
          <List>
            <ListItem>
              <Link href="https://github.com/israellopezdeveloper" target="_blank">
                <Button
                  variant="ghost"
                  colorScheme="teal"
                  leftIcon={<IoLogoGithub />}
                >
                  @israellopezdeveloper
                </Button>
              </Link>
            </ListItem>
          </List>
        </Section>
      </Container>
    </Layout>
  )
}
export default Home
