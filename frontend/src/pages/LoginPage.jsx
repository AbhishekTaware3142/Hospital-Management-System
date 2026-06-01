import { useState } from 'react'
import api from '../api/axiosConfig'

import {
  Box, Flex, VStack, HStack, Button, FormControl, FormLabel,
  Input, InputGroup, InputLeftElement, InputRightElement,
  Text, Heading, Badge, Alert, AlertIcon, IconButton, Image, Link,
  useColorModeValue, useColorMode,
} from '@chakra-ui/react'
import { useAppToast } from '../hooks/useAppToast'

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toast = useAppToast()
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  // Color tokens
  const outerBg    = useColorModeValue('#EAF9F9', 'hsl(222,28%,9%)')
  const cardBg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const leftBg     = useColorModeValue('#F8F6F1', 'hsl(222,22%,17%)')
  const titleColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor   = useColorModeValue('gray.500', 'whiteAlpha.500')
  const labelColor = useColorModeValue(undefined, 'whiteAlpha.700')
  const forgotColor = useColorModeValue('gray.600', 'whiteAlpha.600')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) { setError('Please enter your mobile number'); return }
    if (!password.trim()) { setError('Please enter your password'); return }

    try {
      setLoading(true)
      const response = await api.post('/auth/login', { phone, password })
      const { token, data } = response.data
      toast.success('Welcome Back!', `Successfully signed in as ${data.name}`)
      onLoginSuccess(token, data)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" bg={outerBg} align="center" justify="center" p={4} position="relative">
      {/* Dark mode toggle */}
      <Box position="absolute" top={4} right={4}>
        <Button
          size="sm" variant="ghost" rounded="xl"
          onClick={toggleColorMode}
          color={subColor}
          _hover={{ bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.100' }}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </Button>
      </Box>

      <Box
        maxW="1200px" w="100%"
        bg={cardBg}
        borderRadius="32px"
        overflow="hidden"
        boxShadow="0 20px 60px rgba(0,0,0,0.12)"
      >
        <Flex direction={{ base: 'column', lg: 'row' }}>

          {/* ── LEFT SECTION ── */}
          <Flex flex={1} bg={leftBg} p={{ base: 8, lg: 12 }} justify="center" align="center">
            <VStack spacing={6} w="100%">
              <Box
                w="80px" h="80px" borderRadius="20px"
                bgGradient="linear(to-br, cyan.400, teal.400)"
                display="flex" alignItems="center" justifyContent="center"
                color="white" fontSize="38px" fontWeight="bold" boxShadow="lg"
              >
                M
              </Box>

              <Heading
                fontSize={{ base: '4xl', md: '5xl' }} fontWeight="800"
                bgGradient="linear(to-r, cyan.400, teal.500)" bgClip="text"
              >
                Hospital Management System
              </Heading>

              <Text fontSize="xl" fontWeight="700" letterSpacing="1px" textAlign="center" color={titleColor}>
                DOCTOR APPOINTMENT BOOKING
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify="center">
                <Badge px={4} py={2} borderRadius="full" colorScheme="teal" fontSize="sm">+ 500+ Doctors</Badge>
                <Badge px={4} py={2} borderRadius="full" colorScheme="cyan" fontSize="sm">⚡ Instant Booking</Badge>
                <Badge px={4} py={2} borderRadius="full" colorScheme="green" fontSize="sm">🔒 Secure</Badge>
              </HStack>

              <VStack spacing={2}>
                <Badge px={4} py={2} borderRadius="full">24/7 Support</Badge>
                <Link color={isDark ? 'teal.300' : 'black'} fontWeight="600" textDecoration="underline">
                  Contact Us
                </Link>
              </VStack>

              <Image src="/doctor-team.jpg" alt="Doctor team" maxH="320px" objectFit="contain" />
            </VStack>
          </Flex>

          {/* ── RIGHT SECTION ── */}
          <Flex flex={1} p={{ base: 8, lg: 12 }} justify="center" align="center">
            <Box w="100%" maxW="420px">
              <VStack spacing={6} align="stretch" as="form" onSubmit={handleSubmit}>

                <Box>
                  <Heading size="xl" mb={2} color={titleColor}>Sign In</Heading>
                  <Text fontSize="2xl" fontWeight="700" color={titleColor}>Welcome back 👋</Text>
                  <Text color={subColor} mt={1}>Sign in to manage your appointments</Text>
                </Box>

                {error && (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={labelColor}>MOBILE NUMBER</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">👤</InputLeftElement>
                    <Input
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      borderRadius="xl" disabled={loading}
                      maxLength={10}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={labelColor}>PASSWORD</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">🔑</InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      borderRadius="xl" disabled={loading}
                      maxLength={10}
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm" variant="ghost"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={<Text fontSize="lg">{showPassword ? '🙈' : '👁'}</Text>}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit" size="lg" h="58px" borderRadius="full"
                  bgGradient="linear(to-r, cyan.400, teal.500)"
                  color="white" fontWeight="700"
                  _hover={{ bgGradient: 'linear(to-r, cyan.500, teal.600)' }}
                  isLoading={loading} loadingText="Signing In..."
                >
                  Sign In to HMS →
                </Button>

                <Text textAlign="center" cursor="pointer" color={subColor}>
                  Forgot Password?
                </Text>

                <Text textAlign="center" color={subColor}>
                  Don't have an account?{' '}
                  <Button variant="link" color="teal.500" onClick={onSwitchToRegister}>
                    Register here
                  </Button>
                </Text>

                <HStack justify="center" spacing={4} pt={4}>
                  <Badge px={4} py={2} borderRadius="full">🛡 HIPAA Compliant</Badge>
                  <Badge px={4} py={2} borderRadius="full">🔒 256-bit SSL</Badge>
                </HStack>

              </VStack>
            </Box>
          </Flex>

        </Flex>
      </Box>
    </Flex>
  )
}

export default LoginPage
