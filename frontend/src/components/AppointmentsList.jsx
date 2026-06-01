/**
 * AppointmentsList — displays appointments using useAppointments hook
 * Dark mode support added
 */
import { useState } from 'react'
import { ROLES, normalizeRole } from '../utils/roles'
import { useAppointments } from '../hooks/useAppointments'
import {
  Box, Heading, Text, Select, Stack, Flex, Badge, Button,
  Alert, AlertIcon, SimpleGrid, HStack, Skeleton,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Textarea, useDisclosure, VStack, useColorModeValue,
} from '@chakra-ui/react'
import { useAppToast } from '../hooks/useAppToast'

const STATUS_CFG = {
  scheduled: { scheme: 'cyan',   label: 'Scheduled', icon: '🕐' },
  completed:  { scheme: 'green',  label: 'Completed', icon: '✅' },
  cancelled:  { scheme: 'red',    label: 'Cancelled', icon: '❌' },
  'no-show':  { scheme: 'orange', label: 'No Show',   icon: '⚠️' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { scheme: 'gray', label: status, icon: '•' }
  return (
    <Badge colorScheme={cfg.scheme} rounded="full" px={3} py={1} fontSize="xs" fontWeight="700">
      {cfg.icon} {cfg.label}
    </Badge>
  )
}

function LoadingSkeleton() {
  const cardBg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  return (
    <Stack spacing={4}>
      {[1, 2, 3].map(i => (
        <Box key={i} p={6} bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="2xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} alignItems="center">
            <Skeleton h="20px" w="180px" rounded="lg" />
            <Skeleton h="20px" w="240px" rounded="lg" />
            <Flex justify="flex-end"><Skeleton h="36px" w="100px" rounded="xl" /></Flex>
          </SimpleGrid>
        </Box>
      ))}
    </Stack>
  )
}

function EmptyState({ filterStatus }) {
  const bg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const text   = useColorModeValue('gray.500', 'whiteAlpha.500')
  const sub    = useColorModeValue('gray.400', 'whiteAlpha.400')
  return (
    <Flex direction="column" align="center" justify="center" p={16}
      bg={bg} rounded="3xl" border="1px dashed" borderColor={border}>
      <Text fontSize="4xl" mb={3}>📅</Text>
      <Text color={text} fontSize="sm" fontWeight="700">No appointments found</Text>
      <Text color={sub} fontSize="xs" mt={1}>
        {filterStatus ? `No ${filterStatus} appointments` : 'Your appointment history will appear here'}
      </Text>
    </Flex>
  )
}

/* ── Star Rating component ── */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <HStack spacing={2} justify="center">
      {[1, 2, 3, 4, 5].map(star => (
        <Box
          key={star}
          as="button"
          type="button"
          fontSize="36px"
          lineHeight="1"
          cursor="pointer"
          transition="transform 0.15s"
          transform={(hovered || value) >= star ? 'scale(1.2)' : 'scale(1)'}
          filter={(hovered || value) >= star ? 'none' : 'grayscale(1) opacity(0.35)'}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ⭐
        </Box>
      ))}
    </HStack>
  )
}

