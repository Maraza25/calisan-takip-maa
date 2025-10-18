# Çalışan Takip Sistemi - MAA Mimarlık

Modern ve kullanıcı dostu bir çalışan yoklama ve takip sistemi.

## 🚀 Özellikler

### 📋 Günlük Yoklama
- Bugünün tarihinde tüm çalışanları listele
- Geldi/Gelmedi durumunu tek tıkla değiştir
- Geçmiş tarihlerden yoklama görüntüle ve düzenle
- Gerçek zamanlı güncelleme
- Anlık istatistikler (toplam çalışan, gelen sayısı)

### 👥 Çalışan Yönetimi
- TC Kimlik No ile doğrulama
- Çalışan ekleme (Ad, Soyad, TC)
- Akıllı arama (TC veya isim ile)
- Çalışan pasifleştirme (silmeden devre dışı bırakma)
- Pasif çalışanları tekrar aktif etme
- Aynı TC kontrolü ve uyarı sistemi

### 📊 Raporlama
- Aylık yoklama raporları
- Her çalışan için detaylı istatistikler
- Geldiği günlerin listesi
- Excel (CSV) formatında dışa aktarma
- Yazdırma desteği
- Görsel istatistikler ve grafikler

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

### `employees` (Çalışanlar)
```typescript
{
  tc: string,           // TC Kimlik No (11 haneli)
  firstName: string,    // Ad
  lastName: string,     // Soyad
  disabled: boolean,    // Pasif mi?
  createdAt: Timestamp, // Oluşturulma tarihi
  updatedAt: Timestamp  // Güncellenme tarihi
}
```

### `attendance` (Yoklama)
```typescript
{
  employeeId: string,   // Çalışan ID'si
  date: string,         // Tarih (YYYY-MM-DD)
  status: 'present' | 'absent', // Durum (geldi/gelmedi)
  createdAt: Timestamp, // Oluşturulma tarihi
  updatedAt: Timestamp  // Güncellenme tarihi
}
```

## 🎯 Kullanım

### Çalışan Ekleme
1. "Çalışanlar" sayfasına gidin
2. "Yeni Çalışan Ekle" butonuna tıklayın
3. TC Kimlik No, Ad ve Soyad bilgilerini girin
4. "Ekle" butonuna tıklayın

**Not:** Aynı TC ile kayıtlı pasif bir çalışan varsa, sistem tekrar aktif etme seçeneği sunar.

### Günlük Yoklama
1. Ana sayfada bugünün tarihi otomatik seçilidir
2. Her çalışan için "Geldi" veya "Gelmedi" butonuna tıklayın
3. Değişiklikler anında kaydedilir
4. Tarih seçerek geçmiş günleri görüntüleyebilirsiniz

### Rapor Alma
1. "Raporlar" sayfasına gidin
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
    match /employees/{document=**} {
      allow read, write: if true; // TODO: Auth eklendiğinde değiştir
    }
    match /attendance/{document=**} {
      allow read, write: if true; // TODO: Auth eklendiğinde değiştir
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

## 📄 Lisans

Bu proje MAA Mimarlık için geliştirilmiştir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için: [email protected]
