import {
  Container,
  Badge,
} from '@chakra-ui/react'
import { Title, EducationImage } from '../../../components/education'
import P from '../../../components/paragraph'
import Layout from '../../../components/layouts/article'
import cvData from '../../../public/data/CV.json'

const Education = ({ study: study }) => (
  <Layout title={study.university_name.toUpperCase() + ' - ' + study.title} >
    <Container ml={0} mr={0} w={'100%'} maxW={'100%'}>
      <Title>
        {study.university_name.toUpperCase() + ' - ' + study.title} <Badge>{study.period_time}</Badge>
      </Title>
      {
        study.images.map((image, index) => (
          <EducationImage key={index} src={"/images/educations/" + image} alt={study.university_name} />
        ))
      }
      {
        study.summary.map((str, index) => (
          <P key={index} dangerouslySetInnerHTML={{ __html: str }} />
        ))
      }
    </Container>
  </Layout >
)

// Función para obtener datos estáticos
export async function getStaticProps({ params }) {
  const study = cvData.educations.university[params.id]

  return {
    props: {
      study: study
    }
  };
}

// Función para obtener los paths estáticos
export async function getStaticPaths() {

  const paths = cvData.educations.university.map((_, index) => ({
    params: { id: index.toString() }
  }));

  return {
    paths,
    fallback: false
  };
}

export default Education

