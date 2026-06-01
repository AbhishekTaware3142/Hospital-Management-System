/**
 * USER PROFILE — Premium redesign with dark mode
 */

import { ROLES, normalizeRole, roleLabel } from '../utils/roles'
import {
  Box, Heading, Text, SimpleGrid, Stack, Flex, Avatar, Badge, HStack,
  useColorModeValue,
} from '@chakra-ui/react'

function InfoCard({ label, value, accent = false }) {
  const accentBg     = useColorModeValue('teal.50',  'rgba(13,158,140,0.12)')
  const accentBorder = useColorModeValue('teal.100', 'rgba(13,158,140,0.25)')
  const accentLabel  = useColorModeValue('teal.500', 'teal.300')
  const accentValue  = useColorModeValue('teal.700', 'teal.200')
  const normalBg     = useColorModeValue('gray.50',  'whiteAlpha.50')
  const normalBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const normalLabel  = useColorModeValue('gray.400', 'whiteAlpha.500')
  const normalValue  = useColorModeValue('gray.800', 'whiteAlpha.900')

  return (
    <Box
      p={4}
      bg={accent ? accentBg : normalBg}
      rounded="2xl"
      border="1px solid"
      borderColor={accent ? accentBorder : normalBorder}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-1px)' }}
    >
      <Text
        fontSize="10px" fontWeight="700"
        color={accent ? accentLabel : normalLabel}
        textTransform="uppercase" letterSpacing="0.5px" mb={1}
      >
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="700" color={accent ? accentValue : normalValue}>
        {value || 'Not provided'}
      </Text>
    </Box>
  )
}

function UserProfile({ user }) {
  const userRole = normalizeRole(user.role)
  const isDoctor = userRole === ROLES.DOCTOR

  const cardBg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const headColor  = useColorModeValue('gray.700', 'whiteAlpha.800')
  const divColor   = useColorModeValue('gray.100', 'whiteAlpha.100')

  return (
    <Box maxW="4xl" mx="auto" className="fade-in">
      {/* Hero banner */}
      <Box
        p={8} rounded="3xl" mb={6} position="relative" overflow="hidden"
        bgGradient="linear(135deg, hsl(215,60%,18%) 0%, hsl(184,85%,16%) 100%)"
        boxShadow="0 8px 32px rgba(13,158,140,0.2)"
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-60px" right="-60px" w="200px" h="200px" borderRadius="full"
          bg="radial-gradient(circle, rgba(38,197,241,0.15) 0%, transparent 70%)" />
        <Box position="absolute" bottom="-40px" left="30%" w="160px" h="160px" borderRadius="full"
          bg="radial-gradient(circle, rgba(13,158,140,0.12) 0%, transparent 70%)" />

        <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={6} position="relative">
          <Avatar
            size="2xl" name={user.name}
            bg="rgba(255,255,255,0.15)" color="white" fontWeight="800"
            border="3px solid rgba(255,255,255,0.25)"
            boxShadow="0 8px 24px rgba(0,0,0,0.2)"
            sx={{ borderRadius: '20px' }}
          />
          <Stack spacing={2} align={{ base: 'center', sm: 'start' }} textAlign={{ base: 'center', sm: 'left' }}>
            <Heading size="xl" fontWeight="800" color="white" letterSpacing="-0.5px">{user.name}</Heading>
            <HStack spacing={2} flexWrap="wrap">
              <Badge bg="rgba(255,255,255,0.15)" color="white" border="1px solid rgba(255,255,255,0.2)" rounded="full" px={3} py={1} fontSize="xs" fontWeight="700">
                {roleLabel(userRole)}
              </Badge>
              {isDoctor && user.specialization && (
                <Badge bg="rgba(13,158,140,0.3)" color="teal.100" border="1px solid rgba(13,158,140,0.4)" rounded="full" px={3} py={1} fontSize="xs" fontWeight="700">
                  {user.specialization}
                </Badge>
              )}
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* Details card */}
      <Box bg={cardBg} p={8} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <Heading size="sm" color={headColor} fontWeight="800" mb={6} pb={3} borderBottom="1px solid" borderColor={divColor}>
          {isDoctor ? '👨‍⚕️ Medical Practitioner Details' : '👤 Patient Details'}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <InfoCard label="Full Name"     value={user.name} />
          <InfoCard label="Phone Number"  value={user.phone} />
          <InfoCard label="Home Address"  value={user.address} />

          {isDoctor && (
            <>
              <InfoCard label="Medical License"     value={user.licenseNumber} />
              <InfoCard label="Specialization"      value={user.specialization} accent />
              <InfoCard label="Years of Experience" value={user.experience ? `${user.experience} Years` : null} />
              <InfoCard label="Consultation Fee"    value={user.consultationFee ? `₹${user.consultationFee}` : null} accent />
            </>
          )}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default UserProfile
