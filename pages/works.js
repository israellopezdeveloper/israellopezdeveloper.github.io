import { Container, Heading, SimpleGrid, Divider } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'

import thumbDevo from '../public/images/works/devo1.png'
import thumbEC from '../public/images/works/European_Commission_01.png'
import { useContext, useEffect } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'

const Works = () => {
  const voxel = useContext(VoxelKoalaContext)
  useEffect(() => {
    voxel.current.to_work()
  }, [voxel])

  return (
    <Layout title="Works">
      <Container>
        <Heading as="h3" fontSize={20} mb={4}>
          Works
        </Heading>

        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          <Section>
            <WorkGridItem id="devo" title="Devo" thumbnail={thumbDevo}>
              Cloud-native company offering real-time security analytics, machine learning, and scalable solutions for enterprise data management.
            </WorkGridItem>
          </Section>
          <Section>
            <WorkGridItem id="0" title="European Commission" thumbnail={thumbEC}>
              The European Commission is the executive branch of the European Union, responsible for proposing legislation, implementing decisions, and managing day-to-day affairs.
            </WorkGridItem>
          </Section>
        </SimpleGrid>

        <Section delay={0.2}>
          <Divider my={6} />

          <Heading as="h3" fontSize={20} mb={4}>
            Collaborations
          </Heading>
        </Section>


        <Section delay={0.4}>
          <Divider my={6} />

          <Heading as="h3" fontSize={20} mb={4}>
            Old works
          </Heading>
        </Section>

      </Container>
    </Layout>
  )
}

export default Works
