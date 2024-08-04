import { Container, Heading, SimpleGrid, Divider } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'

import thumbDevo from '../public/images/works/devo1.png'
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
              Devo is a cloud-native logging and security analytics company providing real-time insights and advanced analytics for enterprise data. Their platform helps organizations efficiently detect and respond to security threats using machine learning and scalable architecture. Devo serves industries like finance and telecom, enhancing cybersecurity and data management.
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
