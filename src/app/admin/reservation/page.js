// src/app/admin/reservation/page.js
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout'; 
import { BoltIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Untuk navigasi

// --- DUMMY DATA ---
// Skenario 1: Daftar reservasi kosong (Gunakan ini untuk melihat tampilan "Tidak ada reservasi")
// const DUMMY_RESERVATIONS = []; 

// Skenario 2: Ada daftar reservasi (Gunakan ini untuk melihat tampilan daftar card)
const DUMMY_RESERVATIONS = [
    {
        id: 1,
        fieldName: 'Lapangan Futsal 1',
        user: 'Budi Santoso',
        date: '25-11-2025',
        timeSlot: '18.00 - 19.00 WIB',
        createdAt: '20-11-2025/10.30 WIB',
        status: 'pending'
    },
    {
        id: 2,
        fieldName: 'Lapangan Badminton 2',
        user: 'Siti Aisyah',
        date: '26-11-2025',
        timeSlot: '20.00 - 21.00 WIB',
        createdAt: '20-11-2025/11.15 WIB',
        status: 'pending'
    },
];

/**
 * Komponen Card Reservasi (Inline Component)
 * Menampilkan detail reservasi dan dapat diklik untuk navigasi.
 */
const ReservationCard = ({ reservation, onClick }) => {
    // Menampilkan ikon berdasarkan jenis lapangan (contoh)
    const getFieldIcon = (name) => {
        if (name.toLowerCase().includes('futsal')) {
            return '⚽'; 
        } else if (name.toLowerCase().includes('badminton')) {
            return '🏸';
        }
        return '🏟️';
    };

    return (
        <div 
            onClick={onClick}
            className="w-full bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-200 cursor-pointer mb-4 border border-gray-300"
        >
            <div className="flex items-start justify-between">
                {/* Bagian Kiri: Detail Lapangan */}
                <div className="flex items-center space-x-4">
                    <span className="text-3xl">{getFieldIcon(reservation.fieldName)}</span>
                    <div>
                        <p className="text-lg font-bold font-mono text-gray-800">{reservation.fieldName}</p>
                        <p className="text-sm font-mono text-gray-600 mt-1">
                            **User:** {reservation.user}
                        </p>
                        <p className="text-sm font-mono text-gray-600">
                            **Jadwal:** {reservation.date} | {reservation.timeSlot}
                        </p>
                    </div>
                </div>
                
                {/* Bagian Kanan: Status & Waktu dibuat */}
                <div className="text-right">
                    <p className="text-xs text-gray-500 font-mono">
                        Dibuat pada: {reservation.createdAt}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 font-mono">
                        {reservation.status.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};


export default function ReservationPage() {
    const router = useRouter();
    // Gunakan dummy data di sini
    const [reservations, setReservations] = useState(DUMMY_RESERVATIONS);
    
    // Fungsi untuk mensimulasikan navigasi ke halaman konfirmasi
    const handleCardClick = (reservationId) => {
        // NOTE: Di sini, Anda akan menavigasi ke halaman konfirmasi reservasi
        // Misalnya: router.push(`/admin/reservation/confirm/${reservationId}`);
        
        console.log(`Navigasi ke halaman konfirmasi untuk Reservasi ID: ${reservationId}`);
        
        // Contoh navigasi ke halaman dummy:
        router.push(`/admin/reservation/${reservationId}`); 
        
        // Karena halaman detail konfirmasi belum ada, ini hanya contoh logging.
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Reservasi" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-4 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 font-mono text-gray-900">Daftar Reservasi Baru</h2>
                
                {reservations.length === 0 ? (
                    // --- Skenario 1: Tidak Ada Reservasi ---
                    <div className="text-center p-10 bg-white rounded-lg shadow-lg mt-10">
                        <p className="text-xl font-mono text-gray-500">
                            Tidak ada reservasi dari pelanggan saat ini
                        </p>
                                            </div>
                ) : (
                    // --- Skenario 2: Ada Reservasi (Render Card) ---
                    <div className="space-y-4">
                        {reservations.map((reservation) => (
                            <ReservationCard 
                                key={reservation.id}
                                reservation={reservation}
                                onClick={() => handleCardClick(reservation.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Catatan: Di tampilan Anda (image_ca6d06.png), ada tampilan sidebar admin. 
                    Layout komponen sudah menangani hal ini, namun isi utama 
                    akan mengikuti logika di atas. */}
            </div>
        </Layout>
    );
}