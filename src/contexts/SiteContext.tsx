'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Site } from '@/types';
import { getSites } from '@/lib/siteService';

interface SiteContextValue {
  sites: Site[];
  selectedSiteId: string | null;
  selectedSite: Site | null;
  setSelectedSiteId: (siteId: string | null) => void;
  refreshSites: () => Promise<void>;
  loading: boolean;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const SELECTED_SITE_STORAGE_KEY = 'selectedSiteId';

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSites = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedSites = await getSites();
      setSites(fetchedSites);

      if (fetchedSites.length === 0) {
        setSelectedSiteIdState(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SELECTED_SITE_STORAGE_KEY);
        }
        return;
      }

      setSelectedSiteIdState((current) => {
        if (current && fetchedSites.some((site) => site.id === current)) {
          return current;
        }

        const firstActive = fetchedSites.find((site) => site.isActive);

        if (firstActive) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(SELECTED_SITE_STORAGE_KEY, firstActive.id);
          }
          return firstActive.id;
        }

        if (typeof window !== 'undefined') {
          localStorage.removeItem(SELECTED_SITE_STORAGE_KEY);
        }
        return null;
      });
    } catch (error) {
      console.error('Şantiyeler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let initialSiteId: string | null = null;
    if (typeof window !== 'undefined') {
      initialSiteId = localStorage.getItem(SELECTED_SITE_STORAGE_KEY);
    }
    if (initialSiteId) {
      setSelectedSiteIdState(initialSiteId);
    }
    refreshSites();
  }, [refreshSites]);

  const handleSelectSite = useCallback((siteId: string | null) => {
    setSelectedSiteIdState(siteId);
    if (typeof window !== 'undefined') {
      if (siteId) {
        localStorage.setItem(SELECTED_SITE_STORAGE_KEY, siteId);
      } else {
        localStorage.removeItem(SELECTED_SITE_STORAGE_KEY);
      }
    }
  }, []);

  const selectedSite = useMemo(
    () => (selectedSiteId ? sites.find((site) => site.id === selectedSiteId) ?? null : null),
    [sites, selectedSiteId]
  );

  const value: SiteContextValue = useMemo(
    () => ({
      sites,
      selectedSiteId,
      selectedSite,
      setSelectedSiteId: handleSelectSite,
      refreshSites,
      loading,
    }),
    [sites, selectedSiteId, selectedSite, handleSelectSite, refreshSites, loading]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite sadece SiteProvider içinde kullanılabilir');
  }
  return context;
}


