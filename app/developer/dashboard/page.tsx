'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, DollarSign, Package, Pencil, Trash2 } from 'lucide-react';
import { supabase, type Automation } from '@/lib/supabase';
import { toast } from 'sonner';
import { FileUpload } from '@/components/file-upload';

export default function DeveloperDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, totalEarnings: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [formUploading, setFormUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    long_description: '',
    price: '',
    category_id: '',
    image_path: '',
    file_path: '',
    demo_url: '',
    documentation: '',
    tags: '',
    is_published: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!profileData?.is_developer) {
        toast.error('Geliştirici hesabınız yok');
        router.push('/developer/register');
        return;
      }

      setProfile(profileData);

      const [
        { data: automationsData },
        { data: categoriesData },
        { data: purchasesData }
      ] = await Promise.all([
        supabase
          .from('automations')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('developer_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('purchases')
          .select('developer_earnings, status')
          .eq('developer_id', currentUser.id)
      ]);

      if (automationsData) {
        setAutomations(automationsData as any);

        const totalSales = automationsData.reduce((sum, a) => sum + (a.total_sales || 0), 0);
        const totalEarnings = purchasesData
          ?.filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.developer_earnings?.toString() || '0'), 0) || 0;

        setStats({
          totalSales,
          totalEarnings,
          totalProducts: automationsData.length
        });
      }

      if (categoriesData) {
        setCategories(categoriesData);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const slug = formData.title.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const priceAsNumber = parseFloat(formData.price);
    if (isNaN(priceAsNumber)) {
      toast.error('Geçersiz fiyat formatı.');
      return;
    }

    const automationData = {
      developer_id: user.id,
      title: formData.title,
      slug: editingAutomation ? editingAutomation.slug : slug,
      description: formData.description,
      long_description: formData.long_description || null,
      price: priceAsNumber,
      category_id: formData.category_id || null,
      image_path: formData.image_path || null,
      file_path: formData.file_path || null,
      demo_url: formData.demo_url || null,
      documentation: formData.documentation || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      is_published: formData.is_published,
    };

    try {
      if (editingAutomation) {
        const { error } = await supabase
          .from('automations')
          .update(automationData)
          .eq('id', editingAutomation.id);

        if (error) throw error;
        toast.success('Otomasyon güncellendi!');
      } else {
        const { error } = await supabase
          .from('automations')
          .insert(automationData);

        if (error) throw error;
        toast.success('Otomasyon eklendi!');
      }

      setDialogOpen(false);
      setEditingAutomation(null);
      setFormData({
        title: '',
        description: '',
        long_description: '',
        price: '',
        category_id: '',
        image_path: '',
        file_path: '',
        demo_url: '',
        documentation: '',
        tags: '',
        is_published: true,
      });

      const { data: automationsData } = await supabase
        .from('automations')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });

      if (automationsData) {
        setAutomations(automationsData as any);
      }
    } catch (error: any) {
      console.error('Submission Error:', error);
toast.error(`İşlem başarısız: ${error.details || error.message}`);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      title: automation.title,
      description: automation.description,
      long_description: automation.long_description || '',
      price: automation.price.toString(),
      category_id: automation.category_id || '',
      image_path: (automation as any).image_path || '',
      file_path: (automation as any).file_path || '',
      demo_url: automation.demo_url || '',
      documentation: automation.documentation || '',
      tags: automation.tags?.join(', ') || '',
      is_published: (automation as any).is_published ?? false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu otomasyonu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Otomasyon silindi');
      setAutomations(automations.filter(a => a.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Geliştirici Paneli</h1>
            <p className="text-muted-foreground">Otomasyonlarınızı yönetin ve istatistiklerinizi görün</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => {
                  setEditingAutomation(null);
                  setFormData({
                    title: '',
                    description: '',
                    long_description: '',
                    price: '',
                    category_id: '',
                    image_path: '',
                    file_path: '',
                    demo_url: '',
                    documentation: '',
                    tags: '',
                    is_published: true,
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni Otomasyon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAutomation ? 'Otomasyonu Düzenle' : 'Yeni Otomasyon Ekle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Kısa Açıklama *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="long_description">Detaylı Açıklama</Label>
                  <Textarea
                    id="long_description"
                    value={formData.long_description}
                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Fiyat (₺) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <FileUpload
                  label="Otomasyon Görseli"
                  bucketName="automation-images"
                  accept="image/*"
                  maxSizeMB={5}
                  fileType="image"
                  userId={user?.id || ''}
                  currentFile={formData.image_path}
                  onUploadComplete={(path) => setFormData({ ...formData, image_path: path })}
                  onUploadingChange={setFormUploading}
                />

                <FileUpload
                  label="Otomasyon Dosyası"
                  bucketName="automation-files"
                  accept=".zip,.rar,.7z,.json,.js,.py,.php"
                  maxSizeMB={50}
                  fileType="file"
                  userId={user?.id || ''}
                  currentFile={formData.file_path}
                  onUploadComplete={(path) => setFormData({ ...formData, file_path: path })}
                  onUploadingChange={setFormUploading}
                />

                <div>
                  <Label htmlFor="demo_url">Demo URL (Opsiyonel)</Label>
                  <Input
                    id="demo_url"
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    placeholder="https://demo.example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="documentation">Dokümantasyon</Label>
                  <Textarea
                    id="documentation"
                    value={formData.documentation}
                    onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                    rows={4}
                    placeholder="Kurulum ve kullanım talimatları..."
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="api, automation, webhook"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={formUploading || !formData.title || !formData.description || !formData.price}>
                  {editingAutomation ? 'Güncelle' : 'Ekle'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bakiye</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString('tr-TR')} ₺</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Otomasyonlarım</CardTitle>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Henüz otomasyon eklemediniz.</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Otomasyonunuzu Ekleyin
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {automations.map((automation) => (
                  <div key={automation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20">
                      {(automation as any).image_path ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`}
                          alt={automation.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : automation.image_url ? (
                        <Image src={automation.image_url} alt={automation.title} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl font-bold text-muted-foreground">
                          {automation.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{automation.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{automation.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={automation.is_published ? 'default' : 'secondary'}>
                          {automation.is_published ? 'Yayında' : 'Taslak'}
                        </Badge>
                        <Badge variant={automation.admin_approved ? 'default' : 'secondary'}>
                          {automation.admin_approved ? 'Onaylı' : 'Onay Bekliyor'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{automation.total_sales} satış</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary mb-2">
                        {automation.price.toLocaleString('tr-TR')} ₺
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(automation)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(automation.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
