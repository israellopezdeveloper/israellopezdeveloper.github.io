import Head from 'next/head'
import Navbar from '../navbar'
import { Box } from '@chakra-ui/react'
import { useState, useEffect, useRef, createContext } from 'react'
import VoxelKoala from '../voxel-koala'

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Función para actualizar el estado con el tamaño de la ventana
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Añadir event listener
    window.addEventListener("resize", handleResize);

    // Llamar a la función handleResize inmediatamente para establecer el tamaño inicial
    handleResize();

    // Limpiar event listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Array vacío para que solo se ejecute al montar y desmontar
  return windowSize
}

export const VoxelKoalaContext = createContext()

// TODO cambiar el posicionamiento del Voxel
const Main = ({ children, router }) => {
  const refVoxelKoala = useRef(null)
  const { width } = useWindowSize()
  const isMobile = width < 768; // Define el tamaño de pantalla móvil como < 768px

  return (
    <Box as="main" pb={8}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Israel's homepage" />
        <meta name="author" content="Israel López" />
        <meta property="og:site_name" content="Israel López portfolio" />
        <meta name="og:title" content="Israel López" />
        <meta property="og:type" content="website" />
        <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="manifest" href="/favicons/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/favicons/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <title>Israel&apos;s Portfolio</title>
      </Head>

      <Navbar path={router.asPath} />

      <Box position="relative" height="95vh" width="100vw" overflowX={'hidden'}>
        <Box
          display='flex'
          height="100%"
          width="100%"
        >
          <Box
            display={isMobile ? 'block' : 'contents'}
            w={isMobile ? `${width}px` : '100%'}
            h={isMobile ? `${width / 2}px` : '100%'}
            pos={'fixed'}
            left={0}
            top={0}
            p={0}
          >
            <VoxelKoala ref={refVoxelKoala} />
          </Box>
          <Box
            pt={55}
            display="block"
            height='100%'
            w={isMobile ? "100%" : "55%"}
            pl={10}
            pr={10}
            position={isMobile ? 'absolute' : 'relative'}
            top={isMobile ? `${width / 2}px` : 'auto'}
          >
            <VoxelKoalaContext.Provider value={refVoxelKoala}>
              <Box>
                {children}
              </Box>
            </VoxelKoalaContext.Provider>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Main
