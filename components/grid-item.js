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

export const WorkGridItem = ({
  children,
  category = 'works',
  id,
  title,
  thumbnail
}) => (
  <Box
    w="100%"
    textAlign="center"
    border="1px"
    borderColor={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
    borderRadius="md"
    overflow="hidden"
    _hover={{
      transform: 'scale(1.05)',
      boxShadow: 'lg',
    }}
    transition="all 0.3s ease-in-out"
  >
    <LinkBox
      as={NextLink}
      href={`/${category}/${id}`}
      scroll={false}
      cursor="pointer"
    >
      <Box
        width="240px"
        height="150px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="hidden">
        <Image
          src={thumbnail}
          alt={title}
          className="grid-item-thumbnail"
          objectFit='contain'
          width={240}
          height={150}
        />
      </Box>
      <LinkOverlay as="div" href={`/${category}/${id}`}>
        <Text mt={2} fontSize={20}>
          {title}
        </Text>
      </LinkOverlay>
      <Text
        fontSize={14}
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
  id,
  title,
  thumbnail
}) => (
  <Box w="100%" textAlign="center">
    <LinkBox
      as={NextLink}
      href={`/${category}/${id}`}
      scroll={false}
      cursor="pointer"
    >
      <Image
        src={thumbnail}
        alt={title}
        className="grid-item-thumbnail"
        placeholder="blur"
      />
      <LinkOverlay as="div" href={`/${category}/${id}`}>
        <Text mt={2} fontSize={20}>
          {title}
        </Text>
      </LinkOverlay>
      <Text fontSize={14}>{children}</Text>
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
