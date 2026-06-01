/**
 * SettingsPage — fully functional settings with modals + dark mode
 */
import { useState } from 'react'
import api from '../api/axiosConfig'
import {
  Box, Flex, Stack, Heading, Text, Button, HStack, VStack,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, InputGroup, InputRightElement,
  IconButton, Switch, Divider, useDisclosure, SimpleGrid, Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import SectionHead from '../components/SectionHead'
import { useAppToast } from '../hooks/useAppToast'

/* ── Shared modal shell ── */
function SettingsModal({ isOpen, onClose, title, icon, children }) {
  const modalBg = useColorModeValue('white', 'hsl(222,24%,13%)')
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.500" />
      <ModalContent rounded="3xl" overflow="hidden" boxShadow="0 24px 64px rgba(0,0,0,0.18)" bg={modalBg}>
        <Box
          bgGradient="linear(135deg, hsl(215,60%,18%), hsl(184,85%,14%))"
          px={8} pt={8} pb={6} position="relative"
        >
          <ModalCloseButton color="white" top={4} right={4} rounded="full"
            _hover={{ bg: 'whiteAlpha.200' }} />
          <VStack spacing={2} align="center">
            <Box w="52px" h="52px" bg="rgba(255,255,255,0.12)"
              border="1px solid rgba(255,255,255,0.2)" rounded="2xl"
              display="flex" alignItems="center" justifyContent="center" fontSize="24px">
              {icon}
            </Box>
            <Heading fontSize="xl" fontWeight="800" color="white" letterSpacing="-0.3px">
              {title}
            </Heading>
          </VStack>
        </Box>
        <ModalBody px={8} py={7} bg={modalBg}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

/* ── Account Settings Modal ── */
function AccountModal({ isOpen, onClose, user }) {
  const [name, setName] = useState(user?.name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useAppToast()

  const labelColor  = useColorModeValue('gray.500', 'whiteAlpha.500')
  const readonlyBg  = useColorModeValue('gray.50', 'whiteAlpha.50')
  const readonlyClr = useColorModeValue('gray.400', 'whiteAlpha.400')
  const divColor    = useColorModeValue('gray.200', 'whiteAlpha.200')

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Validation', 'Name cannot be empty'); return }
    if (newPw && newPw.length < 6) { toast.error('Validation', 'New password must be at least 6 characters'); return }
    if (newPw && !currentPw) { toast.error('Validation', 'Enter your current password to set a new one'); return }

    setLoading(true)
    try {
      const payload = { name: name.trim() }
      if (newPw) { payload.currentPassword = currentPw; payload.newPassword = newPw }
      await api.put('/auth/profile', payload)
      toast.success('Account Updated', 'Your profile has been saved.')
      setCurrentPw(''); setNewPw('')
      onClose()
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.message || 'Could not update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Account Settings" icon="👤">
      <VStack spacing={5} align="stretch">
        <FormControl>
          <FormLabel fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="0.5px">
            Full Name
          </FormLabel>
          <Input value={name} onChange={e => setName(e.target.value)}
            rounded="xl" fontSize="sm" placeholder="Your full name" />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="0.5px">
            Phone Number
          </FormLabel>
          <Input value={user?.phone || ''} isReadOnly rounded="xl" fontSize="sm"
            bg={readonlyBg} color={readonlyClr} cursor="not-allowed" />
          <Text fontSize="10px" color={readonlyClr} mt={1}>Phone number cannot be changed</Text>
        </FormControl>

        <Divider borderColor={divColor} />

        <Text fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="0.5px">
          Change Password
        </Text>

        <FormControl>
          <FormLabel fontSize="xs" color={labelColor} fontWeight="600">Current Password</FormLabel>
          <InputGroup>
            <Input type={showCurrent ? 'text' : 'password'} value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              rounded="xl" fontSize="sm" placeholder="Enter current password" />
            <InputRightElement>
              <IconButton size="xs" variant="ghost" aria-label="toggle"
                icon={<Text>{showCurrent ? '🙈' : '👁'}</Text>}
                onClick={() => setShowCurrent(p => !p)} />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" color={labelColor} fontWeight="600">New Password</FormLabel>
          <InputGroup>
            <Input type={showNew ? 'text' : 'password'} value={newPw}
              onChange={e => setNewPw(e.target.value)}
              rounded="xl" fontSize="sm" placeholder="Min 6 characters" />
            <InputRightElement>
              <IconButton size="xs" variant="ghost" aria-label="toggle"
                icon={<Text>{showNew ? '🙈' : '👁'}</Text>}
                onClick={() => setShowNew(p => !p)} />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <HStack spacing={3} pt={2}>
          <Button flex={1} variant="outline" rounded="2xl" h="46px" onClick={onClose}>Cancel</Button>
          <Button flex={2} h="46px" rounded="2xl" fontWeight="700"
            bgGradient="linear(135deg, teal.400, cyan.500)" color="white"
            _hover={{ bgGradient: 'linear(135deg, teal.500, cyan.600)', transform: 'translateY(-1px)' }}
            isLoading={loading} loadingText="Saving…" onClick={handleSave}>
            Save Changes →
          </Button>
        </HStack>
      </VStack>
    </SettingsModal>
  )
}

/* ── Notification Settings Modal ── */
function NotificationModal({ isOpen, onClose }) {
  const [prefs, setPrefs] = useState({
    appointmentReminders: true,
    bookingConfirmations: true,
    cancellationAlerts: true,
    promotionalEmails: false,
    smsAlerts: true,
  })
  const toast = useAppToast()
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const rowBg     = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const nameColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor  = useColorModeValue('gray.500', 'whiteAlpha.500')

  const items = [
    { key: 'appointmentReminders', label: 'Appointment Reminders',   desc: 'Get reminded 24h before your visit' },
    { key: 'bookingConfirmations', label: 'Booking Confirmations',   desc: 'Confirm when an appointment is booked' },
    { key: 'cancellationAlerts',   label: 'Cancellation Alerts',     desc: 'Notify when an appointment is cancelled' },
    { key: 'smsAlerts',            label: 'SMS Alerts',              desc: 'Receive alerts via text message' },
    { key: 'promotionalEmails',    label: 'Promotional Emails',      desc: 'Health tips and offers from HMS' },
  ]

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Notification Settings" icon="🔔">
      <VStack spacing={4} align="stretch">
        {items.map(item => (
          <Flex key={item.key} justify="space-between" align="center"
            p={4} bg={rowBg} rounded="2xl" border="1px solid" borderColor={rowBorder}>
            <Stack spacing={0.5}>
              <Text fontSize="sm" fontWeight="700" color={nameColor}>{item.label}</Text>
              <Text fontSize="xs" color={subColor}>{item.desc}</Text>
            </Stack>
            <Switch colorScheme="teal" isChecked={prefs[item.key]} onChange={() => toggle(item.key)} />
          </Flex>
        ))}
        <Button h="46px" rounded="2xl" fontWeight="700" mt={2}
          bgGradient="linear(135deg, teal.400, cyan.500)" color="white"
          _hover={{ bgGradient: 'linear(135deg, teal.500, cyan.600)', transform: 'translateY(-1px)' }}
          onClick={() => { toast.success('Preferences Saved', 'Notification settings updated.'); onClose() }}>
          Save Preferences →
        </Button>
      </VStack>
    </SettingsModal>
  )
}

/* ── Privacy Settings Modal ── */
function PrivacyModal({ isOpen, onClose }) {
  const [prefs, setPrefs] = useState({
    shareDataWithDoctors: true,
    allowAnalytics: false,
    publicProfile: false,
  })
  const toast = useAppToast()
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const rowBg      = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const nameColor  = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor   = useColorModeValue('gray.500', 'whiteAlpha.500')
  const hipaaAccBg = useColorModeValue('teal.50', 'rgba(13,158,140,0.12)')
  const hipaaAccBd = useColorModeValue('teal.100', 'rgba(13,158,140,0.25)')
  const hipaaHead  = useColorModeValue('teal.700', 'teal.200')
  const hipaaSub   = useColorModeValue('teal.600', 'teal.300')

  const items = [
    { key: 'shareDataWithDoctors', label: 'Share Data with Doctors', desc: 'Allow doctors to view your medical history' },
    { key: 'allowAnalytics',       label: 'Usage Analytics',         desc: 'Help us improve HMS with anonymous data' },
    { key: 'publicProfile',        label: 'Public Profile',          desc: 'Allow others to find your profile' },
  ]

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Privacy Settings" icon="🔒">
      <VStack spacing={4} align="stretch">
        <Box p={4} bg={hipaaAccBg} rounded="2xl" border="1px solid" borderColor={hipaaAccBd}>
          <HStack spacing={2}>
            <Text fontSize="lg">🛡</Text>
            <Stack spacing={0}>
              <Text fontSize="sm" fontWeight="700" color={hipaaHead}>HIPAA Compliant</Text>
              <Text fontSize="xs" color={hipaaSub}>Your data is encrypted with 256-bit SSL</Text>
            </Stack>
          </HStack>
        </Box>

        {items.map(item => (
          <Flex key={item.key} justify="space-between" align="center"
            p={4} bg={rowBg} rounded="2xl" border="1px solid" borderColor={rowBorder}>
            <Stack spacing={0.5}>
              <Text fontSize="sm" fontWeight="700" color={nameColor}>{item.label}</Text>
              <Text fontSize="xs" color={subColor}>{item.desc}</Text>
            </Stack>
            <Switch colorScheme="teal" isChecked={prefs[item.key]} onChange={() => toggle(item.key)} />
          </Flex>
        ))}

        <Button h="46px" rounded="2xl" fontWeight="700" mt={2}
          bgGradient="linear(135deg, teal.400, cyan.500)" color="white"
          _hover={{ bgGradient: 'linear(135deg, teal.500, cyan.600)', transform: 'translateY(-1px)' }}
          onClick={() => { toast.success('Privacy Updated', 'Your privacy settings have been saved.'); onClose() }}>
          Save Settings →
        </Button>
      </VStack>
    </SettingsModal>
  )
}

/* ── Help & Support Modal ── */
function HelpModal({ isOpen, onClose }) {
  const tileBg     = useColorModeValue('gray.50', 'whiteAlpha.50')
  const tileBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.500', 'whiteAlpha.500')
  const faqBg      = useColorModeValue('white', 'hsl(222,22%,17%)')
  const faqBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const faqText    = useColorModeValue('gray.700', 'whiteAlpha.800')
  const faqHover   = useColorModeValue('teal.50', 'rgba(13,158,140,0.1)')

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Help & Support" icon="💬">
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={2} gap={3}>
          {[
            { icon: '📞', label: 'Call Us',       value: '+91 98765 43210', color: 'teal' },
            { icon: '✉️', label: 'Email Us',      value: 'support@hms.in', color: 'cyan' },
            { icon: '💬', label: 'Live Chat',     value: 'Available 24/7', color: 'green' },
            { icon: '📖', label: 'Documentation', value: 'docs.hms.in', color: 'purple' },
          ].map(item => (
            <Box key={item.label} p={4} bg={tileBg} rounded="2xl"
              border="1px solid" borderColor={tileBorder} textAlign="center">
              <Text fontSize="24px" mb={2}>{item.icon}</Text>
              <Text fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase"
                letterSpacing="0.5px">{item.label}</Text>
              <Text fontSize="xs" fontWeight="600" color={`${item.color}.500`} mt={1}>{item.value}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Box p={4} bg={tileBg} rounded="2xl" border="1px solid" borderColor={tileBorder}>
          <Text fontSize="xs" fontWeight="700" color={labelColor} textTransform="uppercase"
            letterSpacing="0.5px" mb={3}>Frequently Asked Questions</Text>
          <VStack spacing={2} align="stretch">
            {[
              'How do I cancel an appointment?',
              'How do I change my doctor?',
              'When will I get a refund?',
            ].map(q => (
              <Flex key={q} justify="space-between" align="center"
                p={3} bg={faqBg} rounded="xl" border="1px solid" borderColor={faqBorder}
                cursor="pointer" _hover={{ borderColor: 'teal.300', bg: faqHover }}
                transition="all 0.15s">
                <Text fontSize="xs" fontWeight="600" color={faqText}>{q}</Text>
                <Text color="teal.400" fontSize="sm">›</Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <HStack spacing={2} justify="center" pt={1}>
          <Badge colorScheme="teal" rounded="full" px={3} py={1} fontSize="xs">🛡 HIPAA Compliant</Badge>
          <Badge colorScheme="cyan" rounded="full" px={3} py={1} fontSize="xs">🔒 256-bit SSL</Badge>
        </HStack>
      </VStack>
    </SettingsModal>
  )
}

/* ══════════════════════════════════════════════════════════ */

export default function SettingsPage({ user, onLogout }) {
  const accountModal = useDisclosure()
  const notifModal   = useDisclosure()
  const privacyModal = useDisclosure()
  const helpModal    = useDisclosure()

  // Color tokens
  const cardBg      = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const rowBg       = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder   = useColorModeValue('gray.100', 'whiteAlpha.100')
  const iconBg      = useColorModeValue('teal.50', 'rgba(13,158,140,0.12)')
  const iconBorder  = useColorModeValue('teal.100', 'rgba(13,158,140,0.25)')
  const headColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor    = useColorModeValue('gray.500', 'whiteAlpha.500')
  const dangerBg    = useColorModeValue('red.50', 'rgba(245,101,101,0.08)')
  const dangerBd    = useColorModeValue('red.100', 'rgba(245,101,101,0.2)')
  const dangerHead  = useColorModeValue('red.700', 'red.300')
  const dangerSub   = useColorModeValue('red.500', 'red.400')

  const SETTINGS_LIST = [
    { title: 'Account Settings',      description: 'Personal information and password', icon: '👤', onManage: accountModal.onOpen },
    { title: 'Notification Settings', description: 'Email and push preferences',        icon: '🔔', onManage: notifModal.onOpen },
    { title: 'Privacy Settings',      description: 'Manage your privacy options',       icon: '🔒', onManage: privacyModal.onOpen },
    { title: 'Help & Support',        description: 'Get assistance for any issue',      icon: '💬', onManage: helpModal.onOpen },
  ]

  return (
    <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
      <SectionHead>Settings</SectionHead>

      <Stack spacing={3}>
        {SETTINGS_LIST.map(item => (
          <Flex
            key={item.title}
            justify="space-between" align="center"
            p={5} bg={rowBg} rounded="2xl" border="1px solid" borderColor={rowBorder}
            flexWrap="wrap" gap={3}
            transition="transform 0.2s, box-shadow 0.2s"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'sm' }}
          >
            <HStack spacing={3}>
              <Box
                w="38px" h="38px" bg={iconBg}
                border="1px solid" borderColor={iconBorder}
                rounded="xl" display="flex" alignItems="center"
                justifyContent="center" fontSize="16px"
              >
                {item.icon}
              </Box>
              <Stack spacing={0.5}>
                <Heading size="xs" color={headColor}>{item.title}</Heading>
                <Text fontSize="xs" color={subColor}>{item.description}</Text>
              </Stack>
            </HStack>
            <Button
              size="sm" colorScheme="teal" variant="outline" rounded="xl"
              fontWeight="700" onClick={item.onManage}
              _hover={{ bg: iconBg, borderColor: 'teal.400' }}
            >
              Manage
            </Button>
          </Flex>
        ))}
      </Stack>

      {/* Danger zone */}
      <Box mt={8} p={5} bg={dangerBg} rounded="2xl" border="1px solid" borderColor={dangerBd}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Stack spacing={0.5}>
            <Heading size="xs" color={dangerHead}>Sign Out</Heading>
            <Text fontSize="xs" color={dangerSub}>Log out of your HMS account</Text>
          </Stack>
          <Button size="sm" colorScheme="red" variant="outline" rounded="xl"
            fontWeight="700" onClick={onLogout}>
            Sign Out
          </Button>
        </Flex>
      </Box>

      {/* Modals */}
      <AccountModal      isOpen={accountModal.isOpen}  onClose={accountModal.onClose}  user={user} />
      <NotificationModal isOpen={notifModal.isOpen}    onClose={notifModal.onClose} />
      <PrivacyModal      isOpen={privacyModal.isOpen}  onClose={privacyModal.onClose} />
      <HelpModal         isOpen={helpModal.isOpen}     onClose={helpModal.onClose} />
    </Box>
  )
}
