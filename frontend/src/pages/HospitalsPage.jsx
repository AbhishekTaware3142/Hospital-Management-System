/**
 * HospitalsPage — hospital details from database
 */
import { useState } from 'react'
import {
  Box, Flex, Stack, Heading, Text, Button,
  SimpleGrid, HStack, Badge, Avatar, Skeleton, Alert, AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import StatCard from '../components/StatCard'
import { useHospital } from '../hooks/useHospital'

const SECTIONS = ['overview', 'departments', 'doctors']

function HospitalSkeleton() {
  const bg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const border = useColorModeValue('gray.100', 'whiteAlpha.100')
  return (
    <Box bg={bg} rounded="3xl" border="1px solid" borderColor={border} boxShadow="sm" overflow="hidden" mb={6}>
      <Skeleton h="240px" />
      <Box p={8}>
        <Skeleton h="28px" w="200px" mb={3} rounded="lg" />
        <Skeleton h="16px" w="300px" mb={6} rounded="lg" />
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {[1,2,3,4].map(i => <Skeleton key={i} h="90px" rounded="2xl" />)}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default function HospitalsPage({ onBook }) {
  const { hospital, doctors, loading, error } = useHospital()
  const [section, setSection] = useState('overview')

  // Color tokens
  const cardBg      = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const headColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor    = useColorModeValue('gray.500', 'whiteAlpha.500')
  const divColor    = useColorModeValue('gray.100', 'whiteAlpha.100')
  const tileBg      = useColorModeValue('gray.50', 'whiteAlpha.50')
  const tileBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const tileHead    = useColorModeValue('gray.800', 'whiteAlpha.900')
  const infoBg      = useColorModeValue('gray.50', 'whiteAlpha.50')
  const infoLabel   = useColorModeValue('gray.400', 'whiteAlpha.400')
  const infoValue   = useColorModeValue('gray.700', 'whiteAlpha.800')
  const navHead     = useColorModeValue('gray.700', 'whiteAlpha.800')

  if (loading) return <HospitalSkeleton />

  if (error) return (
    <Alert status="error" rounded="2xl">
      <AlertIcon />
      {error}
    </Alert>
  )

  if (!hospital) return null

  const departmentCount = Array.isArray(hospital.departments) ? hospital.departments.length : (hospital.departments || 0)
  const specialistCount = hospital.specialists || doctors.length

  return (
    <Box>
      {/* ── Hero card ── */}
      <Box bg={cardBg} rounded="3xl" border="1px solid" borderColor={cardBorder}
        boxShadow="sm" overflow="hidden" mb={6}>

        <Box h="240px" bgImage={`url(${hospital.image})`} bgSize="cover"
          bgPos="center" position="relative">
          <Box position="absolute" inset={0}
            bg="linear-gradient(180deg, rgba(8,18,41,0.05) 0%, rgba(8,18,41,0.65) 100%)" />
          <HStack position="absolute" left={6} bottom={6} spacing={2}>
            <Badge bg="white" color="gray.800" px={3} py={1.5} fontSize="xs"
              fontWeight="bold" rounded="full">📍 {hospital.city}</Badge>
            <Badge bg="green.400" color="white" px={3} py={1.5} fontSize="xs"
              fontWeight="bold" rounded="full">● {hospital.openStatus}</Badge>
          </HStack>
        </Box>

        <Box p={8}>
          <Flex direction={{ base: 'column', md: 'row' }}
            justify="space-between" align={{ base: 'flex-start', md: 'center' }}
            gap={4} mb={6}>
            <Stack spacing={1}>
              <Text fontSize="xs" fontWeight="bold" color="teal.500"
                textTransform="uppercase" letterSpacing="1px">Hospital Details</Text>
              <Heading size="lg" color={headColor}>{hospital.name}</Heading>
              <Text color={subColor} fontSize="sm">📍 {hospital.address}</Text>
            </Stack>
            <Button colorScheme="teal" size="lg" rounded="2xl" px={8} onClick={onBook}>
              Book Appointment
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
            <StatCard label="Rating"      value={`${hospital.rating} ★`}  detail={`${hospital.reviews} reviews`} accent="teal"  icon="⭐" />
            <StatCard label="Departments" value={departmentCount}          detail="Specialty units"               accent="gray"  icon="🏢" />
            <StatCard label="Specialists" value={specialistCount}          detail="Expert doctors"                accent="gray"  icon="👨‍⚕️" />
            <StatCard label="Status"      value={hospital.openStatus}      detail="Round-the-clock care"          accent="green" icon="✅" />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} pt={6}
            borderTop="1px solid" borderColor={divColor}>
            <Stack spacing={2}>
              <Text fontSize="sm" fontWeight="700" color={headColor}>{hospital.highlight}</Text>
              <Text fontSize="sm" color={subColor}>
                {hospital.name} provides high-quality diagnostics, surgical facilities,
                primary health care, emergency trauma centers, and advanced clinical services.
              </Text>
            </Stack>
            <Stack spacing={3} p={5} bg={infoBg} rounded="2xl" border="1px solid" borderColor={tileBorder}>
              <Box>
                <Text fontSize="xs" color={infoLabel} fontWeight="bold" textTransform="uppercase">Contact</Text>
                <Text fontSize="sm" fontWeight="bold" color={infoValue}>{hospital.phone}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={infoLabel} fontWeight="bold" textTransform="uppercase">Website</Text>
                <Text fontSize="sm" fontWeight="bold" color="teal.500">{hospital.website}</Text>
              </Box>
            </Stack>
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Sub-navigation ── */}
      <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
          <Heading size="sm" color={navHead}>Hospital Navigation</Heading>
          <HStack spacing={2}>
            {SECTIONS.map(s => (
              <Button key={s} size="sm" rounded="full" colorScheme="teal"
                variant={section === s ? 'solid' : 'ghost'}
                onClick={() => setSection(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* Overview */}
        {section === 'overview' && (
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {(hospital.services || []).map(s => (
              <Box key={s.label} p={5} bg={tileBg} border="1px solid" borderColor={tileBorder}
                rounded="2xl" transition="transform 0.2s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}>
                <Text fontSize="xl" mb={2}>{s.icon}</Text>
                <Heading size="xs" color="teal.500" mb={1}>{s.label}</Heading>
                <Text fontSize="xs" color={subColor}>Reliable specialist service for every patient.</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Departments */}
        {section === 'departments' && (
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {(hospital.departments || []).map(d => (
              <Box key={d.title} p={5} bg={tileBg} border="1px solid" borderColor={tileBorder}
                rounded="2xl" transition="transform 0.2s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}>
                <Text fontSize="xl" mb={2}>{d.icon}</Text>
                <Heading size="xs" color={tileHead} mb={1}>{d.title}</Heading>
                <Text fontSize="xs" color={subColor} mb={4}>{d.subtitle}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Doctors */}
        {section === 'doctors' && (
          doctors.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              {doctors.map(doc => (
                <Box key={doc.name} p={5} bg={tileBg} border="1px solid" borderColor={tileBorder}
                  rounded="2xl" transition="transform 0.2s"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}>
                  <Avatar size="md" name={doc.name} bg="teal.500" color="white" mb={3} />
                  <Heading size="xs" color={tileHead}>{doc.name}</Heading>
                  <Text fontSize="xs" color="teal.500" mt={0.5} mb={2}>{doc.title}</Text>
                  <HStack justify="space-between" fontSize="xs" color={subColor} mb={4}>
                    <Text>🕐 {doc.experience}</Text>
                    <Text fontWeight="700" color="teal.500">⭐ {doc.rating}</Text>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Flex justify="center" p={12} direction="column" align="center" gap={2}>
              <Text fontSize="2xl">👨‍⚕️</Text>
              <Text color={subColor} fontSize="sm" fontWeight="600">No doctors found.</Text>
            </Flex>
          )
        )}
      </Box>
    </Box>
  )
}
