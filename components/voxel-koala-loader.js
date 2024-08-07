import { forwardRef } from 'react'
import { Box } from '@chakra-ui/react'

export const KoalaContainer = forwardRef(({ children }, ref) => (
  <Box
    ref={ref}
    className="voxel-koala"
    m="auto"
    w="100%"
    h="100%"
    position="fixed"
    left="0px"
    overflow={'hidden'}
  >
    {children}
  </Box>
))
KoalaContainer.displayName = 'KoalaContainer'

const Loader = () => {
  return (
    <KoalaContainer>
    </KoalaContainer>
  )
}

export default Loader
