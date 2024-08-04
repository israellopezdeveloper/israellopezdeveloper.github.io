import { Container, Heading, SimpleGrid, Divider } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { EducationGridItem } from '../components/grid-item'

import thumbUAH from '../public/images/educations/uah1.png'
import { useContext, useEffect } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'

const Educations = () => {
  const voxel = useContext(VoxelKoalaContext)
  useEffect(() => {
    voxel.current.to_education()
  }, [voxel])

  return (
    <Layout title="Education">
      <Container>
        <Heading as="h3" fontSize={20} mb={4}>
          Education
        </Heading>

        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          <Section>
            <EducationGridItem id="UAH" title="UAH" thumbnail={thumbUAH}>
              Texto sobre UAH
            </EducationGridItem>
          </Section>
        </SimpleGrid>

        <Section delay={0.2}>
          <Divider my={6} />

          <Heading as="h3" fontSize={20} mb={4}>
            Others
          </Heading>
        </Section>

      </Container>
    </Layout>
  )
}

export default Educations

