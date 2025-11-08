"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Shield, Trash2 } from "lucide-react";
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
  const [activeAction, setActiveAction] = useState<'approve' | 'reject' | 'delete' | null>(null);

  const handleAction = (automationId: string, approved: boolean) => {
    setActiveId(automationId);
    setActiveAction(approved ? 'approve' : 'reject');
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
        setActiveAction(null);
      }
    });
  };

  const handleDelete = (automationId: string) => {
    setActiveId(automationId);
    setActiveAction('delete');
    startTransition(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        }

        const response = await fetch(`/api/admin/automations/${automationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
          throw new Error(data.message || "Silme işlemi başarısız");
        }

        toast.success("Otomasyon silindi");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Silme işlemi gerçekleştirilemedi");
      } finally {
        setActiveId(null);
        setActiveAction(null);
      }
    });
  };

  if (!automations.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-purple-500/25 bg-background/50 py-12 text-center backdrop-blur-sm">
        <Shield className="h-12 w-12 text-purple-400/50" />
        <p className="text-foreground/60">Şu anda onay bekleyen otomasyon bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {automations.map((automation) => {
        const isCurrent = activeId === automation.id;
        return (
          <div
            key={automation.id}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
            
            <div className="relative h-full overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm p-6">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold line-clamp-2 transition-colors group-hover:text-purple-400">
                      {automation.title}
                    </h3>
                    <Badge variant="outline" className="border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs flex-shrink-0">
                      Bekliyor
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-foreground/70">
                      <span className="font-medium">Geliştirici:</span>
                      <span>{automation.developer_name ?? "Bilinmiyor"}</span>
                    </div>
                    {typeof automation.price === "number" && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground/70">Fiyat:</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {automation.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <span>Başvuru:</span>
                      <span>{new Date(automation.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-border/50 pt-4">
                  <Button
                    onClick={() => handleAction(automation.id, true)}
                    disabled={isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:from-green-500/90 hover:to-emerald-500/90"
                  >
                    {isCurrent && isPending && activeAction === 'approve' ? (
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
                    {isCurrent && isPending && activeAction === 'reject' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reddet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(automation.id)}
                    disabled={isPending}
                    className="border-purple-500/40 text-purple-200 hover:bg-purple-500/15"
                  >
                    {isCurrent && isPending && activeAction === 'delete' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Sil
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
