"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Box, Flex, HStack, Link, IconButton, useDisclosure, Stack, Container, Spacer
} from "@chakra-ui/react";
import { LuMenu, LuX } from "react-icons/lu";
import dynamic from "next/dynamic";
import LanguageSelector from "./LanguageSelector";

// Evita mismatches en el botón de tema
const ColorModeButton = dynamic(
  () => import("./ui/color-mode").then(m => m.ColorModeButton),
  { ssr: false }
);

const links = [
  { href: "/", label: "Israel López" },
  { href: "/works", label: "Jobs & Projects" },
  { href: "/educations", label: "Education" },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      as={NextLink}
      href={href}
      px={3}
      py={2}
      rounded="md"
      fontWeight={active ? "bold" : "normal"}
      _hover={{ textDecoration: "none", bg: "blackAlpha.50" }}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <Box as="nav" position="sticky" top={0} zIndex={10} backdropFilter="saturate(100%) blur(5px)">
      <Container maxW="container.lg" py={2}>
        <Flex align="center">
          <HStack gap={2}>
            <IconButton
              aria-label="Open menu"
              display={{ base: "inline-flex", md: "none" }}
              onClick={open ? onClose : onOpen}
            >
              {open ? <LuX /> : <LuMenu />}
            </IconButton>

            <HStack as="ul" gap={1} display={{ base: "none", md: "flex" }}>
              {links.map(l => (
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

        {open && (
          <Box mt={2} display={{ md: "none" }}>
            <Stack as="ul" gap={1}>
              {links.map(l => (
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

