import NextLink from 'next/link'
import { Heading, Box, Image, Link, Badge, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, useDisclosure } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useState } from 'react'

export const Title = ({ children }) => (
  <Box>
    <Link as={NextLink} href="/educations">
      Education
    </Link>
    <span>
      {' '}
      <ChevronRightIcon />{' '}
    </span>
    <Heading display="inline-block" as="h3" fontSize={20} mb={4}>
      {children}
    </Heading>
  </Box>
)

export const EducationImage = ({ src, alt }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [imageSrc, setImageSrc] = useState('')

  const handleClick = () => {
    setImageSrc(src)
    onOpen()
  }

  return (
    <>
      <Image
        borderRadius="lg"
        w="full"
        src={src}
        alt={alt}
        mb={4}
        maxH={300}
        fit={'scale-down'}
        onClick={handleClick}
        cursor="pointer"
      />
      <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
        <ModalOverlay />
        <ModalContent maxW={'80vw'} maxH={'80vh'} >
          <ModalCloseButton />
          <ModalBody display="flex" justifyContent="center" alignItems="center" p={0}>
            <Image src={imageSrc} alt={alt} borderRadius="lg" style={{ width: '80vw', height: '80vh', objectFit: 'contain' }} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export const Meta = ({ children }) => (
  <Badge colorScheme="green" mr={2}>
    {children}
  </Badge>
)

