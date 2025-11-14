'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
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
import { supabase } from '@/lib/supabase';
import { useCart } from '@/components/cart-context';
import { useAuth } from '@/components/auth-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileDropdown } from '@/components/profile-dropdown';

function NavbarComponent() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth(); // Remove authLoading to prevent flicker
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [opacity, setOpacity] = useState(0.8);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
      // Calculate opacity based on scroll position (0.8 to 1.0)
      const newOpacity = Math.min(0.8 + (scrollY / 100) * 0.2, 1.0);
      setOpacity(newOpacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    // Prevent body scroll on mobile menu open
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Add padding to prevent shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    
    return () => { 
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
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

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Even if there's an error, try to clear local state and redirect
      }
      
      // Wait longer to ensure session is fully cleared and auth state change propagates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify session is actually cleared
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.warn('Session still exists after signOut, forcing clear');
        // Force clear if session still exists
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      }
      
      // Clear any cached state and redirect
      // Use replace to prevent back button issues
      window.location.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even on error
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      window.location.replace('/');
    }
  }, []);

  const navLinks = [
    { href: '/automations', label: 'Otomasyonlar', icon: Package },
    { href: '/categories', label: 'Kategoriler', icon: Layers },
    { href: '/developer/register', label: 'Geliştirici Ol', icon: Code2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full h-16" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
      <div 
        className="relative w-full h-full transition-all duration-300"
        style={{ 
          opacity: mounted ? opacity : 0.8,
          position: 'relative'
        }}
      >
        <div
          className={`w-full h-full transition-all duration-300 gpu-accelerated ${
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
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Ultra Futuristic */}
          <Link href="/" prefetch={true} className="group relative flex items-center space-x-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer glow */}
              <motion.div 
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 blur-xl group-hover:opacity-75 transition-opacity duration-300"
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

          {/* Desktop Navigation - Hidden on tablet, show mobile menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className="group relative"
                >
                  <motion.div
                    className="relative px-5 py-2.5 text-sm font-semibold transition-all rounded-xl overflow-hidden min-h-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Active state - vibrant gradient with glow */}
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="navbar-active-desktop"
                          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/40"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-xl opacity-50 blur-xl"
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </>
                    )}
                    
                    {/* Hover effect - elegant glow and border */}
                    {!isActive && (
                      <>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 opacity-0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-blue-500/10 group-hover:opacity-100 transition-all duration-300" />
                        <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/30 transition-all duration-300" />
                        {/* Shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/10"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 0, repeat: 0 }}
                          style={{ width: '50%' }}
                        />
                      </>
                    )}
                    
                    <div className={`relative flex items-center gap-2.5 z-10 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400'
                    }`}>
                      <Icon className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${
                        isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-purple-400 group-hover:text-purple-500'
                      }`} />
                      <span className={`font-medium transition-all duration-300 ${
                        isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''
                      }`}>
                        {link.label}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions - Hidden on tablet, show mobile menu */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-3">
            <ThemeToggle />
            
            {user && (
              <Link href="/cart" prefetch={true} className="relative group">
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
              <ProfileDropdown user={user} profile={profile} />
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" asChild className="rounded-xl font-semibold hover:bg-purple-500/10 min-h-[44px] h-11 touch-manipulation flex items-center">
                    <Link href="/auth/signin" prefetch={true} className="touch-manipulation flex items-center">Giriş Yap</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild className="relative rounded-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 overflow-hidden group min-h-[44px] h-11 touch-manipulation flex items-center">
                    <Link href="/auth/signup" prefetch={true} className="touch-manipulation flex items-center">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      />
                      <Sparkles className="mr-2 h-4 w-4 relative z-10" />
                      <span className="relative z-10">Kayıt Ol</span>
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Show on tablet and mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            {user && (
              <Link href="/cart" prefetch={true} className="relative">
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
            className="lg:hidden py-6 space-y-2 border-t border-purple-500/20 bg-background"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'text-foreground hover:bg-purple-500/10'
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
                <div className="rounded-2xl border border-purple-500/20 bg-background p-4 shadow-lg backdrop-blur-none">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                        {profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{profile?.username || user?.email?.split('@')[0] || 'Kullanıcı'}</p>
                      <p className="text-xs text-foreground/70">{user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                      <Link href="/dashboard" prefetch={true}>
                        <User className="mr-2 h-4 w-4" />
                        Panelim
                      </Link>
                    </Button>
                    {(profile?.role === 'admin' || profile?.is_admin) && (
                      <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                        <Link href="/admin/dashboard" prefetch={true}>
                          <Shield className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500 font-semibold">Admin Paneli</span>
                        </Link>
                      </Button>
                    )}
                    {(profile?.is_developer || profile?.developer_approved) && (
                      <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                        <Link href="/developer/dashboard" prefetch={true}>
                          <Code2 className="mr-2 h-4 w-4" />
                          Geliştirici Paneli
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                      <Link href="/dashboard/favorites" prefetch={true}>
                        <Heart className="mr-2 h-4 w-4" />
                        Favorilerim
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl justify-start border-purple-500/20" asChild>
                      <Link href="/dashboard/settings" prefetch={true}>
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
                    <Link href="/auth/signin" prefetch={true}>Giriş Yap</Link>
                  </Button>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg" asChild>
                    <Link href="/auth/signup" prefetch={true}>
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
      </motion.div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
