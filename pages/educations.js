import { Container, Heading, SimpleGrid, Divider, Box } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { EducationGridItem } from '../components/grid-item'
import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'
import cvDataEN from '../data/CV.en.json'
import cvDataENS from '../data/CV.en.s.json'
import cvDataES from '../data/CV.es.json'
import cvDataESS from '../data/CV.es.s.json'
import cvDataZH from '../data/CV.zh.json'
import cvDataZHS from '../data/CV.zh.s.json'
import { useLanguage } from '../components/context/language_context'
import guiEN from '../data/gui.en.json'
import guiES from '../data/gui.es.json'
import guiZH from '../data/gui.zh.json'

const Educations = () => {
  const voxel = useContext(VoxelKoalaContext)
  useEffect(() => {
    voxel.current.to_education()
  }, [voxel])

  const { language } = useLanguage()
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
  const [gui, setGui] = useState(guiEN)
  const [cvData, setCvData] = useState(cvDataEN)
  useEffect(() => {
    setCvData(cvDataArray[language])
    setGui(guiArray[language])
  }, [language, cvDataArray, guiArray])

  return (
    <Layout title="Education">
      <Container display="flex" flexDirection="row" maxW={'75%'}>
        <Box flex="3">
          <Heading as="h3" fontSize={20} mb={4}>
            {gui.educations.uni}
          </Heading>

          <SimpleGrid columns={[1, 1, 2]} gap={6}>
            {cvData.educations.university.map((education, index) => (
              <Section key={index}>
                <EducationGridItem
                  id={index.toString()}
                  title={education.university_name}
                  type={'universitary'}
                  thumbnail={`/images/educations/${education.thumbnail}`}>
                  {education.title}
                </EducationGridItem>
              </Section>
            ))}
          </SimpleGrid>

          <Section delay={0.2}>
            <Divider my={6} />
            <Heading as="h3" fontSize={20} mb={4}>
              {gui.educations.complementary}
            </Heading>
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {cvData.educations.complementary.map((education, index) => (
                <Section key={index}>
                  <EducationGridItem
                    id={index.toString()}
                    title={education.institution}
                    type={'complementary'}
                    thumbnail={`/images/educations/${education.thumbnail}`}>
                    {education.title}
                  </EducationGridItem>
                </Section>
              ))}
            </SimpleGrid>
          </Section>

          <Section delay={0.4}>
            <Divider my={6} />
            <Heading as="h3" fontSize={20} mb={4}>
              {gui.educations.languages}
            </Heading>
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {cvData.educations.languages.map((education, index) => (
                <Section key={index}>
                  <EducationGridItem
                    id={index.toString()}
                    title={education.language}
                    type={'languages'}
                    thumbnail={`/images/educations/${education.thumbnail}`}>
                    {education.title}
                  </EducationGridItem>
                </Section>
              ))}
            </SimpleGrid>
          </Section>
        </Box>
      </Container>
    </Layout >
  )
}

export default Educations

