'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Printer } from 'lucide-react';
import { getAllEmployees } from '@/lib/employeeService';
import { getAttendanceByDateRange } from '@/lib/attendanceService';
import { AttendanceRecord, MonthlyReport } from '@/types';
import { formatDateTurkish, getMonthRange, getDaysInMonth, generateCSV, downloadCSV, cn } from '@/lib/utils';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [report, setReport] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      // Çalışanları ve yoklama verilerini getir
      const monthRange = getMonthRange(selectedYear, selectedMonth);
      const [employeesData, attendanceData] = await Promise.all([
        getAllEmployees(),
        getAttendanceByDateRange(monthRange.start, monthRange.end),
      ]);

      // Her çalışan için rapor oluştur
      const reportData: MonthlyReport[] = employeesData.map((employee) => {
        // Bu çalışanın yoklama kayıtlarını filtrele
        const employeeAttendance = attendanceData.filter(
          (record: AttendanceRecord) => record.employeeId === employee.id
        );

        // Geldiği günleri bul
        const presentRecords = employeeAttendance.filter(
          (record: AttendanceRecord) => record.status === 'present'
        );

        const presentDates = presentRecords
          .map((record: AttendanceRecord) => record.date)
          .sort();

        return {
          employeeId: employee.id,
          employeeName: employee.fullName,
          tc: employee.tc,
          totalDays: presentRecords.length,
          presentDates,
          isDisabled: employee.disabled,
        };
      });

      // İsme göre sırala
      reportData.sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'tr'));

      setReport(reportData);
    } catch (error) {
      console.error('Rapor oluşturulurken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const handleExportExcel = () => {
    // CSV formatında veri oluştur
    const headers = ['Ad Soyad', 'TC Kimlik No', 'Toplam Gün', 'Geldiği Günler'];
    const rows = report.map((item) => [
      item.employeeName + (item.isDisabled ? ' (pasif)' : ''),
      item.tc,
      item.totalDays.toString(),
      item.presentDates.join(', '),
    ]);

    const csvData = [headers, ...rows];
    const csv = generateCSV(csvData);

    // Dosya adı
    const fileName = `${MONTHS[selectedMonth]}_${selectedYear}_Yoklama_Raporu.csv`;
    downloadCSV(csv, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  // Yıl seçenekleri (son 3 yıl + gelecek 1 yıl)
  const years = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  );

  const totalWorkingDays = getDaysInMonth(selectedYear, selectedMonth).length;
  const activeEmployees = report.filter(r => !r.isDisabled);
  const totalPresent = report.reduce((sum, item) => sum + item.totalDays, 0);
  const averageAttendance = activeEmployees.length > 0
    ? (activeEmployees.reduce((sum, item) => sum + item.totalDays, 0) / activeEmployees.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Aylık Yoklama Raporu
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {MONTHS[selectedMonth]} {selectedYear}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Ay Seçimi */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>

            {/* Yıl Seçimi */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Export Butonları */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel İndir
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Yazdır
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Toplam Çalışan
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
              {activeEmployees.length}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              İş Günü
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
              {totalWorkingDays}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Toplam Geliş
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
              {totalPresent}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              Ort. Katılım
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">
              {averageAttendance} gün
            </div>
          </div>
        </div>
      </div>

      {/* Yazdırma için başlık */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">
          {MONTHS[selectedMonth]} {selectedYear} Yoklama Raporu
        </h1>
        <p className="text-center text-gray-600">
          MAA Mimarlık Çalışan Takip Sistemi
        </p>
      </div>

      {/* Rapor Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : report.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            Bu dönem için rapor verisi bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TC Kimlik No
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Toplam Gün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Geldiği Günler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {report.map((item, index) => (
                  <tr
                    key={item.employeeId}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      item.isDisabled && 'opacity-50'
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.employeeName}
                        {item.isDisabled && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (pasif)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {item.tc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                        item.totalDays === 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : item.totalDays < totalWorkingDays / 2
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      )}>
                        {item.totalDays} gün
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.presentDates.length > 0 ? (
                        <div className="max-w-md">
                          {item.presentDates.map((date) => {
                            const [, month, day] = date.split('-');
                            return `${day}.${month}`;
                          }).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          Hiç gelmedi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yazdırma için footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
        <p className="text-sm text-gray-600 text-center">
          Rapor Tarihi: {formatDateTurkish(new Date())}
        </p>
      </div>
    </div>
  );
}

