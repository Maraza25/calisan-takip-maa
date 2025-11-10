'use client';

import Link from 'next/link';
import { Building2, Loader2, Plus, XCircle } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';
import { cn } from '@/lib/utils';

export default function SiteSelector({ className }: { className?: string }) {
  const { sites, selectedSiteId, setSelectedSiteId, loading } = useSite();

  const activeSites = sites.filter((site) => site.isActive);

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-500 dark:text-gray-400',
          className
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Şantiyeler yükleniyor...
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <Link
        href="/santiyeler"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors',
          className
        )}
      >
        <Plus className="w-4 h-4" />
        Şantiye Oluştur
      </Link>
    );
  }

  if (activeSites.length === 0) {
    return (
      <Link
        href="/santiyeler"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors',
          className
        )}
      >
        <XCircle className="w-4 h-4" />
        Aktif şantiye yok
      </Link>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600',
        className
      )}
    >
      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <select
        className="bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
        value={activeSites.some((site) => site.id === selectedSiteId) ? selectedSiteId ?? '' : ''}
        onChange={(event) => {
          const value = event.target.value;
          setSelectedSiteId(value === '' ? null : value);
        }}
      >
        {activeSites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>
      <Link
        href="/santiyeler"
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        Yönet
      </Link>
    </div>
  );
}


