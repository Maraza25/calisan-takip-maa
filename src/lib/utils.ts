import { type ClassValue, clsx } from "clsx";

// Tailwind class'ları birleştirmek için
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Tarih formatla (YYYY-MM-DD)
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Tarih formatla (Türkçe gösterim: 18 Ekim 2025)
export function formatDateTurkish(date: Date): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// String'den Date'e çevir (YYYY-MM-DD)
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Ay için başlangıç ve bitiş tarihleri (YYYY-MM-DD)
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

// Bir ay içindeki tüm günleri array olarak döndür
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= lastDay; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
}

// TC Kimlik numarası doğrulama
export function validateTC(tc: string): boolean {
  if (!/^\d{11}$/.test(tc)) return false;
  
  const digits = tc.split('').map(Number);
  
  // İlk hane 0 olamaz
  if (digits[0] === 0) return false;
  
  // 10. hane kontrolü
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (sum1 - sum2) % 10;
  
  if (digits[9] !== digit10) return false;
  
  // 11. hane kontrolü
  const sum3 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  const digit11 = sum3 % 10;
  
  if (digits[10] !== digit11) return false;
  
  return true;
}

// Excel export için CSV oluştur
export function generateCSV(data: string[][]): string {
  return data
    .map(row => 
      row.map(cell => {
        // Virgül veya tırnak içeren hücreleri tırnak içine al
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
    .join('\n');
}

// CSV'yi dosya olarak indir
export function downloadCSV(csv: string, filename: string): void {
  // UTF-8 BOM ekle (Excel için Türkçe karakter desteği)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

