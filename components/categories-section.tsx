'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Share2, ChartBar as BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    name: 'E-Ticaret',
    slug: 'e-ticaret',
    description: 'Mağaza yönetimi, sipariş otomasyonu ve envanter takibi için çözümler',
    icon: ShoppingCart,
    color: 'from-purple-600 to-purple-800',
    glowColor: 'group-hover:shadow-purple-500/50',
  },
  {
    name: 'Sosyal Medya',
    slug: 'sosyal-medya',
    description: 'İçerik paylaşımı, takipçi analizi ve otomatik etkileşim araçları',
    icon: Share2,
    color: 'from-blue-600 to-blue-800',
    glowColor: 'group-hover:shadow-blue-500/50',
  },
  {
    name: 'Veri & Raporlama',
    slug: 'veri-raporlama',
    description: 'Veri çekme, analiz ve otomatik rapor oluşturma sistemleri',
    icon: BarChart3,
    color: 'from-pink-600 to-pink-800',
    glowColor: 'group-hover:shadow-pink-500/50',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CategoriesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-3xl font-bold md:text-4xl"
          >
            Popüler Kategoriler
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            İhtiyacınıza uygun otomasyon çözümlerini keşfedin
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div key={category.slug} variants={item}>
                <Link href={`/automations?category=${category.slug}`}>
                  <Card className={`group relative overflow-hidden border-border/50 bg-card/50 p-8 backdrop-blur transition-all duration-300 hover:scale-105 ${category.glowColor} hover:shadow-2xl`}>
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${category.color}" />

                    <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="mb-3 text-2xl font-bold">{category.name}</h3>
                    <p className="mb-6 text-muted-foreground">{category.description}</p>

                    <div className="flex items-center text-sm font-medium text-primary">
                      Keşfet
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                    </div>

                    <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl ${category.color}" />
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
