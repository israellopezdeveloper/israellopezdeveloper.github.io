'use client';
import { IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

import { useI18n } from '@/app/i18n/useI18n';

export function ColorModeButton(): React.JSX.Element {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const onToggle = React.useCallback(() => {
    const current = theme === 'system' ? resolvedTheme : theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [theme, resolvedTheme, setTheme]);
  const t = useI18n();

  return (
    <IconButton
      aria-label="Toggle color mode"
      variant="ghost"
      onClick={onToggle}
      title={t('toggleColorMode')}
    >
      <span className="icon--light" aria-hidden>
        <LuMoon />
      </span>
      <span className="icon--dark" aria-hidden>
        <LuSun />
      </span>
    </IconButton>
  );
}
