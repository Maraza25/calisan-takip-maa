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

// Belirli bir şantiye ve tarih için yoklama kayıtlarını getir
export const getAttendanceByDate = async (
  siteId: string,
  date: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('siteId', '==', siteId),
    where('date', '==', date)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      siteId: data.siteId,
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
  siteId: string,
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('siteId', '==', siteId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        siteId: data.siteId,
        employeeId: data.employeeId,
        date: data.date,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AttendanceRecord;
    })
    .filter(record => record.employeeId === employeeId && record.date >= startDate && record.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Tarih aralığındaki tüm yoklamaları getir
export const getAttendanceByDateRange = async (
  siteId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('siteId', '==', siteId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        siteId: data.siteId,
        employeeId: data.employeeId,
        date: data.date,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AttendanceRecord;
    })
    .filter(record => record.date >= startDate && record.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Yoklama kaydı ekle veya güncelle
export const setAttendance = async (
  siteId: string,
  employeeId: string,
  date: string,
  status: 'present' | 'absent'
): Promise<void> => {
  // Benzersiz ID: employeeId_date
  const docId = `${siteId}_${employeeId}_${date}`;
  const attendanceRef = doc(db, ATTENDANCE_COLLECTION, docId);

  const now = Timestamp.now();
  
  await setDoc(
    attendanceRef,
    {
      siteId,
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
  siteId: string,
  date: string,
  employeeIds: string[]
): Promise<void> => {
  const existingRecords = await getAttendanceByDate(siteId, date);
  const existingEmployeeIds = new Set(existingRecords.map(r => r.employeeId));

  // Henüz kaydı olmayan çalışanlar için absent kaydı oluştur
  const promises = employeeIds
    .filter(id => !existingEmployeeIds.has(id))
    .map(employeeId => setAttendance(siteId, employeeId, date, 'absent'));

  await Promise.all(promises);
};

