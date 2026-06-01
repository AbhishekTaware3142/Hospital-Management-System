/**
 * MEDIBOOK — CHAKRA UI CUSTOM THEME
 * Extends the default theme with brand tokens + dark mode
 * ============================================
 */

import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const theme = extendTheme({
  // ── Color palette ──────────────────────────────────────────
  colors: {
    brand: {
      50:  'hsl(184, 85%, 95%)',
      100: 'hsl(184, 85%, 88%)',
      200: 'hsl(184, 85%, 75%)',
      300: 'hsl(184, 85%, 62%)',
      400: 'hsl(184, 85%, 52%)',
      500: 'hsl(184, 85%, 42%)',   // primary
      600: 'hsl(184, 85%, 34%)',
      700: 'hsl(184, 85%, 26%)',
      800: 'hsl(184, 85%, 18%)',
      900: 'hsl(184, 85%, 10%)',
    },
    navy: {
      50:  'hsl(215, 60%, 96%)',
      100: 'hsl(215, 60%, 88%)',
      200: 'hsl(215, 60%, 72%)',
      300: 'hsl(215, 60%, 55%)',
      400: 'hsl(215, 60%, 38%)',
      500: 'hsl(215, 60%, 25%)',
      600: 'hsl(215, 60%, 18%)',
      700: 'hsl(215, 60%, 13%)',
      800: 'hsl(215, 60%, 10%)',
      900: 'hsl(215, 60%, 7%)',
    },
    dark: {
      bg:        'hsl(222, 28%, 9%)',
      surface:   'hsl(222, 24%, 13%)',
      elevated:  'hsl(222, 22%, 17%)',
      border:    'hsl(222, 20%, 22%)',
      muted:     'hsl(222, 16%, 30%)',
    },
  },

  // ── Typography ─────────────────────────────────────────────
  fonts: {
    heading: `'Plus Jakarta Sans', system-ui, sans-serif`,
    body:    `'Plus Jakarta Sans', system-ui, sans-serif`,
    mono:    `'JetBrains Mono', 'Fira Code', monospace`,
  },

  fontWeights: {
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold: 800,
    black:    900,
  },

  // ── Border radii ───────────────────────────────────────────
  radii: {
    none: '0',
    sm:   '6px',
    md:   '10px',
    lg:   '14px',
    xl:   '18px',
    '2xl': '22px',
    '3xl': '28px',
    full: '9999px',
  },

  // ── Shadows ────────────────────────────────────────────────
  shadows: {
    xs:  '0 1px 3px rgba(0,0,0,0.06)',
    sm:  '0 2px 8px rgba(0,0,0,0.07)',
    md:  '0 4px 20px rgba(0,0,0,0.09)',
    lg:  '0 8px 32px rgba(0,0,0,0.12)',
    xl:  '0 16px 48px rgba(0,0,0,0.15)',
    '2xl': '0 24px 64px rgba(0,0,0,0.18)',
    teal: '0 8px 24px rgba(13,158,140,0.28)',
    'teal-lg': '0 16px 40px rgba(13,158,140,0.35)',
  },

  // ── Global styles ──────────────────────────────────────────
  styles: {
    global: (props) => ({
      'html, body': {
        bg:    mode('hsl(220, 33%, 98%)', 'hsl(222, 28%, 9%)')(props),
        color: mode('hsl(220, 45%, 16%)', 'hsl(220, 20%, 88%)')(props),
      },
      '::selection': {
        bg:    mode('teal.100', 'teal.800')(props),
        color: mode('teal.900', 'teal.100')(props),
      },
      '::-webkit-scrollbar-track': {
        background: mode('hsl(220, 33%, 95%)', 'hsl(222, 24%, 13%)')(props),
      },
      '::-webkit-scrollbar-thumb': {
        background: mode('hsl(220, 16%, 78%)', 'hsl(222, 20%, 30%)')(props),
      },
    }),
  },

  // ── Component overrides ────────────────────────────────────
  components: {
    Button: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.01em',
        _focus: { boxShadow: '0 0 0 3px rgba(13,158,140,0.35)' },
      },
      variants: {
        solid: (props) => ({
          ...(props.colorScheme === 'teal' && {
            bgGradient: 'linear(135deg, teal.400, cyan.500)',
            color: 'white',
            _hover: {
              bgGradient: 'linear(135deg, teal.500, cyan.600)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 24px rgba(13,158,140,0.3)',
            },
            _active: { transform: 'translateY(0)', boxShadow: 'none' },
          }),
        }),
        ghost: {
          _hover: { bg: 'whiteAlpha.100' },
        },
      },
      defaultProps: { colorScheme: 'teal' },
    },

    Input: {
      variants: {
        outline: (props) => ({
          field: {
            borderRadius: 'xl',
            borderColor: mode('gray.200', 'whiteAlpha.200')(props),
            bg: mode('white', 'whiteAlpha.50')(props),
            color: mode('gray.800', 'whiteAlpha.900')(props),
            _placeholder: { color: mode('gray.400', 'whiteAlpha.400')(props) },
            _hover: { borderColor: 'teal.400' },
            _focus: {
              borderColor: 'teal.400',
              boxShadow: '0 0 0 3px rgba(13,158,140,0.15)',
            },
          },
        }),
      },
      defaultProps: { variant: 'outline' },
    },

    Select: {
      variants: {
        outline: (props) => ({
          field: {
            borderRadius: 'xl',
            borderColor: mode('gray.200', 'whiteAlpha.200')(props),
            bg: mode('white', 'hsl(222, 24%, 13%)')(props),
            color: mode('gray.800', 'whiteAlpha.900')(props),
            _hover: { borderColor: 'teal.400' },
            _focus: {
              borderColor: 'teal.400',
              boxShadow: '0 0 0 3px rgba(13,158,140,0.15)',
            },
          },
        }),
      },
    },

    Textarea: {
      variants: {
        outline: (props) => ({
          borderRadius: 'xl',
          borderColor: mode('gray.200', 'whiteAlpha.200')(props),
          bg: mode('white', 'whiteAlpha.50')(props),
          color: mode('gray.800', 'whiteAlpha.900')(props),
          _placeholder: { color: mode('gray.400', 'whiteAlpha.400')(props) },
          _hover: { borderColor: 'teal.400' },
          _focus: {
            borderColor: 'teal.400',
            boxShadow: '0 0 0 3px rgba(13,158,140,0.15)',
          },
        }),
      },
    },

    Badge: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
    },

    Heading: {
      baseStyle: {
        letterSpacing: '-0.02em',
        fontWeight: '800',
      },
    },

    Modal: {
      baseStyle: (props) => ({
        dialog: {
          borderRadius: '3xl',
          boxShadow: '2xl',
          bg: mode('white', 'hsl(222, 24%, 13%)')(props),
        },
        overlay: {
          backdropFilter: 'blur(8px)',
          bg: 'blackAlpha.600',
        },
      }),
    },

    Tooltip: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: '600',
        fontSize: 'xs',
        px: 3,
        py: 2,
      },
    },

    Divider: {
      baseStyle: (props) => ({
        borderColor: mode('gray.100', 'whiteAlpha.100')(props),
      }),
    },
  },

  // ── Config ─────────────────────────────────────────────────
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default theme
