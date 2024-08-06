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
import cvData from '../../../public/data/CV.json'
import { CheckCircleIcon } from '@chakra-ui/icons'

const Education = ({ study: study }) => (
  <Layout title={study.language.toUpperCase()} >
    <Container ml={0} mr={0} w={'100%'} maxW={'100%'}>
      <Title>
        {study.language.toUpperCase()}
      </Title>
      <EducationImage src={"/images/educations/" + study.thumbnail} alt={study.language} />
    </Container>
    <Box p={5} border="1px" borderColor="gray.200" borderRadius="md">
      <Heading as="h3" fontSize={20} mb={4}>
        {study.language} Proficiency
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

// Función para obtener datos estáticos
export async function getStaticProps({ params }) {
  const study = cvData.educations.languages[params.id]

  return {
    props: {
      study: study
    }
  };
}

// Función para obtener los paths estáticos
export async function getStaticPaths() {

  const paths = cvData.educations.languages.map((_, index) => ({
    params: { id: index.toString() }
  }));

  return {
    paths,
    fallback: false
  };
}

export default Education

