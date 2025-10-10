import Link from 'next/link';
import { Instagram, Linkedin, Mail } from 'lucide-react';

function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.146 2H21l-6.555 7.49L22 22h-6.873l-4.79-6.258L4.756 22H2l7.01-8.008L2 2h6.873l4.38 5.724L18.146 2Zm-1.205 18h1.885L8.2 4H6.314l10.627 16Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-card/30">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <div className="container relative mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Otomasyon Mağazası
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Türkiye'nin en kapsamlı otomasyon marketplace platformu. İşlerinizi otomatikleştirin, verimliliğinizi artırın.
            </p>
            <div className="flex gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="X"
              >
                <XLogo className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@otomasyonmagazasi.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold">Keşfet</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/automations" className="text-muted-foreground hover:text-primary transition-colors">
                  Tüm Otomasyonlar
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold">Geliştirici</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/developer/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Geliştirici Ol
                </Link>
              </li>
              <li>
                <Link href="/developer/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Geliştirici Paneli
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Hesabım
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold">Destek</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  SSS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2025 Otomasyon Mağazası. Tüm hakları saklıdır.</p>
            <p>Made with ❤️ in Turkey</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
