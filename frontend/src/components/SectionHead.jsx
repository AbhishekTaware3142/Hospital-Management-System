/**
 * SectionHead — reusable section heading with optional action slot
 */
import { Flex, Heading, useColorModeValue } from '@chakra-ui/react'

export default function SectionHead({ children, action }) {
  const color = useColorModeValue('gray.800', 'whiteAlpha.900')
  return (
    <Flex justify="space-between" align="center" mb={5}>
      <Heading size="sm" color={color} fontWeight="800" letterSpacing="-0.3px">
        {children}
      </Heading>
      {action}
    </Flex>
  )
}
