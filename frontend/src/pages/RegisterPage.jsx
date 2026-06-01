/**
 * REGISTER PAGE
 * Public registration — patients only.
 * Doctors are created exclusively by Master admin via the Admin Panel.
 */

import { useState } from 'react'
import api from '../api/axiosConfig'
import {
  Box, Button, FormControl, FormLabel, Input,
  Stack, Text, Heading, Alert, AlertIcon,
  HStack, Flex, Badge, Divider, SimpleGrid,
} from '@chakra-ui/react'
import { useAppToast } from '../hooks/useAppToast'

export default function RegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  const [name,            setName]            = useState('')
  const [phone,           setPhone]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const toast = useAppToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your full name'); return
    }
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number'); return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match'); return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { name: name.trim(), phone: phone.trim(), password })
      toast.success('Account Created!', 'Registration successful. Please log in.')
      if (onRegisterSuccess) onRegisterSuccess()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh" align="center" justify="center" p={4}
      bgGradient="linear(to-br, hsl(220,60%,8%) 0%, hsl(215,60%,15%) 40%, hsl(184,85%,10%) 100%)"
      position="relative" overflow="hidden"
      fontFamily="'Plus Jakarta Sans', sans-serif"
    >
      {/* Background glow */}
      <Box position="absolute" w="600px" h="600px" borderRadius="full" zIndex={0}
        bg="radial-gradient(circle, rgba(13,158,140,0.15) 0%, transparent 70%)"
        top="-150px" left="-100px"
      />

      <Stack spacing={8} mx="auto" maxW="lg" py={6} px={4} w="100%" zIndex={1}>
        <Box
          rounded="3xl" overflow="hidden"
          bg="rgba(255,255,255,0.03)"
          border="1px solid rgba(255,255,255,0.08)"
          backdropFilter="blur(24px)" boxShadow="2xl"
        >
          {/* Header */}
          <Box
            bgGradient="linear(to-r, rgba(38,197,241,0.9) 0%, rgba(19,145,196,0.8) 50%, rgba(13,158,140,0.9) 100%)"
            p={6} textAlign="center"
          >
            <Flex align="center" justify="center" gap={3} mb={1}>
              <Box w="38px" h="38px" bg="rgba(255,255,255,0.15)"
                border="1px solid rgba(255,255,255,0.25)" borderRadius="lg"
                display="flex" alignItems="center" justifyContent="center"
                fontSize="18px" backdropFilter="blur(8px)">
                🏥
              </Box>
              <Heading fontSize="2xl" fontWeight="800" color="white" letterSpacing="-0.5px">
                HMS
              </Heading>
            </Flex>
            <Text fontSize="xs" fontWeight="700" color="whiteAlpha.800" letterSpacing="1px" mb={3}>
              CREATE PATIENT ACCOUNT
            </Text>
            <HStack spacing={2} justify="center">
              <Badge bg="whiteAlpha.200" color="white" rounded="full" px={2} py={0.5} fontSize="9px">
                ✓ Free to join
              </Badge>
              <Badge bg="whiteAlpha.200" color="white" rounded="full" px={2} py={0.5} fontSize="9px">
                ✓ Book instantly
              </Badge>
            </HStack>
          </Box>

          {/* Form */}
          <Box p={6}>
            <Stack spacing={4} as="form" onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <Heading fontSize="lg" fontWeight="700" color="white">
                  Start your HMS account
                </Heading>
                <Text fontSize="xs" color="whiteAlpha.600">
                  Register as a patient to book specialist appointments.
                </Text>
              </Stack>

              {error && (
                <Alert status="error" rounded="xl" fontSize="xs"
                  bg="red.900" color="red.100" border="1px solid" borderColor="red.700">
                  <AlertIcon color="red.300" />
                  {error}
                </Alert>
              )}

              {/* Name + Phone */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="whiteAlpha.700" fontWeight="bold">Full Name</FormLabel>
                  <Input
                    placeholder="John Doe" value={name}
                    onChange={e => setName(e.target.value)} disabled={loading}
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 3px rgba(13,158,140,0.2)' }}
                    fontSize="sm" rounded="xl"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="whiteAlpha.700" fontWeight="bold">Phone Number</FormLabel>
                  <Input
                    type="tel" placeholder="10-digit number" value={phone}
                    onChange={e => setPhone(e.target.value)} disabled={loading}
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 3px rgba(13,158,140,0.2)' }}
                    fontSize="sm" rounded="xl" maxLength={10}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Password + Confirm */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="whiteAlpha.700" fontWeight="bold">Password</FormLabel>
                  <Input
                    type="password" placeholder="Min 6 characters" value={password}
                    onChange={e => setPassword(e.target.value)} disabled={loading}
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 3px rgba(13,158,140,0.2)' }}
                    fontSize="sm" rounded="xl"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="whiteAlpha.700" fontWeight="bold">Confirm Password</FormLabel>
                  <Input
                    type="password" placeholder="Repeat password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} disabled={loading}
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 3px rgba(13,158,140,0.2)' }}
                    fontSize="sm" rounded="xl"
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                type="submit" size="lg" h="54px" rounded="2xl"
                bgGradient="linear(to-r, cyan.400, teal.400)" color="white"
                fontWeight="bold" fontSize="md"
                _hover={{ bgGradient: 'linear(to-r, cyan.500, teal.500)', transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(13,158,140,0.3)' }}
                _active={{ transform: 'translateY(0)' }}
                isLoading={loading} loadingText="Registering..." mt={2}
              >
                Create Account →
              </Button>
            </Stack>

            <Divider my={4} borderColor="whiteAlpha.100" />

            <Stack align="center" spacing={3}>
              <Text fontSize="sm" color="whiteAlpha.600">
                Already have an account?{' '}
                <Button variant="link" color="teal.300" onClick={onSwitchToLogin}
                  fontSize="sm" fontWeight="bold" _hover={{ color: 'teal.200' }}>
                  Login here
                </Button>
              </Text>
              <HStack spacing={4} opacity={0.6} justify="center" pt={2}
                borderTop="1px solid" borderColor="whiteAlpha.100" w="100%">
                <HStack spacing={1}>
                  <Box w="6px" h="6px" rounded="full" bg="teal.300" />
                  <Text fontSize="10px" color="white">HIPAA Compliant</Text>
                </HStack>
                <HStack spacing={1}>
                  <Box w="6px" h="6px" rounded="full" bg="teal.300" />
                  <Text fontSize="10px" color="white">256-bit SSL</Text>
                </HStack>
              </HStack>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Flex>
  )
}
