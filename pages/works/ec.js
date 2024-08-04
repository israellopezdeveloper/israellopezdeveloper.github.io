import {
  Container,
  Badge,
  Link,
  List,
  ListItem,
  AspectRatio,
  Heading,
  Center
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Title, WorkImage, Meta } from '../../components/work'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Work = () => (
  <Layout title="European Commission">
    <Container>
      <Title>
        European Commission <Badge>June 2017- Janurary 2020</Badge>
      </Title>
      <P>
        The European Commission is the executive branch of the European Union, responsible for proposing legislation, implementing decisions, upholding the EU treaties, and managing the day-to-day business of the EU. It operates as a cabinet government, with 27 members of the Commission (one from each member state) led by a President. The Commission's main roles include developing strategies and policies, enforcing EU laws, and negotiating international agreements on behalf of the EU.
      </P>
      <P>
        Within the European Commission, the Directorate-General for Competition (DG COMP) plays a critical role. DG COMP is responsible for establishing and implementing competition policy to ensure fair competition within the EU internal market. This includes enforcing antitrust laws, overseeing mergers and acquisitions, and preventing monopolistic practices and state aid that could distort competition. DG COMP works to protect consumers and businesses by promoting innovation, ensuring a level playing field, and enhancing economic efficiency.
      </P>
      <P>
        Israel worked at DG COMP, contributing to the Commission's efforts to maintain competitive markets and foster economic growth across the European Union.
      </P>
      <WorkImage src="/images/works/European_Commission_01.png" alt="European Commission" />
      <List ml={4} my={4}>
        <ListItem>
          <Meta>Website</Meta>
          <Link href="https://competition-policy.ec.europa.eu/index_en" target='_blank'>
            https://competition-policy.ec.europa.eu/index_en <ExternalLinkIcon mx="2px" />
          </Link>
        </ListItem>
        <ListItem>
          <Meta>Contributions</Meta>
          <P>Israel worked as a software architect on three projects, with a wide range of responsibilities that showcased his expertise and leadership in software development. His key responsibilities included:</P>
          <P><b>Management of Non-Functional Requirements and Project Definition</b>: Using Enterprise Architect, Israel was responsible for identifying and managing non-functional requirements, ensuring that each project was clearly defined and aligned with organizational goals.</P>
          <P><b>Task Prioritization</b>: Utilizing Jira, he prioritized tasks effectively to ensure that the most critical elements were addressed in a timely manner.</P>
          <P><b>Management of Task Dependencies</b>: He used Jira to manage dependencies between tasks, ensuring smooth progress and minimizing delays.</P>
          <P><b>Technology Selection</b>: Israel was instrumental in selecting the appropriate technologies for each project, ensuring that they were well-suited to meet the project’s needs.</P>
          <P><b>Team Member Profile Definition</b>: He defined the profiles and roles of team members, ensuring that the team had the necessary skills and expertise to succeed.</P>
          <P><b>Inter-Team Collaboration</b>: Israel facilitated collaboration between different teams whose projects needed to be integrated, ensuring seamless integration and cooperation.</P>
          <P><b>Quality Control and Testing</b>: He defined quality controls and testing protocols, including unit tests using technologies such as JUnit or Google Test/Valgrind, depending on the programming language.</P>
          <P><b>CI/CD Systems Implementation</b>: He defined and implemented Continuous Integration and Continuous Deployment systems using tools like Bamboo and SonarQube.</P>
          <P><b>Software Development Methodologies</b>: Israel applied Test-Driven Development (TDD) and Behavior-Driven Development (BDD) practices to ensure high-quality software development.</P>
          <P><b>Agile Methodology</b>: He utilized SCRUM as the primary methodology for project management, fostering an agile and efficient development process.</P>

          <Heading as="h3" fontSize={16} my={6}>
            <Center>Project 1: Definition of Two RESTful APIs</Center>
          </Heading>

          <P>The first project involved defining two RESTful APIs that implemented the Richardson Maturity Model Level 3, incorporating HATEOAS. These APIs were designed as platforms for the secure exchange of legal documents in anti-cartel proceedings.</P>
          <P><b>Internal API</b>: The first API was intended to serve the internal staff of the European Commission.</P>
          <P><b>External API</b>: The second API served as a platform for external personnel.</P>
          <P>Both APIs featured access control through a Single Sign-On system called CAS. Data persistence was managed using both Oracle DB and MongoDB. Additionally, the APIs were integrated with an internal secure document storage project via a SOAP interface. The workflow of each procedure was managed using the State design pattern, and system administrators were notified of status changes via email.</P>
        </ListItem>
        <ListItem>
          <Meta>Documentation</Meta>
          <Link href="https://competition-policy.ec.europa.eu/document/download/2fc568de-61ff-4aaf-9c9b-e03e96324ef7_en?filename=eleniency_guidance_access-notification.pdf" target='_blank'>
            e-leniency documentation <ExternalLinkIcon mx="2px" />
          </Link>
        </ListItem>
        <Heading as="h5" fontSize={14} my={6}>
          <Center>Technologies</Center>
        </Heading>
        <ListItem>
          <Meta>Java 8</Meta><Meta>Spring Security</Meta><Meta>Spring MVC</Meta><Meta>Spring Data</Meta><Meta>Spring Documentation</Meta><Meta>Spring IoC</Meta><Meta>JPA</Meta><Meta>Eclipselink</Meta><Meta>WebLogic 12</Meta><Meta>Oracle DB</Meta><Meta>MongoDB</Meta><Meta>Swagger</Meta><Meta>JUnit</Meta><Meta>AngularJS 5</Meta><Meta>Selenium</Meta><Meta>Maven</Meta><Meta>Git</Meta><Meta>CAS</Meta><Meta>Jira</Meta><Meta>JUnit</Meta><Meta>Bamboo</Meta><Meta>SonarQuebe</Meta><Meta>TDD</Meta><Meta>BDD</Meta>
        </ListItem>
      </List>
      <WorkImage src="/images/works/European_Commission_02.png" alt="European Commission" />
    </Container>
  </Layout >
)

export default Work
