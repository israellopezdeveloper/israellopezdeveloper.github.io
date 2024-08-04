import {
  Container,
  Badge,
  Link,
  List,
  ListItem,
  AspectRatio
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Title, EducationImage, Meta } from '../../components/education'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Education = () => (
  <Layout title="UAH">
    <Container>
      <Title>
        UAH <Badge>?</Badge>
      </Title>
      <P>
        Texto descriptivo de la carrera
      </P>
      <List ml={4} my={4}>
        <ListItem>
          <Meta>Website</Meta>
          <Link href="https://uah.es/">
            https://uah.es/ <ExternalLinkIcon mx="2px" />
          </Link>
        </ListItem>
      </List>

      <EducationImage src="/images/educations/uah1.png" alt="UAH" />
    </Container>
  </Layout >
)

export default Education

