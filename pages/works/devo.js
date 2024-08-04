import {
  Container,
  Badge,
  Link,
  List,
  ListItem,
  AspectRatio
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Title, WorkImage, Meta } from '../../components/work'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Work = () => (
  <Layout title="Devo">
    <Container>
      <Title>
        Devo <Badge>2016-2024</Badge>
      </Title>
      <P>
        Texto descriptivo del trabajo
      </P>
      <List ml={4} my={4}>
        <ListItem>
          <Meta>Website</Meta>
          <Link href="https://www.devo.com/es/" target='_blank'>
            https://www.devo.com/es/ <ExternalLinkIcon mx="2px" />
          </Link>
        </ListItem>
      </List>

      <WorkImage src="/images/works/devo1.png" alt="Devo" />
      <WorkImage src="/images/works/devo2.png" alt="Devo" />
    </Container>
  </Layout >
)

export default Work
