import { Geist, Geist_Mono } from 'next/font/google';

import './assets/globals.css';

import { LanguageProvider } from './components/context/LanguageContext';
import Fonts from './components/Fonts';
import Navbar from './components/Navbar';
import KoalaCanvas from './components/three/KoalaCanvas';
import { Provider } from './components/ui/provider';

import type { Metadata } from 'next';
import type { JSX } from 'react';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Israel’s Portfolio',
  description: 'My Portfolio',
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/favicons/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicons/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
    ],
    other: [{ rel: 'manifest', url: '/favicons/manifest.json' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Provider>
          <LanguageProvider>
            <Fonts />
            <Navbar />
            <KoalaCanvas />
            <div className="site-content">{children}</div>
          </LanguageProvider>
        </Provider>
      </body>
    </html>
  );
}
