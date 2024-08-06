import cvData from '../public/data/CV.json'
import { Container, Heading, SimpleGrid, Divider, Box, WrapItem, Wrap } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'
import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'
import TechBadge from '../components/techbadge'
import moment from 'moment'

const Works = () => {
  const voxel = useContext(VoxelKoalaContext)
  useEffect(() => {
    voxel.current.to_work()
  }, [voxel])

  // Función para calcular los meses de uso de cada tecnología
  const calculateTechnologyUsage = () => {
    const techUsage = {}

    cvData.works.forEach(work => {
      const period = work.period_time.split(' - ')
      const startDate = moment(period[0], 'MMMM YYYY')
      const endDate = moment(period[1], 'MMMM YYYY')
      const duration = endDate.diff(startDate, 'months')

      work.projects.forEach(project => {
        project.technologies.forEach(tech => {
          if (techUsage[tech]) {
            techUsage[tech] += duration
          } else {
            techUsage[tech] = duration
          }
        })
      })
    })

    return techUsage
  }

  // Uso de useMemo para memorizar el uso de las tecnologías
  const technologyUsage = useMemo(calculateTechnologyUsage, [])

  // Estado para las tecnologías seleccionadas
  const [selectedTechnologies, setSelectedTechnologies] = useState(() => {
    const initialState = {}
    Object.keys(technologyUsage).forEach(tech => {
      initialState[tech] = true; // Todas las tecnologías están marcadas inicialmente
    })
    return initialState
  })

  // Estado para el checkbox "seleccionar todo"
  const [selectAll, setSelectAll] = useState(true)

  // Manejar el cambio de selección de las tecnologías
  const handleTechnologyChange = (tech) => {
    setSelectedTechnologies(prevState => ({
      ...prevState,
      [tech]: !prevState[tech]
    }))
  }

  // Manejar el cambio del checkbox "seleccionar todo"
  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    const newSelectedTechnologies = {}
    Object.keys(technologyUsage).forEach(tech => {
      newSelectedTechnologies[tech] = newSelectAll
    })
    setSelectedTechnologies(newSelectedTechnologies)
  }

  // Filtrar los trabajos basados en las tecnologías seleccionadas
  const filteredWorks = cvData.works.filter(work => {
    return work.projects.some(project => {
      return project.technologies.some(tech => selectedTechnologies[tech])
    })
  })


  return (
    <Layout title="Works">
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
                  thumbnail={`/images/works/${work.thumbnail}`}>
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
          <p style={{ fontSize: '10pt' }}>
            The amount in parentheses is the months worked in each technology.
          </p>
          <TechBadge
            tech="Select All"
            isSelected={selectAll}
            onToggle={handleSelectAllChange}
          />
          <Wrap gap={0.1}>
            {Object.keys(technologyUsage).map((tech, index) => (
              <WrapItem key={index}>
                <TechBadge
                  tech={tech}
                  usage={technologyUsage[tech]} // Pasa el número de meses al TechBadge
                  isSelected={selectedTechnologies[tech]}
                  onToggle={handleTechnologyChange}
                />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </Container>
    </Layout >
  )
}

export default Works
