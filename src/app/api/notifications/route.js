import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/notifications.json');

// --- GET: AMBIL SEMUA NOTIFIKASI ---
export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }
    const fileData = fs.readFileSync(filePath, 'utf8');
    const notifications = JSON.parse(fileData);
    
    // Urutkan dari yang terbaru (Descending)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// --- POST: TAMBAH NOTIFIKASI BARU ---
export async function POST(request) {
  try {
    const newNotif = await request.json();
    
    let notifications = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      notifications = JSON.parse(fileData);
    }

    // Tambahkan notifikasi baru di awal array
    notifications.unshift(newNotif);

    // Simpan ke file
    fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2));

    return NextResponse.json({ message: 'Saved', data: newNotif }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving notification' }, { status: 500 });
  }
}

// --- DELETE: HAPUS SEMUA NOTIFIKASI ---
export async function DELETE() {
  try {
    // Timpa file dengan array kosong
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return NextResponse.json({ message: 'All notifications cleared' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error clearing notifications' }, { status: 500 });
  }
}