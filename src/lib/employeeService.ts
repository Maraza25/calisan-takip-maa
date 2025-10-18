import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Employee } from '@/types';

const EMPLOYEES_COLLECTION = 'employees';

// Tüm çalışanları getir
export const getAllEmployees = async (): Promise<Employee[]> => {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      tc: data.tc,
      fullName: data.fullName,
      disabled: data.disabled || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Employee;
  });
};

// Aktif çalışanları getir
export const getActiveEmployees = async (): Promise<Employee[]> => {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('disabled', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      tc: data.tc,
      fullName: data.fullName,
      disabled: data.disabled || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Employee;
  });
};

// TC'ye göre çalışan ara
export const getEmployeeByTC = async (tc: string): Promise<Employee | null> => {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('tc', '==', tc)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    tc: data.tc,
    fullName: data.fullName,
    disabled: data.disabled || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Employee;
};

// Çalışan ekle
export const addEmployee = async (
  tc: string,
  fullName: string
): Promise<Employee> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
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

// Arama (TC veya isim)
export const searchEmployees = async (searchTerm: string): Promise<Employee[]> => {
  const allEmployees = await getAllEmployees();
  
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  const isNumeric = /^\d+$/.test(searchTerm);
  
  return allEmployees.filter(employee => {
    if (isNumeric) {
      // Sayı ise TC'ye göre ara
      return employee.tc.includes(searchTerm);
    } else {
      // Harf ise isme göre ara
      return employee.fullName.toLowerCase().includes(lowerSearchTerm);
    }
  });
};

