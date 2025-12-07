import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // 1. Baca data dari Frontend
    const { email, password, role } = await request.json();

    // 2. Tentukan file target (users.json atau admins.json)
    const fileName = role === 'admin' ? 'admins.json' : 'users.json';
    const filePath = path.join(process.cwd(), 'src/data', fileName);

    // 3. Baca isi file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const accounts = JSON.parse(fileData);

    // 4. Cari akun yang cocok
    const account = accounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    // 5. Validasi Login
    if (!account) {
      // Kita cek lagi apakah emailnya yang salah atau passwordnya
      const emailExists = accounts.some(acc => acc.email === email);
      
      if (!emailExists) {
        return NextResponse.json({ message: 'EMAIL_NOT_FOUND' }, { status: 404 });
      } else {
        return NextResponse.json({ message: 'WRONG_PASSWORD' }, { status: 401 });
      }
    }

    // 6. Login Sukses
    return NextResponse.json({
      message: 'Login Berhasil',
      user: { ...account, role }
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}