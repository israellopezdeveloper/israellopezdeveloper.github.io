"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { IconButton } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";

export function ColorModeButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const onToggle = React.useCallback(() => {
    const current = theme === "system" ? resolvedTheme : theme;
    setTheme(current === "dark" ? "light" : "dark");
  }, [theme, resolvedTheme, setTheme]);

  return (
    <IconButton aria-label="Toggle color mode" variant="ghost" onClick={onToggle} title="Toggle color mode">
      <span className="icon--light" aria-hidden><LuMoon /></span>
      <span className="icon--dark" aria-hidden><LuSun /></span>
    </IconButton>
  );
}

