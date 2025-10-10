"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import AdminAutomationList from '@/components/admin/AdminAutomationList';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

type StatSummary = {
  totalAutomations: number;
  pendingApproval: number;
  totalUsers: number;
  totalDevelopers: number;
  platformEarnings: number;
};

const cardClasses =
  'relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20 p-5 text-white shadow-xl backdrop-blur';

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
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        router.replace('/');
        return;
      }

      const [automationsRes, automationsCount, pendingCount, usersCount, developersCount, earningsRes] = await Promise.all([
        supabase
          .from('admin_dashboard')
          .select('*')
          .order('created_at', { ascending: false }),
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
      <main className="relative min-h-screen overflow-hidden bg-slate-950">
        <BackgroundDecor />
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sky-200">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Admin paneli yükleniyor...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <BackgroundDecor />
      <Navbar />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600/15 via-slate-900/90 to-blue-600/20 p-6 shadow-2xl backdrop-blur">
          <header className="mb-6 flex flex-col gap-2 border-b border-purple-500/20 pb-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-purple-200">
              Yönetim Alanı
            </span>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Yönetici Paneli
            </h1>
            <p className="text-sm text-slate-200/80">Bu alan yalnızca yönetici hesabına görünür.</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Toplam Otomasyon" value={stats.totalAutomations} />
            <StatCard label="Onay Bekleyen" value={stats.pendingApproval} />
            <StatCard label="Toplam Kullanıcı" value={stats.totalUsers} />
            <StatCard label="Geliştirici Sayısı" value={stats.totalDevelopers} />
            <StatCard
              label="Platform Kazancı"
              value={stats.platformEarnings.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) + ' ₺'}
              className="md:col-span-2 lg:col-span-4"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-slate-900/95 via-slate-950 to-indigo-900/60 p-6 shadow-2xl backdrop-blur">
          <header className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">Onay Bekleyen Otomasyonlar</h2>
            <p className="text-sm text-slate-300">
              Bu listede sadece henüz onaylanmamış otomasyonlar yer alır.
            </p>
          </header>
          <AdminAutomationList automations={automations} />
        </section>
      </div>
    </main>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
      <div
        className="absolute -bottom-48 -left-48 h-[560px] w-[560px] rounded-full bg-blue-600/20 blur-[130px] animate-pulse"
        style={{ animationDelay: '600ms' }}
      />
      <div className="absolute left-1/2 top-1/3 h-[880px] w-[880px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[110px]" />
    </div>
  );
}

function StatCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={`${cardClasses} ${className ?? ''}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/10" />
      <div className="relative">
        <p className="text-sm font-medium text-slate-200/90">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
}
