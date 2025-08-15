// components/Navbar.tsx
'use client';

import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Stack,
  Container,
  Spacer,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode, type JSX } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';

import LanguageSelector from './LanguageSelector';
import { useI18n } from '../i18n/useI18n';

// Evita mismatches en el botón de tema
const ColorModeButton = dynamic(() => import('./ui/color-mode').then((m) => m.ColorModeButton), {
  ssr: false,
});

function NavLink({
  href,
  children,
  partial = true,
}: {
  href: string;
  children: ReactNode;
  /** Marca activo también en subrutas (/works/123) */
  partial?: boolean;
}): JSX.Element {
  const pathname = usePathname();

  const isActive = useMemo(() => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return partial ? pathname === href || pathname.startsWith(href + '/') : pathname === href;
  }, [pathname, href, partial]);

  return (
    <Link
      as={NextLink}
      href={href}
      px={3}
      py={2}
      rounded="md"
      aria-current={isActive ? 'page' : undefined}
      _hover={{ textDecoration: 'none', bg: 'blackAlpha.50' }}
    >
      {children}
    </Link>
  );
}

export default function Navbar(): JSX.Element {
  const { open, onOpen, onClose } = useDisclosure();
  const t = useI18n();

  const links = [
    { href: '/', label: 'Israel López' },
    { href: '/works', label: t('jobsAndProjects') },
    { href: '/educations', label: t('education') },
  ];

  return (
    <Box as="nav" position="sticky" top={0} zIndex={10} backdropFilter="saturate(100%) blur(5px)">
      <Container maxW="container.lg" py={2}>
        <Flex align="center">
          <HStack gap={2}>
            <IconButton
              aria-label="Toggle menu"
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={open ? onClose : onOpen}
              variant="ghost"
            >
              {open ? <LuX /> : <LuMenu />}
            </IconButton>

            {/* Menú desktop */}
            <HStack as="ul" gap={1} display={{ base: 'none', md: 'flex' }} className="menu">
              {links.map((l) => (
                <Box as="li" key={l.href} listStyleType="none">
                  <NavLink href={l.href}>{l.label}</NavLink>
                </Box>
              ))}
            </HStack>
          </HStack>

          <Spacer />
          <LanguageSelector />
          <ColorModeButton />
        </Flex>

        {/* Menú móvil */}
        {open && (
          <Box mt={2} display={{ md: 'none' }}>
            <Stack as="ul" gap={1} className="menu small">
              {links.map((l) => (
                <Box as="li" key={l.href} listStyleType="none">
                  <NavLink href={l.href}>{l.label}</NavLink>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
