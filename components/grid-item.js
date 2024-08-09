import NextLink from 'next/link'
import Image from 'next/image'
import { Box, Text, LinkBox, LinkOverlay, useColorModeValue } from '@chakra-ui/react'
import { Global } from '@emotion/react'

export const GridItem = ({ children, href, title, thumbnail }) => (
  <Box w="100%" textAlign="center">
    <LinkBox cursor="pointer">
      <Image
        src={thumbnail}
        alt={title}
        className="grid-item-thumbnail"
        placeholder="blur"
        loading="lazy"
      />
      <LinkOverlay href={href} target="_blank">
        <Text mt={2}>{title}</Text>
      </LinkOverlay>
      <Text fontSize={14}>{children}</Text>
    </LinkBox>
  </Box>
)

export const ProjectGridItem = ({
  children,
  id,
  title,
  thumbnail
}) => (
  <Box
    w="100%"
    p={5}
    textAlign="center"
    border="1px"
    borderColor={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
    borderRadius="md"
    overflow="hidden"
    _hover={{
      transform: 'scale(1.05)',
      boxShadow: 'lg',
    }}
    transition="all 0.3s ease-in-out">
    <LinkBox
      as={NextLink}
      href={id}
      target='_blank'
      scroll={false}
      alignItems={'center'}
      w={'100%'}
      cursor="pointer">
      <Box
        display="flex"
        width="240px"
        height="150px"
        ml={'calc((100% - 240px)/2)'}
        overflow="hidden"
        justifyContent="center"
        alignItems="center">
        <Image
          src={thumbnail}
          alt={title}
          width={240}
          height={150}
          style={{ position: 'relative', objectFit: 'contain', maxWidth: '240px', maxHeight: '150px' }}
        />
      </Box>
      <LinkOverlay as="div" href={id} isExternal>
        <Text mt={2} fontSize={20}>
          {title}
        </Text>
      </LinkOverlay>
      <Text
        fontSize={14}
        textAlign={'justify'}
        css={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{children}</Text>
    </LinkBox>
  </Box>
)

export const WorkGridItem = ({
  children,
  category = 'works',
  id,
  title,
  thumbnail
}) => (
  <Box
    w="100%"
    p={5}
    textAlign="center"
    border="1px"
    borderColor={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
    borderRadius="md"
    overflow="hidden"
    _hover={{
      transform: 'scale(1.05)',
      boxShadow: 'lg',
    }}
    transition="all 0.3s ease-in-out">
    <LinkBox
      as={NextLink}
      href={`/${category}/${id}`}
      scroll={false}
      alignItems={'center'}
      w={'100%'}
      cursor="pointer">
      <Box
        display="flex"
        width="240px"
        height="150px"
        ml={'calc((100% - 240px)/2)'}
        overflow="hidden"
        justifyContent="center"
        alignItems="center">
        <Image
          src={thumbnail}
          alt={title}
          width={240}
          height={150}
          style={{ position: 'relative', objectFit: 'contain', maxWidth: '240px', maxHeight: '150px' }}
        />
      </Box>
      <LinkOverlay as="div" href={`/${category}/${id}`}>
        <Text mt={2} fontSize={20}>
          {title}
        </Text>
      </LinkOverlay>
      <Text
        fontSize={14}
        textAlign={'justify'}
        css={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{children}</Text>
    </LinkBox>
  </Box>
)

export const EducationGridItem = ({
  children,
  category = 'educations',
  type,
  id,
  title,
  thumbnail
}) => (
  <Box
    w="100%"
    p={5}
    textAlign="center"
    border="1px"
    borderColor={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
    borderRadius="md"
    overflow="hidden"
    _hover={{
      transform: 'scale(1.05)',
      boxShadow: 'lg',
    }}
    transition="all 0.3s ease-in-out">
    <LinkBox
      as={NextLink}
      href={`/${category}/${type}/${id}`}
      scroll={false}
      alignItems={'center'}
      w={'100%'}
      cursor="pointer">
      <Box
        display="flex"
        width={240}
        height={150}
        ml={'calc((100% - 240px)/2)'}
        overflow="hidden"
        justifyContent="center"
        alignItems="center">
        <Image
          src={thumbnail}
          alt={title}
          width={240}
          height={150}
          style={{ position: 'relative', objectFit: 'contain', maxWidth: '240px', maxHeight: '150px' }}
        />
      </Box>
      <LinkOverlay as="div" href={`/${category}/${type}/${id}`}>
        <Text mt={2} fontSize={20}>
          {title}
        </Text>
      </LinkOverlay>
      <Text
        fontSize={14}
        textAlign={'justify'}
        css={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{children}</Text>
    </LinkBox>
  </Box>
)

export const GridItemStyle = () => (
  <Global
    styles={`
      .grid-item-thumbnail {
        border-radius: 12px
      }
    `}
  />
)