/* ── Review Modal ── */
function ReviewModal({ isOpen, onClose, doctorName, onSubmit, submitting }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')

  const modalBg    = useColorModeValue('white', 'hsl(222,24%,13%)')
  const modalBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.400', 'whiteAlpha.400')

  const handleClose = () => {
    setRating(0)
    setText('')
    onClose()
  }

  const handleSubmit = () => {
    if (rating === 0) return
    onSubmit(rating, text)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.500" />
      <ModalContent
        rounded="3xl"
        overflow="hidden"
        boxShadow="0 24px 64px rgba(0,0,0,0.18)"
        border="1px solid"
        borderColor={modalBorder}
        bg={modalBg}
      >
        {/* Header */}
        <Box
          bgGradient="linear(135deg, hsl(215,60%,18%), hsl(184,85%,14%))"
          px={8} pt={8} pb={6} position="relative"
        >
          <ModalCloseButton
            color="white" top={4} right={4} rounded="full"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
          <VStack spacing={2} align="center">
            <Box
              w="56px" h="56px"
              bg="rgba(255,255,255,0.12)"
              border="1px solid rgba(255,255,255,0.2)"
              rounded="2xl"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="26px"
            >
              ⭐
            </Box>
            <Heading fontSize="xl" fontWeight="800" color="white" letterSpacing="-0.3px">
              Rate Your Visit
            </Heading>
            {doctorName && (
              <Text fontSize="sm" color="whiteAlpha.700" fontWeight="500">
                with {doctorName}
              </Text>
            )}
          </VStack>
        </Box>

        <ModalBody px={8} py={7} bg={modalBg}>
          <VStack spacing={6}>
            {/* Stars */}
            <VStack spacing={3} w="100%">
              <Text fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="0.5px">
                Your Rating
              </Text>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <Text fontSize="sm" fontWeight="700" color="teal.500">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </Text>
              )}
            </VStack>

            {/* Review text */}
            <VStack spacing={2} w="100%" align="stretch">
              <Text fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="0.5px">
                Your Review <Text as="span" color={labelColor} fontWeight="400">(optional)</Text>
              </Text>
              <Textarea
                placeholder="Share your experience with this doctor…"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                rounded="2xl"
                fontSize="sm"
                resize="none"
              />
            </VStack>

            {/* Actions */}
            <HStack spacing={3} w="100%">
              <Button
                flex={1} variant="outline" rounded="2xl" h="48px"
                fontWeight="700" onClick={handleClose} colorScheme="gray"
              >
                Cancel
              </Button>
              <Button
                flex={2} h="48px" rounded="2xl" fontWeight="700"
                bgGradient="linear(135deg, teal.400, cyan.500)"
                color="white"
                _hover={{
                  bgGradient: 'linear(135deg, teal.500, cyan.600)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(13,158,140,0.3)',
                }}
                _active={{ transform: 'translateY(0)' }}
                isDisabled={rating === 0}
                isLoading={submitting}
                loadingText="Submitting…"
                onClick={handleSubmit}
              >
                Submit Review →
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

/* ══════════════════════════════════════════════════════════ */

