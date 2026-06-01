/**
 * StatCard — reusable metric card with dark mode support
 */
import { Box, Text, useColorModeValue } from '@chakra-ui/react'

const ACCENT_MAP = {
  teal:   { bg: ['teal.50',   'rgba(13,158,140,0.12)'],  border: ['teal.100',   'rgba(13,158,140,0.25)'],  text: ['teal.600',   'teal.300'],   val: ['teal.700',   'teal.200']   },
  green:  { bg: ['green.50',  'rgba(72,187,120,0.12)'],  border: ['green.100',  'rgba(72,187,120,0.25)'],  text: ['green.600',  'green.300'],  val: ['green.700',  'green.200']  },
  purple: { bg: ['purple.50', 'rgba(159,122,234,0.12)'], border: ['purple.100', 'rgba(159,122,234,0.25)'], text: ['purple.600', 'purple.300'], val: ['purple.700', 'purple.200'] },
  gray:   { bg: ['gray.50',   'whiteAlpha.50'],           border: ['gray.100',   'whiteAlpha.100'],          text: ['gray.500',   'whiteAlpha.600'], val: ['gray.700', 'whiteAlpha.800'] },
  blue:   { bg: ['blue.50',   'rgba(66,153,225,0.12)'],  border: ['blue.100',   'rgba(66,153,225,0.25)'],  text: ['blue.600',   'blue.300'],   val: ['blue.700',   'blue.200']   },
}

export default function StatCard({ label, value, detail, accent = 'teal', icon }) {
  const c = ACCENT_MAP[accent] || ACCENT_MAP.teal
  const bg     = useColorModeValue(c.bg[0],     c.bg[1])
  const border = useColorModeValue(c.border[0], c.border[1])
  const text   = useColorModeValue(c.text[0],   c.text[1])
  const val    = useColorModeValue(c.val[0],    c.val[1])

  return (
    <Box
      p={5}
      bg={bg}
      rounded="2xl"
      border="1px solid"
      borderColor={border}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-3px)', boxShadow: 'md' }}
    >
      {icon && <Text fontSize="xl" mb={2}>{icon}</Text>}
      <Text fontSize="xs" fontWeight="700" color={text} textTransform="uppercase" letterSpacing="0.5px">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="800" color={val} mt={1} letterSpacing="-0.5px">
        {value}
      </Text>
      {detail && (
        <Text fontSize="10px" color={text} fontWeight="600" mt={1}>{detail}</Text>
      )}
    </Box>
  )
}
