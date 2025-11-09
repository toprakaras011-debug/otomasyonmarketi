'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconBox } from '@/components/ui/icon-box';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plus, TrendingUp, DollarSign, Package, Pencil, Trash2, Sparkles, Info, Loader2, Wand2, Tags, Layers, Link2, FileText, CalendarClock, ShieldCheck, Rocket, Zap, Gauge, ChevronRight, Globe, SparklesIcon, Star, Filter, ListChecks, BookOpen } from 'lucide-react';
import { supabase, type Automation } from '@/lib/supabase';
import { toast } from 'sonner';
import { FileUpload } from '@/components/file-upload';
import { CATEGORY_DEFINITIONS } from '@/lib/constants/categories';
import { automationTags } from '@/lib/automation-tags';

const createInitialFormState = () => ({
  title: '',
  description: '',
  long_description: '',
  price: '',
  category_id: '',
  category_custom: '',
  automation_type: 'template',
  complexity: 'beginner',
  image_path: '',
  file_path: '',
  demo_url: '',
  documentation: '',
  tags: '',
  tag_ids: [] as string[],
  is_published: true,
  enable_support: true,
  support_response_time: '48',
  estimated_setup_time: '15',
  release_notes: '',
  changelog_url: '',
  integrations: '',
});

type FormState = ReturnType<typeof createInitialFormState>;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>(() => createInitialFormState());
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'experience' | 'metadata'>('overview');
  const [tagSearch, setTagSearch] = useState('');

  const derivedCategories = useMemo(() => {
    const dynamicCategories = (categories || []).map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
    }));

    const staticCategories = CATEGORY_DEFINITIONS.map((definition) => ({
      id: null, // Don't use static IDs that look like UUIDs
      slug: definition.slug,
      name: definition.name,
    }));

    const merged = [...staticCategories];
    for (const category of dynamicCategories) {
      if (!merged.some((item) => item.slug === category.slug)) {
        merged.push(category);
      }
    }
    return merged;
  }, [categories]);

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) {
      return automationTags;
    }
    return automationTags.filter((tag) =>
      tag.label.toLowerCase().includes(tagSearch.trim().toLowerCase())
    );
  }, [tagSearch]);

  const slugPreview = useMemo(() => (formData.title ? slugify(formData.title) : ''), [formData.title]);

  const toggleTag = (tagId: string) => {
    setFormData((prev) => {
      const exists = prev.tag_ids.includes(tagId);
      const tagIds = exists
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId];
      return { ...prev, tag_ids: tagIds };
    });
  };

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

    setFormSubmitting(true);

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

    // Find the actual category ID for static categories
    let categoryId = formData.category_id;
    if (categoryId && !categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // This is a slug, find the actual category ID
      const category = categories?.find(c => c.slug === categoryId);
      if (category) {
        categoryId = category.id;
      } else {
        // Create category if it doesn't exist
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: derivedCategories.find(c => c.slug === categoryId)?.name || categoryId,
            slug: categoryId,
            description: '',
            color: '#8b5cf6'
          })
          .select()
          .single();
        
        if (categoryError) {
          toast.error('Kategori oluşturulamadı: ' + categoryError.message);
          setFormSubmitting(false);
          return;
        }
        categoryId = newCategory.id;
      }
    }

    const automationData = {
      developer_id: user.id,
      title: formData.title,
      slug: editingAutomation ? editingAutomation.slug : slug,
      description: formData.description,
      long_description: formData.long_description || null,
      price: priceAsNumber,
      category_id: categoryId || null,
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

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Otomasyon başarıyla güncellendi!');
      } else {
        const { error } = await supabase
          .from('automations')
          .insert(automationData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Otomasyon başarıyla eklendi!');
      }

      setDialogOpen(false);
      setEditingAutomation(null);
      setFormData(createInitialFormState());

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
      console.error('Error:', error);
      let errorMessage = 'Bilinmeyen hata';
      
      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Bu başlıkta bir otomasyon zaten mevcut';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Seçilen kategori geçersiz';
        } else if (error.message.includes('uuid')) {
          errorMessage = 'Kategori seçimi hatası';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error('İşlem başarısız: ' + errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData((prev) => ({
      ...createInitialFormState(),
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
      tag_ids: automation.tags || [],
      is_published: (automation as any).is_published ?? false,
      automation_type: (automation as any).automation_type || 'template',
      complexity: (automation as any).complexity || 'beginner',
      enable_support: (automation as any).enable_support ?? true,
      support_response_time: (automation as any).support_response_time?.toString() || '48',
      estimated_setup_time: (automation as any).estimated_setup_time?.toString() || '15',
      release_notes: (automation as any).release_notes || '',
      changelog_url: (automation as any).changelog_url || '',
      integrations: Array.isArray((automation as any).integrations)
        ? (automation as any).integrations.join(', ')
        : (automation as any).integrations || '',
    }));
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
      <main className="relative min-h-screen overflow-hidden bg-background">
        <Navbar />
        <div className="container relative mx-auto px-4 py-12">
          <div className="space-y-8">
            <div className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div 
          className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <Navbar />

      <div className="container relative mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="mb-2 text-4xl font-black md:text-5xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Geliştirici Paneli
              </span>
            </h1>
            <p className="text-foreground/70">Otomasyonlarınızı yönetin ve istatistiklerinizi görün</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => {
                  setEditingAutomation(null);
                  setFormData(createInitialFormState());
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni Otomasyon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {editingAutomation ? 'Otomasyonu Düzenle' : 'Yeni Otomasyon Ekle'}
                </DialogTitle>
                {slugPreview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    URL Önizleme: <span className="font-mono text-purple-500">/automations/{slugPreview}</span>
                  </p>
                )}
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Genel
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Dosyalar
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Deneyim
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    Metadata
                  </TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 pr-4">
                  <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <TabsContent value="overview" className="space-y-4 mt-0">
                      <div>
                        <Label htmlFor="title" className="flex items-center gap-2">
                          Başlık *
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Otomasyonunuzun açıklayıcı başlığı</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          placeholder="Örn: Instagram Otomatik Paylaşım"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="category">Kategori *</Label>
                          <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Sabit Kategoriler</SelectLabel>
                                {derivedCategories.filter(c => c.id === null).map((cat) => (
                                  <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                                ))}
                              </SelectGroup>
                              {derivedCategories.filter(c => c.id !== null).length > 0 && (
                                <>
                                  <SelectSeparator />
                                  <SelectGroup>
                                    <SelectLabel>Özel Kategoriler</SelectLabel>
                                    {derivedCategories.filter(c => c.id !== null).map((cat) => (
                                      <SelectItem key={cat.slug} value={cat.id!}>{cat.name}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="price">Fiyat (₺) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Kısa Açıklama *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          rows={3}
                          placeholder="Otomasyonunuzun kısa tanımı (maksimum 200 karakter)"
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.description.length}/200 karakter
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="long_description">Detaylı Açıklama</Label>
                        <Textarea
                          id="long_description"
                          value={formData.long_description}
                          onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                          rows={6}
                          placeholder="Otomasyonunuzun detaylı açıklaması, özellikleri ve faydaları..."
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="assets" className="space-y-4 mt-0">

                      <FileUpload
                        label="Otomasyon Görseli *"
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
                        label="Otomasyon Dosyası *"
                        bucketName="automation-files"
                        accept=".zip,.rar,.7z,.json,.js,.py,.php,.txt,.md"
                        maxSizeMB={50}
                        fileType="file"
                        userId={user?.id || ''}
                        currentFile={formData.file_path}
                        onUploadComplete={(path) => setFormData({ ...formData, file_path: path })}
                        onUploadingChange={setFormUploading}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ <strong>Önemli:</strong> Otomasyon dosyası için arşiv dosyası (.zip, .rar, .7z) veya kod dosyası (.json, .js, .py, .php) yüklemelisiniz. 
                        Görsel dosyası için yukarıdaki "Otomasyon Görseli" alanını kullanın.
                      </p>

                      <Separator />

                      <div>
                        <Label htmlFor="demo_url" className="flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          Demo URL
                        </Label>
                        <Input
                          id="demo_url"
                          type="url"
                          value={formData.demo_url}
                          onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                          placeholder="https://demo.example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="documentation" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Dokümantasyon
                        </Label>
                        <Textarea
                          id="documentation"
                          value={formData.documentation}
                          onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                          rows={6}
                          placeholder="Kurulum adımları, kullanım talimatları, gereksinimler..."
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-4 mt-0">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="automation_type">Otomasyon Tipi</Label>
                          <Select value={formData.automation_type} onValueChange={(value) => setFormData({ ...formData, automation_type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="template">Şablon</SelectItem>
                              <SelectItem value="workflow">İş Akışı</SelectItem>
                              <SelectItem value="integration">Entegrasyon</SelectItem>
                              <SelectItem value="script">Script</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="complexity">Karmaşıklık Seviyesi</Label>
                          <Select value={formData.complexity} onValueChange={(value) => setFormData({ ...formData, complexity: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Başlangıç</SelectItem>
                              <SelectItem value="intermediate">Orta</SelectItem>
                              <SelectItem value="advanced">İleri</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="estimated_setup_time">Tahmini Kurulum Süresi (dakika)</Label>
                        <Input
                          id="estimated_setup_time"
                          type="number"
                          min="1"
                          value={formData.estimated_setup_time}
                          onChange={(e) => setFormData({ ...formData, estimated_setup_time: e.target.value })}
                          placeholder="15"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Destek Hizmeti</Label>
                          <p className="text-xs text-muted-foreground">Müşterilere destek sağlayacak mısınız?</p>
                        </div>
                        <Switch
                          checked={formData.enable_support}
                          onCheckedChange={(checked) => setFormData({ ...formData, enable_support: checked })}
                        />
                      </div>

                      {formData.enable_support && (
                        <div>
                          <Label htmlFor="support_response_time">Destek Yanıt Süresi (saat)</Label>
                          <Input
                            id="support_response_time"
                            type="number"
                            min="1"
                            value={formData.support_response_time}
                            onChange={(e) => setFormData({ ...formData, support_response_time: e.target.value })}
                            placeholder="48"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="integrations">Entegrasyonlar (virgülle ayırın)</Label>
                        <Input
                          id="integrations"
                          value={formData.integrations}
                          onChange={(e) => setFormData({ ...formData, integrations: e.target.value })}
                          placeholder="Slack, Google Sheets, Trello"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="metadata" className="space-y-4 mt-0">

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Tags className="h-4 w-4" />
                          Platform Etiketleri
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Filter className="mr-2 h-4 w-4" />
                              {formData.tag_ids.length > 0 ? `${formData.tag_ids.length} etiket seçildi` : 'Etiket seç'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <Command>
                              <CommandInput placeholder="Etiket ara..." value={tagSearch} onValueChange={setTagSearch} />
                              <CommandList>
                                <CommandEmpty>Etiket bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                  {filteredTags.map((tag) => (
                                    <CommandItem
                                      key={tag.id}
                                      onSelect={() => toggleTag(tag.id)}
                                    >
                                      <Checkbox
                                        checked={formData.tag_ids.includes(tag.id)}
                                        className="mr-2"
                                      />
                                      {tag.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {formData.tag_ids.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tag_ids.map((tagId) => {
                              const tag = automationTags.find(t => t.id === tagId);
                              return tag ? (
                                <Badge key={tagId} variant="secondary" className="gap-1">
                                  {tag.label}
                                  <button
                                    type="button"
                                    onClick={() => toggleTag(tagId)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="tags">Özel Etiketler (virgülle ayırın)</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="api, automation, webhook"
                        />
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="changelog_url">Değişiklik Günlüğü URL</Label>
                        <Input
                          id="changelog_url"
                          type="url"
                          value={formData.changelog_url}
                          onChange={(e) => setFormData({ ...formData, changelog_url: e.target.value })}
                          placeholder="https://changelog.example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="release_notes">Sürüm Notları</Label>
                        <Textarea
                          id="release_notes"
                          value={formData.release_notes}
                          onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                          rows={4}
                          placeholder="Bu sürümdeki yenilikler ve düzeltmeler..."
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Yayınla</Label>
                          <p className="text-xs text-muted-foreground">Otomasyonu hemen yayınlamak istiyor musunuz?</p>
                        </div>
                        <Switch
                          checked={formData.is_published}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                        />
                      </div>
                    </TabsContent>

                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          setEditingAutomation(null);
                          setFormData(createInitialFormState());
                        }}
                        className="flex-1"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                        disabled={formUploading || formSubmitting || !formData.title || !formData.description || !formData.price}
                      >
                        {formSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            {editingAutomation ? (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Güncelle
                              </>
                            ) : (
                              <>
                                <Rocket className="mr-2 h-4 w-4" />
                                Yayınla
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </ScrollArea>
              </Tabs>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Package, label: 'Toplam Ürün', value: stats.totalProducts, gradient: 'from-purple-600 to-blue-600' },
            { icon: TrendingUp, label: 'Toplam Satış', value: stats.totalSales, gradient: 'from-pink-600 to-rose-600' },
            { icon: DollarSign, label: 'Bakiye', value: `${stats.totalEarnings.toLocaleString('tr-TR')} ₺`, gradient: 'from-green-600 to-emerald-600' },
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
                  <IconBox icon={stat.icon} gradient={stat.gradient} size="sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Automations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
        >
          <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm">
            <h2 className="mb-6 text-2xl font-bold">Otomasyonlarım</h2>
            {automations.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto mb-4 h-16 w-16 text-purple-400/50" />
                <p className="mb-4 text-foreground/60">Henüz otomasyon eklemediniz</p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Otomasyonunuzu Ekleyin
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {automations.map((automation, index) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                    
                    <div className="relative h-full overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm">
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                        {(automation as any).image_path ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`}
                            alt={automation.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : automation.image_url ? (
                          <Image src={automation.image_url} alt={automation.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-16 w-16 text-purple-400/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="mb-2 text-xl font-bold line-clamp-2 transition-colors group-hover:text-purple-400">{automation.title}</h3>
                          <p className="text-sm text-foreground/70 line-clamp-2">{automation.description}</p>
                        </div>

                        {/* Status Badges */}
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <Badge variant={automation.is_published ? 'default' : 'secondary'} className="text-xs">
                            {automation.is_published ? 'Yayında' : 'Taslak'}
                          </Badge>
                          <Badge variant={automation.admin_approved ? 'default' : 'secondary'} className="text-xs">
                            {automation.admin_approved ? 'Onaylı' : 'Onay Bekliyor'}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-foreground/70">
                            <TrendingUp className="h-3 w-3" />
                            {automation.total_sales} satış
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                          <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {automation.price.toLocaleString('tr-TR')} ₺
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(automation)} className="hover:bg-purple-500/10">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(automation.id)} className="hover:bg-red-500/10 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
