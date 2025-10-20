'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Sparkles, Package, Layers, Code as Code2, BookOpen, ChevronDown, Shield, ShoppingCart, LayoutDashboard, Heart, Settings, LayoutGrid } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import { useCart } from '@/components/cart-context';
import { useAuthHydration } from '@/components/auth-provider';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { initialUser, initialProfile } = useAuthHydration();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [profile, setProfile] = useState<any>(initialProfile ?? null);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    let raf = 0;
    const last = { val: false };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY > 10;
        if (next !== last.val) {
          last.val = next;
          setScrolled(next);
        }

      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser((prev: User | null) => (prev?.id === user?.id ? prev : user));
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        setProfile((prev: any) => (prev?.id === data?.id ? prev : data));
      } else {
        setProfile((prev: any) => (prev ? null : prev));
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void getUser();
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  const navLinks = [
    { href: '/automations', label: 'Otomasyonlar', icon: Package },
    { href: '/categories', label: 'Kategoriler', icon: Layers },
    { href: '/developer/register', label: 'Geliştirici Ol', icon: Code2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5'
        : 'border-b border-border/40 bg-background/95 backdrop-blur-lg'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center space-x-3 transition-transform hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 opacity-75 blur-md group-hover:opacity-100 transition-opacity" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 shadow-lg">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Otomasyon
              </span>
              <span className="text-xs font-semibold text-muted-foreground -mt-1">
                MARKETPLACE
              </span>
            </div>
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-4 py-2 text-sm font-semibold transition-all rounded-lg ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-primary' : ''
                    }`} />
                    {link.label}
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/0 to-blue-600/0 opacity-0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link href="/cart" className="relative group">
              <Button variant="ghost" className="rounded-xl" size="icon" aria-label="Sepet">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="group relative h-11 gap-2 rounded-xl hover:bg-primary/5">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-semibold">
                        {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {profile?.username || user?.email || '...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {/* DEV rozeti kaldırıldı */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/60 p-2">
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                          {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{profile?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Panelim
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-red-500 font-semibold">Admin Paneli</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.is_developer && (
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
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                  >
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-xl font-semibold hover:bg-primary/5">
                  <Link href="/auth/signin">Giriş Yap</Link>
                </Button>
                <Button asChild className="rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105">
                  <Link href="/auth/signup">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Kayıt Ol
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link href="/cart" className="relative" aria-label="Sepet">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-2 border-t border-border/40 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </div>
                  {isActive && <span className="text-xs text-primary">Aktif</span>}
                </Link>
              );
            })}
            <div className="border-t border-border/60 pt-6">
              <div className="space-y-4">
                <Link
                  href="/cart"
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Sepetim</span>
                  </div>
                  {count > 0 && (
                    <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
                      {count}
                    </span>
                  )}
                </Link>
                {user ? (
                  <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                          {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile?.username || 'Kullanıcı'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" className="w-full rounded-xl justify-start" asChild>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          Panelim
                        </Link>
                      </Button>
                      {profile?.role === 'admin' && (
                        <Button variant="outline" className="w-full rounded-xl justify-start" asChild>
                          <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <Shield className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-500 font-semibold">Admin Paneli</span>
                          </Link>
                        </Button>
                      )}
                      {profile?.is_developer && (
                        <Button variant="outline" className="w-full rounded-xl justify-start" asChild>
                          <Link href="/developer/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <Code2 className="mr-2 h-4 w-4" />
                            Geliştirici Paneli
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full rounded-xl justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Çıkış Yap
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button variant="outline" className="w-full rounded-xl" asChild>
                      <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                        Giriş Yap
                      </Link>
                    </Button>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg" asChild>
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Kayıt Ol
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
