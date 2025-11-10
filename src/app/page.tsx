'use client';

import Link from 'next/link';
import { Users, ClipboardCheck, BarChart3, Shield, Clock, FileSpreadsheet, CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';

export default function HomePage() {
  const { selectedSite, sites } = useSite();
  const features = [
    {
      icon: Building2,
      title: 'Şantiye Yönetimi',
      description: 'Birden fazla şantiye oluşturun, ustaları ve yöneticileri görevlendirin',
      link: '/santiyeler',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      icon: ClipboardCheck,
      title: 'Günlük Yoklama',
      description: 'Her şantiye için günlük yoklamayı ayrı ayrı yönetin ve takip edin',
      link: '/yoklama',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Users,
      title: 'Çalışan Yönetimi',
      description: 'Çalışanlarınızı ekleyin, düzenleyin ve aktif/pasif durumlarını yönetin',
      link: '/calisanlar',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: BarChart3,
      title: 'Detaylı Raporlar',
      description: 'Şantiye bazlı aylık yoklama raporlarını görüntüleyin, yazdırın veya Excel olarak indirin',
      link: '/raporlar',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Zaman Tasarrufu',
      description: 'Manuel yoklama süreçlerinizi dijitalleştirerek zamandan tasarruf edin',
    },
    {
      icon: Shield,
      title: 'Güvenli Veri',
      description: 'Firebase altyapısı ile verileriniz güvenli bir şekilde saklanır',
    },
    {
      icon: FileSpreadsheet,
      title: 'Kolay Raporlama',
      description: 'Excel formatında raporlar alın ve arşivleyin',
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Şantiye Bazlı Çalışan Takip Sistemi
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          MAA Mimarlık için özel olarak tasarlanmış, tüm şantiyelerinizi tek panelden yöneteceğiniz modern çalışan takip sistemi
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/santiyeler"
            className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Şantiye Oluştur
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>

          <Link
            href="/yoklama"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Yoklama Al
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          
          <Link
            href="/calisanlar"
            className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
          >
            Çalışan Havuzuna Git
          </Link>
        </div>
      </section>

      {sites.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
                <Building2 className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedSite ? selectedSite.name : 'Aktif Şantiye Seçili Değil'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedSite
                    ? 'Seçili şantiye için yoklama ve rapor işlemlerini üst menüden yönetebilirsiniz.'
                    : 'Üst menüden bir şantiye seçerek yoklama ve raporları yönetmeye başlayın.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {sites.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Toplam Şantiye
                </div>
              </div>
              <Link
                href="/santiyeler"
                className="inline-flex items-center px-5 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Şantiyeleri Yönet
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Özellikler
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            İşinizi kolaylaştıracak güçlü özellikler
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.link}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                <div className="p-8 space-y-4">
                  <div className={`inline-flex p-4 rounded-xl ${feature.bgColor}`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium pt-2 group-hover:translate-x-2 transition-transform">
                    Başla
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-8 md:p-12 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Neden Bu Sistem?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            İş süreçlerinizi optimize edin
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white dark:bg-gray-700/50 rounded-xl p-6 space-y-3 backdrop-blur-sm"
              >
                <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            100%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Dijital
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
            7/24
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Erişim
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            ∞
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Çalışan
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            ⚡
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Hızlı
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Hemen Başlayın
        </h2>
        
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
          Çalışanlarınızın yoklamasını almak için bugün başlayın
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/yoklama"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
          >
            Yoklama Sayfasına Git
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

