/**
 * ReportsPage — live data from /api/analytics/reports
 *
 * Export button  → Master only, downloads a real CSV file
 * Revenue card   → Master only
 */
import {
  Box, Flex, Text, Button, Badge, SimpleGrid,
  Skeleton, Alert, AlertIcon, Stack, HStack, Avatar,
  useColorModeValue,
} from '@chakra-ui/react'
import StatCard    from '../components/StatCard'
import SectionHead from '../components/SectionHead'
import { useReports } from '../hooks/useAnalytics'
import { ROLES } from '../utils/roles'

function ReportsSkeleton() {
  const bg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const border = useColorModeValue('gray.100', 'whiteAlpha.100')
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        {[1,2,3].map(i => <Skeleton key={i} h="110px" rounded="2xl" />)}
      </SimpleGrid>
      <Box bg={bg} p={6} rounded="3xl" border="1px solid" borderColor={border}>
        {[1,2,3].map(i => <Skeleton key={i} h="52px" rounded="xl" mb={3} />)}
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

// ─────────────────────────────────────────────────────────────
// exportToCSV
//   Builds a CSV string from the report data and triggers a
//   browser file download — no server call needed.
//
//   What gets exported:
//     Section 1 — Health Summary rows  (label, value)
//     Section 2 — Recent Completed Visits (patient, doctor,
//                 specialization, date, rating)
// ─────────────────────────────────────────────────────────────
function exportToCSV(data) {
  const rows = []

  // ── Header ──────────────────────────────────────────────
  rows.push(['Hospital Management System - Health Report'])
  rows.push([`Generated on: ${new Date().toLocaleDateString('en-IN')}`])
  rows.push([]) // blank line

  // ── Section 1: Summary stats ─────────────────────────────
  rows.push(['Health Summary'])
  rows.push(['Metric', 'Value'])
  data.summary.forEach(({ label, value }) => {
    rows.push([label, value])
  })
  rows.push([]) // blank line

  // ── Section 2: Recent completed visits ───────────────────
  rows.push(['Recent Completed Visits'])
  rows.push(['Patient', 'Doctor', 'Specialization', 'Date', 'Rating'])
  ;(data.recentAppointments || []).forEach(appt => {
    rows.push([
      appt.patient?.name        || '—',
      appt.doctor?.name         || '—',
      appt.doctor?.specialization || '—',
      formatDate(appt.appointmentDate),
      appt.rating ? `${appt.rating}/5` : '—',
    ])
  })

  // ── Convert rows array → CSV string ──────────────────────
  // Each cell is wrapped in quotes to handle commas inside values.
  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  // ── Trigger browser download ──────────────────────────────
  // Create a hidden <a> tag, set its href to a Blob URL,
  // click it programmatically, then remove it.
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `hms-report-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url) // free memory
}

// ─────────────────────────────────────────────────────────────

export default function ReportsPage({ userRole }) {
  const { data, loading, error } = useReports()

  const isAdmin = userRole === ROLES.MASTER

  // Color tokens
  const cardBg     = useColorModeValue('white', 'hsl(222,24%,13%)')
  const cardBorder = useColorModeValue('gray.100', 'whiteAlpha.100')
  const rowBg      = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder  = useColorModeValue('gray.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.600', 'whiteAlpha.700')
  const nameColor  = useColorModeValue('gray.800', 'whiteAlpha.900')
  const metaColor  = useColorModeValue('gray.500', 'whiteAlpha.500')
  const dateColor  = useColorModeValue('gray.400', 'whiteAlpha.400')

  if (loading) return <ReportsSkeleton />
  if (error)   return <Alert status="error" rounded="2xl"><AlertIcon />{error}</Alert>
  if (!data)   return null

  return (
    <Box>
      {/* ── Stat cards ── */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        {data.stats
          .filter(s => isAdmin || s.label !== 'Revenue')
          .map(s => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              detail={s.detail}
              accent={s.accent}
              icon={s.icon}
            />
          ))}
      </SimpleGrid>

      {/* ── Summary rows ── */}
      <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm" mb={6}>
        <SectionHead
          action={
            // Export button — only rendered for Master admin
            isAdmin ? (
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                rounded="lg"
                leftIcon={<Text fontSize="sm">⬇️</Text>}
                onClick={() => exportToCSV(data)}
              >
                Export CSV
              </Button>
            ) : null
          }
        >
          Health Summary
        </SectionHead>

        <Stack spacing={3}>
          {data.summary.map(({ label, value }) => (
            <Flex key={label} justify="space-between" align="center"
              p={4} bg={rowBg} rounded="xl" fontSize="sm">
              <Text color={labelColor}>{label}</Text>
              <Badge colorScheme="teal" rounded="full" px={3} py={1} fontWeight="700">
                {value}
              </Badge>
            </Flex>
          ))}
        </Stack>
      </Box>

      {/* ── Recent completed appointments ── */}
      {data.recentAppointments?.length > 0 && (
        <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
          <SectionHead>Recent Completed Visits</SectionHead>
          <Stack spacing={3}>
            {data.recentAppointments.map(appt => {
              // Doctor view: show patient name. Master view: show patient + doctor
              const primaryName = appt.patient?.name || appt.doctor?.name || '—'
              const subName     = isAdmin
                ? `${appt.doctor?.name || '—'} · ${appt.doctor?.specialization || ''}`
                : appt.doctor?.name
                  ? `${appt.doctor.name} · ${appt.doctor.specialization || ''}`
                  : null

              return (
                <Flex key={appt._id} justify="space-between" align="center"
                  p={4} bg={rowBg} rounded="2xl" border="1px solid" borderColor={rowBorder}
                  flexWrap="wrap" gap={3}
                  transition="transform 0.2s" _hover={{ transform: 'translateY(-1px)', boxShadow: 'xs' }}>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={primaryName} bg="teal.400" color="white" />
                    <Stack spacing={0.5}>
                      <Text fontSize="sm" fontWeight="700" color={nameColor}>{primaryName}</Text>
                      {subName && <Text fontSize="xs" color={metaColor}>{subName}</Text>}
                    </Stack>
                  </HStack>
                  <HStack spacing={3}>
                    <Text fontSize="xs" color={dateColor}>{formatDate(appt.appointmentDate)}</Text>
                    {appt.rating && (
                      <Badge colorScheme="yellow" rounded="full" px={2} py={0.5} fontSize="10px">
                        ⭐ {appt.rating}/5
                      </Badge>
                    )}
                    <Badge colorScheme="green" rounded="full" px={3} py={1} fontSize="xs">
                      Completed
                    </Badge>
                  </HStack>
                </Flex>
              )
            })}
          </Stack>
        </Box>
      )}
    </Box>
  )
}
