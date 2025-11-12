# Çalışan Takip Sistemi - SMD İnşaat

Çoklu şantiye desteğine sahip, modern ve kullanıcı dostu çalışan yoklama ve takip sistemi.

## 🚀 Özellikler

### 🏗️ Şantiye Yönetimi
- Birden fazla şantiye oluşturma
- Şantiyeleri kapatma/açma (silmeden devre dışı bırakma)
- Aktif şantiye seçimi ve context temelli kullanım
- Aktif şantiyeye göre menü ve verilerin otomatik filtrelenmesi

### 📋 Günlük Yoklama
- Seçili şantiyenin çalışanlarını listeler
- Geldi/Gelmedi durumunu tek tıkla değiştirir
- Tarih seçici ile geçmiş kayıtları görüntüler
- Anlık istatistikler (toplam çalışan, gelen sayısı)

### 👥 Çalışan Yönetimi
- Şantiye bazlı çalışan havuzları
- TC Kimlik No doğrulaması ve arama
- Çalışan ekleme/düzenleme/pasifleştirme
- Pasif çalışanları tekrar aktif etme
- Aynı TC için uyarı ve reaktivasyon akışı

### 📊 Raporlama
- Şantiye bazlı aylık yoklama raporları
- Her çalışan için detaylı istatistikler
- Geldiği günlerin listesi
- Excel (CSV) dışa aktarma ve yazdırma desteği

### 🎨 Arayüz
- Modern ve kullanıcı dostu tasarım
- Dark/Light mode desteği
- Responsive (mobil, tablet, masaüstü)
- Tailwind CSS ile stillendirilmiş
- Smooth animasyonlar ve geçişler

## 🛠️ Teknolojiler

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS
- **Database:** Firebase Firestore
- **Icons:** Lucide React
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## 📦 Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd calisan-takip-maa
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Firebase projenizi oluşturun:
   - [Firebase Console](https://console.firebase.google.com/) üzerinden yeni bir proje oluşturun
   - Firestore Database'i etkinleştirin
   - Web uygulaması ekleyin ve config bilgilerini alın

4. Ortam değişkenlerini ayarlayın:
   - `.env.local` dosyası oluşturun
   - Firebase config değerlerini ekleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

6. Tarayıcınızda açın:
```
http://localhost:3000
```

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── calisanlar/        # Çalışanlar sayfası
│   ├── raporlar/          # Raporlar sayfası
│   ├── layout.tsx         # Ana layout
│   └── page.tsx           # Ana sayfa (Günlük Yoklama)
├── components/            # React bileşenleri
│   └── Navbar.tsx         # Navigation bar
├── contexts/              # React Context'leri
│   └── ThemeContext.tsx   # Dark/Light mode yönetimi
├── lib/                   # Yardımcı fonksiyonlar ve servisler
│   ├── firebase.ts        # Firebase yapılandırması
│   ├── employeeService.ts # Çalışan işlemleri
│   ├── attendanceService.ts # Yoklama işlemleri
│   └── utils.ts           # Yardımcı fonksiyonlar
└── types/                 # TypeScript tip tanımları
    └── index.ts
```

## 🔥 Firestore Koleksiyonları

### `sites` (Şantiyeler)
```typescript
{
  name: string;        // Şantiye adı
  code?: string;
  location?: string;
  description?: string;
  isActive: boolean;   // Şantiye açık mı?
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `employees` (Çalışanlar)
```typescript
{
  siteId: string;       // Şantiye ID'si
  tc: string;
  fullName: string;
  disabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `attendance` (Yoklama)
```typescript
{
  siteId: string;        // Şantiye ID'si
  employeeId: string;    // Çalışan ID'si
  date: string;          // YYYY-MM-DD
  status: 'present' | 'absent';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🎯 Kullanım

### Şantiye Yönetimi
1. "Şantiyeler" sayfasına gidin
2. "Yeni Şantiye Oluştur" butonunu açın
3. Şantiye bilgilerini girip kaydedin
4. Gerekirse aynı sayfadan şantiyeyi kapatabilir veya tekrar açabilirsiniz

### Çalışan Ekleme
1. Aktif şantiyeyi seçin
2. "Çalışanlar" sayfasına gidin
2. "Yeni Çalışan Ekle" butonuna tıklayın
3. TC Kimlik No, Ad ve Soyad bilgilerini girin
4. "Ekle" butonuna tıklayın

**Not:** Aynı TC ile kayıtlı pasif bir çalışan varsa, sistem tekrar aktif etme seçeneği sunar.

### Günlük Yoklama
1. Üst menüden şantiye seçin
2. Ana sayfada bugünün tarihi otomatik seçilir
3. Her çalışan için "Geldi" veya "Gelmedi" butonuna tıklayın
3. Değişiklikler anında kaydedilir
4. Tarih seçerek geçmiş günleri görüntüleyebilirsiniz

### Rapor Alma
1. Şantiyenizi seçtikten sonra "Raporlar" sayfasına gidin
2. Ay ve yıl seçin
3. "Excel İndir" ile CSV formatında indirebilirsiniz
4. "Yazdır" ile doğrudan yazdırabilirsiniz

## 🔒 Güvenlik

- Tüm Firestore işlemleri client-side yapılır
- Firebase Security Rules'u ayarlamayı unutmayın
- Üretim ortamında mutlaka güvenlik kuralları ekleyin

### Örnek Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sites/{document=**} {
      allow read, write: if true; // TODO: Auth eklendiğinde güncelle
    }
    match /employees/{document=**} {
      allow read, write: if true; // TODO: Auth eklendiğinde güncelle
    }
    match /attendance/{document=**} {
      allow read, write: if true; // TODO: Auth eklendiğinde güncelle
    }
  }
}
```

## 📝 Notlar

- TC Kimlik No doğrulaması yapılır (algoritma kontrolü)
- Çalışanlar silinmez, sadece pasifleştirilir
- Pasif çalışanlar geçmiş raporlarda görünür
- Tüm tarihler Türkiye saat diliminde saklanır
- Excel export UTF-8 BOM ile yapılır (Türkçe karakter desteği)

## 🚀 Production Build

Üretim için build almak:

```bash
npm run build
npm start
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için: [email protected]
