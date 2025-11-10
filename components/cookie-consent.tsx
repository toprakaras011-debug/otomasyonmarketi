'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'cookie-consent'

type ConsentStatus = 'accepted'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ConsentStatus | null
      if (!stored) {
        setVisible(true)
      }
    } catch (error) {
      console.warn('Cookie consent kontrolü yapılamadı:', error)
      setVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch (error) {
      console.warn('Çerez onayı kaydedilemedi:', error)
    }
    setVisible(false)
  }

  if (!mounted || !visible) return null

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.div
        layout
        className="relative mx-auto w-full max-w-[1920px] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 text-white shadow-[0_35px_80px_-30px_rgba(79,70,229,0.6)] backdrop-blur-2xl"
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >
        <div className="pointer-events-none absolute -left-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-blue-500/25 blur-[100px]" />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.28),rgba(236,72,153,0.18),rgba(59,130,246,0.28))] opacity-60"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 translate-x-[-100%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)]"
          animate={{ translateX: ['-100%', '120%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 flex flex-row items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-1 items-center gap-4 text-left">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-[0_10px_30px_rgba(168,85,247,0.45)] sm:h-12 sm:w-12 sm:rounded-2xl">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-70 blur-sm sm:rounded-2xl" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950/80 sm:h-10 sm:w-10 sm:rounded-2xl">
                <Cookie className="h-4 w-4 text-purple-100 sm:h-5 sm:w-5" />
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-base font-semibold text-white sm:text-lg">Çerezleri kullanıyoruz</p>
                <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/80 sm:inline-flex">
                  <Sparkles className="h-3 w-3" />
                  Gizliliğinize değer veriyoruz
                </div>
              </div>
              <p className="text-xs text-white/85 sm:text-sm">
                Deneyiminizi iyileştirmek için çerezlerden yararlanıyoruz.{' '}
                <Link href="/privacy" className="font-semibold text-white underline decoration-white/60 underline-offset-2 transition-colors hover:text-purple-200">
                  Gizlilik Politikası
                </Link>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="group relative overflow-hidden border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] transition hover:border-white/50 hover:bg-white/20 sm:px-5 sm:text-sm"
              asChild
            >
              <Link href="/privacy">
                <span className="relative">Ayrıntılar</span>
              </Link>
            </Button>
            <Button
              onClick={acceptCookies}
              size="sm"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(147,197,253,0.35)] transition hover:opacity-90 sm:px-6 sm:text-sm"
            >
              <span className="absolute inset-0 translate-y-[120%] bg-gradient-to-r from-white/40 via-white/20 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
              <span className="relative">Kabul Ediyorum</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
