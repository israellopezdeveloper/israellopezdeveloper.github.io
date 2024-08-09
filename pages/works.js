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
import { useLanguage } from '../components/context/language_context'
import axios from 'axios'

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

async function fetchRepos() {
  const test = true
  if (!test) {
    try {
      const response = await axios.get('https://api.github.com/users/israellopezdeveloper/repos')
      const repoData = response.data

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
          let techs2 = []
          try {
            techs2 = await axios.get(`https://raw.githubusercontent.com/${repo.owner.login}/${repo.name}/main/.techs`)
            techs2 = techs2.data.split('\n')
          } catch (e) {
          }
          techs = [...new Set([...techs, ...techs2])]
          techs = techs.map((item) => {
            return {
              'tech': item,
              'time': totalMonths
            }
          })
          const titles = JSON.parse(repo.description)
          const output = {
            techs: techs,
            title: {
              es: titles.es.name,
              en: titles.en.name
            },
            description: {
              es: titles.es.desc,
              en: titles.en.desc
            },
            url: repo.html_url,

            thumbnail: `https://raw.githubusercontent.com/${repo.owner.login}/${repo.name}/main/.logo.png`
          }
          return output
        })
      )

      return reposFilled
    } catch (error) {
      console.error(error)
    } finally {
    }
  } else {
    return [{
      "techs": [
        {
          "tech": "JavaScript",
          "time": 1
        },
        {
          "tech": "next.js",
          "time": 1
        },
        {
          "tech": "chakra",
          "time": 1
        },
        {
          "tech": "react",
          "time": 1
        },
        {
          "tech": "node.js",
          "time": 1
        },
        {
          "tech": "threejs",
          "time": 1
        },
        {
          "tech": "blender",
          "time": 1
        }
      ], "title": {
        "es": "Mi portfolio",
        "en": "My portfolio"
      }, "description": {
        "es": "Código fuente de mi portfolio",
        "en": "Source code of my portfolio"
      }, "url": "https://github.com/israellopezdeveloper/israellopezdeveloper.github.io", thumbnail: "https://raw.githubusercontent.com/israellopezdeveloper/israellopezdeveloper.github.io/main/.logo.png"
    }]
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
    'es.s': cvDataESS
  }), [])
  const [cvData, setCvData] = useState(cvDataEN)
  useEffect(() => {
    setCvData(cvDataArray[language])
  }, [language, cvDataArray])

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
      repo.techs.forEach(tech => {
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
    return repo.techs.map(t => t.tech).some(tech => selectedTechnologies[tech])
  })

  const { width } = useWindowSize()
  const isMobile = width < 768; // Define el tamaño de pantalla móvil como < 768px

  return (
    <Layout title="Works">
      <Container display="flex" flexDirection={isMobile ? 'column' : 'row'} maxW={'100%'}>
        <Box flex="3">
          <Section>
            <Heading as="h3" fontSize={20} mb={4}>
              Works
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
              Own projects
            </Heading>
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {filteredProjects.map((repo) => (
                <ProjectGridItem key={'Repo' + repo.id}
                  id={repo.url}
                  title={repo.title.es}
                  thumbnail={repo.thumbnail}>
                  {repo.description.es}
                </ProjectGridItem>
              ))}
            </SimpleGrid>
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
