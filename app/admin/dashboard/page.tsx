"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import AdminAutomationList from '@/components/admin/AdminAutomationList';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Package, Users, TrendingUp, DollarSign, Shield } from 'lucide-react';

type StatSummary = {
  totalAutomations: number;
  pendingApproval: number;
  totalUsers: number;
  totalDevelopers: number;
  platformEarnings: number;
};


const initialStats: StatSummary = {
  totalAutomations: 0,
  pendingApproval: 0,
  totalUsers: 0,
  totalDevelopers: 0,
  platformEarnings: 0,
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<any[]>([]);
  const [stats, setStats] = useState<StatSummary>(initialStats);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth/signin');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .maybeSingle();

      // Check both role and is_admin for admin access
      const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
      
      if (!isAdmin) {
        toast.error('Bu sayfaya erişim yetkiniz yok.', {
          duration: 4000,
        });
        router.replace('/dashboard');
        return;
      }

      const [automationsRes, automationsCount, pendingCount, usersCount, developersCount, earningsRes] = await Promise.all([
        supabase
          .from('admin_dashboard')
          .select('*')
          .order('created_at', { ascending: false })
          .then(result => {
            if (result.data) {
              // Admin dashboard automations loaded
            }
            return result;
          }),
        supabase
          .from('automations')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('automations')
          .select('id', { count: 'exact', head: true })
          .eq('admin_approved', false),
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_developer', true),
        supabase.from('platform_earnings').select('amount'),
      ]);

      if (automationsRes.data) {
        setAutomations(automationsRes.data);
      }

      setStats({
        totalAutomations: automationsCount.count ?? 0,
        pendingApproval: pendingCount.count ?? 0,
        totalUsers: usersCount.count ?? 0,
        totalDevelopers: developersCount.count ?? 0,
        platformEarnings:
          earningsRes.data?.reduce((total, row) => total + Number(row.amount ?? 0), 0) ?? 0,
      });

      setLoading(false);
    };

    void loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background">
        <BackgroundDecor />
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-foreground/70">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <span>Admin paneli yükleniyor...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundDecor />
      <Navbar />
      
      <div className="container relative mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 mt-8 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
            <Shield className="h-3 w-3" />
            Yönetim Alanı
          </div>
          <h1 className="mb-4 text-5xl font-black md:text-6xl">
            <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Yönetici Paneli
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-foreground/70">
            Platform istatistiklerini görüntüleyin ve otomasyonları yönetin
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Package, label: 'Toplam Otomasyon', value: stats.totalAutomations, gradient: 'from-purple-600 to-blue-600' },
            { icon: Shield, label: 'Onay Bekleyen', value: stats.pendingApproval, gradient: 'from-orange-600 to-red-600' },
            { icon: Users, label: 'Toplam Kullanıcı', value: stats.totalUsers, gradient: 'from-blue-600 to-cyan-600' },
            { icon: TrendingUp, label: 'Geliştirici Sayısı', value: stats.totalDevelopers, gradient: 'from-green-600 to-emerald-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
            >
              <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                    <p className="mt-2 text-3xl font-black">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm md:col-span-2 lg:col-span-4"
          >
            <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Platform Kazançı</p>
                  <p className="mt-2 text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.platformEarnings.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ₺
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 p-3 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Automations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
        >
          <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Onay Bekleyen Otomasyonlar</h2>
              <p className="text-sm text-foreground/60 mt-1">
                Bu listede sadece henüz onaylanmamış otomasyonlar yer alır.
              </p>
            </div>
            <AdminAutomationList automations={automations} />
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function BackgroundDecor() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <motion.div 
        className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]"
        animate={{ opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
        animate={{ opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </div>
  );
}
