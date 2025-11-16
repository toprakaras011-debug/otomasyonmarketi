'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes/dist/types'

const storageKey = 'theme'
const modeKey = 'theme-mode'

function ThemeModeSync() {
  const { setTheme, resolvedTheme } = useTheme()
  const appliedRef = useRef(false)

  useEffect(() => {
    if (appliedRef.current) return
    appliedRef.current = true

    const mode = typeof window !== 'undefined' ? localStorage.getItem(modeKey) : null
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null

    if (mode === 'auto') {
      if (storedTheme && storedTheme !== resolvedTheme) {
        setTheme(storedTheme)
      }
    }
  }, [resolvedTheme, setTheme])

  return null
}

function ThemeModePersistence() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const handler = () => {
      const mode = localStorage.getItem(modeKey)
      const storedTheme = localStorage.getItem(storageKey)

      if (mode === 'auto' && storedTheme) {
        setTheme(storedTheme)
      }
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} storageKey={storageKey}>
      <ThemeModeSync />
      <ThemeModePersistence />
      {children}
    </NextThemesProvider>
  )
}
