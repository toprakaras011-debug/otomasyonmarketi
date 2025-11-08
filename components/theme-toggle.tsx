'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const storageKey = 'theme'
const modeKey = 'theme-mode'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative rounded-xl"
      aria-label="Tema değiştirme"
      onClick={() => {
        const nextTheme = isDark ? 'light' : 'dark'
        localStorage.setItem(storageKey, nextTheme)
        localStorage.setItem(modeKey, 'manual')
        setTheme(nextTheme)
      }}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Tema değiştir</span>
    </Button>
  )
}
