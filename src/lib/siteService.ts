import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Site } from '@/types';

const SITES_COLLECTION = 'sites';

export const getSites = async (): Promise<Site[]> => {
  const q = query(collection(db, SITES_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      name: data.name,
      code: data.code,
      location: data.location,
      description: data.description,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Site;
  });
};

export const getSiteById = async (siteId: string): Promise<Site | null> => {
  const siteRef = doc(db, SITES_COLLECTION, siteId);
  const snapshot = await getDoc(siteRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    code: data.code,
    location: data.location,
    description: data.description,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Site;
};

export const createSite = async (site: {
  name: string;
  code?: string;
  location?: string;
  description?: string;
}): Promise<Site> => {
  const now = Timestamp.now();

  const docRef = await addDoc(collection(db, SITES_COLLECTION), {
    ...site,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    name: site.name,
    code: site.code,
    location: site.location,
    description: site.description,
    isActive: true,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
};

export const updateSite = async (
  siteId: string,
  updates: Partial<Pick<Site, 'name' | 'code' | 'location' | 'description'>>
): Promise<void> => {
  const siteRef = doc(db, SITES_COLLECTION, siteId);
  await updateDoc(siteRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteSite = async (siteId: string): Promise<void> => {
  const siteRef = doc(db, SITES_COLLECTION, siteId);
  await deleteDoc(siteRef);
};

export const setSiteActiveState = async (siteId: string, isActive: boolean): Promise<void> => {
  const siteRef = doc(db, SITES_COLLECTION, siteId);
  await updateDoc(siteRef, {
    isActive,
    updatedAt: Timestamp.now(),
  });
};


