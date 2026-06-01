import React from 'react'
import {
  Box, Image, Text, Stack, Flex, Badge, useColorModeValue,
} from '@chakra-ui/react'

function HospitalCard({ hospital }) {
  const cardBg      = useColorModeValue('white', 'hsl(222,24%,13%)')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100')
  const nameColor   = useColorModeValue('gray.800', 'whiteAlpha.900')
  const addrColor   = useColorModeValue('gray.500', 'whiteAlpha.500')
  const dividerColor = useColorModeValue('gray.50', 'whiteAlpha.100')

  return (
    <Box
      w="320px"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      rounded="3xl"
      overflow="hidden"
      boxShadow="sm"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <Image
        src={hospital.image}
        alt={hospital.name}
        h="140px"
        w="100%"
        objectFit="cover"
      />
      <Stack p={4} spacing={2}>
        <Text fontWeight="800" fontSize="md" color={nameColor}>
          {hospital.name}
        </Text>
        <Text fontSize="xs" color={addrColor}>
          {hospital.address}
        </Text>
        <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor={dividerColor}>
          <Text fontSize="xs" fontWeight="bold" color="teal.500">
            ⭐ {hospital.rating}
          </Text>
          <Text fontSize="10px" color={addrColor} fontWeight="bold">
            {hospital.services?.join(' · ')}
          </Text>
        </Flex>
      </Stack>
    </Box>
  )
}

export default HospitalCard
