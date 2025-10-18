import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { AttendanceRecord } from '@/types';

const ATTENDANCE_COLLECTION = 'attendance';

// Belirli bir tarih için yoklama kayıtlarını getir
export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('date', '==', date)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      employeeId: data.employeeId,
      date: data.date,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AttendanceRecord;
  });
};

// Belirli bir çalışan için tarih aralığındaki yoklamaları getir
export const getAttendanceByEmployeeAndDateRange = async (
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('employeeId', '==', employeeId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      employeeId: data.employeeId,
      date: data.date,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AttendanceRecord;
  });
};

// Tarih aralığındaki tüm yoklamaları getir
export const getAttendanceByDateRange = async (
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      employeeId: data.employeeId,
      date: data.date,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AttendanceRecord;
  });
};

// Yoklama kaydı ekle veya güncelle
export const setAttendance = async (
  employeeId: string,
  date: string,
  status: 'present' | 'absent'
): Promise<void> => {
  // Benzersiz ID: employeeId_date
  const docId = `${employeeId}_${date}`;
  const attendanceRef = doc(db, ATTENDANCE_COLLECTION, docId);

  const now = Timestamp.now();
  
  await setDoc(
    attendanceRef,
    {
      employeeId,
      date,
      status,
      updatedAt: now,
    },
    { merge: true }
  );

  // Eğer createdAt yoksa ekle
  const docSnap = await getDocs(
    query(collection(db, ATTENDANCE_COLLECTION), where('__name__', '==', docId))
  );
  
  if (docSnap.empty || !docSnap.docs[0].data().createdAt) {
    await setDoc(
      attendanceRef,
      {
        createdAt: now,
      },
      { merge: true }
    );
  }
};

// Tarih için tüm çalışanların yoklamasını başlat (varsayılan olarak absent)
export const initializeAttendanceForDate = async (
  date: string,
  employeeIds: string[]
): Promise<void> => {
  const existingRecords = await getAttendanceByDate(date);
  const existingEmployeeIds = new Set(existingRecords.map(r => r.employeeId));

  // Henüz kaydı olmayan çalışanlar için absent kaydı oluştur
  const promises = employeeIds
    .filter(id => !existingEmployeeIds.has(id))
    .map(employeeId => setAttendance(employeeId, date, 'absent'));

  await Promise.all(promises);
};

