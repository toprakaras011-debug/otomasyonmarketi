// Türkiye banka IBAN prefix'leri
const BANK_PREFIXES: Record<string, string> = {
  'TR33': 'Türkiye İş Bankası',
  'TR32': 'Türkiye İş Bankası',
  'TR64': 'Ziraat Bankası',
  'TR62': 'Ziraat Bankası',
  'TR46': 'Akbank',
  'TR45': 'Akbank',
  'TR67': 'Garanti BBVA',
  'TR66': 'Garanti BBVA',
  'TR20': 'Türkiye Halk Bankası',
  'TR12': 'Türkiye Halk Bankası',
  'TR15': 'Vakıfbank',
  'TR16': 'Vakıfbank',
  'TR17': 'Vakıfbank',
  'TR18': 'Vakıfbank',
  'TR19': 'Vakıfbank',
  'TR88': 'Yapı Kredi',
  'TR89': 'Yapı Kredi',
  'TR90': 'Yapı Kredi',
  'TR91': 'Yapı Kredi',
  'TR92': 'Yapı Kredi',
  'TR93': 'Yapı Kredi',
  'TR94': 'Yapı Kredi',
  'TR95': 'Yapı Kredi',
  'TR96': 'Yapı Kredi',
  'TR97': 'Yapı Kredi',
  'TR98': 'Yapı Kredi',
  'TR99': 'Yapı Kredi',
  'TR01': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR02': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR03': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR04': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR05': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR06': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR07': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR08': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR09': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR10': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR11': 'Türkiye Cumhuriyet Merkez Bankası',
  'TR13': 'Türkiye Halk Bankası',
  'TR14': 'Türkiye Halk Bankası',
  'TR21': 'Türkiye Halk Bankası',
  'TR22': 'Türkiye Halk Bankası',
  'TR23': 'Türkiye Halk Bankası',
  'TR24': 'Türkiye Halk Bankası',
  'TR25': 'Türkiye Halk Bankası',
  'TR26': 'Türkiye Halk Bankası',
  'TR27': 'Türkiye Halk Bankası',
  'TR28': 'Türkiye Halk Bankası',
  'TR29': 'Türkiye Halk Bankası',
  'TR30': 'Türkiye Halk Bankası',
  'TR31': 'Türkiye Halk Bankası',
  'TR34': 'Türkiye İş Bankası',
  'TR35': 'Türkiye İş Bankası',
  'TR36': 'Türkiye İş Bankası',
  'TR37': 'Türkiye İş Bankası',
  'TR38': 'Türkiye İş Bankası',
  'TR39': 'Türkiye İş Bankası',
  'TR40': 'Türkiye İş Bankası',
  'TR41': 'Türkiye İş Bankası',
  'TR42': 'Türkiye İş Bankası',
  'TR43': 'Türkiye İş Bankası',
  'TR44': 'Türkiye İş Bankası',
  'TR47': 'Akbank',
  'TR48': 'Akbank',
  'TR49': 'Akbank',
  'TR50': 'Akbank',
  'TR51': 'Akbank',
  'TR52': 'Akbank',
  'TR53': 'Akbank',
  'TR54': 'Akbank',
  'TR55': 'Akbank',
  'TR56': 'Akbank',
  'TR57': 'Akbank',
  'TR58': 'Akbank',
  'TR59': 'Akbank',
  'TR60': 'Akbank',
  'TR61': 'Akbank',
  'TR63': 'Ziraat Bankası',
  'TR65': 'Ziraat Bankası',
  'TR68': 'Garanti BBVA',
  'TR69': 'Garanti BBVA',
  'TR70': 'Garanti BBVA',
  'TR71': 'Garanti BBVA',
  'TR72': 'Garanti BBVA',
  'TR73': 'Garanti BBVA',
  'TR74': 'Garanti BBVA',
  'TR75': 'Garanti BBVA',
  'TR76': 'Garanti BBVA',
  'TR77': 'Garanti BBVA',
  'TR78': 'Garanti BBVA',
  'TR79': 'Garanti BBVA',
  'TR80': 'Garanti BBVA',
  'TR81': 'Garanti BBVA',
  'TR82': 'Garanti BBVA',
  'TR83': 'Garanti BBVA',
  'TR84': 'Garanti BBVA',
  'TR85': 'Garanti BBVA',
  'TR86': 'Garanti BBVA',
  'TR87': 'Garanti BBVA',
};

/**
 * IBAN'dan banka adını döndürür
 */
export function getBankNameFromIban(iban: string): string | null {
  if (!iban || iban.length < 4) return null;
  
  // IBAN'ı temizle (boşluk ve tire kaldır)
  const cleanIban = iban.replace(/[\s-]/g, '').toUpperCase();
  
  // TR ile başlamalı
  if (!cleanIban.startsWith('TR')) return null;
  
  // İlk 4 karakteri al (TR + 2 haneli banka kodu)
  const prefix = cleanIban.substring(0, 4);
  
  return BANK_PREFIXES[prefix] || null;
}

/**
 * IBAN formatını doğrular (esnek - boşluklu girişlere izin verir)
 */
export function validateIban(iban: string): boolean {
  if (!iban) return false;
  
  // IBAN'ı temizle (boşluk, tire ve diğer karakterleri kaldır)
  const cleanIban = iban.replace(/[\s\-_.,]/g, '').toUpperCase();
  
  // Minimum uzunluk kontrolü (TR + en az 4 karakter)
  if (cleanIban.length < 6) return false;
  
  // TR ile başlamalı
  if (!cleanIban.startsWith('TR')) {
    return false;
  }
  
  // Türkiye IBAN'ı 26 karakter olmalı (TR + 24 rakam/harf)
  if (cleanIban.length !== 26) {
    return false;
  }
  
  // Sadece rakam ve harf içermeli (TR'den sonra sadece rakam olmalı)
  if (!/^TR[0-9]{24}$/.test(cleanIban)) {
    return false;
  }
  
  return true;
}

