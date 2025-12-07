import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/fields.json');

// --- GET: AMBIL SEMUA FIELD ---
export async function GET() {
  try {
    if (!fs.existsSync(filePath)) return NextResponse.json([], { status: 200 });
    // BACA FILE SETIAP REQUEST
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data), { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error reading fields' }, { status: 500 });
  }
}

// --- PUT: UPDATE DATA FIELD (JADWAL & LIBUR) ---
export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Destructure semua properti yang mungkin dikirim
    const { 
        id, 
        openHour, 
        closeHour, 
        breakHours, 
        closedDays,           
        specificClosedDates   
    } = body;

    if (!fs.existsSync(filePath)) return NextResponse.json({ message: 'File not found' }, { status: 404 });
    
    let fields = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = fields.findIndex(f => f.id === id);

    if (index === -1) return NextResponse.json({ message: 'Field not found' }, { status: 404 });

    // UPDATE LOGIC: Gunakan spread operator conditional
    fields[index] = { 
        ...fields[index], 
        
        // Data Jadwal Harian
        ...(openHour !== undefined && { openHour }),
        ...(closeHour !== undefined && { closeHour }),
        ...(breakHours !== undefined && { breakHours }),

        // Data Hari Libur
        ...(closedDays !== undefined && { closedDays }), 
        ...(specificClosedDates !== undefined && { specificClosedDates }) 
    };
    
    fs.writeFileSync(filePath, JSON.stringify(fields, null, 2));

    return NextResponse.json({ message: 'Field Data Updated', data: fields[index] }, { status: 200 });
  } catch (error) {
    console.error("Update Field Error:", error);
    return NextResponse.json({ message: 'Failed to update field data' }, { status: 500 });
  }
}