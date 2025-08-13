"use client";

import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import system from "./theme";
import { ThemeProvider } from "next-themes";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </ThemeProvider>
  );
}

