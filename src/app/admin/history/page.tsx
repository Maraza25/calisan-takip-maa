'use client';

import { useState, useEffect } from 'react';
import { Employee, AttendanceEntry } from '@/types';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

type AttendanceWithEmployee = AttendanceEntry & {
  employee?: Employee;
};

export default function HistoryPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [historyData, setHistoryData] = useState<{
    [date: string]: AttendanceWithEmployee[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
    // Varsayılan tarih aralığı: son 7 gün
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?includeDeleted=true');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Çalışanlar yüklenemedi:', err);
    }
  };

  const fetchHistory = async () => {
    if (!startDate || !endDate) {
      setError('Başlangıç ve bitiş tarihi seçiniz');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data: { [date: string]: AttendanceWithEmployee[] } = {};

      // Tarih aralığındaki her gün için kayıtları getir
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const response = await fetch(`/api/attendance?date=${dateStr}`);
        const attendanceData = await response.json();
        
        if (attendanceData.entries && attendanceData.entries.length > 0) {
          // Çalışan bilgilerini ekle
          const enrichedEntries = attendanceData.entries.map((entry: AttendanceEntry) => {
            const employee = employees.find((emp) => emp.id === entry.employeeId);
            return { ...entry, employee };
          });

          // Eğer çalışan filtresi varsa, sadece o çalışanı göster
          if (selectedEmployeeId) {
            const filtered = enrichedEntries.filter(
              (e: AttendanceWithEmployee) => e.employeeId === selectedEmployeeId
            );
            if (filtered.length > 0) {
              data[dateStr] = filtered;
            }
          } else {
            data[dateStr] = enrichedEntries;
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setHistoryData(data);
    } catch (err) {
      console.error('Geçmiş veriler yüklenemedi:', err);
      setError('Geçmiş veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate && employees.length > 0) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedEmployeeId, employees]);

  const sortedDates = Object.keys(historyData).sort().reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Başlık */}
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Geçmiş Yoklamalar</h1>

          {/* Filtreler */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışan Filtresi
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Çalışanlar</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} {emp.isDeleted && '(Silinmiş)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mesajlar */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Geçmiş Listesi */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Seçilen tarih aralığında kayıt bulunamadı
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-blue-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">
                      {new Date(date + 'T00:00:00').toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {historyData[date].map((entry) => (
                      <div
                        key={entry.employeeId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {entry.status === 'present' ? (
                            <CheckCircle className="text-green-600" size={20} />
                          ) : (
                            <XCircle className="text-red-600" size={20} />
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {entry.employee?.fullName || 'Bilinmeyen Çalışan'}
                              {entry.employee?.isDeleted && (
                                <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  Silinmiş
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              TC: {entry.employee?.tc || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${
                              entry.status === 'present'
                                ? 'text-green-700'
                                : 'text-red-700'
                            }`}
                          >
                            {entry.status === 'present' ? 'Geldi' : 'Gelmedi'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.ts).toLocaleTimeString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

