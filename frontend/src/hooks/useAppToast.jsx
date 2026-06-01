/**
 * useAppToast — Stylish custom toast hook for MediBook
 * Wraps Chakra's useToast with a consistent premium design.
 *
 * Usage:
 *   const toast = useAppToast()
 *   toast.success('Title', 'Description')
 *   toast.error('Title', 'Description')
 *   toast.info('Title', 'Description')
 *   toast.warning('Title', 'Description')
 */

import { useToast, Box, Flex, Text, Icon } from '@chakra-ui/react'

// Config per variant
const VARIANTS = {
  success: {
    bg: 'linear-gradient(135deg, #0d9e8c 0%, #26c5f1 100%)',
    border: 'rgba(13,158,140,0.4)',
    icon: '✅',
    glow: 'rgba(13,158,140,0.35)',
  },
  error: {
    bg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
    border: 'rgba(231,76,60,0.4)',
    icon: '❌',
    glow: 'rgba(231,76,60,0.3)',
  },
  warning: {
    bg: 'linear-gradient(135deg, #d68910 0%, #f39c12 100%)',
    border: 'rgba(243,156,18,0.4)',
    icon: '⚠️',
    glow: 'rgba(243,156,18,0.3)',
  },
  info: {
    bg: 'linear-gradient(135deg, #1a6fa8 0%, #2980b9 100%)',
    border: 'rgba(41,128,185,0.4)',
    icon: 'ℹ️',
    glow: 'rgba(41,128,185,0.3)',
  },
}

function ToastBody({ title, description, type }) {
  const v = VARIANTS[type] || VARIANTS.info
  return (
    <Box
      background={v.bg}
      border={`1px solid ${v.border}`}
      borderRadius="2xl"
      boxShadow={`0 8px 32px ${v.glow}, 0 2px 8px rgba(0,0,0,0.2)`}
      px={5}
      py={4}
      minW="300px"
      maxW="380px"
      backdropFilter="blur(12px)"
    >
      <Flex align="flex-start" gap={3}>
        {/* Icon bubble */}
        <Box
          w="36px"
          h="36px"
          minW="36px"
          bg="rgba(255,255,255,0.15)"
          border="1px solid rgba(255,255,255,0.2)"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
          mt="1px"
        >
          {v.icon}
        </Box>

        {/* Text */}
        <Box flex={1}>
          <Text
            fontWeight="800"
            fontSize="sm"
            color="white"
            letterSpacing="-0.01em"
            lineHeight="1.3"
          >
            {title}
          </Text>
          {description && (
            <Text
              fontSize="xs"
              color="rgba(255,255,255,0.8)"
              mt={1}
              lineHeight="1.5"
              fontWeight="500"
            >
              {description}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export function useAppToast() {
  const chakraToast = useToast()

  const show = (type, title, description) => {
    chakraToast({
      position: 'top-right',
      duration: 4000,
      isClosable: true,
      render: () => (
        <ToastBody title={title} description={description} type={type} />
      ),
    })
  }

  return {
    success: (title, description) => show('success', title, description),
    error:   (title, description) => show('error',   title, description),
    warning: (title, description) => show('warning', title, description),
    info:    (title, description) => show('info',    title, description),
  }
}
