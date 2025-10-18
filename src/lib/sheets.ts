// Google Sheets API entegrasyonu (Server-side only)
import { google } from 'googleapis';

// Service account ile kimlik doğrulama
const getAuthClient = () => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Upsert: Mevcut satırı güncelle veya yeni satır ekle (tarih grupları arası 3 boş satır)
export async function upsertToSheet(rows: any[][]) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.SHEET_ID;

    if (!sheetId) {
      throw new Error('SHEET_ID env değişkeni tanımlanmamış');
    }

    // Mevcut tüm verileri oku
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:F',
    });

    const existingRows = existingData.data.values || [];
    
    // Başlık satırını ayır
    const headerRow = existingRows.length > 0 ? existingRows[0] : ['Tarih', 'Çalışan ID', 'Ad Soyad', 'Durum', 'Kaynak', 'Düzenleme Zamanı'];
    
    // Mevcut verileri tarihe göre grupla (başlık hariç)
    const dateGroups: { [date: string]: any[] } = {};
    
    for (let i = 1; i < existingRows.length; i++) {
      const row = existingRows[i];
      // Boş satırları atla
      if (!row || !row[0]) continue;
      
      const date = row[0];
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      dateGroups[date].push(row);
    }

    // Yeni kayıtları ekle veya güncelle
    let updatedCount = 0;
    let addedCount = 0;

    for (const newRow of rows) {
      const [date, employeeId] = newRow;
      let found = false;

      // Bu tarih grubu var mı?
      if (dateGroups[date]) {
        // Aynı employeeId var mı kontrol et
        for (let i = 0; i < dateGroups[date].length; i++) {
          if (dateGroups[date][i][1] === employeeId) {
            // Bulundu! Güncelle
            dateGroups[date][i] = newRow;
            found = true;
            updatedCount++;
            break;
          }
        }
      } else {
        // Yeni tarih grubu oluştur
        dateGroups[date] = [];
      }

      if (!found) {
        // Yeni kayıt ekle
        dateGroups[date].push(newRow);
        addedCount++;
      }
    }

    // Tarihleri sırala (en yeni en üstte)
    const sortedDates = Object.keys(dateGroups).sort().reverse();

    // Yeni sheet verisi oluştur: başlık + tarih grupları (aralarında 3 boş satır)
    const newSheetData: any[][] = [headerRow];
    
    sortedDates.forEach((date, index) => {
      // Bu tarihin tüm kayıtlarını ekle
      dateGroups[date].forEach(row => {
        newSheetData.push(row);
      });
      
      // Son grup değilse, 3 boş satır ekle
      if (index < sortedDates.length - 1) {
        newSheetData.push([], [], []);
      }
    });

    // Tüm sheet'i yeniden yaz
    // Önce mevcut verileri temizle (başlık hariç)
    if (existingRows.length > 1) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `Sheet1!A2:F${existingRows.length + 100}`, // Fazladan satır temizle
      });
    }

    // Yeni verileri yaz
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: newSheetData,
      },
    });

    return {
      updated: updatedCount,
      added: addedCount,
    };
  } catch (error) {
    console.error('Google Sheets upsert hatası:', error);
    throw error;
  }
}

// Eski append-only fonksiyonu (yedek olarak kalsın, isterseniz silebilirsiniz)
export async function appendToSheet(rows: any[][]) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.SHEET_ID;

    if (!sheetId) {
      throw new Error('SHEET_ID env değişkeni tanımlanmamış');
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:F', // date, employeeId, fullName, status, source, editedAt
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Google Sheets append hatası:', error);
    throw error;
  }
}

// İlk kurulum için başlık satırı ekle
export async function initializeSheet() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.SHEET_ID;

    if (!sheetId) {
      throw new Error('SHEET_ID env değişkeni tanımlanmamış');
    }

    // Başlık satırını ekle
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:F1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Tarih', 'Çalışan ID', 'Ad Soyad', 'Durum', 'Kaynak', 'Düzenleme Zamanı']],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Google Sheets başlatma hatası:', error);
    throw error;
  }
}

