/**
 * PaymentsPage — live data from /api/analytics/payments
 */
import {
  Box, Flex, Stack, Text, Button, Badge, HStack,
  SimpleGrid, Skeleton, Alert, AlertIcon, useColorModeValue,
} from '@chakra-ui/react'
import StatCard    from '../components/StatCard'
import SectionHead from '../components/SectionHead'
import { usePayments } from '../hooks/useAnalytics'

const STATUS_COLOR = { Paid: 'green', Pending: 'orange', Refunded: 'blue' }
const STATUS_ICON  = { Paid: '✅',    Pending: '⏳',      Refunded: '↩️' }

function PaymentsSkeleton() {
  const bg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const border = useColorModeValue('gray.100', 'whiteAlpha.100')
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        {[1,2,3].map(i => <Skeleton key={i} h="110px" rounded="2xl" />)}
      </SimpleGrid>
      <Box bg={bg} p={6} rounded="3xl" border="1px solid" borderColor={border}>
        {[1,2,3,4,5].map(i => <Skeleton key={i} h="64px" rounded="2xl" mb={3} />)}
      </Box>
    </Box>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function PaymentsPage() {
  const { data, loading, error } = usePayments()

  // Color tokens
  const cardBg      = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const rowBg       = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder   = useColorModeValue('gray.100', 'whiteAlpha.100')
  const idColor     = useColorModeValue('gray.800', 'whiteAlpha.900')
  const metaColor   = useColorModeValue('gray.500', 'whiteAlpha.500')
  const nameColor   = useColorModeValue('gray.700', 'whiteAlpha.800')
  const dateColor   = useColorModeValue('gray.400', 'whiteAlpha.400')

  if (loading) return <PaymentsSkeleton />
  if (error)   return <Alert status="error" rounded="2xl"><AlertIcon />{error}</Alert>
  if (!data)   return null

  const { summary, invoices } = data

  return (
    <Box>
      {/* ── Summary stats ── */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        <StatCard label="Total Paid"       value={summary.totalPaid}    accent="green"  icon="✅" />
        <StatCard label="Pending Invoices" value={summary.pendingCount} accent="purple" icon="⏳" />
        <StatCard label="Due Amount"       value={summary.dueAmount}    accent="teal"   icon="💳" />
      </SimpleGrid>

      {/* ── Invoice list ── */}
      <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <SectionHead
          action={
            <Button size="sm" colorScheme="teal" variant="outline" rounded="lg">
              Download
            </Button>
          }
        >
          Latest Invoices
        </SectionHead>

        {invoices.length === 0 ? (
          <Flex direction="column" align="center" justify="center" p={12}>
            <Text fontSize="3xl" mb={2}>💳</Text>
            <Text color={metaColor} fontSize="sm" fontWeight="600">No invoices found</Text>
          </Flex>
        ) : (
          <Stack spacing={3}>
            {invoices.map(inv => (
              <Flex key={inv.id} justify="space-between" align="center"
                p={4} bg={rowBg} rounded="2xl" border="1px solid" borderColor={rowBorder}
                flexWrap="wrap" gap={3}
                transition="transform 0.2s" _hover={{ transform: 'translateY(-1px)', boxShadow: 'xs' }}>

                <Stack spacing={0.5}>
                  <HStack spacing={2}>
                    <Text fontSize="sm" fontWeight="800" color={idColor}>{inv.id}</Text>
                    <Badge
                      colorScheme={STATUS_COLOR[inv.status] || 'gray'}
                      rounded="full" px={2} py={0.5} fontSize="10px"
                    >
                      {STATUS_ICON[inv.status]} {inv.status}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={metaColor}>
                    Patient: <Text as="span" fontWeight="600" color={nameColor}>{inv.patient}</Text>
                    {' · '}
                    Doctor: <Text as="span" fontWeight="600" color={nameColor}>{inv.doctor}</Text>
                  </Text>
                </Stack>

                <HStack spacing={4}>
                  <Text fontSize="xs" color={dateColor}>{formatDate(inv.date)}</Text>
                  <Text fontSize="md" fontWeight="800" color="teal.500">{inv.amount}</Text>
                </HStack>
              </Flex>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
