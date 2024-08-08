import { Container, Heading, SimpleGrid, Divider, Box, WrapItem, Wrap, useColorModeValue } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'
import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'
import TechBadge from '../components/techbadge'
import moment from 'moment'
import cvDataEN from '../data/CV.en.json'
import cvDataENS from '../data/CV.en.s.json'
import cvDataES from '../data/CV.es.json'
import cvDataESS from '../data/CV.es.s.json'
import { useLanguage } from '../components/context/language_context'

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Función para actualizar el estado con el tamaño de la ventana
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Añadir event listener
    window.addEventListener("resize", handleResize);

    // Llamar a la función handleResize inmediatamente para establecer el tamaño inicial
    handleResize();

    // Limpiar event listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Array vacío para que solo se ejecute al montar y desmontar
  return windowSize
}

const Works = () => {
  const voxel = useContext(VoxelKoalaContext)
  useEffect(() => {
    voxel.current.to_work()
  }, [voxel])

  const { language } = useLanguage()
  const cvDataArray = useMemo(() => ({
    'en': cvDataEN,
    'en.s': cvDataENS,
    'es': cvDataES,
    'es.s': cvDataESS
  }), [])
  const [cvData, setCvData] = useState(cvDataEN)
  useEffect(() => {
    setCvData(cvDataArray[language])
  }, [language, cvDataArray])

  // Función para calcular los meses de uso de cada tecnología
  const calculateTechnologyUsage = () => {
    const techUsage = {}

    cvData.works.forEach(work => {
      const period = work.period_time.split(' - ')
      const startDate = moment(period[0], 'MMMM YYYY')
      const endDate = moment(period[1], 'MMMM YYYY')
      const duration = endDate.diff(startDate, 'months')

      let job_techs = []
      work.projects.forEach(project => {
        project.technologies.forEach(tech => {
          if (techUsage[tech]) {
            if (!job_techs.includes(tech)) {
              techUsage[tech] += duration
              job_techs.push(tech)
            }
          } else {
            techUsage[tech] = duration
            job_techs.push(tech)
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

  const { width } = useWindowSize()
  const isMobile = width < 768; // Define el tamaño de pantalla móvil como < 768px

  return (
    <Layout title="Works">
      <Container display="flex" flexDirection={isMobile ? 'column' : 'row'} maxW={'100%'}>
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

        <Box flex="1" ml={6} bg={useColorModeValue('whiteAlpha.600', 'blackAlpha.600')} p={1} rounded={'md'}>
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
            {Object.keys(technologyUsage).sort().map((tech, index) => (
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
