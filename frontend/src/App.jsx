/**
 * MAIN APP COMPONENT
 * Root component that manages routing and overall layout
 * ======================================================
 */

import { useState, useEffect } from 'react'
import { Box, Flex, Text, Spinner } from '@chakra-ui/react'
import api from './api/axiosConfig'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppRouter    from './router/AppRouter'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          setUser(response.data.data)
          setIsAuthenticated(true)
          setCurrentPage('dashboard')
        }
      } catch (error) {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    setCurrentPage('login')
  }

  if (loading) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        gap={6}
        bgGradient="linear(135deg, hsl(220,60%,8%) 0%, hsl(215,60%,15%) 50%, hsl(184,85%,10%) 100%)"
      >
        {/* Animated logo mark */}
        <Box
          w="72px"
          h="72px"
          bg="rgba(255,255,255,0.08)"
          border="1px solid rgba(255,255,255,0.15)"
          borderRadius="2xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="36px"
          boxShadow="0 0 40px rgba(13,158,140,0.3)"
          animation="pulse-icon 1.8s ease-in-out infinite"
          sx={{
            '@keyframes pulse-icon': {
              '0%, 100%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.08)', opacity: 0.85 },
            },
          }}
        >
          🏥
        </Box>

        {/* Brand name */}
        <Box textAlign="center">
          <Text
            fontSize="2xl"
            fontWeight="800"
            color="white"
            letterSpacing="-0.5px"
            mb={1}
          >
            MediBook
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500" fontWeight="600" letterSpacing="2px" textTransform="uppercase">
            Loading your workspace…
          </Text>
        </Box>

        {/* Spinner */}
        <Spinner
          size="sm"
          color="teal.300"
          thickness="2px"
          speed="0.7s"
          emptyColor="whiteAlpha.200"
        />
      </Flex>
    )
  }

  return (
    <Box className="app-container">
      {isAuthenticated ? (
        <Box className="fade-in">
          <AppRouter user={user} onLogout={handleLogout} />
        </Box>
      ) : (
        <Box className="fade-in">
          {currentPage === 'login' ? (
            <LoginPage
              onLoginSuccess={handleLogin}
              onSwitchToRegister={() => setCurrentPage('register')}
            />
          ) : (
            <RegisterPage
              onRegisterSuccess={() => setCurrentPage('login')}
              onSwitchToLogin={() => setCurrentPage('login')}
            />
          )}
        </Box>
      )}
    </Box>
  )
}

export default App
