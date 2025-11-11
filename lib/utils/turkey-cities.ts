// Türkiye İl ve İlçe Verileri
export interface City {
  code: string;
  name: string;
  districts: string[];
}

export const TURKEY_CITIES: City[] = [
  { code: '01', name: 'Adana', districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Karaisalı', 'Aladağ', 'Ceyhan', 'Feke', 'İmamoğlu', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Tufanbeyli', 'Yumurtalık'] },
  { code: '02', name: 'Adıyaman', districts: ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'] },
  { code: '03', name: 'Afyonkarahisar', districts: ['Merkez', 'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'] },
  { code: '04', name: 'Ağrı', districts: ['Merkez', 'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Patnos', 'Taşlıçay', 'Tutak'] },
  { code: '05', name: 'Amasya', districts: ['Merkez', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merzifon', 'Suluova', 'Taşova'] },
  { code: '06', name: 'Ankara', districts: ['Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Güdül', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar', 'Yenimahalle', 'Gölbaşı', 'Keçiören', 'Mamak', 'Sincan', 'Kazan', 'Akyurt', 'Etimesgut', 'Evren', 'Pursaklar'] },
  { code: '07', name: 'Antalya', districts: ['Akseki', 'Alanya', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'Kaş', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik', 'Demre', 'İbradı', 'Kemer', 'Aksu', 'Döşemealtı', 'Kepez', 'Konyaaltı', 'Muratpaşa'] },
  { code: '08', name: 'Artvin', districts: ['Merkez', 'Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Murgul', 'Şavşat', 'Yusufeli'] },
  { code: '09', name: 'Aydın', districts: ['Merkez', 'Bozdoğan', 'Çine', 'Germencik', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar', 'Buharkent', 'İncirliova', 'Karpuzlu', 'Didim'] },
  { code: '10', name: 'Balıkesir', districts: ['Merkez', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk', 'Altıeylül', 'Karesi'] },
  { code: '11', name: 'Bilecik', districts: ['Merkez', 'Bozüyük', 'Gölpazarı', 'İnhisar', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'] },
  { code: '12', name: 'Bingöl', districts: ['Merkez', 'Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Yayladere', 'Yedisu'] },
  { code: '13', name: 'Bitlis', districts: ['Merkez', 'Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Mutki', 'Tatvan'] },
  { code: '14', name: 'Bolu', districts: ['Merkez', 'Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Yeniçağa'] },
  { code: '15', name: 'Burdur', districts: ['Merkez', 'Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Tefenni', 'Yeşilova'] },
  { code: '16', name: 'Bursa', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'Orhangazi', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Marmara', 'Mustafakemalpaşa', 'Orhaneli', 'Orhangazi', 'Yenişehir', 'Büyükorhan', 'Harmancık', 'İnegöl', 'Gürsu', 'Kestel'] },
  { code: '17', name: 'Çanakkale', districts: ['Merkez', 'Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Yenice'] },
  { code: '18', name: 'Çankırı', districts: ['Merkez', 'Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı'] },
  { code: '19', name: 'Çorum', districts: ['Merkez', 'Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'] },
  { code: '20', name: 'Denizli', districts: ['Merkez', 'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Sarayköy', 'Serinhisar', 'Tavas', 'Pamukkale'] },
  { code: '21', name: 'Diyarbakır', districts: ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir', 'Kayapınar'] },
  { code: '22', name: 'Edirne', districts: ['Merkez', 'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Süloğlu', 'Uzunköprü'] },
  { code: '23', name: 'Elazığ', districts: ['Merkez', 'Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Palu', 'Sivrice'] },
  { code: '24', name: 'Erzincan', districts: ['Merkez', 'Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'] },
  { code: '25', name: 'Erzurum', districts: ['Merkez', 'Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'] },
  { code: '26', name: 'Eskişehir', districts: ['Odunpazarı', 'Tepebaşı', 'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar'] },
  { code: '27', name: 'Gaziantep', districts: ['Şahinbey', 'Şehitkamil', 'Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Yavuzeli'] },
  { code: '28', name: 'Giresun', districts: ['Merkez', 'Alucra', 'Bulancak', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'] },
  { code: '29', name: 'Gümüşhane', districts: ['Merkez', 'Kelkit', 'Köse', 'Kürtün', 'Şiran', 'Torul'] },
  { code: '30', name: 'Hakkari', districts: ['Merkez', 'Çukurca', 'Şemdinli', 'Yüksekova'] },
  { code: '31', name: 'Hatay', districts: ['Antakya', 'Altınözü', 'Belen', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Reyhanlı', 'Samandağ', 'Yayladağı', 'Arsuz', 'Defne', 'Payas'] },
  { code: '32', name: 'Isparta', districts: ['Merkez', 'Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'] },
  { code: '33', name: 'Mersin', districts: ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus'] },
  { code: '34', name: 'İstanbul', districts: ['Adalar', 'Bakırköy', 'Beşiktaş', 'Beykoz', 'Beyoğlu', 'Çatalca', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Kadıköy', 'Kartal', 'Sarıyer', 'Silivri', 'Şile', 'Şişli', 'Üsküdar', 'Zeytinburnu', 'Büyükçekmece', 'Kağıthane', 'Küçükçekmece', 'Pendik', 'Ümraniye', 'Bayrampaşa', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Güngören', 'Maltepe', 'Sultanbeyli', 'Tuzla', 'Esenler', 'Arnavutköy', 'Ataşehir', 'Başakşehir', 'Beylikdüzü', 'Çekmeköy', 'Esenyurt', 'Sancaktepe', 'Sultangazi'] },
  { code: '35', name: 'İzmir', districts: ['Aliağa', 'Bayındır', 'Bergama', 'Bornova', 'Çeşme', 'Dikili', 'Foça', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Menemen', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla', 'Beydağ', 'Buca', 'Konak', 'Menderes', 'Balçova', 'Çiğli', 'Gaziemir', 'Güzelbahçe', 'Narlıdere'] },
  { code: '36', name: 'Kars', districts: ['Merkez', 'Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Sarıkamış', 'Selim', 'Susuz'] },
  { code: '37', name: 'Kastamonu', districts: ['Merkez', 'Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'] },
  { code: '38', name: 'Kayseri', districts: ['Melikgazi', 'Kocasinan', 'Talas', 'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yahyalı', 'Yeşilhisar'] },
  { code: '39', name: 'Kırklareli', districts: ['Merkez', 'Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Pehlivanköy', 'Pınarhisar', 'Vize'] },
  { code: '40', name: 'Kırşehir', districts: ['Merkez', 'Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Mucur'] },
  { code: '41', name: 'Kocaeli', districts: ['İzmit', 'Gebze', 'Gölcük', 'Kandıra', 'Karamürsel', 'Körfez', 'Derince', 'Başiskele', 'Çayırova', 'Darıca', 'Dilovası', 'Kartepe'] },
  { code: '42', name: 'Konya', districts: ['Meram', 'Karatay', 'Selçuklu', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'] },
  { code: '43', name: 'Kütahya', districts: ['Merkez', 'Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'] },
  { code: '44', name: 'Malatya', districts: ['Battalgazi', 'Yeşilyurt', 'Akçadağ', 'Arapgir', 'Arguvan', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan'] },
  { code: '45', name: 'Manisa', districts: ['Şehzadeler', 'Yunusemre', 'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Turgutlu'] },
  { code: '46', name: 'Kahramanmaraş', districts: ['Onikişubat', 'Dulkadiroğlu', 'Afşin', 'Andırın', 'Çağlayancerit', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Pazarcık', 'Türkoğlu'] },
  { code: '47', name: 'Mardin', districts: ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'] },
  { code: '48', name: 'Muğla', districts: ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Ula', 'Yatağan', 'Dalaman', 'Seydikemer'] },
  { code: '49', name: 'Muş', districts: ['Merkez', 'Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Varto'] },
  { code: '50', name: 'Nevşehir', districts: ['Merkez', 'Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Ürgüp'] },
  { code: '51', name: 'Niğde', districts: ['Merkez', 'Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Ulukışla'] },
  { code: '52', name: 'Ordu', districts: ['Altınordu', 'Akkuş', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'] },
  { code: '53', name: 'Rize', districts: ['Merkez', 'Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Pazar'] },
  { code: '54', name: 'Sakarya', districts: ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'] },
  { code: '55', name: 'Samsun', districts: ['Atakum', 'Canik', 'İlkadım', 'Tekkeköy', 'Alaçam', 'Asarcık', 'Ayvacık', 'Bafra', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Terme', 'Vezirköprü', 'Yakakent'] },
  { code: '56', name: 'Siirt', districts: ['Merkez', 'Baykan', 'Eruh', 'Kurtalan', 'Pervari', 'Şirvan', 'Tillo'] },
  { code: '57', name: 'Sinop', districts: ['Merkez', 'Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Saraydüzü', 'Türkeli'] },
  { code: '58', name: 'Sivas', districts: ['Merkez', 'Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Şarkışla', 'Suşehri', 'Ulaş', 'Yıldızeli', 'Zara'] },
  { code: '59', name: 'Tekirdağ', districts: ['Süleymanpaşa', 'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Şarköy'] },
  { code: '60', name: 'Tokat', districts: ['Merkez', 'Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Niksar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'] },
  { code: '61', name: 'Trabzon', districts: ['Ortahisar', 'Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Şalpazarı', 'Sürmene', 'Tonya', 'Vakfıkebir', 'Yomra'] },
  { code: '62', name: 'Tunceli', districts: ['Merkez', 'Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'] },
  { code: '63', name: 'Şanlıurfa', districts: ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Halfeti', 'Harran', 'Hilvan', 'Siverek', 'Suruç', 'Viranşehir'] },
  { code: '64', name: 'Uşak', districts: ['Merkez', 'Banaz', 'Eşme', 'Karahallı', 'Sivaslı', 'Ulubey'] },
  { code: '65', name: 'Van', districts: ['İpekyolu', 'Tuşba', 'Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'Muradiye', 'Özalp', 'Saray'] },
  { code: '66', name: 'Yozgat', districts: ['Merkez', 'Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yerköy', 'Yenifakılı'] },
  { code: '67', name: 'Zonguldak', districts: ['Merkez', 'Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu'] },
  { code: '68', name: 'Aksaray', districts: ['Merkez', 'Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Ortaköy', 'Sarıyahşi'] },
  { code: '69', name: 'Bayburt', districts: ['Merkez', 'Aydıntepe', 'Demirözü'] },
  { code: '70', name: 'Karaman', districts: ['Merkez', 'Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Sarıveliler'] },
  { code: '71', name: 'Kırıkkale', districts: ['Merkez', 'Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Sulakyurt', 'Yahşihan'] },
  { code: '72', name: 'Batman', districts: ['Merkez', 'Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Sason'] },
  { code: '73', name: 'Şırnak', districts: ['Merkez', 'Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Silopi', 'Uludere'] },
  { code: '74', name: 'Bartın', districts: ['Merkez', 'Amasra', 'Kurucaşile', 'Ulus'] },
  { code: '75', name: 'Ardahan', districts: ['Merkez', 'Çıldır', 'Damal', 'Göle', 'Hanak', 'Posof'] },
  { code: '76', name: 'Iğdır', districts: ['Merkez', 'Aralık', 'Karakoyunlu', 'Tuzluca'] },
  { code: '77', name: 'Yalova', districts: ['Merkez', 'Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Termal'] },
  { code: '78', name: 'Karabük', districts: ['Merkez', 'Eflani', 'Eskipazar', 'Ovacık', 'Safranbolu', 'Yenice'] },
  { code: '79', name: 'Kilis', districts: ['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli'] },
  { code: '80', name: 'Osmaniye', districts: ['Merkez', 'Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Sumbas', 'Toprakkale'] },
  { code: '81', name: 'Düzce', districts: ['Merkez', 'Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Yığılca'] },
];

// İl listesini döndür
export const getCities = (): City[] => TURKEY_CITIES;

// İl adına göre ilçeleri döndür
export const getDistrictsByCity = (cityName: string): string[] => {
  const city = TURKEY_CITIES.find(c => c.name === cityName);
  return city ? city.districts : [];
};

// İl koduna göre ilçeleri döndür
export const getDistrictsByCityCode = (cityCode: string): string[] => {
  const city = TURKEY_CITIES.find(c => c.code === cityCode);
  return city ? city.districts : [];
};

