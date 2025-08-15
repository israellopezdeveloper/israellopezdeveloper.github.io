'use client';
import { Global } from '@emotion/react';

import type { JSX } from 'react';

export default function Fonts(): JSX.Element {
  return (
    <Global
      styles={`
      @import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;700&display=swap");
    `}
    />
  );
}
