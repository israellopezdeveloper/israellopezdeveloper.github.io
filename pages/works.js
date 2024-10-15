import { Container, Heading, SimpleGrid, Divider, Box, WrapItem, Wrap, useColorModeValue } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { ProjectGridItem, WorkGridItem } from '../components/grid-item'
import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'
import TechBadge from '../components/techbadge'
import moment from 'moment'
import cvDataEN from '../data/CV.en.json'
import cvDataENS from '../data/CV.en.s.json'
import cvDataES from '../data/CV.es.json'
import cvDataESS from '../data/CV.es.s.json'
import cvDataZH from '../data/CV.zh.json'
import cvDataZHS from '../data/CV.zh.s.json'
import guiEN from '../data/gui.en.json'
import guiES from '../data/gui.es.json'
import guiZH from '../data/gui.zh.json'
import backup_repos from '../data/backup.repos.json'
import { useLanguage } from '../components/context/language_context'
import axios from 'axios'

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    // Función para actualizar el estado con el tamaño de la ventana
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Añadir event listener
    window.addEventListener("resize", handleResize)

    // Llamar a la función handleResize inmediatamente para establecer el tamaño inicial
    handleResize()

    // Limpiar event listener al desmontar
    return () => window.removeEventListener("resize", handleResize)
  }, []); // Array vacío para que solo se ejecute al montar y desmontar
  return windowSize
}

async function fetchRepos() {
  try {
    const response = await axios.get('https://api.github.com/users/israellopezdeveloper/repos')
    const repoData = response.data
    console.log("repoData", repoData)

    const reposFilled = await Promise.all(
      repoData.map(async (repo) => {
        const startDate = new Date(repo.created_at)

        // Fecha actual
        const currentDate = new Date()

        // Calcula la diferencia en años y meses
        const yearsDiff = currentDate.getFullYear() - startDate.getFullYear()
        const monthsDiff = currentDate.getMonth() - startDate.getMonth()

        // Calcula el número total de meses
        let totalMonths = yearsDiff * 12 + monthsDiff
        totalMonths = (totalMonths === 0 ? 1 : totalMonths)
        let techs = await axios.get(repo.languages_url)
        techs = Object.keys(techs.data)
        let nitem = {}
        try {
          const data = await axios.get(repo.html_url.replace("github.com", "raw.githubusercontent.com") + "/metadata-branch/metadata.json")
          nitem = data.data
          nitem.url = repo.html_url
          nitem.thumbnail = repo.html_url.replace("github.com", "raw.githubusercontent.com") + "/metadata-branch/logo.png"
          techs = [...new Set([...(techs || []), ...(nitem.technologies || [])])]
          nitem.technologies = techs.map((item) => {
            return {
              'tech': item,
              'time': totalMonths
            }
          })
        } catch (error) {
          // Manejar error si es necesario
        }
        return nitem
      })
    )

    return reposFilled
  } catch (error) {
  } finally {
  }
}

let repos = []

fetchRepos().then(r => repos = r)

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
  const [cvData, setCvData] = useState(cvDataEN)
  const [gui, setGui] = useState(guiEN)
  useEffect(() => {
    setCvData(cvDataArray[language])
    setGui(guiArray[language])
  }, [language, cvDataArray, guiArray])

  // Función para calcular los meses de uso de cada tecnología
  const calculateTechnologyUsage = () => {
    const techUsage = {}

    cvDataEN.works.forEach(work => {
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
    repos.forEach(repo => {
      repo.technologies.forEach(tech => {
        if (techUsage[tech.tech]) {
          techUsage[tech.tech] += tech.time
        } else {
          techUsage[tech.tech] = tech.time
        }
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

  // Filtrar los proyectos basados en las tecnologías seleccionadas
  const filteredProjects = repos.filter(repo => {
    return repo.technologies.map(t => t.tech).some(tech => selectedTechnologies[tech])
  })

  const { width } = useWindowSize()
  const isMobile = width < 768; // Define el tamaño de pantalla móvil como < 768px

  return (
    <Layout title="Works">
      <Container display="flex" flexDirection={isMobile ? 'column' : 'row'} maxW={'100%'}>
        <Box flex="3">
          <Section>
            <Heading as="h3" fontSize={20} mb={4}>
              {gui.jobs.title}
            </Heading>

            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {filteredWorks.map((work, index) => (
                <WorkGridItem key={index}
                  id={index.toString()}
                  title={work.name}
                  thumbnail={`/images/works/${work.thumbnail}`}>
                  {work.short_description}
                </WorkGridItem>
              ))}
            </SimpleGrid>
          </Section>

          <Divider my={6} />
          <Section delay={0.2}>
            <Heading as="h3" fontSize={20} mb={4}>
              {gui.jobs.own_projects}
            </Heading>
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {filteredProjects.map((repo) => (
                <ProjectGridItem key={'Repo' + repo.id}
                  id={repo.url}
                  title={repo.lang[language.replace(".s", "")].name}
                  thumbnail={repo.thumbnail}>
                  {repo.lang[language.replace(".s", "")].desc}
                </ProjectGridItem>
              ))}
            </SimpleGrid>
          </Section>
        </Box>

        <Box flex="1" ml={6} bg={useColorModeValue('whiteAlpha.600', 'blackAlpha.600')} p={1} rounded={'md'}>
          <Heading as="h3" fontSize={20} mb={4}>
            {gui.jobs.techs}
          </Heading>
          <p style={{ fontSize: '10pt' }}>
            {gui.jobs.tech_text}
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
