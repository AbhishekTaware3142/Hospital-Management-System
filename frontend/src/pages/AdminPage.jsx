/**
 * AdminPage — master control: doctor list + add doctor form
 */
import {
  Box, Flex, Stack, Heading, Text, Button, Input,
  SimpleGrid, HStack, Avatar, Badge, FormControl, FormLabel,
  Alert, AlertIcon, useColorModeValue,
} from '@chakra-ui/react'
import { useAppToast } from '../hooks/useAppToast'
import { useState } from 'react'
import { useDoctors } from '../hooks/useDoctors'

const EMPTY_FORM = {
  name: '', phone: '', password: '', licenseNumber: '',
  specialization: '', experience: '', consultationFee: '',
}

export default function AdminPage() {
  const { doctors, loading, error: fetchError, addDoctor, removeDoctor } = useDoctors()
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useAppToast()

  // Color tokens
  const cardBg      = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const headColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor    = useColorModeValue('gray.500', 'whiteAlpha.500')
  const rowBg       = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder   = useColorModeValue('gray.100', 'whiteAlpha.100')
  const nameColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const labelColor  = useColorModeValue('gray.500', 'whiteAlpha.500')

  const change = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete Dr. ${name}? This cannot be undone.`)) return
    const result = await removeDoctor(id)
    if (result.ok) {
      toast.info('Doctor Removed', `Dr. ${name} has been removed.`)
    } else {
      toast.error('Delete Failed', result.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!(form.name || '').trim() || !(form.phone || '').trim() || !(form.password || '').trim() || !(form.licenseNumber || '').trim() || !(form.specialization || '').trim()) {
      setFormError('Please complete all required fields')
      return
    }
    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      setFormError('Please enter a valid 10-digit phone number')
      return
    }

    setSubmitting(true)
    const result = await addDoctor(form)
    setSubmitting(false)

    if (result.ok) {
      toast.success('Doctor Added', 'New doctor profile has been saved.')
      setForm(EMPTY_FORM)
    } else {
      setFormError(result.message)
    }
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>

      {/* Doctor list */}
      <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <Flex justify="space-between" align="center" mb={6}>
          <Stack spacing={0.5}>
            <Heading size="md" color={headColor}>Master Control Center</Heading>
            <Text fontSize="xs" color={subColor}>Manage doctors and monitor network</Text>
          </Stack>
          <Badge colorScheme="purple" rounded="full" px={3} py={1} fontSize="xs">MASTER</Badge>
        </Flex>

        {fetchError && <Alert status="error" rounded="xl" mb={4}><AlertIcon />{fetchError}</Alert>}

        {loading ? (
          <Flex justify="center" p={12}>
            <Text fontSize="sm" color={subColor} fontWeight="bold">Loading doctors…</Text>
          </Flex>
        ) : doctors.length > 0 ? (
          <Stack spacing={3}>
            {doctors.map(doc => (
              <Flex key={doc._id} justify="space-between" align="center"
                p={4} bg={rowBg} rounded="2xl" border="1px solid" borderColor={rowBorder}
                transition="transform 0.2s" _hover={{ transform: 'translateY(-1px)' }}>
                <HStack spacing={3}>
                  <Avatar size="sm" name={doc.name} bg="teal.500" color="white" />
                  <Stack spacing={0.5}>
                    <Text fontSize="sm" fontWeight="bold" color={nameColor}>{doc.name}</Text>
                    <Text fontSize="xs" color="teal.500" fontWeight="bold">
                      {doc.specialization || 'General'} · {doc.phone}
                    </Text>
                  </Stack>
                </HStack>
                <HStack spacing={2}>
                  <Badge colorScheme="cyan" rounded="full" px={3} py={1}>Doctor</Badge>
                  <Button
                    size="xs" colorScheme="red" variant="ghost" rounded="lg"
                    onClick={() => handleDelete(doc._id, doc.name)}
                    title="Remove doctor"
                  >
                    🗑️
                  </Button>
                </HStack>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Flex justify="center" p={12} direction="column" align="center" gap={2}>
            <Text fontSize="2xl">👨‍⚕️</Text>
            <Text color={subColor} fontSize="sm" fontWeight="600">No doctors registered yet.</Text>
          </Flex>
        )}
      </Box>

      {/* Add doctor form */}
      <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder}
        boxShadow="sm" as="form" onSubmit={handleSubmit}>
        <Heading size="md" color={headColor} mb={1}>Add New Doctor</Heading>
        <Text fontSize="xs" color={subColor} mb={6}>Enter doctor profile and credential details</Text>

        {formError && <Alert status="error" rounded="xl" mb={4}><AlertIcon />{formError}</Alert>}

        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">Full Name</FormLabel>
            <Input value={form.name} onChange={e => change('name', e.target.value)}
              placeholder="Doctor's full name" rounded="xl" fontSize="sm" />
          </FormControl>

          <SimpleGrid columns={2} gap={4}>
            <FormControl isRequired>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">Phone</FormLabel>
              <Input value={form.phone} onChange={e => change('phone', e.target.value)}
                placeholder="10-digit phone" maxLength={10} rounded="xl" fontSize="sm" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">Password</FormLabel>
              <Input value={form.password} onChange={e => change('password', e.target.value)}
                placeholder="Assign password" type="password" rounded="xl" fontSize="sm" />
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={2} gap={4}>
            <FormControl isRequired>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">Specialization</FormLabel>
              <Input value={form.specialization} onChange={e => change('specialization', e.target.value)}
                placeholder="e.g. Cardiology" rounded="xl" fontSize="sm" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">License No.</FormLabel>
              <Input value={form.licenseNumber} onChange={e => change('licenseNumber', e.target.value)}
                placeholder="LIC-9982" rounded="xl" fontSize="sm" />
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={2} gap={4}>
            <FormControl>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">Fee (₹)</FormLabel>
              <Input type="number" value={form.consultationFee}
                onChange={e => change('consultationFee', e.target.value)}
                placeholder="500" rounded="xl" fontSize="sm" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" color={labelColor} fontWeight="bold">Experience (Yrs)</FormLabel>
              <Input type="number" value={form.experience}
                onChange={e => change('experience', e.target.value)}
                placeholder="8" rounded="xl" fontSize="sm" />
            </FormControl>
          </SimpleGrid>

          <Button type="submit" colorScheme="teal" h="50px" rounded="xl"
            fontWeight="bold" isLoading={submitting} loadingText="Saving…">
            Save Doctor
          </Button>
        </Stack>
      </Box>
    </SimpleGrid>
  )
}
