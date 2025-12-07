### Rahmad Hidayatullah Tsunami
### 2308107010051
### Link Youtube : https://youtu.be/0cMsQJAwJaQ

# 🏟️ SportField - Sistem Reservasi Lapangan Olahraga

**SportField** adalah aplikasi berbasis web untuk memudahkan pemesanan (booking) lapangan olahraga secara online. Sistem ini menghubungkan penyedia lapangan dengan pengguna, menangani manajemen jadwal, pembayaran digital, dan notifikasi real-time.

## 🏗️ Tech Stack

* **Framework:** [Next.js 13+](https://nextjs.org/) (App Router)
* **Language:** JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** Heroicons
* **Database:** JSON File System (Server-side storage simulation)


## 🚀 Fitur Utama

### 👤 User (Pelanggan)
* **Browsing Lapangan:** Melihat daftar venue olahraga (Futsal, Badminton, Basket).
* **Booking System:** Memilih tanggal dan slot waktu secara interaktif.
* **Pembayaran Digital:** Simulasi pembayaran menggunakan E-Wallet (DANA, OVO, GoPay).
* **Notifikasi & History:** Menerima update status booking (Diterima/Ditolak) dan melihat riwayat transaksi.
* **Tier User:** Dukungan untuk user Regular dan VIP (Diskon khusus).

### 🛡️ Admin (Pengelola)
* **Dashboard Manajemen:** Mengelola data lapangan dan venue.
* **Approval System:** Menyetujui atau menolak reservasi masuk.
* **Audit Log:** Memantau aktivitas sistem secara teknis.
* **Manajemen Jadwal:** Mengatur jam operasional dan hari libur venue.

---

## 🏗️ Tech Stack

* **Framework:** [Next.js 13+](https://nextjs.org/) (App Router)
* **Language:** JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** Heroicons
* **Database:** JSON File System (Server-side storage simulation)

---

## 🧠 Design Patterns (Arsitektur Sistem)

Proyek ini dibangun dengan menerapkan prinsip **Software Engineering** yang kuat, menggunakan minimal 4 Design Patterns utama untuk memastikan kode yang bersih, modular, dan mudah dikembangkan.

| Design Pattern | Implementasi di Proyek | Lokasi Kode Utama |
| :--- | :--- | :--- |
| **Singleton** | Mengelola koneksi data agar tersentralisasi. Memastikan hanya ada satu instance `DatabaseService` yang berjalan di seluruh aplikasi. | `src/services/DatabaseService.js` |
| **Observer** | Menangani *side-effects* perubahan status reservasi. Ketika status berubah, sistem otomatis mengirim notifikasi ke User dan mencatat Audit Log. | `src/utils/Observers.js`<br>`src/services/DatabaseService.js` |
| **Strategy** | Menangani logika pembayaran yang berbeda-beda (DANA, OVO, GoPay) dengan antarmuka yang seragam namun perilaku berbeda. | `src/strategies/PaymentStrategy.js` |

---

Tentu, ini adalah draf README.md yang komprehensif, profesional, dan siap pakai. Dokumen ini dirancang khusus untuk menonjolkan fitur teknis dan Design Patterns yang telah Anda implementasikan, yang sangat bagus untuk keperluan tugas kuliah atau portofolio.

Silakan buat file bernama README.md di root folder proyek Anda dan salin kode di bawah ini:

Markdown

# 🏟️ SportField - Sistem Reservasi Lapangan Olahraga

**SportField** adalah aplikasi berbasis web untuk memudahkan pemesanan (booking) lapangan olahraga secara online. Sistem ini menghubungkan penyedia lapangan dengan pengguna, menangani manajemen jadwal, pembayaran digital, dan notifikasi real-time.

![SportField Banner](public/field-bg.jpg) ## 🚀 Fitur Utama

### 👤 User (Pelanggan)
* **Browsing Lapangan:** Melihat daftar venue olahraga (Futsal, Badminton, Basket).
* **Booking System:** Memilih tanggal dan slot waktu secara interaktif.
* **Pembayaran Digital:** Simulasi pembayaran menggunakan E-Wallet (DANA, OVO, GoPay).
* **Notifikasi & History:** Menerima update status booking (Diterima/Ditolak) dan melihat riwayat transaksi.
* **Tier User:** Dukungan untuk user Regular dan VIP (Diskon khusus).

### 🛡️ Admin (Pengelola)
* **Dashboard Manajemen:** Mengelola data lapangan dan venue.
* **Approval System:** Menyetujui atau menolak reservasi masuk.
* **Audit Log:** Memantau aktivitas sistem secara teknis.
* **Manajemen Jadwal:** Mengatur jam operasional dan hari libur venue.

---

## 📂 Struktur Folder Utama

```bash
src/
├── app/
│   ├── admin/           # Halaman khusus Admin
│   ├── api/             # API Routes (Backend logic)
│   ├── notification/    # Halaman Notifikasi User
│   ├── transaction/     # Halaman Pembayaran
│   └── reservation/     # Halaman Booking
├── components/          # Komponen UI Reusable (Navbar, Sidebar, Modal)
├── data/                # File JSON sebagai Database (users, reservations, etc)
├── services/            # Logic utama (DatabaseService - Singleton)
└── strategies/          # Strategies payment (Strategy)
└── utils/               # Utility classes (Observers)

🛠️ Cara Menjalankan Proyek
Pastikan Node.js telah terinstall 

Clone Repository
git clone [https://github.com/rahmaddayat/UAS-APL.git]
cd UAS-APL

Install Dependencies
npm install

Jalankan Development Server
npm run dev

Buka Aplikasi Buka browser dan akses http://localhost:3000.