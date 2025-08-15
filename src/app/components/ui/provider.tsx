'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';

import system from './theme';

export function Provider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </ThemeProvider>
  );
}
