    import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // 1. Baca data dari Frontend
    const { username, email, password } = await request.json();

    // 2. Tentukan lokasi file users.json
    const filePath = path.join(process.cwd(), 'src/data/users.json');

    // 3. Baca isi file saat ini
    const fileData = fs.readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileData);

    // 4. Validasi: Cek apakah email sudah ada
    if (users.some((user) => user.email === email)) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 400 }
      );
    }

    // 5. Buat User Baru
    const newUser = {
      id: `u-${Date.now()}`,
      username,
      email,
      password,
    };

    // 6. Masukkan ke array dan Tulis Ulang File JSON (Simpan Permanen)
    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    // 7. Kirim respon sukses ke Frontend
    return NextResponse.json(
      { message: 'Registrasi Berhasil', data: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}