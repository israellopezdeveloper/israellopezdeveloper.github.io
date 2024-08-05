import worksData from '../public/data/CV.json'
import { Container, Heading, SimpleGrid, Divider, Box, UnorderedList, ListItem, Checkbox, border } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'

import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'

const Works = () => {
  const voxel = useContext(VoxelKoalaContext)
  useEffect(() => {
    voxel.current.to_work()
  }, [voxel])

  // Función para recopilar todas las tecnologías y eliminar duplicados
  const getAllTechnologies = () => {
    const techSet = new Set()
    worksData.works.forEach(work => {
      work.projects.forEach(project => {
        project.technologies.forEach(tech => techSet.add(tech))
      })
    })
    return Array.from(techSet)
  }

  // Uso de useMemo para memorizar la lista de tecnologías
  const allTechnologies = useMemo(getAllTechnologies, [worksData])

  // Estado para las tecnologías seleccionadas
  const [selectedTechnologies, setSelectedTechnologies] = useState(() => {
    const initialState = {}
    allTechnologies.forEach(tech => {
      initialState[tech] = true; // Todas las tecnologías están marcadas inicialmente
    })
    return initialState
  })

  // Manejar el cambio de selección de las tecnologías
  const handleTechnologyChange = (tech) => {
    setSelectedTechnologies(prevState => ({
      ...prevState,
      [tech]: !prevState[tech]
    }))
  }

  // Filtrar los trabajos basados en las tecnologías seleccionadas
  const filteredWorks = worksData.works.filter(work => {
    return work.projects.some(project => {
      return project.technologies.some(tech => selectedTechnologies[tech])
    })
  })

  return (
    <Layout title="Works" css={{ border: '1px solid red' }}>
      <Container display="flex" flexDirection="row" maxW={'100%'}>
        <Box flex="3">
          <Heading as="h3" fontSize={20} mb={4}>
            Works
          </Heading>

          <SimpleGrid columns={[1, 1, 2]} gap={6}>
            {filteredWorks.map((work, index) => (
              <Section key={index}>
                <WorkGridItem
                  id={index.toString()}
                  title={work.name}
                  thumbnail={`/images/works/${work.thumbnail}`}
                  thumbnailWidth={work.thumbnailWidth}
                  thumbnailHeight={work.thumbnailHeight}
                >
                  {work.short_description}
                </WorkGridItem>
              </Section>
            ))}
          </SimpleGrid>

          <Section delay={0.2}>
            <Divider my={6} />
            <Heading as="h3" fontSize={20} mb={4}>
              Collaborations
            </Heading>
          </Section>

          <Section delay={0.4}>
            <Divider my={6} />
            <Heading as="h3" fontSize={20} mb={4}>
              Old works
            </Heading>
          </Section>
        </Box>

        <Box flex="1" ml={6}>
          <Heading as="h3" fontSize={20} mb={4}>
            Technologies
          </Heading>
          <UnorderedList listStyleType="none" pl={0}>
            {allTechnologies.map((tech, index) => (
              <ListItem key={index} display="flex" alignItems="center">
                <Checkbox
                  isChecked={selectedTechnologies[tech]}
                  onChange={() => handleTechnologyChange(tech)}
                  mr={2}
                >
                  {tech}
                </Checkbox>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      </Container>
    </Layout>
  )
}

export default Works
