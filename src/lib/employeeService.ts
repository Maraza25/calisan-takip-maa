import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  orderBy,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Employee } from '@/types';

const EMPLOYEES_COLLECTION = 'employees';

const mapEmployee = (document: FirebaseDocument): Employee => {
  const data = document.data() as {
    tc?: string;
    fullName?: string;
    siteId?: string;
    disabled?: boolean;
    createdAt?: { toDate: () => Date };
    updatedAt?: { toDate: () => Date };
  };
  return {
    id: document.id,
    tc: data.tc ?? '',
    fullName: data.fullName ?? '',
    siteId: data.siteId || '',
    disabled: data.disabled || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};
type FirebaseDocument = QueryDocumentSnapshot<DocumentData, DocumentData>;

// Tüm çalışanları getir (site filtresi olmadan)
export const getAllEmployees = async (): Promise<Employee[]> => {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapEmployee);
};

// Belirli bir şantiyedeki çalışanları getir
export const getEmployeesBySite = async (siteId: string): Promise<Employee[]> => {
  const q = query(collection(db, EMPLOYEES_COLLECTION), where('siteId', '==', siteId));

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(mapEmployee)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Aktif çalışanları getir (belirli şantiyede)
export const getActiveEmployeesBySite = async (siteId: string): Promise<Employee[]> => {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('siteId', '==', siteId),
    where('disabled', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(mapEmployee)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// TC'ye göre çalışan ara (şantiye bazlı)
export const getEmployeeByTC = async (siteId: string, tc: string): Promise<Employee | null> => {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('siteId', '==', siteId),
    where('tc', '==', tc)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return mapEmployee(snapshot.docs[0]);
};

// Çalışan ekle
export const addEmployee = async (
  siteId: string,
  tc: string,
  fullName: string
): Promise<Employee> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
    siteId,
    tc,
    fullName,
    disabled: false,
    createdAt: now,
    updatedAt: now,
  });
  
  return {
    id: docRef.id,
    tc,
    fullName,
    siteId,
    disabled: false,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
};

// Çalışanı aktif et
export const activateEmployee = async (employeeId: string): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  await updateDoc(employeeRef, {
    disabled: false,
    updatedAt: Timestamp.now(),
  });
};

// Çalışanı pasifleştir
export const deactivateEmployee = async (employeeId: string): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  await updateDoc(employeeRef, {
    disabled: true,
    updatedAt: Timestamp.now(),
  });
};

// Çalışan güncelle
export const updateEmployee = async (
  employeeId: string,
  updates: Partial<Pick<Employee, 'fullName' | 'tc'>>
): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  await updateDoc(employeeRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

// Arama (TC veya isim) - şantiye bazlı
export const searchEmployees = async (siteId: string, searchTerm: string): Promise<Employee[]> => {
  const employees = await getEmployeesBySite(siteId);
  
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  const isNumeric = /^\d+$/.test(searchTerm);
  
  return employees.filter(employee => {
    if (isNumeric) {
      return employee.tc.includes(searchTerm);
    }
    return employee.fullName.toLowerCase().includes(lowerSearchTerm);
  });
};


