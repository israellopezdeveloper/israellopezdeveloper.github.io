import {
  Container,
  Badge,
  Link,
  List,
  ListItem,
  Heading,
  Center
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Title, WorkImage, Meta } from '../../components/work'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Work = () => (
  <Layout title="Devo">
    <Container>
      <Title>
        Devo <Badge>March 2020 - March 2024</Badge>
      </Title>
      <P>
        Devo is a leading cloud-native logging and security analytics company dedicated to providing real-time insights and advanced analytics for enterprise data. Their robust platform empowers organizations to efficiently detect, analyze, and respond to security threats by leveraging the power of machine learning and a highly scalable architecture. Devo's solutions are designed to handle large volumes of data, ensuring that businesses can maintain high levels of performance and security. Serving a diverse range of industries, including finance and telecommunications, Devo enhances cybersecurity measures and optimizes data management practices, helping enterprises stay ahead of evolving threats and regulatory requirements. With a commitment to innovation and excellence, Devo is at the forefront of transforming how businesses approach security and data analytics.
      </P>
      <WorkImage src="/images/works/devo1.png" alt="Devo" />
      <List ml={4} my={4}>
        <ListItem>
          <Meta>Website</Meta>
          <Link href="https://www.devo.com/es/" target='_blank'>
            https://www.devo.com/es/ <ExternalLinkIcon mx="2px" />
          </Link>
        </ListItem>
        <ListItem>
          <Meta>Contributions</Meta>
          <P>At Devo, Israel played a crucial role in the data ingestion team, specifically focusing on the load balancer. Given the sensitivity of the data and its importance for diagnosing potential attacks, the service needed to be both reliable and fast. Under Israel's expertise, the system was able to handle an impressive ingestion volume of approximately 60TB per day. Additionally, he significantly contributed to Devo's efforts in adapting to the necessary standards for integration with U.S. federal systems, achieving FedRAMP certification. Furthermore, Israel participated in the creation of a multi-region and multi-cloud backup system, ensuring data redundancy and reliability across diverse environments. Israel's work ensured that Devo's platform met the highest levels of security and compliance, enhancing the company's capability to serve its clients effectively.</P>
        </ListItem>
        <Heading as="h5" fontSize={14} my={6}>
          <Center>Technologies</Center>
        </Heading>
        <ListItem>
          <Meta>Java 14</Meta><Meta>Java 21</Meta><Meta>Node.js</Meta><Meta>C</Meta><Meta>C++</Meta><Meta>FIPS</Meta><Meta>FedRAMP</Meta><Meta>SonarQube</Meta><Meta>Snyk</Meta><Meta>Owasp</Meta><Meta>Jenkins</Meta><Meta>Gitlab CI/CD</Meta><Meta>Kubernetes</Meta><Meta>Docker</Meta><Meta>Groovy</Meta>
        </ListItem>
      </List>
      <WorkImage src="/images/works/devo2.png" alt="Devo" />
    </Container>
  </Layout >
)

export default Work
