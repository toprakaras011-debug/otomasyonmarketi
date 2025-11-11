'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, User, Shield, Code2, Heart, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileDropdownProps {
  user: any;
  profile: any;
}

export function ProfileDropdown({ user, profile }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  const menuItems = [
    {
      label: 'Panelim',
      href: '/dashboard',
      icon: User,
      show: true,
    },
    {
      label: 'Yönetim Paneli',
      href: '/admin/dashboard',
      icon: Shield,
      show: profile?.role === 'admin' || profile?.is_admin,
      className: 'text-red-500',
    },
    {
      label: 'Geliştirici Paneli',
      href: '/developer/dashboard',
      icon: Code2,
      show: profile?.is_developer || profile?.developer_approved,
    },
    {
      label: 'Favorilerim',
      href: '/dashboard/favorites',
      icon: Heart,
      show: true,
    },
    {
      label: 'Ayarlar',
      href: '/dashboard/settings',
      icon: Settings,
      show: true,
    },
  ];

  return (
    <div className="relative pr-2">
      {/* Trigger Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative h-11 min-h-[44px] gap-2 rounded-xl hover:bg-purple-500/10 border border-purple-500/20 min-w-[180px] touch-manipulation"
      >
        <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-semibold">
            {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium whitespace-nowrap">
          {profile?.username || user?.email?.split('@')[0] || 'Kullanıcı'}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute mt-4 w-64 rounded-xl border border-purple-500/20 bg-background/95 backdrop-blur-xl p-2 shadow-2xl"
            style={{
              zIndex: 999999,
              position: 'absolute',
              right: '0',
              maxWidth: '256px',
            }}
          >
            {/* User Info Header */}
            <div className="flex items-center gap-3 px-2 py-3 border-b border-purple-500/10 mb-2">
              <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {profile?.username || user?.email?.split('@')[0] || 'Kullanıcı'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                if (!item.show) return null;
                
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-purple-500/10 ${
                      item.className || ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="h-px bg-purple-500/10 my-2" />

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
