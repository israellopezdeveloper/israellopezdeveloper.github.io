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
          Hello, I&apos;m a backend developer travelling around the world!
        </Box>

        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Israel López
            </Heading>
            <Paragraph>Senior Software Developer</Paragraph>
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
            Israel is a senior software developer based in Spain with a passion for expanding his horizons and traveling the world while doing what he loves: developing high-quality software products. With extensive experience in high availability and concurrency environments, he excels in performance optimization, ensuring every byte counts. Israel&apos;s dedication to his craft and his ability to deliver exceptional results make him a valuable asset to any project.
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
            Born in Madrid, Spain.
          </BioSection>
          <BioSection>
            <BioYear>2007</BioYear>
            Complete the diploma in computer science in Alcalá de Henares University.
          </BioSection>
          <BioSection>
            <BioYear>2009</BioYear>
            Complete the Master of Artificial Intelligence in information and communication technologies at Alcalá de Henares University.
          </BioSection>
          <BioSection>
            <BioYear>2004 to present</BioYear>
            Working as a Full-time employee.
          </BioSection>
          <BioSection>
            <BioYear>2024 to future</BioYear>
            Working as a freelancer.
          </BioSection>
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            Hobbies
          </Heading>
          <Paragraph>
            🧗 climbing, 🏂 snowboarding, 🧭 travel, 🤿 scuba diving, ⨋ maths (especially linear algebra and statistics), 🧠 Artificial Intelligence.
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
