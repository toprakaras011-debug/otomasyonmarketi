import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <div className="mt-4 space-y-2">
            <h2 className="text-3xl font-bold">Sayfa Bulunamadı</h2>
            <p className="text-muted-foreground">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Ana Sayfaya Dön
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/automations">
              <Search className="mr-2 h-5 w-5" />
              Otomasyonları Keşfet
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <Button asChild variant="ghost">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
