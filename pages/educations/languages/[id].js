import {
  Box,
  Container,
  Heading,
  List,
  ListIcon,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { Title, EducationImage } from '../../../components/education'
import Layout from '../../../components/layouts/article'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { useLanguage } from '../../../components/context/language_context'
import cvDataEN from '../../../data/CV.en.json'
import cvDataENS from '../../../data/CV.en.s.json'
import cvDataES from '../../../data/CV.es.json'
import cvDataESS from '../../../data/CV.es.s.json'
import { useEffect, useMemo, useState } from 'react'

const Education = ({ studyId }) => {
  const { language } = useLanguage()
  const [study, setStudy] = useState(cvDataEN.educations.languages[studyId])

  const cvDataArray = useMemo(() => ({
    'en': cvDataEN,
    'en.s': cvDataENS,
    'es': cvDataES,
    'es.s': cvDataESS
  }), [])

  useEffect(() => {
    const cvData = cvDataArray[language]
    setStudy(cvData.educations.languages[studyId])
  }, [language, studyId, cvDataArray])

  return (
    <Layout title={study.language.toUpperCase()} >
      <Container ml={0} mr={0} w={'100%'} maxW={'100%'}>
        <Title>
          {study.language.toUpperCase()}
        </Title>
        <EducationImage src={"/images/educations/" + study.thumbnail} alt={study.language} />
      </Container>
      <Box p={5} border="1px" borderColor="gray.200" borderRadius="md">
        <Heading as="h3" fontSize={20} mb={4}>
          Proficiency
        </Heading>

        <TableContainer mb={4}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Skill</Th>
                <Th>Level</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Spoken</Td>
                <Td>{study.spoken}</Td>
              </Tr>
              <Tr>
                <Td>Written</Td>
                <Td>{study.writen}</Td>
              </Tr>
              <Tr>
                <Td>Read</Td>
                <Td>{study.read}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        <Heading as="h4" fontSize={18} mb={2}>
          Acreditations
        </Heading>
        <List spacing={3}>
          {study.acreditations.map((acreditation, index) => (
            <ListItem key={index}>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>{acreditation.institution}</strong>: {acreditation.title} ({acreditation.period_time})
            </ListItem>
          ))}
        </List>
      </Box>
    </Layout >
  )
}

// Función para obtener datos estáticos
export async function getStaticProps({ params }) {
  return {
    props: {
      studyId: params.id
    }
  };
}

// Función para obtener los paths estáticos
export async function getStaticPaths() {

  const paths = cvDataEN.educations.languages.map((_, index) => ({
    params: { id: index.toString() }
  }));

  return {
    paths,
    fallback: false
  };
}

export default Education

