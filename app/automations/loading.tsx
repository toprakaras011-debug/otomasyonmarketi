import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-sm text-foreground/60">Otomasyonlar yükleniyor...</p>
        </div>
      </div>
    </div>
  );
}
