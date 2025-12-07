import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path tetap mengarah ke src/data/courts.json
const filePath = path.join(process.cwd(), 'src/data/courts.json');

// --- GET: AMBIL SEMUA COURT ---
export async function GET() {
  try {
    if (!fs.existsSync(filePath)) return NextResponse.json([], { status: 200 });
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data), { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error reading courts' }, { status: 500 });
  }
}

// --- POST: TAMBAH COURT BARU ---
export async function POST(request) {
  try {
    const body = await request.json();
    // Body: { fieldId, name, pricePerHour, type }
    
    let courts = [];
    if (fs.existsSync(filePath)) {
      courts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const newCourt = {
      id: `c-${Date.now()}`, // Generate ID unik
      ...body
    };

    courts.push(newCourt);
    fs.writeFileSync(filePath, JSON.stringify(courts, null, 2));

    return NextResponse.json({ message: 'Success', data: newCourt }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to add court' }, { status: 500 });
  }
}

// --- PUT: EDIT COURT ---
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, pricePerHour, type } = body;

    if (!fs.existsSync(filePath)) return NextResponse.json({ message: 'File not found' }, { status: 404 });
    
    let courts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = courts.findIndex(c => c.id === id);

    if (index === -1) return NextResponse.json({ message: 'Court not found' }, { status: 404 });

    // Update data
    courts[index] = { ...courts[index], name, pricePerHour, type };
    
    fs.writeFileSync(filePath, JSON.stringify(courts, null, 2));

    return NextResponse.json({ message: 'Updated', data: courts[index] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}

// --- DELETE: HAPUS COURT ---
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!fs.existsSync(filePath)) return NextResponse.json({ message: 'File not found' }, { status: 404 });

    let courts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const newCourts = courts.filter(c => c.id !== id);

    fs.writeFileSync(filePath, JSON.stringify(newCourts, null, 2));

    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 });
  }
}