import {
  Container,
  Badge,
  Link,
  List,
  ListItem,
  Heading,
  Center,
  Box
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Title, WorkImage, Meta } from '../../components/work'
import Layout from '../../components/layouts/article'
import cvData from '../../public/data/CV.json'

const Work = ({ job }) => (
  <Layout title={job.name} >
    <Container ml={0} mr={0} w={'100%'} maxW={'100%'}>
      <Title>
        {job.name} <Badge>{job.period_time}</Badge>
      </Title>
      <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: job.full_description.join('') }} />
      <WorkImage src={"/images/works/" + job.thumbnail} alt={job.name} />
      <List ml={4} my={4}>
        {
          job.links.map((item, index) => (
            <ListItem key={index}>
              <Meta>{item.tag}</Meta>
              <Link href={item.url} target='_blank'>
                {item.text} <ExternalLinkIcon mx="2px" />
              </Link>
            </ListItem>
          ))
        }
        <ListItem>
          <Meta>Contributions</Meta>
          <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: job.contribution.join('') }} />
          {
            job.projects.map((project, index1) => (
              <Box key={index1}>
                <Heading as="h3" fontSize={16} my={6}>
                  <Center>Project {index1 + 1}: {project.name}</Center>
                </Heading>
                <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: project.description.join('') }} />
                {
                  project.links && project.links.length > 0 ?
                    (
                      <Heading as="h5" fontSize={14} my={6}>
                        <Center>Project links</Center>
                      </Heading>
                    ) :
                    (
                      ''
                    )
                }
                {
                  project.links.map((link, index2) => (
                    <Box key={index2}>
                      <Meta>{link.tag}</Meta>
                      <Link href={link.url} target='_blank'>
                        {link.text} <ExternalLinkIcon mx="2px" />
                      </Link>
                    </Box>
                  ))
                }
                <Heading as="h5" fontSize={14} my={6}>
                  <Center>Technologies</Center>
                </Heading>
                <Box>
                  {
                    project.technologies.map((str, index2) => (
                      <Meta key={index2}>{str}</Meta>
                    ))
                  }
                </Box>
                {
                  project.images && project.images.length > 0 ?
                    (
                      <Heading as="h5" fontSize={14} my={6}>
                        <Center>Proyect images</Center>
                      </Heading>
                    ) :
                    (
                      ''
                    )
                }
                <Box>
                  {
                    project.images && project.images.length > 0 ?
                      project.images.map((image, index2) => (
                        <WorkImage key={index2} src={"/images/works/" + image} alt={job.name} />
                      )) :
                      ('')
                  }
                </Box>
              </Box>
            ))
          }
        </ListItem>
      </List>
      {
        job.images && job.images.length > 0 ?
          (
            <Heading as="h3" fontSize={14} my={6}>
              <Center>Job images</Center>
            </Heading>
          ) :
          (
            ''
          )
      }
      {
        job.images && job.images.length > 0 ?
          job.images.map((image, index) => (
            <WorkImage key={index} src={"/images/works/" + image} alt={job.name} />
          )) : ('')
      }
    </Container>
  </Layout >
)

// Función para obtener datos estáticos
export async function getStaticProps({ params }) {
  const job = cvData.works[params.id];

  return {
    props: {
      job
    }
  };
}

// Función para obtener los paths estáticos
export async function getStaticPaths() {

  const paths = cvData.works.map((_, index) => ({
    params: { id: index.toString() }
  }));

  return {
    paths,
    fallback: false
  };
}

export default Work

