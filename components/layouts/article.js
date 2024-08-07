import { motion } from 'framer-motion'
import Head from 'next/head'
import { GridItemStyle } from '../grid-item'
import { Box, useColorModeValue } from '@chakra-ui/react'

const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -0, y: 20 }
}

const Layout = ({ children, title }) => {
  const t = `${title} - Israel López`
  return (
    <motion.article
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.4, type: 'easeInOut' }}
      style={{ position: 'relative' }}
    >
      <>
        <Box
          borderRadius="lg"
          mb={6}
          p={3}
          textAlign="center"
          bg={useColorModeValue('whiteAlpha.600', 'whiteAlpha.500')}
          css={{ backdropFilter: 'blur(10px)' }}
        >
          {title && (
            <Head>
              <title>{t}</title>
              <meta property="og:title" content={t} />
            </Head>
          )}
          {children}

          <GridItemStyle />
        </Box>
      </>
    </motion.article >
  )
}

export default Layout
