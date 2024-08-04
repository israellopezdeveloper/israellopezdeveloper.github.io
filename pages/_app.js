import { ChakraProvider } from "@chakra-ui/react";
import Main from '../components/layouts/main'
import Fonts from '../components/fonts'
import theme from '../libs/theme'
import { AnimatePresence } from "framer-motion";

const Website = ({ Component, pageProps, router }) => {
  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <Main router={router}>
        <AnimatePresence
          mode="wait"
          initial={true}
          onExitComplete={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <Component {...pageProps} key={router.route} />
        </AnimatePresence>
      </Main>
    </ChakraProvider>
  )
}

export default Website
