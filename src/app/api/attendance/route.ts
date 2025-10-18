// Yoklama kayıtlarını getir (belirli tarih için)
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json(
        { error: 'date parametresi gereklidir (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // attendance/{date}/entries/ koleksiyonundan tüm kayıtları getir
    const entriesSnapshot = await adminDb
      .collection('attendance')
      .doc(date)
      .collection('entries')
      .get();

    const entries = entriesSnapshot.docs.map(doc => ({
      employeeId: doc.id,
      ...doc.data(),
      ts: doc.data().ts?.toDate?.()?.toISOString() || doc.data().ts,
    }));

    return NextResponse.json({ date, entries });
  } catch (error: any) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json(
      { error: 'Yoklama kayıtları yüklenirken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

