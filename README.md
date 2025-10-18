# Çalışan Takip Sistemi

MAA Mimarlık için çalışan yoklama ve yönetim sistemi. Firebase Firestore ve Google Sheets entegrasyonu ile çalışır.

## 🎯 Özellikler

- ✅ **Çalışan Yönetimi**: Ekle, düzenle, sil (soft delete)
- ✅ **TC Numarası ile Benzersiz Kayıt**: Aynı TC ile tekrar ekleme yapılırsa mevcut kayıt aktive edilir
- ✅ **Yoklama Sistemi**: Günlük ve geçmiş tarihli yoklama kaydı
- ✅ **Geçmiş Görüntüleme**: Tarih aralığı ve çalışan filtresi ile detaylı raporlama
- ✅ **Google Sheets Entegrasyonu**: Otomatik veri aktarımı (append-only mod)
- ✅ **Firestore Veritabanı**: Güvenli ve hızlı veri saklama
- ✅ **Modern UI**: Responsive, kullanıcı dostu arayüz

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) üzerinden yeni proje oluştur
2. **Firestore Database** oluştur:
   - Test modunda başlat (rules: `allow read, write: if true;`)
   - **Önemli**: Production'da güvenlik kurallarını sıkılaştırın!
3. **Proje Ayarları** → **Genel** → Web uygulaması ekle
4. Firebase yapılandırma değerlerini kopyala
5. **Proje Ayarları** → **Hizmet Hesapları** → **Yeni özel anahtar oluştur**
   - JSON dosyasını indir ve sakla

### 3. Google Sheets API Kurulumu

