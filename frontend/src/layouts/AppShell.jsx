/**
 * AppShell — persistent sidebar + sticky topbar
 * Wraps every authenticated page
 */
import { useState } from 'react'
import {
  Box, Flex, Stack, Text, Button, Avatar, Input,
  HStack, Tooltip, IconButton, useColorMode, useColorModeValue,
} from '@chakra-ui/react'
import { ALL_NAV_ITEMS, PAGE_META } from '../constants/navigation'
import { ROLES, roleLabel } from '../utils/roles'

export default function AppShell({ user, userRole, isAdmin, activeNav, onNavChange, onLogout, children }) {
  const [search, setSearch] = useState('')
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const meta = PAGE_META[activeNav] || PAGE_META.dashboard

  // Build nav list — filter ALL_NAV_ITEMS by the user's role.
  // If an item has no `roles` array → visible to everyone.
  // If it has a `roles` array → only visible if userRole is in it.
  const navItems = ALL_NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(userRole)
  )

  // Color tokens
  const mainBg       = useColorModeValue('hsl(220,33%,97%)', 'hsl(222,28%,9%)')
  const topbarBg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const topbarBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const titleColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor     = useColorModeValue('gray.400', 'whiteAlpha.500')
  const searchBg     = useColorModeValue('gray.50', 'whiteAlpha.100')
  const searchBorder = useColorModeValue('gray.100', 'whiteAlpha.150')
  const searchColor  = useColorModeValue('gray.600', 'whiteAlpha.800')
  const contentBg    = useColorModeValue('hsl(220,33%,97%)', 'hsl(222,28%,9%)')

  return (
    <Flex direction={{ base: 'column', lg: 'row' }} minH="100vh" bg={mainBg}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Box
        as="aside"
        w={{ base: '100%', lg: '260px' }}
        minH={{ lg: '100vh' }}
        position={{ lg: 'sticky' }}
        top={0}
        flexShrink={0}
        bgGradient="linear(180deg, hsl(215,62%,14%) 0%, hsl(215,60%,10%) 100%)"
        color="white"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        p={5}
        zIndex={10}
        boxShadow="4px 0 24px rgba(0,0,0,0.18)"
      >
        <Stack spacing={8}>
          {/* Logo */}
          <Flex align="center" gap={3} pt={2}>
            <Box
              w="40px" h="40px"
              bg="rgba(255,255,255,0.1)"
              border="1px solid rgba(255,255,255,0.2)"
              borderRadius="xl"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="20px"
              boxShadow="0 0 20px rgba(13,158,140,0.3)"
            >
              🏥
            </Box>
            <Stack spacing={0}>
              <Text fontSize="md" fontWeight="800" letterSpacing="-0.5px">HMS</Text>
              <Text fontSize="9px" color="whiteAlpha.500" fontWeight="700"
                letterSpacing="1.5px" textTransform="uppercase">
                Hospital Management System
              </Text>
            </Stack>
          </Flex>

          {/* User pill */}
          <Flex align="center" gap={3} p={3}
            bg="rgba(255,255,255,0.06)"
            border="1px solid rgba(255,255,255,0.08)"
            rounded="2xl">
            <Avatar size="sm" name={user.name} bg="teal.400" color="white" fontWeight="bold" />
            <Stack spacing={0} flex={1} minW={0}>
              <Text fontSize="xs" fontWeight="700" noOfLines={1}>{user.name}</Text>
              <Text fontSize="9px" color="whiteAlpha.500" fontWeight="600"
                textTransform="uppercase" letterSpacing="0.5px">
                {roleLabel(userRole)}
              </Text>
            </Stack>
            <Box w="8px" h="8px" rounded="full" bg="green.400" flexShrink={0} />
          </Flex>

          {/* Nav */}
          <Stack spacing={2} as="nav">
            {navItems.map(item => {
              const active = activeNav === item.key
              return (
                <Button
                  key={item.key}
                  justifyContent="flex-start"
                  variant="ghost"
                  w="100%"
                  h="57px"
                  rounded="xl"
                  fontSize="sm"
                  fontWeight="600"
                  color={active ? 'white' : 'whiteAlpha.650'}
                  bg={active ? 'rgba(255,255,255,0.12)' : 'transparent'}
                  borderLeft={active ? '3px solid' : '3px solid transparent'}
                  borderColor={active ? 'teal.300' : 'transparent'}
                  _hover={{ bg: 'rgba(255,255,255,0.08)', color: 'white' }}
                  onClick={() => onNavChange(item.key)}
                  leftIcon={<span style={{ fontSize: '16px', minWidth: '22px' }}>{item.icon}</span>}
                  transition="all 0.15s"
                >
                  {item.label}
                </Button>
              )
            })}
          </Stack>
        </Stack>

        {/* Logout */}
        <Box pt={6} borderTop="1px solid rgba(255,255,255,0.08)">
          <Button
            variant="ghost" color="whiteAlpha.600" w="100%" h="57px"
            rounded="xl" fontSize="sm" fontWeight="600"
            _hover={{ bg: 'rgba(255,0,0,0.1)', color: 'red.300' }}
            onClick={onLogout}
            leftIcon={<span>🚪</span>}
            justifyContent="flex-start"
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* ── Main area ───────────────────────────────────────── */}
      <Flex direction="column" flex={1} minW={0} overflowX="hidden">

        {/* Topbar */}
        <Flex
          as="header"
          justify="space-between"
          align="center"
          px={{ base: 4, md: 8 }}
          py={4}
          bg={topbarBg}
          borderBottom="1px solid"
          borderColor={topbarBorder}
          boxShadow="0 1px 8px rgba(0,0,0,0.04)"
          gap={4}
          flexWrap="wrap"
          position="sticky"
          top={0}
          zIndex={9}
        >
          <Stack spacing={0.5}>
            <Text fontSize="10px" color={subColor} fontWeight="700"
              textTransform="uppercase" letterSpacing="1.5px">
              {meta.sub}
            </Text>
            <Text fontSize="xl" fontWeight="800" color={titleColor} letterSpacing="-0.3px">
              {isAdmin && activeNav === 'dashboard' ? 'Admin Dashboard' : meta.title}
            </Text>
          </Stack>

          <HStack spacing={3}>
            <HStack
              spacing={2} bg={searchBg} border="1px solid" borderColor={searchBorder}
              rounded="2xl" px={4} py={2} w={{ base: '100%', sm: '240px' }}
              _focusWithin={{ borderColor: 'teal.300', boxShadow: '0 0 0 3px rgba(13,158,140,0.1)' }}
              transition="all 0.2s"
            >
              <Text fontSize="sm" color={subColor}>🔍</Text>
              <Input
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                variant="unstyled"
                fontSize="xs"
                color={searchColor}
                _placeholder={{ color: subColor }}
              />
            </HStack>

            {/* Dark mode toggle */}
            <Tooltip label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} placement="bottom">
              <IconButton
                aria-label="Toggle color mode"
                icon={<Text fontSize="lg">{isDark ? '☀️' : '🌙'}</Text>}
                onClick={toggleColorMode}
                variant="ghost"
                rounded="xl"
                size="sm"
                color={subColor}
                bg={searchBg}
                border="1px solid"
                borderColor={searchBorder}
                _hover={{ borderColor: 'teal.300', bg: isDark ? 'whiteAlpha.100' : 'gray.100' }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label={user.name} placement="bottom">
              <Avatar
                size="sm" name={user.name} bg="teal.500" color="white"
                fontWeight="bold" cursor="pointer"
                _hover={{ transform: 'scale(1.05)' }}
                transition="transform 0.2s"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Page content */}
        <Box as="main" p={{ base: 4, md: 8 }} flex={1} bg={contentBg} key={activeNav} className="fade-in">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
