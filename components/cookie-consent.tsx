'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie, ShieldCheck, Sparkles } from 'lucide-react'

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
      className="fixed inset-x-4 bottom-6 z-[60]"
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.div
        layout
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 text-white shadow-[0_35px_80px_-30px_rgba(79,70,229,0.6)] backdrop-blur-2xl"
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

        <div className="relative z-10 flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-start gap-5 text-left">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-[0_10px_30px_rgba(168,85,247,0.45)]">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-70 blur-sm" />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/80">
                <Cookie className="h-5 w-5 text-purple-100" />
              </span>
            </div>

            <div className="space-y-4 text-sm leading-relaxed sm:text-base">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Gizliliğinize değer veriyoruz
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white sm:text-xl">Çerezleri kullanıyoruz</p>
                <p className="text-sm text-white/85 sm:text-base">
                  Deneyiminizi iyileştirmek, kullanım verilerini analiz etmek ve kişiselleştirilmiş içerikler göstermek için çerezlerden yararlanıyoruz. Detaylar için{' '}
                  <Link href="/privacy" className="font-semibold text-white underline decoration-white/60 underline-offset-4 transition-colors hover:text-purple-200">
                    Gizlilik Politikası
                  </Link>{' '}
                  sayfamızı inceleyebilirsiniz.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-white/75 sm:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-purple-200" />
                  Güvenli veri saklama
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-blue-200" />
                  Performans analizi
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-pink-200" />
                  Kişiselleştirilmiş içerik
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="group relative overflow-hidden border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] transition hover:border-white/50 hover:bg-white/20"
              asChild
            >
              <Link href="/privacy">
                <span className="relative">Ayrıntıları Gör</span>
              </Link>
            </Button>
            <Button
              onClick={acceptCookies}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(147,197,253,0.35)] transition hover:opacity-90"
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
