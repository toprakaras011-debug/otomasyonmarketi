"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AdminAutomation = {
  id: string;
  title: string;
  developer_name: string | null;
  price: number | null;
  image_path: string | null;
  created_at: string;
  admin_approved: boolean;
};

interface Props {
  automations: AdminAutomation[];
}

export default function AdminAutomationList({ automations }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleAction = (automationId: string, approved: boolean) => {
    setActiveId(automationId);
    startTransition(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        }

        const response = await fetch(`/api/admin/automations/${automationId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          credentials: "include",
          body: JSON.stringify({ approved }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ message: "İşlem başarısız" }));
          throw new Error(data.message || "İşlem başarısız");
        }

        toast.success(approved ? "Otomasyon onaylandı" : "Otomasyon reddedildi");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "İşlem gerçekleştirilemedi");
      } finally {
        setActiveId(null);
      }
    });
  };

  if (!automations.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-purple-500/25 bg-slate-900/70 py-12 text-center text-sm text-slate-200">
        <Shield className="h-8 w-8 text-purple-400" />
        <span>Şu anda onay bekleyen otomasyon bulunmuyor.</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {automations.map((automation) => {
        const isCurrent = activeId === automation.id;
        return (
          <div
            key={automation.id}
            className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-slate-900/85 shadow-xl backdrop-blur"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-600/15 via-blue-600/10 to-pink-500/10" />
            <div className="p-5 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-100">
                      {automation.title}
                    </h3>
                    <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-200">
                      Onay Bekliyor
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
                    <span className="font-medium text-slate-100">
                      Geliştirici: {automation.developer_name ?? "Bilinmiyor"}
                    </span>
                    {typeof automation.price === "number" && (
                      <span>
                        Fiyat: {automation.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </span>
                    )}
                    <span>
                      Başvuru Tarihi: {new Date(automation.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleAction(automation.id, true)}
                    disabled={isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:from-green-500/90 hover:to-emerald-500/90"
                  >
                    {isCurrent && isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Onayla
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction(automation.id, false)}
                    disabled={isPending}
                    className="border-red-500/40 text-red-300 hover:bg-red-500/15"
                  >
                    {isCurrent && isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reddet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
