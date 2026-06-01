/**
 * BookingModal — global floating appointment booking modal
 */
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, HStack, Box, Text, Button,
  useColorModeValue,
} from '@chakra-ui/react'
import BookAppointment from './BookAppointment'

export default function BookingModal({ isOpen, onClose, onSuccess }) {
  const modalBg = useColorModeValue('white', 'hsl(222,24%,13%)')

  return (
    <>
      {/* Floating action button */}
      <Button
        position="fixed" right="24px" bottom="24px"
        w="56px" h="56px" rounded="full"
        bgGradient="linear(135deg, teal.400, cyan.400)"
        color="white" fontSize="24px"
        boxShadow="0 8px 24px rgba(13,158,140,0.4)"
        _hover={{
          bgGradient: 'linear(135deg, teal.500, cyan.500)',
          transform: 'scale(1.08)',
          boxShadow: '0 12px 32px rgba(13,158,140,0.5)',
        }}
        _active={{ transform: 'scale(0.96)' }}
        onClick={onClose}
        zIndex={20}
        transition="all 0.2s"
        aria-label="Book Appointment"
      >
        +
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent rounded="3xl" overflow="hidden" boxShadow="2xl" bg={modalBg}>
          <ModalHeader
            bgGradient="linear(135deg, hsl(215,60%,18%), hsl(184,85%,14%))"
            color="white" p={6}
          >
            <HStack spacing={3}>
              <Box
                w="32px" h="32px" bg="rgba(255,255,255,0.1)" rounded="lg"
                display="flex" alignItems="center" justifyContent="center" fontSize="16px"
              >
                📅
              </Box>
              <Text fontWeight="800" fontSize="md">Book Doctor Appointment</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={4} right={4} rounded="full"
            _hover={{ bg: 'whiteAlpha.200' }} />
          <ModalBody p={6} bg={modalBg}>
            <BookAppointment onSuccess={onSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
