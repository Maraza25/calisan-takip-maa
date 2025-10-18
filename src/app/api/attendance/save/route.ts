// Yoklama kaydetme API
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { upsertToSheet } from '@/lib/sheets';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, entries } = body; // { date: 'YYYY-MM-DD', entries: [{ employeeId, status }] }

    if (!date || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'date ve entries gereklidir' },
        { status: 400 }
      );
    }

    // 1. Firestore batch upsert
    const batch = adminDb.batch();
    const dateDocRef = adminDb.collection('attendance').doc(date);

    const sheetsRows: any[] = [];

    for (const entry of entries) {
      const { employeeId, status } = entry;

      if (!employeeId || !status) continue;

      // Çalışan bilgisini al
      const employeeDoc = await adminDb.collection('employees').doc(employeeId).get();
      const employeeData = employeeDoc.data();

      if (!employeeData) continue;

      const entryRef = dateDocRef.collection('entries').doc(employeeId);

      // Firestore'a yaz
      batch.set(entryRef, {
        employeeRef: `employees/${employeeId}`,
        status,
        ts: FieldValue.serverTimestamp(),
        by: 'admin', // Test modunda sabit
      }, { merge: true });

      // Google Sheets için satır hazırla
      const now = new Date().toISOString();
      sheetsRows.push([
        date,
        employeeId,
        employeeData.fullName,
        status === 'present' ? 'Geldi' : 'Gelmedi',
        'admin_save',
        now,
      ]);
    }

    // Firestore batch commit
    await batch.commit();

    // 2. Google Sheets'e upsert (mevcut satırı güncelle veya yeni ekle)
    if (sheetsRows.length > 0) {
      try {
        const result = await upsertToSheet(sheetsRows);
        return NextResponse.json({
          success: true,
          message: `${entries.length} kayıt başarıyla kaydedildi`,
          sheetsUpdate: {
            updated: result.updated,
            added: result.added,
          },
        });
      } catch (sheetError: any) {
        console.error('Google Sheets hatası:', sheetError);
        // Firestore başarılı ama Sheets başarısız - kullanıcıya bildir ama devam et
        return NextResponse.json({
          success: true,
          warning: 'Firestore kaydedildi ancak Google Sheets güncellenemedi',
          sheetError: sheetError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${entries.length} kayıt başarıyla kaydedildi`,
    });
  } catch (error: any) {
    console.error('POST /api/attendance/save error:', error);
    return NextResponse.json(
      { error: 'Yoklama kaydedilirken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

