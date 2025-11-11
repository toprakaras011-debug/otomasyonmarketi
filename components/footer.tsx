'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Mail, Zap } from 'lucide-react';

function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.146 2H21l-6.555 7.49L22 22h-6.873l-4.79-6.258L4.756 22H2l7.01-8.008L2 2h6.873l4.38 5.724L18.146 2Zm-1.205 18h1.885L8.2 4H6.314l10.627 16Z" />
    </svg>
  );
}

export function Footer() {
  const footerLinks = {
    discover: [
      { label: 'Tüm Otomasyonlar', href: '/automations' },
      { label: 'Kategoriler', href: '/categories' },
      { label: 'Hakkımızda', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ],
    developer: [
      { label: 'Geliştirici Ol', href: '/developer/register' },
      { label: 'Geliştirici Paneli', href: '/developer/dashboard' },
      { label: 'Hesabım', href: '/dashboard' },
      { label: 'API Dokümantasyonu', href: '/api-docs' },
    ],
    support: [
      { label: 'SSS', href: '/faq' },
      { label: 'İletişim', href: '/contact' },
      { label: 'Destek', href: '/help' },
      { label: 'Gizlilik Politikası', href: '/privacy' },
    ],
  };

  const socialLinks = [
    { icon: XLogo, href: 'https://x.com', label: 'X' },
    { icon: Instagram, href: 'https://www.instagram.com/otomasyonmagazasi/', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:info@otomasyonmagazasi.com', label: 'Email' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-purple-500/20 bg-gradient-to-b from-background via-background to-purple-950/10">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <motion.div
          className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container relative mx-auto px-4 py-16">
        {/* Top gradient line */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {/* Brand section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Workflow Automation
              </span>
            </div>
            <div className="group flex items-center space-x-3">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: 3 }}
              >
                <motion.div
                  className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-75"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 shadow-lg shadow-purple-500/40">
                  <Zap className="h-6 w-6 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                    animate={{
                      x: [-20, 20],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </div>
              </motion.div>
              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Otomasyon
                </h3>
                <p className="text-[10px] font-bold tracking-[0.2em] text-purple-400/80 -mt-1">
                  MARKETPLACE
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Türkiye'nin en kapsamlı workflow automation ve otomasyon marketplace platformu. AI destekli workflow çözümleriyle işlerinizi otomatikleştirin.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 blur-lg group-hover:opacity-20 transition-opacity"
                    />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-purple-400">Keşfet</h4>
            <ul className="space-y-3">
              {footerLinks.discover.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-purple-400"
                  >
                    <motion.span
                      className="mr-2 h-1 w-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-purple-400">Geliştirici</h4>
            <ul className="space-y-3">
              {footerLinks.developer.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-purple-400"
                  >
                    <motion.span
                      className="mr-2 h-1 w-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-purple-400">Destek</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-purple-400"
                  >
                    <motion.span
                      className="mr-2 h-1 w-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-purple-500/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <p>&copy; 2025 Otomasyon Mağazası. Tüm hakları saklıdır.</p>
              <div className="hidden md:flex items-center gap-2">
                <motion.div
                  className="h-2 w-2 rounded-full bg-green-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs">Tüm sistemler çalışıyor</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Made with</span>
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-red-500"
              >
                ❤️
              </motion.span>
              <span className="text-muted-foreground">in</span>
              <span className="font-semibold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
                Turkey
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
