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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plus, TrendingUp, DollarSign, Package, Pencil, Trash2, Sparkles, Info, Loader2, Wand2, Tags, Layers, FileText, ShieldCheck, Rocket, Zap, Star, Filter, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase, type Automation } from '@/lib/supabase';
import { toast } from 'sonner';
import { FileUpload } from '@/components/file-upload';
import { CATEGORY_DEFINITIONS } from '@/lib/constants/categories';
import { automationTags } from '@/lib/automation-tags';
import { getBankNameFromIban, validateIban } from '@/lib/utils/iban-bank';

const createInitialFormState = () => ({
  title: '',
  description: '',
  long_description: '',
  price: '',
  category_id: '',
  image_path: '',
  file_path: '',
  tags: '',
  tag_ids: [] as string[],
  is_published: true,
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
  const [imageUploading, setImageUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>(() => createInitialFormState());
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'metadata'>('overview');
  const [tagSearch, setTagSearch] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    full_name: '',
    tc_no: '',
    tax_office: '',
    iban: '',
    bank_name: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);

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
        .select('id,username,avatar_url,role,is_admin,is_developer,developer_approved')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!profileData?.is_developer) {
        toast.error('Geliştirici hesabınız yok');
        router.push('/developer/register');
        return;
      }

      setProfile(profileData);
      
      // Fetch payment data separately if needed
      let paymentInfo = null;
      if (profileData) {
        const { data: paymentDataResult } = await supabase
          .from('user_profiles')
          .select('full_name,tc_no,tax_office,iban,bank_name')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        paymentInfo = paymentDataResult;
        
        if (paymentInfo) {
          setPaymentData({
            full_name: paymentInfo.full_name || '',
            tc_no: paymentInfo.tc_no || '',
            tax_office: paymentInfo.tax_office || '',
            iban: paymentInfo.iban || '',
            bank_name: paymentInfo.bank_name || '',
          });
        }
      }

      const [
        { data: automationsData },
        { data: categoriesData },
        { data: purchasesData }
      ] = await Promise.all([
        supabase
          .from('automations')
          .select(`
            id,title,slug,description,price,image_path,file_path,total_sales,rating_avg,created_at,is_published,admin_approved,
            category:categories(id,name,slug)
          `)
          .eq('developer_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id,name,slug').order('name'),
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
      
      // İlk girişte ödeme bilgileri eksikse dialog'u otomatik aç
      if (profileData && (!paymentInfo?.iban || !paymentInfo?.full_name || !paymentInfo?.tc_no)) {
        // Sadece ilk yüklemede aç (localStorage ile kontrol)
        if (typeof window !== 'undefined') {
          const hasShownPaymentDialog = localStorage.getItem('payment_dialog_shown');
          if (!hasShownPaymentDialog) {
            setTimeout(() => {
              setPaymentDialogOpen(true);
              localStorage.setItem('payment_dialog_shown', 'true');
            }, 500);
          }
        }
      }
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
          id,title,slug,description,price,image_path,file_path,total_sales,rating_avg,created_at,is_published,admin_approved,
          category:categories(id,name,slug)
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
      tags: automation.tags?.join(', ') || '',
      tag_ids: automation.tags || [],
      is_published: (automation as any).is_published ?? false,
    }));
    setDialogOpen(true);
  };

  const handleSavePaymentInfo = async () => {
    if (!user) return;

    // Validation
    if (!paymentData.full_name.trim()) {
      toast.error('Ad Soyad zorunludur');
      return;
    }
    if (!paymentData.tc_no.trim() || paymentData.tc_no.length !== 11) {
      toast.error('Geçerli bir TC Kimlik No giriniz (11 haneli)');
      return;
    }
    if (!paymentData.tax_office.trim()) {
      toast.error('Vergi Dairesi zorunludur');
      return;
    }
    if (!paymentData.iban.trim()) {
      toast.error('IBAN zorunludur');
      return;
    }
    if (!validateIban(paymentData.iban)) {
      toast.error('Geçerli bir IBAN giriniz');
      return;
    }

    // Get bank name from IBAN
    const bankName = getBankNameFromIban(paymentData.iban);
    if (!bankName) {
      toast.error('IBAN\'dan banka adı tespit edilemedi');
      return;
    }

    setSavingPayment(true);
    
    // Timeout koruması (60 saniye - increased for slow networks and retries)
    let timeoutCleared = false;
    const timeoutId = setTimeout(() => {
      if (!timeoutCleared) {
        setSavingPayment(false);
        toast.error('İşlem zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.', {
          duration: 8000,
          description: 'Bağlantı sorunu yaşıyorsanız, sayfayı yenileyip tekrar deneyin.',
        });
      }
    }, 60000); // Increased to 60s to accommodate retries
    
    try {
      const cleanIban = paymentData.iban.replace(/[\s\-_.,]/g, '').toUpperCase();
      
      // Retry mechanism for network issues
      let lastError: any = null;
      let data: any = null;
      let error: any = null;
      const maxRetries = 2;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        const result = await supabase
          .from('user_profiles')
          .update({
            full_name: paymentData.full_name.trim(),
            tc_no: paymentData.tc_no.trim(),
            tax_office: paymentData.tax_office.trim(),
            iban: cleanIban,
            bank_name: bankName,
          })
          .eq('id', user.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
        
        // If successful or non-retryable error, break
        if (!error || (error.code !== 'PGRST301' && !error.message?.includes('timeout') && !error.message?.includes('network'))) {
          break;
        }
        
        lastError = error;
      }
      
      // Use last error if all retries failed
      if (error && lastError) {
        error = lastError;
      }

      clearTimeout(timeoutId);
      timeoutCleared = true;

      if (error) {
        console.error('Payment save error:', error);
        // Kolon yoksa daha açıklayıcı hata mesajı
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          toast.error('Veritabanı kolonları eksik. Lütfen SQL migration dosyasını çalıştırın.');
        } else {
          toast.error(error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
        setSavingPayment(false);
        return;
      }

      if (data) {
        // Update local state
        setProfile((prev: any) => ({
          ...prev,
          full_name: paymentData.full_name.trim(),
          tc_no: paymentData.tc_no.trim(),
          tax_office: paymentData.tax_office.trim(),
          iban: cleanIban,
          bank_name: bankName,
        }));

        toast.success('Ödeme bilgileri kaydedildi!');
        setPaymentDialogOpen(false);
        // Dialog gösterildi olarak işaretle
        if (typeof window !== 'undefined') {
          localStorage.setItem('payment_dialog_shown', 'true');
        }
      } else {
        toast.error('Kayıt başarısız. Veri döndürülmedi.');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      timeoutCleared = true;
      console.error('Payment save exception:', error);
      toast.error(error?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleIbanChange = (iban: string) => {
    // IBAN'ı temizle ve büyük harfe çevir
    const cleanIban = iban.replace(/[\s\-_.,]/g, '').toUpperCase();
    setPaymentData({ ...paymentData, iban: cleanIban });
    
    // Auto-detect bank name (temizlenmiş IBAN ile)
    if (cleanIban.length >= 4) {
      const bankName = getBankNameFromIban(cleanIban);
      if (bankName) {
        setPaymentData(prev => ({ ...prev, bank_name: bankName }));
      } else {
        setPaymentData(prev => ({ ...prev, bank_name: '' }));
      }
    }
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
                <DialogDescription>
                  {editingAutomation 
                    ? 'Otomasyon bilgilerinizi güncelleyin ve yayınlayın.'
                    : 'Yeni bir otomasyon ekleyin ve marketplace\'te paylaşın.'}
                  {slugPreview && (
                    <span className="block mt-1">
                      URL Önizleme: <span className="font-mono text-purple-500">/automations/{slugPreview}</span>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={(v) => {
                  // Prevent tab change if uploading
                  if (imageUploading || fileUploading) {
                    toast.warning('Dosya yüklenirken sekme değiştirilemez. Lütfen yükleme işleminin tamamlanmasını bekleyin.');
                    return;
                  }
                  setActiveTab(v as any);
                }} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="flex items-center gap-2" disabled={imageUploading || fileUploading}>
                    <FileText className="h-4 w-4" />
                    Genel
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="flex items-center gap-2" disabled={imageUploading || fileUploading}>
                    <Layers className="h-4 w-4" />
                    Dosyalar
                    {(imageUploading || fileUploading) && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="flex items-center gap-2" disabled={imageUploading || fileUploading}>
                    <Tags className="h-4 w-4" />
                    Etiketler
                  </TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 pr-4">
                  <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Form validation summary */}
                    {(imageUploading || fileUploading) && (
                      <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {imageUploading && fileUploading 
                            ? 'Görsel ve dosya yükleniyor... Lütfen bekleyin. Sekme değiştirmeyin.'
                            : imageUploading 
                            ? 'Görsel yükleniyor... Lütfen bekleyin. Sekme değiştirmeyin.'
                            : 'Dosya yükleniyor... Lütfen bekleyin. Sekme değiştirmeyin.'}
                        </p>
                      </div>
                    )}
                    {!(imageUploading || fileUploading) && (
                      <div className="mb-4 space-y-1">
                        {(!formData.title?.trim() || !formData.description?.trim() || !formData.price || !formData.category_id || !formData.image_path || !formData.file_path) && (
                          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                              ⚠️ Eksik Bilgiler
                            </p>
                            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                              {!formData.title?.trim() && <li>• Başlık gereklidir</li>}
                              {!formData.description?.trim() && <li>• Kısa açıklama gereklidir</li>}
                              {!formData.price && <li>• Fiyat gereklidir</li>}
                              {!formData.category_id && <li>• Kategori seçimi gereklidir</li>}
                              {!formData.image_path && <li>• Otomasyon görseli yüklenmelidir</li>}
                              {!formData.file_path && <li>• Otomasyon dosyası yüklenmelidir</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
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

                    <TabsContent value="assets" className="space-y-4 mt-0" forceMount>
                      <div className={activeTab !== 'assets' ? 'hidden' : ''}>
                        <FileUpload
                          label="Otomasyon Görseli *"
                          bucketName="automation-images"
                          accept="image/*"
                          maxSizeMB={5}
                          fileType="image"
                          userId={user?.id || ''}
                          currentFile={formData.image_path}
                          onUploadComplete={(path) => setFormData({ ...formData, image_path: path })}
                          onUploadingChange={setImageUploading}
                        />

                        <FileUpload
                          label="Otomasyon Dosyası *"
                          bucketName="automation-files"
                          accept=".zip,.rar,.7z,.json,.js,.py,.php,.txt,.md"
                          maxSizeMB={100}
                          fileType="file"
                          userId={user?.id || ''}
                          currentFile={formData.file_path}
                          onUploadComplete={(path) => setFormData({ ...formData, file_path: path })}
                          onUploadingChange={setFileUploading}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          ⚠️ <strong>Önemli:</strong> Otomasyon dosyası için arşiv dosyası (.zip, .rar, .7z) veya kod dosyası (.json, .js, .py, .php) yüklemelisiniz. 
                          Görsel dosyası için yukarıdaki "Otomasyon Görseli" alanını kullanın.
                          <br />
                          📦 <strong>Maksimum dosya boyutu:</strong> 100 MB
                        </p>
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

                      <div className="flex items-center justify-between pt-2">
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
                        disabled={
                          imageUploading || 
                          fileUploading || 
                          formSubmitting || 
                          !formData.title?.trim() || 
                          !formData.description?.trim() || 
                          !formData.price || 
                          !formData.category_id ||
                          !formData.image_path ||
                          !formData.file_path
                        }
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
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
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

      {/* Ödeme Bilgileri Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              Ödeme Bilgileri
            </DialogTitle>
            <DialogDescription>
              Ödeme alabilmek için aşağıdaki bilgileri eksiksiz doldurmanız gerekmektedir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="full_name">
                Ad Soyad *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground inline ml-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Banka hesabınızda kayıtlı ad soyad</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="full_name"
                value={paymentData.full_name}
                onChange={(e) => setPaymentData({ ...paymentData, full_name: e.target.value })}
                placeholder="Ad Soyad"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="tc_no">
                  TC Kimlik No *
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground inline ml-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>11 haneli TC Kimlik Numarası</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="tc_no"
                  value={paymentData.tc_no}
                  onChange={(e) => setPaymentData({ ...paymentData, tc_no: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  placeholder="12345678901"
                  maxLength={11}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tax_office">Vergi Dairesi *</Label>
                <Input
                  id="tax_office"
                  value={paymentData.tax_office}
                  onChange={(e) => setPaymentData({ ...paymentData, tax_office: e.target.value })}
                  placeholder="Örn: Kadıköy Vergi Dairesi"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="iban">
                IBAN *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground inline ml-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>TR ile başlayan 26 haneli IBAN numarası</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="iban"
                value={paymentData.iban}
                onChange={(e) => handleIbanChange(e.target.value)}
                placeholder="TR33 0006 1005 1978 6457 8413 26 (boşluklu girebilirsiniz)"
                required
                className="font-mono"
              />
              {paymentData.bank_name && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Banka: {paymentData.bank_name}
                </p>
              )}
              {paymentData.iban && !validateIban(paymentData.iban) && paymentData.iban.length >= 6 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Geçersiz IBAN formatı (TR ile başlamalı, 26 karakter olmalı)
                </p>
              )}
            </div>

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-foreground/80">
                <strong className="text-blue-600 dark:text-blue-400">Bilgi:</strong> Tüm bilgileriniz güvenli bir şekilde saklanır ve sadece ödeme işlemleri için kullanılır.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleSavePaymentInfo}
              disabled={savingPayment}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {savingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
