// Çalışan yönetimi API routes
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Çalışan listesi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // Silinmişleri hariç tut (varsayılan)
    const query = includeDeleted
      ? adminDb.collection('employees')
      : adminDb.collection('employees').where('isDeleted', '!=', true);

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const employees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    }));

    return NextResponse.json({ employees });
  } catch (error) {
    const err = error as Error;
    console.error('GET /api/employees error:', error);
    return NextResponse.json(
      { error: 'Çalışanlar yüklenirken hata oluştu', details: err.message },
      { status: 500 }
    );
  }
}

// POST - Yeni çalışan ekle veya mevcut çalışanı aktive et (TC unique)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, tc } = body;

    if (!fullName || !tc) {
      return NextResponse.json(
        { error: 'fullName ve tc gereklidir' },
        { status: 400 }
      );
    }

    // TC ile var olan kayıt var mı kontrol et
    const existingQuery = await adminDb
      .collection('employees')
      .where('tc', '==', tc)
      .limit(1)
      .get();

    const now = FieldValue.serverTimestamp();

    if (!existingQuery.empty) {
      // Var olan kaydı aktive et
      const existingDoc = existingQuery.docs[0];
      await existingDoc.ref.update({
        fullName,
        isDeleted: false,
        updatedAt: now,
      });

      const updatedData = (await existingDoc.ref.get()).data();
      return NextResponse.json({
        employee: {
          id: existingDoc.id,
          ...updatedData,
          createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || updatedData?.createdAt,
          updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || updatedData?.updatedAt,
        },
        message: 'Mevcut çalışan aktive edildi',
      });
    } else {
      // Yeni kayıt oluştur
      const docRef = await adminDb.collection('employees').add({
        fullName,
        tc,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      });

      const newDoc = await docRef.get();
      const newData = newDoc.data();

      return NextResponse.json({
        employee: {
          id: docRef.id,
          ...newData,
          createdAt: newData?.createdAt?.toDate?.()?.toISOString() || newData?.createdAt,
          updatedAt: newData?.updatedAt?.toDate?.()?.toISOString() || newData?.updatedAt,
        },
        message: 'Yeni çalışan eklendi',
      }, { status: 201 });
    }
  } catch (error) {
    const err = error as Error;
    console.error('POST /api/employees error:', error);
    return NextResponse.json(
      { error: 'Çalışan eklenirken hata oluştu', details: err.message },
      { status: 500 }
    );
  }
}

// PATCH - Çalışan güncelle
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, fullName, tc } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id gereklidir' },
        { status: 400 }
      );
    }

    const updateData: {
      updatedAt: FirebaseFirestore.FieldValue;
      fullName?: string;
      tc?: string;
    } = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (fullName) updateData.fullName = fullName;
    if (tc) {
      // TC değiştiriliyorsa, başka çalışanda bu TC var mı kontrol et
      const existingQuery = await adminDb
        .collection('employees')
        .where('tc', '==', tc)
        .limit(1)
        .get();

      if (!existingQuery.empty && existingQuery.docs[0].id !== id) {
        return NextResponse.json(
          { error: 'Bu TC numarası başka bir çalışana ait' },
          { status: 400 }
        );
      }
      updateData.tc = tc;
    }

    const docRef = adminDb.collection('employees').doc(id);
    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      employee: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || updatedData?.updatedAt,
      },
      message: 'Çalışan güncellendi',
    });
  } catch (error) {
    const err = error as Error;
    console.error('PATCH /api/employees error:', error);
    return NextResponse.json(
      { error: 'Çalışan güncellenirken hata oluştu', details: err.message },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (isDeleted = true)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id gereklidir' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('employees').doc(id);
    await docRef.update({
      isDeleted: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: 'Çalışan silindi (soft delete)',
    });
  } catch (error) {
    const err = error as Error;
    console.error('DELETE /api/employees error:', error);
    return NextResponse.json(
      { error: 'Çalışan silinirken hata oluştu', details: err.message },
      { status: 500 }
    );
  }
}

