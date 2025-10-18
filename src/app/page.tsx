'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { getAllEmployees } from '@/lib/employeeService';
import { getAttendanceByDate, setAttendance, initializeAttendanceForDate } from '@/lib/attendanceService';
import { Employee, AttendanceRecord } from '@/types';
import { formatDate, formatDateTurkish } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendanceState] = useState<Record<string, 'present' | 'absent'>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Çalışanları ve yoklama verilerini yükle
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [employeesData, attendanceData] = await Promise.all([
        getAllEmployees(),
        getAttendanceByDate(formatDate(selectedDate)),
      ]);

      setEmployees(employeesData);

      // Yoklama verilerini map'e çevir
      const attendanceMap: Record<string, 'present' | 'absent'> = {};
      attendanceData.forEach((record: AttendanceRecord) => {
        attendanceMap[record.employeeId] = record.status;
      });

      // Henüz kaydı olmayan çalışanlar için varsayılan olarak 'absent'
      const allEmployeeIds = employeesData.map(e => e.id);
      await initializeAttendanceForDate(formatDate(selectedDate), allEmployeeIds);

      // Kayıt eksik olanları da 'absent' olarak ekle
      employeesData.forEach(emp => {
        if (!attendanceMap[emp.id]) {
          attendanceMap[emp.id] = 'absent';
        }
      });

      setAttendanceState(attendanceMap);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleAttendance = async (employeeId: string, currentStatus: 'present' | 'absent') => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    
    // Optimistic update
    setAttendanceState(prev => ({
      ...prev,
      [employeeId]: newStatus,
    }));

    setUpdating(employeeId);

    try {
      await setAttendance(employeeId, formatDate(selectedDate), newStatus);
    } catch (error) {
      console.error('Yoklama güncellenirken hata:', error);
      // Hata durumunda geri al
      setAttendanceState(prev => ({
        ...prev,
        [employeeId]: currentStatus,
      }));
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: 'present' | 'absent') => {
    return status === 'present' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const activeEmployees = employees.filter(e => !e.disabled);
  const inactiveEmployees = employees.filter(e => e.disabled);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Başlık ve Tarih Seçimi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Günlük Yoklama
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatDateTurkish(selectedDate)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="date"
              value={formatDate(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Toplam Çalışan
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-300 mt-1">
              {activeEmployees.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              Gelen
            </div>
            <div className="text-xl font-bold text-green-900 dark:text-green-300 mt-1">
              {presentCount}
            </div>
          </div>
        </div>
      </div>

      {/* Aktif Çalışanlar Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Aktif Çalışanlar
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activeEmployees.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Henüz aktif çalışan bulunmuyor.
            </div>
          ) : (
            activeEmployees.map((employee) => (
              <div
                key={employee.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {employee.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    TC: {employee.tc}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleAttendance(employee.id, attendance[employee.id] || 'absent')}
                  disabled={updating === employee.id}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all flex-shrink-0 ml-3',
                    getStatusColor(attendance[employee.id] || 'absent'),
                    'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {updating === employee.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : attendance[employee.id] === 'present' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Geldi
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Gelmedi
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pasif Çalışanlar (sadece görüntüleme) */}
      {inactiveEmployees.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden opacity-60">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Pasif Çalışanlar
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {inactiveEmployees.map((employee) => (
              <div
                key={employee.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {employee.fullName}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(pasif)</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    TC: {employee.tc}
                  </div>
                </div>

                <div className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 ml-3',
                  getStatusColor(attendance[employee.id] || 'absent')
                )}>
                  {attendance[employee.id] === 'present' ? 'Geldi' : 'Gelmedi'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
