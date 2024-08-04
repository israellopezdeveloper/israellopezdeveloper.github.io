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
        <title>Israel's Portfolio</title>
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
