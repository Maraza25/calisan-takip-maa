import Link from 'next/link';
import { Users, Calendar, History, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Çalışan Takip Sistemi
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            MAA Mimarlık
          </p>
          <p className="text-lg text-gray-500">
            Çalışanlarınızı yönetin, yoklama alın, geçmiş kayıtları görüntüleyin
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Link
            href="/admin/employees"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                <Users className="text-blue-600" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Çalışan Havuzu
            </h2>
            <p className="text-gray-600 text-center">
              Çalışan ekle, düzenle ve yönet. TC numarası ile benzersiz kayıt.
            </p>
          </Link>

          <Link
            href="/admin/attendance"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
                <Calendar className="text-green-600" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Yoklama
            </h2>
            <p className="text-gray-600 text-center">
              Günlük veya geçmiş tarihli yoklama kayıtları al ve düzenle.
            </p>
          </Link>

          <Link
            href="/admin/history"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-200 transition-colors">
                <History className="text-purple-600" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Geçmiş
            </h2>
            <p className="text-gray-600 text-center">
              Tarih aralığı ile geçmiş yoklama kayıtlarını görüntüle ve filtrele.
            </p>
          </Link>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Özellikler
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800">TC Numarası ile Benzersiz Kayıt</h4>
                <p className="text-sm text-gray-600">Aynı TC ile tekrar ekleme yapılırsa, mevcut kayıt aktive edilir.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800">Geçmiş Gün Düzenleme</h4>
                <p className="text-sm text-gray-600">İstediğiniz tarihe yoklama girişi yapabilir veya düzeltme yapabilirsiniz.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800">Soft Delete</h4>
                <p className="text-sm text-gray-600">Silinen çalışanların geçmiş kayıtları korunur.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800">Google Sheets Entegrasyonu</h4>
                <p className="text-sm text-gray-600">Tüm yoklama kayıtları otomatik olarak Google Sheets'e aktarılır.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800">Firestore Veritabanı</h4>
                <p className="text-sm text-gray-600">Güvenli ve hızlı veri saklama ile gerçek zamanlı senkronizasyon.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800">Modern ve Kullanıcı Dostu Arayüz</h4>
                <p className="text-sm text-gray-600">Temiz, responsive tasarım ile kolay kullanım.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-12 text-center">
          <div className="bg-blue-600 text-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Hızlı Başlangıç</h3>
            <p className="mb-6">
              İlk önce çalışanlarınızı ekleyin, sonra günlük yoklama almaya başlayın!
            </p>
            <Link
              href="/admin/employees"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Çalışan Ekle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