1. [Google Cloud Console](https://console.cloud.google.com/) üzerinden Firebase projenizi seç
2. **APIs & Services** → **Enable APIs** → "Google Sheets API" etkinleştir
3. Firebase'den indirdiğiniz service account'u kullanacaksınız (aynı credentials)
4. Yeni bir Google Sheets dosyası oluştur:
   - İlk satıra başlıklar: `Tarih | Çalışan ID | Ad Soyad | Durum | Kaynak | Düzenleme Zamanı`
   - Sheets ID'yi URL'den al: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
5. Sheets'i service account email ile paylaş (Editor yetkisi):
   - Şu formatta: `firebase-adminsdk-xxxxx@{PROJECT_ID}.iam.gserviceaccount.com`

### 4. Environment Variables

`.env.local` dosyası oluştur (`.env.example` dosyasını referans al):

```bash
cp .env.example .env.local
```

Değerleri doldur:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Firebase Admin SDK
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"

# Google Sheets
SHEET_ID=your_sheet_id_here
```

**Önemli Notlar:**
- `FIREBASE_PRIVATE_KEY` değişkeninde `\n` karakterlerini olduğu gibi bırak
- Çift tırnak içinde olmalı
- Service account JSON'dan `private_key` alanını kopyala

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── admin/
│   │   ├── employees/        # Çalışan yönetimi sayfası
│   │   ├── attendance/       # Yoklama sayfası
│   │   └── history/          # Geçmiş kayıtlar sayfası
│   ├── api/
│   │   ├── employees/        # Çalışan CRUD API
│   │   └── attendance/       # Yoklama API
│   │       └── save/         # Yoklama kaydetme
│   ├── layout.tsx
│   └── page.tsx              # Ana sayfa
├── components/
│   └── Navbar.tsx            # Navigasyon menüsü
├── lib/
│   ├── firebase.ts           # Firebase Client SDK
│   ├── firebaseAdmin.ts      # Firebase Admin SDK
│   └── sheets.ts             # Google Sheets API
└── types/
    └── index.ts              # TypeScript tipleri
```

## 🗄️ Veri Modeli

### Firestore Collections

#### `employees/{employeeId}`
```typescript
{
  fullName: string,
  tc: string,          // TC Kimlik No (unique)
  isDeleted: boolean,  // Soft delete
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `attendance/{YYYY-MM-DD}/entries/{employeeId}`
```typescript
{
  employeeRef: string,         // Reference: employees/{id}
  status: 'present' | 'absent',
  ts: Timestamp,
  by: string                   // Admin kullanıcı
}
```

### Google Sheets Format (Upsert Mode + Tarih Grupları)

```
| Tarih      | Çalışan ID | Ad Soyad      | Durum  | Kaynak     | Düzenleme Zamanı     |
|------------|-----------|---------------|---------|------------|---------------------|
| 2024-01-17 | abc123    | Ahmet Yılmaz  | Geldi   | admin_save | 2024-01-17T10:30:00Z |
| 2024-01-17 | def456    | Ayşe Kaya     | Gelmedi | admin_save | 2024-01-17T10:30:00Z |
|            |           |               |         |            |                     | ← 3 boş satır
|            |           |               |         |            |                     |
|            |           |               |         |            |                     |
| 2024-01-16 | abc123    | Ahmet Yılmaz  | Geldi   | admin_save | 2024-01-16T09:15:00Z |
| 2024-01-16 | def456    | Ayşe Kaya     | Geldi   | admin_save | 2024-01-16T09:15:00Z |
|            |           |               |         |            |                     | ← 3 boş satır
|            |           |               |         |            |                     |
|            |           |               |         |            |                     |
| 2024-01-15 | abc123    | Ahmet Yılmaz  | Gelmedi | admin_save | 2024-01-15T08:00:00Z |
```

**Upsert Yaklaşımı (Aktif):**
- ✅ Her kaydetme/düzenleme işlemi mevcut satırı arar
- ✅ **Aynı tarih + çalışan varsa:** O satırı günceller
- ✅ **Yoksa:** Yeni satır ekler
- ✅ Sheets'te her tarih+çalışan kombinasyonu tek satırda tutulur
- ✅ **Her tarih grubu arasında 3 boş satır** - Görsel olarak daha temiz!
- ✅ Tarihler en yeni üstte sıralanır (descending)
- ✅ Daha temiz ve okunabilir Sheets

**Alternatif: Append-Only Modu**
- İsterseniz `appendToSheet()` fonksiyonunu kullanabilirsiniz
- Her işlem yeni satır ekler (audit trail)
- `api/attendance/save/route.ts` içinde `upsertToSheet` yerine `appendToSheet` kullanın
- Not: Append-only modda tarih grupları arası boşluk olmaz

## 🔐 Güvenlik

⚠️ **Bu test sürümüdür!** Production kullanımı için:

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Test modu - PRODUCTION'DA DEĞİŞTİR!
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Production için örnek:
    // match /employees/{employeeId} {
    //   allow read: if request.auth != null;
    //   allow write: if request.auth != null && request.auth.token.admin == true;
    // }
  }
}
```

### Öneriler

1. **Authentication Ekle**: Firebase Authentication ile kullanıcı girişi
2. **Admin Kontrolü**: Custom claims ile admin rolü
3. **Rate Limiting**: API route'larına rate limit ekle
4. **CORS Ayarları**: Production domain'leri beyaz listeye al
5. **Env Gizliliği**: `.env.local` asla commit etme (`.gitignore`'da var)

## 📝 Kullanım

### 1. Çalışan Ekle

1. **Çalışan Havuzu** sayfasına git
2. **Yeni Çalışan** butonuna tıkla
3. Ad Soyad ve TC Kimlik No gir
4. **Ekle** butonuna tıkla

**Not:** Aynı TC ile tekrar ekleme yapılırsa:
- Mevcut kayıt silinmiş ise → Kayıt aktive edilir (`isDeleted=false`)
- Mevcut kayıt aktif ise → Hata mesajı gösterilir

### 2. Yoklama Al

1. **Yoklama** sayfasına git
2. Tarih seçici ile istediğin tarihi seç (varsayılan: bugün)
3. Her çalışan için durumu seç:
   - Seçilmedi (varsayılan)
   - Geldi (yeşil)
   - Gelmedi (kırmızı)
4. **Kaydet** butonuna tıkla

### 3. Geçmiş Görüntüle

1. **Geçmiş** sayfasına git
2. Başlangıç ve bitiş tarihi seç
3. İsteğe bağlı: Belirli bir çalışan filtrele
4. Kayıtlar otomatik yüklenecek

## 🛠️ Geliştirme

### Build & Deploy

```bash
# Production build
npm run build

# Production server başlat
npm start

# Lint kontrol
npm run lint
```

### Vercel Deploy

1. Projeyi GitHub'a push et
2. [Vercel](https://vercel.com/) hesabınla bağlan
3. Proje import et
4. Environment Variables ekle (`.env.local` içeriği)
5. Deploy et

## 🐛 Sorun Giderme

### Firebase Admin SDK Hatası

**Hata:** `Error: Failed to parse private key`

**Çözüm:**
- `.env.local` dosyasında `FIREBASE_PRIVATE_KEY` çift tırnak içinde olmalı
- `\n` karakterlerini olduğu gibi kopyala (gerçek newline değil)

### Google Sheets Hatası

**Hata:** `Permission denied` veya `Requested entity was not found`

**Çözüm:**
1. Sheets ID doğru mu kontrol et
2. Service account email ile Sheets'i paylaşmayı unutma
3. Google Sheets API'nin etkin olduğunu doğrula

### Firestore Bağlantı Hatası

**Çözüm:**
1. Firebase proje ID'nin doğru olduğunu kontrol et
2. Firestore Database'in oluşturulduğundan emin ol
3. Test modunda rules'ların `allow read, write: if true;` olduğunu doğrula

## 📄 Lisans

Bu proje MAA Mimarlık için özel olarak geliştirilmiştir.

## 🤝 Destek

Sorularınız için: [İletişim Bilgileri]

---

**Geliştirici Notu:** Bu sistem test sürümüdür. Production ortamında kullanmadan önce güvenlik ayarlarını mutlaka sıkılaştırın!
