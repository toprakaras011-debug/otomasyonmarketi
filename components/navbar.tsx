'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Sparkles, Package, Layers, Code2, BookOpen, ChevronDown, Shield, ShoppingCart, User, Heart, Settings, Zap } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useCart } from '@/components/cart-context';
import { useAuth } from '@/components/auth-provider';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [8, 20]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (mobileMenuRef.current?.contains(target)) return;
      if (menuButtonRef.current?.contains(target)) return;
      setMobileMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navLinks = [
    { href: '/automations', label: 'Otomasyonlar', icon: Package },
    { href: '/categories', label: 'Kategoriler', icon: Layers },
    { href: '/developer/register', label: 'Geliştirici Ol', icon: Code2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ];

  return (
    <motion.nav 
      style={{ opacity: mounted ? navOpacity : 0.8 }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'border-b border-purple-500/20 bg-background/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(139,92,246,0.15)]'
          : 'border-b border-border/20 bg-background/40 backdrop-blur-xl'
      }`}
    >
      {/* Animated gradient line */}
      <motion.div 
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Ultra Futuristic */}
          <Link href="/" className="group relative flex items-center space-x-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer glow */}
              <motion.div 
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 blur-xl group-hover:opacity-75 transition-opacity duration-500"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Main logo container */}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 shadow-lg shadow-purple-500/50">
                <Zap className="h-7 w-7 text-white" />
                
                {/* Inner shine effect */}
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
            
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Otomasyon
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-purple-400/80 -mt-1">
                MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative"
                >
                  <motion.div
                    className={`relative px-4 py-2 text-sm font-semibold transition-all rounded-xl overflow-hidden ${
                      isActive ? 'text-white' : 'text-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Active background */}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-blue-600/0 opacity-0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 group-hover:opacity-100 transition-all duration-300" />
                    )}
                    
                    <div className="relative flex items-center gap-2 z-10">
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-purple-400'
                      }`} />
                      {link.label}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <ThemeToggle />
            
            {user && (
              <Link href="/cart" className="relative group">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" className="rounded-xl relative" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {count > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-1.5 py-0.5 font-bold shadow-lg"
                      >
                        {count}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="group relative h-11 gap-2 rounded-xl hover:bg-purple-500/10 border border-purple-500/20">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-semibold">
                        {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {profile?.username || user?.email || '...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-purple-500/20 bg-background/95 backdrop-blur-xl p-2">
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                          {profile?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold">{profile?.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Panelim
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-red-500 font-semibold">Yönetim Paneli</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(profile?.is_developer || profile?.developer_approved) && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/developer/dashboard" className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Geliştirici Paneli
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard/favorites" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Favorilerim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Ayarlar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer text-destructive">
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" asChild className="rounded-xl font-semibold hover:bg-purple-500/10">
                    <Link href="/auth/signin">Giriş Yap</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild className="relative rounded-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 overflow-hidden group">
                    <Link href="/auth/signup">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-30"
                        animate={{
                          x: [-100, 100],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <Sparkles className="mr-2 h-4 w-4 relative z-10" />
                      <span className="relative z-10">Kayıt Ol</span>
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {user && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ShoppingCart className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-1.5 py-0.5 font-bold">
                      {count}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2 text-foreground hover:bg-purple-500/10 border border-purple-500/20"
              onClick={() => setMobileMenuOpen(true)}
              ref={menuButtonRef}
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-6 space-y-2 border-t border-purple-500/20"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'text-muted-foreground hover:text-foreground hover:bg-purple-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </div>
                </Link>
              );
            })}
            
            <div className="border-t border-purple-500/20 pt-6 space-y-4">
              {user ? (
                <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 backdrop-blur-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                        {profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile?.username || 'Kullanıcı'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Panelim
                      </Link>
                    </Button>
                    {profile?.role === 'admin' && (
                      <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                        <Link href="/admin/dashboard">
                          <Shield className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500 font-semibold">Admin Paneli</span>
                        </Link>
                      </Button>
                    )}
                    {profile?.is_developer && (
                      <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                        <Link href="/developer/dashboard">
                          <Code2 className="mr-2 h-4 w-4" />
                          Geliştirici Paneli
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                      <Link href="/dashboard/favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        Favorilerim
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Ayarlar
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20 text-destructive" onClick={handleSignOut}>
                      Çıkış Yap
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button variant="outline" className="w-full rounded-xl border-purple-500/20" asChild>
                    <Link href="/auth/signin">Giriş Yap</Link>
                  </Button>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg" asChild>
                    <Link href="/auth/signup">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Kayıt Ol
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
