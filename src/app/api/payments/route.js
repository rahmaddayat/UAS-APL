import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/payments.json');

// --- 1. GET: AMBIL SEMUA DATA PAYMENT (DIGUNAKAN DI HISTORY DETAIL) ---
export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const payments = JSON.parse(data);
    
    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("GET Payment Error:", error);
    return NextResponse.json({ message: 'Error reading payments' }, { status: 500 });
  }
}

// --- 2. POST: CATAT PAYMENT BARU (DIGUNAKAN SAAT BAYAR / CANCEL) ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { reservationId, amount, paymentStatus, paymentMethod } = body;

    let payments = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      try { payments = JSON.parse(fileData); } catch (e) { payments = []; }
    }

    const newPayment = {
      paymentId: `pay-${Date.now()}`,
      reservationId,
      amount: parseFloat(amount),
      paymentStatus, // 'paid' atau 'canceled'
      paymentTime: new Date().toISOString(),
      paymentMethod // 'GOPAY', 'DANA', 'User Request', 'System Timeout'
    };

    payments.push(newPayment);
    fs.writeFileSync(filePath, JSON.stringify(payments, null, 2));

    return NextResponse.json({ message: 'Payment recorded', data: newPayment }, { status: 201 });

  } catch (error) {
    console.error("POST Payment Error:", error);
    return NextResponse.json({ message: 'Failed to record payment' }, { status: 500 });
  }
}