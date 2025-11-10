'use client';

import { useState } from 'react';
import { Building2, Loader2, MapPin, NotebookPen, PlusCircle, Lock, Unlock } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';
import { createSite, setSiteActiveState } from '@/lib/siteService';
import { cn } from '@/lib/utils';

export default function SitesPage() {
  const {
    sites,
    selectedSiteId,
    setSelectedSiteId,
    refreshSites,
    loading: sitesLoading,
  } = useSite();

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    location: '',
    description: '',
    error: '',
    loading: false,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [updatingSiteId, setUpdatingSiteId] = useState<string | null>(null);

  const handleCreateSite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createForm.name.trim()) {
      setCreateForm((prev) => ({ ...prev, error: 'Şantiye adı zorunludur.' }));
      return;
    }

    setCreateForm((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const newSite = await createSite({
        name: createForm.name.trim(),
        code: createForm.code.trim() || undefined,
        location: createForm.location.trim() || undefined,
        description: createForm.description.trim() || undefined,
      });

      setCreateForm({
        name: '',
        code: '',
        location: '',
        description: '',
        error: '',
        loading: false,
      });

      await refreshSites();
      setSelectedSiteId(newSite.id);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Şantiye oluşturulurken hata:', error);
      setCreateForm((prev) => ({
        ...prev,
        error: 'Şantiye oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        loading: false,
      }));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Şantiye Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Farklı şantiyeleri oluşturun ve aktif şantiyeyi seçerek çalışanları, yoklamaları ve raporları ayrı ayrı yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedSiteId && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
              Aktif Şantiye:
              <span className="font-semibold">
                {sites.find((site) => site.id === selectedSiteId)?.name ?? 'Seçilmedi'}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {showCreateForm ? 'Formu Gizle' : 'Yeni Şantiye Oluştur'}
          </button>
        </div>
      </header>

      {showCreateForm && (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          Yeni Şantiye Oluştur
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Her şantiye için ayrı çalışan listeleri ve yoklama kayıtları tutabilirsiniz.
        </p>

        <form onSubmit={handleCreateSite} className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Şantiye Adı
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, name: event.target.value, error: '' }))
              }
              placeholder="Örn. Ataşehir Residence"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Şantiye Kodu
            </label>
            <input
              type="text"
              value={createForm.code}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, code: event.target.value }))
              }
              placeholder="Örn. SNT-001"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konum
            </label>
            <input
              type="text"
              value={createForm.location}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, location: event.target.value }))
              }
              placeholder="Şehir / İlçe"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              value={createForm.description}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Şantiye hakkında kısa bilgi girin..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createForm.loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createForm.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Şantiye Oluştur
                </>
              )}
            </button>
          </div>
        </form>

        {createForm.error && (
          <div className="mt-3 text-sm text-red-500 dark:text-red-400">
            {createForm.error}
          </div>
        )}
      </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          Şantiye Listesi
        </h2>

        {sitesLoading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Şantiyeler yükleniyor...
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400">
            Henüz şantiye oluşturmadınız. Yukarıdaki butonla yeni şantiye oluşturabilirsiniz.
          </div>
        ) : (
          <div className="space-y-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className={cn(
                  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-shadow',
                  selectedSiteId === site.id && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                )}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {site.name}
                      </h3>
                      {site.code && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          {site.code}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {site.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {site.location}
                        </span>
                      )}
                      {site.description && (
                        <span className="inline-flex items-center gap-1 mt-1 sm:mt-0">
                          <NotebookPen className="w-4 h-4" />
                          {site.description}
                        </span>
                      )}
                      {!site.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                          Kapalı
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedSiteId(site.id)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                        selectedSiteId === site.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      {selectedSiteId === site.id ? 'Aktif Şantiye' : 'Aktif Et'}
                    </button>

                    <button
                      onClick={async () => {
                        setUpdatingSiteId(site.id);
                        try {
                          await setSiteActiveState(site.id, !site.isActive);
                          await refreshSites();
                        } finally {
                          setUpdatingSiteId(null);
                        }
                      }}
                      disabled={updatingSiteId === site.id}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                        site.isActive
                          ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20'
                          : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/40 dark:text-green-300 dark:hover:bg-green-900/20',
                        updatingSiteId === site.id && 'opacity-60 cursor-wait'
                      )}
                    >
                      {updatingSiteId === site.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : site.isActive ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Kapat
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Aç
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


