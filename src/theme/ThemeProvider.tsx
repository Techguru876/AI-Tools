/**
 * Theme Provider - ContentForge Studio Theming System
 * Provides brand colors, vibe modes, and dynamic theming
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ContentForge Studio Brand Colors and Themes
export const themes = {
  // Professional Dark (Default)
  professional: {
    name: 'Professional Dark',
    colors: {
      // Base colors
      bg: {
        primary: '#0a0a0f',     // Deep charcoal - almost black
        secondary: '#13131a',   // Slightly lighter charcoal
        tertiary: '#1a1a24',    // Card/panel background
        elevated: '#21212e',    // Elevated elements
        hover: '#2a2a3a',       // Hover states
        active: '#353547',      // Active states
      },
      // Text colors
      text: {
        primary: '#e8e8f0',     // High contrast white
        secondary: '#b0b0c8',   // Muted text
        tertiary: '#7a7a90',    // Disabled/subtle text
        accent: '#00d9ff',      // Accent text (cyan)
      },
      // Accent colors (ContentForge Studio signature)
      accent: {
        primary: '#00d9ff',     // Cyan - main brand color
        secondary: '#a855f7',   // Purple - secondary brand
        tertiary: '#f59e0b',    // Amber - warnings/highlights
        success: '#10b981',     // Green
        error: '#ef4444',       // Red
        warning: '#f59e0b',     // Amber
      },
      // Vibe colors - for background moods
      vibe: {
        lofi: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple gradient
        chill: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue gradient
        warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',  // Warm gradient
        rain: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',  // Rain gradient
        sunset: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Sunset
        midnight: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Dark blue
      },
      // Border and divider colors
      border: {
        default: '#2a2a3a',
        subtle: '#1f1f2e',
        focus: '#00d9ff',
      },
    },
    // Spacing scale (8px base)
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },
    // Border radius
    radius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
    },
    // Shadows
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
      md: '0 4px 8px rgba(0, 0, 0, 0.5)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.6)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.7)',
      glow: '0 0 20px rgba(0, 217, 255, 0.3)', // Cyan glow
      glowPurple: '0 0 20px rgba(168, 85, 247, 0.3)', // Purple glow
    },
    // Typography
    typography: {
      fonts: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        heading: "'Montserrat', 'Inter', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
      },
      sizes: {
        xs: '11px',
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    // Transitions
    transitions: {
      fast: '0.1s ease',
      normal: '0.2s ease',
      slow: '0.3s ease',
    },
  },

  // Super Dark Mode (for late night editing)
  superDark: {
    name: 'Super Dark',
    colors: {
      bg: {
        primary: '#000000',
        secondary: '#0a0a0a',
        tertiary: '#121212',
        elevated: '#1a1a1a',
        hover: '#242424',
        active: '#2e2e2e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
        tertiary: '#707070',
        accent: '#00e5ff',
      },
      accent: {
        primary: '#00e5ff',
        secondary: '#b84fff',
        tertiary: '#ffaa00',
        success: '#00ff88',
        error: '#ff4466',
        warning: '#ffaa00',
      },
      vibe: {
        lofi: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
        chill: 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)',
        warm: 'linear-gradient(135deg, #7c2d12 0%, #422006 100%)',
        rain: 'linear-gradient(135deg, #164e63 0%, #083344 100%)',
        sunset: 'linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 100%)',
        midnight: 'linear-gradient(135deg, #030712 0%, #0c4a6e 100%)',
      },
      border: {
        default: '#242424',
        subtle: '#1a1a1a',
        focus: '#00e5ff',
      },
    },
    spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', '2xl': '32px', '3xl': '48px' },
    radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', full: '9999px' },
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.8)',
      md: '0 4px 8px rgba(0, 0, 0, 0.9)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.95)',
      xl: '0 16px 32px rgba(0, 0, 0, 1)',
      glow: '0 0 24px rgba(0, 229, 255, 0.4)',
      glowPurple: '0 0 24px rgba(184, 79, 255, 0.4)',
    },
    typography: {
      fonts: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        heading: "'Montserrat', 'Inter', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
      },
      sizes: { xs: '11px', sm: '12px', md: '14px', lg: '16px', xl: '18px', '2xl': '24px', '3xl': '32px', '4xl': '48px' },
      weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    },
    transitions: { fast: '0.1s ease', normal: '0.2s ease', slow: '0.3s ease' },
  },
}

export type ThemeName = keyof typeof themes
export type Theme = typeof themes.professional
export type VibeMode = keyof Theme['colors']['vibe']

interface ThemeContextType {
  theme: Theme
  themeName: ThemeName
  vibeMode: VibeMode | null
  setTheme: (theme: ThemeName) => void
  setVibeMode: (vibe: VibeMode | null) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('professional')
  const [vibeMode, setVibeMode] = useState<VibeMode | null>(null)

  const theme = themes[themeName]

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement
    const colors = theme.colors

    // Background colors
    root.style.setProperty('--color-bg-primary', colors.bg.primary)
    root.style.setProperty('--color-bg-secondary', colors.bg.secondary)
    root.style.setProperty('--color-bg-tertiary', colors.bg.tertiary)
    root.style.setProperty('--color-bg-elevated', colors.bg.elevated)
    root.style.setProperty('--color-bg-hover', colors.bg.hover)
    root.style.setProperty('--color-bg-active', colors.bg.active)

    // Text colors
    root.style.setProperty('--color-text-primary', colors.text.primary)
    root.style.setProperty('--color-text-secondary', colors.text.secondary)
    root.style.setProperty('--color-text-tertiary', colors.text.tertiary)
    root.style.setProperty('--color-text-accent', colors.text.accent)

    // Accent colors
    root.style.setProperty('--color-accent-primary', colors.accent.primary)
    root.style.setProperty('--color-accent-secondary', colors.accent.secondary)
    root.style.setProperty('--color-accent-tertiary', colors.accent.tertiary)
    root.style.setProperty('--color-accent-success', colors.accent.success)
    root.style.setProperty('--color-accent-error', colors.accent.error)
    root.style.setProperty('--color-accent-warning', colors.accent.warning)

    // Border colors
    root.style.setProperty('--color-border-default', colors.border.default)
    root.style.setProperty('--color-border-subtle', colors.border.subtle)
    root.style.setProperty('--color-border-focus', colors.border.focus)

    // Vibe gradient (if active)
    if (vibeMode) {
      root.style.setProperty('--vibe-gradient', colors.vibe[vibeMode])
    }

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })

    // Radius
    Object.entries(theme.radius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value)
    })

    // Shadows
    Object.entries(theme.shadow).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

    // Typography
    root.style.setProperty('--font-primary', theme.typography.fonts.primary)
    root.style.setProperty('--font-heading', theme.typography.fonts.heading)
    root.style.setProperty('--font-mono', theme.typography.fonts.mono)

    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value)
    })

    // Transitions
    Object.entries(theme.transitions).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value)
    })
  }, [theme, vibeMode])

  const toggleTheme = () => {
    setThemeName(current => current === 'professional' ? 'superDark' : 'professional')
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, vibeMode, setTheme: setThemeName, setVibeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// CSS-in-JS helper to use theme values
export function css(theme: Theme) {
  return {
    bg: (level: keyof Theme['colors']['bg']) => theme.colors.bg[level],
    text: (level: keyof Theme['colors']['text']) => theme.colors.text[level],
    accent: (type: keyof Theme['colors']['accent']) => theme.colors.accent[type],
    border: (type: keyof Theme['colors']['border']) => theme.colors.border[type],
    spacing: (size: keyof Theme['spacing']) => theme.spacing[size],
    radius: (size: keyof Theme['radius']) => theme.radius[size],
    shadow: (size: keyof Theme['shadow']) => theme.shadow[size],
  }
}
