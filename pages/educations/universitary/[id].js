import {
  Container,
  Badge,
} from '@chakra-ui/react'
import { Title, EducationImage } from '../../../components/education'
import P from '../../../components/paragraph'
import Layout from '../../../components/layouts/article'
import { useLanguage } from '../../../components/context/language_context'
import cvDataEN from '../../../data/CV.en.json'
import cvDataENS from '../../../data/CV.en.s.json'
import cvDataES from '../../../data/CV.es.json'
import cvDataESS from '../../../data/CV.es.s.json'
import { useEffect, useMemo, useState } from 'react'

const Education = ({ studyId }) => {
  const { language } = useLanguage()
  const [study, setStudy] = useState(cvDataEN.educations.university[studyId])

  const cvDataArray = useMemo(() => ({
    'en': cvDataEN,
    'en.s': cvDataENS,
    'es': cvDataES,
    'es.s': cvDataESS
  }), [])

  useEffect(() => {
    const cvData = cvDataArray[language]
    setStudy(cvData.educations.university[studyId])
  }, [language, studyId, cvDataArray])

  return (
    < Layout title={study.university_name.toUpperCase() + ' - ' + study.title} >
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

  const paths = cvDataEN.educations.university.map((_, index) => ({
    params: { id: index.toString() }
  }));

  return {
    paths,
    fallback: false
  };
}

export default Education

