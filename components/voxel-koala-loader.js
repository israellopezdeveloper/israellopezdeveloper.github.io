import { forwardRef } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

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

const Loader = () => {
  return (
    <KoalaContainer>
      <KoalaSpinner />
    </KoalaContainer>
  )
}

export default Loader
