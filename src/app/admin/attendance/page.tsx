'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Employee, AttendanceEntry } from '@/types';
import { Calendar, Save, CheckCircle, XCircle } from 'lucide-react';

type AttendanceState = {
  [employeeId: string]: 'present' | 'absent' | null;
};

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // URL'den tarih al veya bugünü kullan
    const dateParam = searchParams.get('date');
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(dateParam || today);
  }, [searchParams]);

  useEffect(() => {
    if (selectedDate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Çalışanları getir
      const employeesResponse = await fetch('/api/employees');
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData.employees || []);

      // Mevcut yoklama kayıtlarını getir
      const attendanceResponse = await fetch(`/api/attendance?date=${selectedDate}`);
      const attendanceData = await attendanceResponse.json();

      // Mevcut kayıtları state'e yükle
      const attendanceMap: AttendanceState = {};
      if (attendanceData.entries) {
        attendanceData.entries.forEach((entry: AttendanceEntry) => {
          attendanceMap[entry.employeeId] = entry.status;
        });
      }
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    router.push(`/admin/attendance?date=${newDate}`);
  };

  const toggleAttendance = (employeeId: string) => {
    setAttendance((prev) => {
      const current = prev[employeeId];
      let next: 'present' | 'absent' | null;

      if (current === null || current === undefined) {
        next = 'present';
      } else if (current === 'present') {
        next = 'absent';
      } else {
        next = null;
      }

      return { ...prev, [employeeId]: next };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      // Sadece değer girilmiş olanları kaydet
      const entries = Object.entries(attendance)
        .filter(([, status]) => status !== null)
        .map(([employeeId, status]) => ({
          employeeId,
          status: status!,
        }));

      if (entries.length === 0) {
        setError('En az bir yoklama kaydı girmelisiniz');
        return;
      }

      const response = await fetch('/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, entries }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kaydetme başarısız');
      }

      setSuccessMessage(data.message || 'Yoklama başarıyla kaydedildi');
      if (data.warning) {
        setError(data.warning);
      }

      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: 'present' | 'absent' | null) => {
    if (status === 'present') return 'bg-green-100 border-green-500 text-green-800';
    if (status === 'absent') return 'bg-red-100 border-red-500 text-red-800';
    return 'bg-gray-50 border-gray-300 text-gray-500';
  };

  const getStatusIcon = (status: 'present' | 'absent' | null) => {
    if (status === 'present') return <CheckCircle className="text-green-600" size={20} />;
    if (status === 'absent') return <XCircle className="text-red-600" size={20} />;
    return null;
  };

  const getStatusText = (status: 'present' | 'absent' | null) => {
    if (status === 'present') return 'Geldi';
    if (status === 'absent') return 'Gelmedi';
    return 'Seçilmedi';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Başlık */}
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Yoklama</h1>

          {/* Mesajlar */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Tarih Seçici */}
          <div className="mb-6 flex items-center gap-3">
            <Calendar className="text-gray-600" size={24} />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-600">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Çalışan Listesi */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz çalışan eklenmemiş. Önce çalışan ekleyin.
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {employees.map((employee) => {
                const status = attendance[employee.id];
                return (
                  <div
                    key={employee.id}
                    onClick={() => toggleAttendance(employee.id)}
                    className={`
                      flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer
                      transition-all hover:shadow-md
                      ${getStatusColor(status)}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div>
                        <div className="font-semibold text-lg">{employee.fullName}</div>
                        <div className="text-sm opacity-75">TC: {employee.tc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">{getStatusText(status)}</div>
                      <div className="text-xs opacity-75">
                        Tıklayarak değiştir
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Kaydet Butonu */}
          {employees.length > 0 && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAttendance({})}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Temizle
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          )}

          {/* Bilgi Notu */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>Not:</strong> Her çalışan için durumu değiştirmek için üzerine tıklayın.
            Sıralama: Seçilmedi → Geldi → Gelmedi → Seçilmedi...
          </div>
        </div>
      </div>
    </div>
  );
}

