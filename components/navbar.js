import Logo from './logo'
import NextLink from 'next/link'
import { Box, Container, Heading, Link, useColorModeValue, Flex, Stack, Menu, MenuButton, IconButton, MenuList, MenuItem } from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import ThemeToggleButton from './theme-toggle-button'
import LanguageSelector from './language_selector'
import { useLanguage } from './context/language_context'
import guiEN from '../data/gui.en.json'
import guiES from '../data/gui.es.json'
import guiZH from '../data/gui.zh.json'

const LinkItem = ({ href, path, target, children, ...props }) => {
  const active = path === href
  const inactiveColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  return (
    <Link
      as={NextLink}
      href={href}
      scroll={false}
      p={2}
      bg={active ? 'grassTeal' : undefined}
      color={active ? '#202023' : inactiveColor}
      target={target}
      {...props}
    >
      {children}
    </Link>
  )
}

const MenuLink = forwardRef((props, ref) => (
  <Link ref={ref} as={NextLink} {...props} />
))
MenuLink.displayName = 'MenuLink'

const NavBar = props => {
  const { path } = props
  const { language } = useLanguage()
  const guiArray = useMemo(() => ({
    'en': guiEN,
    'en.s': guiEN,
    'es': guiES,
    'es.s': guiES,
    'zh': guiZH,
    'zh.s': guiZH
  }), [])
  const [gui, setGui] = useState(guiEN)

  useEffect(() => {
    setGui(guiArray[language])
  }, [language, guiArray])

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={useColorModeValue('#ffffff40', '#20202380')}
      css={{ backdropFilter: 'blur(10px)' }}
      zIndex={2}
      {...props}
    >
      <Container
        display="flex"
        p={2}
        maxW="container.md"
        wrap="wrap"
        align="center"
        justify="space-between"
      >
        <Flex align="center" mr={5}>
          <Heading as="h1" size="lg" letterSpacing={'tighter'}>
            <Logo />
          </Heading>
        </Flex>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          display={{ base: 'none', md: 'flex' }}
          width={{ base: 'full', md: 'auto' }}
          alignItems="center"
          flexGrow={1}
          mt={{ base: 4, md: 0 }}
        >
          <LinkItem href="/works" path={path}>
            {gui.titles.jobs}
          </LinkItem>
          <LinkItem href="/educations" path={path}>
            {gui.titles.education}
          </LinkItem>
        </Stack>

        <Box flex={1} align="right">
          <LanguageSelector display={{ base: 'inline-block' }} />
          <ThemeToggleButton />
          <Box ml={2} display={{ base: 'inline-block', md: 'none' }}>
            <Menu isLazy id="navbar-menu">
              <MenuButton
                as={IconButton}
                variant="outline"
                icon={<HamburgerIcon />}
                aria-label="Options"
              />
              <MenuList>
                <MenuItem as={MenuLink} href="/">
                  {gui.titles.about}
                </MenuItem>
                <MenuItem as={MenuLink} href="/works">
                  {gui.titles.jobs}
                </MenuItem>
                <MenuItem as={MenuLink} href="/educations">
                  {gui.titles.education}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default NavBar
