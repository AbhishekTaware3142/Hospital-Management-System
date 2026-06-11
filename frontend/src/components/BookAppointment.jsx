/**
 * BOOK APPOINTMENT — Premium redesign with dark mode
 * ============================================================
 */

import { useEffect, useState } from 'react'
import { fetchDoctors } from '../api/userService'
import { bookAppointment } from '../api/appointmentService'
import {
  Box, Button, FormControl, FormLabel, Input, Select, Textarea,
  Stack, Text, Heading, Alert, AlertIcon, SimpleGrid, HStack,
  Flex, Badge, Divider, List, ListItem, Avatar,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAppToast } from '../hooks/useAppToast'

const TIME_SLOTS = [
  '09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM', '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM', '11:00 AM - 11:30 AM', '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM', '03:00 PM - 03:30 PM', '04:00 PM - 04:30 PM',
]

function BookAppointment({ onSuccess }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [doctors, setDoctors] = useState([])
  const [showDoctorList, setShowDoctorList] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [reason, setReason] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [allDoctors, setAllDoctors] = useState([])
  const toast = useAppToast()

  // Color tokens
  const cardBg       = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder   = useColorModeValue('gray.100', 'whiteAlpha.100')
  const headColor    = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor     = useColorModeValue('gray.500', 'whiteAlpha.500')
  const dropdownBg   = useColorModeValue('white', 'hsl(222,22%,17%)')
  const dropdownBorder = useColorModeValue('gray.150', 'whiteAlpha.150')
  const hoverBg      = useColorModeValue('teal.50', 'rgba(13,158,140,0.12)')
  const docNameColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const dividerColor = useColorModeValue('gray.100', 'whiteAlpha.100')
  const labelColor   = useColorModeValue('gray.500', 'whiteAlpha.500')
  const docCardBg    = useColorModeValue('gray.50', 'whiteAlpha.50')
  const docCardBorderSel = useColorModeValue('teal.400', 'teal.400')
  const docCardBorderNorm = useColorModeValue('gray.100', 'whiteAlpha.100')
  const docCardBgSel = useColorModeValue('teal.50', 'rgba(13,158,140,0.12)')
  const feeLabel     = useColorModeValue('gray.400', 'whiteAlpha.400')
  const borderAlpha  = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    fetchDoctors()
      .then(data => setAllDoctors(data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Unable to load doctors'))
  }, [])

  const handleSearchDoctor = (e) => {
    const term = e.target.value
    setDoctorName(term)
    if (!term.trim()) { setShowDoctorList(false); setDoctors([]); return }
    const norm = term.toLowerCase()
    setDoctors(allDoctors.filter(d =>
      d.name.toLowerCase().includes(norm) ||
      (d.specialization || '').toLowerCase().includes(norm)
    ))
    setShowDoctorList(true)
  }

  const handleSelectDoctor = (id, name) => {
    setSelectedDoctorId(id); setDoctorName(name); setShowDoctorList(false)
  }

  const handleBook = async (e) => {
    e.preventDefault(); setError('')
    if (!selectedDoctorId || !appointmentDate || !timeSlot || !reason) {
      setError('Please fill in all required fields'); return
    }
    try {
      setLoading(true)
      await bookAppointment({ doctor: selectedDoctorId, appointmentDate, timeSlot, reason, symptoms: symptoms || '' })
      toast.success('Appointment Booked!', `Scheduled with ${doctorName}.`)
      setSelectedDoctorId(''); setDoctorName(''); setAppointmentDate(''); setTimeSlot(''); setReason(''); setSymptoms('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to book appointment')
    } finally { setLoading(false) }
  }

  const recommendedDoctors = allDoctors.slice(0, 3)

  return (
    <Box maxW="3xl" mx="auto" className="fade-in">
      <Box bg={cardBg} p={{ base: 6, md: 8 }} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
          <Stack spacing={0.5}>
            <Heading size="md" color={headColor}>Book Appointment</Heading>
            <Text fontSize="sm" color={subColor}>Choose a specialist and schedule your visit</Text>
          </Stack>
          {selectedDoctorId && (
            <Badge colorScheme="teal" rounded="full" px={3} py={1} fontSize="xs" fontWeight="700">✓ Doctor Selected</Badge>
          )}
        </Flex>

        {error && <Alert status="error" rounded="2xl" mb={6}><AlertIcon />{error}</Alert>}

        <Stack spacing={5} as="form" onSubmit={handleBook}>
          {/* Doctor search */}
          <FormControl isRequired position="relative">
            <FormLabel fontSize="xs" color={labelColor} fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Select Doctor</FormLabel>
            <Input
              placeholder="Search by name or specialty…"
              value={doctorName}
              onChange={handleSearchDoctor}
              disabled={loading}
              autoComplete="off"
              size="lg" rounded="2xl" fontSize="sm"
            />
            {showDoctorList && (
              <Box
                position="absolute" left={0} right={0} top="100%" mt={2}
                bg={dropdownBg} border="1px solid" borderColor={dropdownBorder}
                rounded="2xl" boxShadow="xl" maxH="240px" overflowY="auto" zIndex={30} p={2}
              >
                {doctors.length > 0 ? (
                  <List spacing={1}>
                    {doctors.map(doc => (
                      <ListItem
                        key={doc._id} p={3} rounded="xl" cursor="pointer"
                        _hover={{ bg: hoverBg }} onClick={() => handleSelectDoctor(doc._id, doc.name)}
                      >
                        <HStack spacing={3}>
                          <Avatar size="xs" name={doc.name} bg="teal.400" color="white" />
                          <Box>
                            <Text fontSize="sm" fontWeight="700" color={docNameColor}>{doc.name}</Text>
                            <Text fontSize="xs" color="teal.500">{doc.specialization || 'General'} · {doc.phone}</Text>
                          </Box>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text p={3} fontSize="xs" color={subColor} fontWeight="600">No doctors matched your search.</Text>
                )}
              </Box>
            )}
          </FormControl>

          {/* Date + Time */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <FormControl isRequired>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Appointment Date</FormLabel>
              <Input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} disabled={loading} min={minDate} size="lg" rounded="2xl" fontSize="sm" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Time Slot</FormLabel>
              <Select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} disabled={loading} size="lg" rounded="2xl" fontSize="sm">
                <option value="">Select time slot</option>
                {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* Reason */}
          <FormControl isRequired>
            <FormLabel fontSize="xs" color={labelColor} fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Reason for Appointment</FormLabel>
            <Input placeholder="e.g. Regular checkup, Chronic back pain" value={reason} onChange={e => setReason(e.target.value)} disabled={loading} size="lg" rounded="2xl" fontSize="sm" />
          </FormControl>

          {/* Symptoms */}
          <FormControl>
            <FormLabel fontSize="xs" color={labelColor} fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
              Symptoms <Text as="span" color={subColor} fontWeight="400">(Optional)</Text>
            </FormLabel>
            <Textarea placeholder="Describe what you are feeling…" value={symptoms} onChange={e => setSymptoms(e.target.value)} disabled={loading} rows={3} rounded="2xl" fontSize="sm" resize="none" />
          </FormControl>

          <Button
            type="submit" size="lg" colorScheme="teal" h="54px" rounded="2xl" fontWeight="700"
            isLoading={loading} loadingText="Booking…" isDisabled={!selectedDoctorId}
            bgGradient="linear(135deg, teal.400, cyan.500)"
            _hover={{ bgGradient: 'linear(135deg, teal.500, cyan.600)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(13,158,140,0.35)' }}
            _active={{ transform: 'translateY(0)' }}
          >
            Confirm Appointment Booking. →
          </Button>
        </Stack>

        <Divider my={8} borderColor={dividerColor} />

        {/* Recommended doctors */}
        <Stack spacing={4}>
          <Text fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="0.5px">Top Specialists Available</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {recommendedDoctors.length > 0 ? recommendedDoctors.map(doc => (
              <Box
                key={doc._id} p={4} rounded="2xl" cursor="pointer"
                border="2px solid"
                borderColor={selectedDoctorId === doc._id ? docCardBorderSel : docCardBorderNorm}
                bg={selectedDoctorId === doc._id ? docCardBgSel : docCardBg}
                onClick={() => handleSelectDoctor(doc._id, doc.name)}
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm', borderColor: 'teal.200' }}
              >
                <Avatar size="sm" name={doc.name} bg="teal.400" color="white" mb={2} />
                <Text fontSize="sm" fontWeight="700" color={docNameColor} noOfLines={1}>{doc.name}</Text>
                <Badge colorScheme="teal" rounded="md" mt={1} fontSize="10px">{doc.specialization || 'General Practice'}</Badge>
                <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px solid" borderColor={borderAlpha}>
                  <Text fontSize="10px" color={feeLabel} fontWeight="700">FEES</Text>
                  <Text fontSize="xs" fontWeight="800" color="teal.500">₹{doc.consultationFee || 0}</Text>
                </Flex>
              </Box>
            )) : (
              <Text fontSize="xs" color={subColor} fontWeight="600">No doctors available yet.</Text>
            )}
          </SimpleGrid>
        </Stack>
      </Box>
    </Box>
  )
}

export default BookAppointment