export default function AppointmentsList({ userId, userRole, refreshTrigger }) {
  const normalizedRole = normalizeRole(userRole)
  const isAdmin = normalizedRole === ROLES.MASTER
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const toast = useAppToast()

  // Review modal state
  const { isOpen: isReviewOpen, onOpen: openReview, onClose: closeReview } = useDisclosure()
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const { appointments, totalPages, loading, error, cancel, review, updateStatus } =
    useAppointments({ filterStatus, page, refreshTrigger })

  // Color tokens
  const headColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor    = useColorModeValue('gray.500', 'whiteAlpha.500')
  const filterLabel = useColorModeValue('gray.400', 'whiteAlpha.400')
  const cardBg      = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const nameColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const reasonColor = useColorModeValue('gray.600', 'whiteAlpha.700')
  const metaLabel   = useColorModeValue('gray.400', 'whiteAlpha.400')
  const pageColor   = useColorModeValue('gray.600', 'whiteAlpha.700')

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await cancel(id)
      setPage(1)
      setFilterStatus('scheduled')
      toast.success('Appointment Cancelled', 'Your appointment has been cancelled.')
    } catch (err) {
      toast.error('Failed to Cancel', err.response?.data?.message || 'Error occurred.')
    }
  }

  const openReviewModal = (appt) => {
    setReviewTarget({ id: appt._id, doctorName: appt.doctor?.name || '' })
    openReview()
  }

  const handleReviewSubmit = async (rating, text) => {
    if (!reviewTarget) return
    setReviewSubmitting(true)
    try {
      await review(reviewTarget.id, rating, text)
      toast.success('Review Submitted', 'Thank you for your feedback!')
      setPage(1)
      closeReview()
      setReviewTarget(null)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit your review.'
      toast.error('Review Error', msg)
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <Box maxW="5xl" mx="auto">

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={closeReview}
        doctorName={reviewTarget?.doctorName}
        onSubmit={handleReviewSubmit}
        submitting={reviewSubmitting}
      />

      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between"
        align={{ base: 'flex-start', md: 'center' }} gap={4} mb={6}>
        <Stack spacing={0.5}>
          <Heading size="md" color={headColor} fontWeight="800">Appointments</Heading>
          <Text fontSize="sm" color={subColor}>Track all upcoming and past visits</Text>
        </Stack>
        <HStack spacing={3}>
          <Text fontSize="xs" fontWeight="bold" color={filterLabel} textTransform="uppercase">Filter:</Text>
          <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            size="sm" rounded="xl" w="150px">
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </HStack>
      </Flex>

      {error && <Alert status="error" rounded="2xl" mb={4}><AlertIcon />{error}</Alert>}

      {loading ? <LoadingSkeleton /> : appointments.length > 0 ? (
        <Stack spacing={3}>
          {appointments.map((appt, idx) => (
            <Box
              key={appt._id}
              p={5} bg={cardBg} border="1px solid" borderColor={cardBorder}
              rounded="2xl" boxShadow="xs"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md', borderColor: 'teal.200' }}
              className="fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <SimpleGrid columns={{ base: 1, md: isAdmin ? 4 : 3 }} gap={4} alignItems="center">

                {/* Name + date */}
                <HStack spacing={3}>
                  <Box
                    w="42px" h="42px" rounded="xl" flexShrink={0}
                    bgGradient="linear(135deg, teal.400, cyan.500)"
                    display="flex" alignItems="center" justifyContent="center"
                    color="white" fontWeight="800" fontSize="sm"
                  >
                    {isAdmin
                      ? (appt.patient?.name || '?')[0]
                      : normalizedRole === ROLES.PATIENT
                        ? (appt.doctor?.name  || '?')[0]
                        : (appt.patient?.name || '?')[0]}
                  </Box>
                  <Stack spacing={0.5}>
                    <Text fontSize="sm" fontWeight="800" color={nameColor}>
                      {isAdmin
                        ? (appt.patient?.name || 'Patient')
                        : normalizedRole === ROLES.PATIENT
                          ? (appt.doctor?.name  || 'Doctor')
                          : (appt.patient?.name || 'Patient')}
                    </Text>
                    <Text fontSize="xs" fontWeight="600" color="teal.500">
                      {formatDate(appt.appointmentDate)} · {appt.timeSlot}
                    </Text>
                  </Stack>
                </HStack>

                {/* Admin-only: Doctor column */}
                {isAdmin && (
                  <Stack spacing={0.5}>
                    <Text fontSize="10px" fontWeight="bold" color={metaLabel} textTransform="uppercase">Doctor</Text>
                    <Text fontSize="sm" fontWeight="700" color="purple.400">
                      {appt.doctor?.name || '—'}
                    </Text>
                    <Text fontSize="xs" color={metaLabel}>{appt.doctor?.specialization || ''}</Text>
                  </Stack>
                )}

                {/* Reason */}
                <Stack spacing={0.5}>
                  <Text fontSize="10px" fontWeight="bold" color={metaLabel} textTransform="uppercase">Reason</Text>
                  <Text fontSize="sm" color={reasonColor} noOfLines={2}>{appt.reason}</Text>
                </Stack>

                {/* Status + actions */}
                <Flex justify={{ base: 'flex-start', md: 'flex-end' }} align="center" gap={2} flexWrap="wrap">
                  {normalizedRole === ROLES.DOCTOR ? (() => {
                    const today = new Date()
                    const apptDate = new Date(appt.appointmentDate)
                    const isToday =
                      apptDate.getFullYear() === today.getFullYear() &&
                      apptDate.getMonth()    === today.getMonth()    &&
                      apptDate.getDate()     === today.getDate()
                    return (
                      <Select
                        size="sm" rounded="xl" w="130px"
                        fontWeight="700"
                        value={appt.status}
                        isDisabled={!isToday}
                        title={!isToday ? 'Status can only be changed on the appointment day' : ''}
                        onChange={async (e) => {
                          try {
                            await updateStatus(appt._id, e.target.value)
                            toast.success('Status Updated', 'Appointment status has been changed.')
                          } catch (err) {
                            toast.error('Failed to update', err.message)
                          }
                        }}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </Select>
                    )
                  })() : (
                    <StatusBadge status={appt.status} />
                  )}

                  {appt.status === 'scheduled' && normalizedRole === ROLES.PATIENT && (
                    <Button size="sm" colorScheme="red" variant="outline" rounded="xl"
                      fontSize="xs" fontWeight="700" onClick={() => handleCancel(appt._id)}>
                      Cancel
                    </Button>
                  )}
                  {appt.status === 'completed' && normalizedRole === ROLES.PATIENT && (
                    <Button
                      size="sm" colorScheme="teal" rounded="xl"
                      fontSize="xs" fontWeight="700"
                      onClick={() => openReviewModal(appt)}
                    >
                      ⭐ Review
                    </Button>
                  )}
                </Flex>

              </SimpleGrid>
            </Box>
          ))}
        </Stack>
      ) : (
        <EmptyState filterStatus={filterStatus} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" align="center" gap={4} mt={8}>
          <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))}
            isDisabled={page === 1} rounded="xl" colorScheme="teal" variant="outline">
            ← Previous
          </Button>
          <Text fontSize="sm" fontWeight="bold" color={pageColor}>
            Page {page} of {totalPages}
          </Text>
          <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            isDisabled={page === totalPages} rounded="xl" colorScheme="teal" variant="outline">
            Next →
          </Button>
        </Flex>
      )}
    </Box>
  )
}
