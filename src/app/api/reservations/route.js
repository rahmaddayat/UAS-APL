import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/reservations.json');

// --- 1. GET: AMBIL DATA RESERVASI (FILTER BY DATE) ---
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }

    // Baca File
    const fileData = fs.readFileSync(filePath, 'utf8');
    const reservations = JSON.parse(fileData);

    // Filter Data
    let filtered = reservations;
    if (date) {
      filtered = filtered.filter(r => r.date === date);
    }
    
    return NextResponse.json(filtered, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 });
  }
}

// --- 2. POST: SIMPAN RESERVASI BARU ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, courtId, date, timeSlots, totalPrice } = body;

    let reservations = [];
    try {
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        reservations = JSON.parse(fileData);
      }
    } catch (err) { reservations = []; }

    const newReservation = {
      id: `res-${Date.now()}`,
      userId,
      courtId,
      date,
      timeSlots,
      totalPrice,
      status: 'pending', // Default
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));

    return NextResponse.json({ message: 'Success', data: newReservation }, { status: 201 });

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ message: 'Failed' }, { status: 500 });
  }
}

// --- 3. PUT: UPDATE STATUS TRANSAKSI (BAYAR / BATAL / CONFIRM) ---
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, message } = body; 

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'Database not found' }, { status: 404 });
    }

    // Baca File
    const fileData = fs.readFileSync(filePath, 'utf8');
    let reservations = JSON.parse(fileData);

    // Cari Index Data
    const index = reservations.findIndex(r => r.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    // Update Status
    reservations[index].status = status;

    // Simpan pesan (jika ada, misal alasan cancel)
    if (message) {
      reservations[index].message = message;
    }

    // LOGIKA TIMER: Catat waktu konfirmasi untuk timer 30 menit
    if (status === 'confirmed') {
      reservations[index].confirmedAt = new Date().toISOString();
    }

    // Simpan Perubahan
    fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));

    return NextResponse.json({ message: 'Status updated', data: reservations[index] }, { status: 200 });

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}