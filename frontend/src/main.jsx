/**
 * MAIN ENTRY POINT
 * Initializes React application and renders App component
 * =========================================================
 */

import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    {/* Injects color mode script before React hydrates — prevents flash */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </>
)
