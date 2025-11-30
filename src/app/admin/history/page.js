// src/app/admin/history/page.js
'use client';

import { useState, useMemo } from 'react';
import Layout from '@/components/Layout'; 
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Menggunakan ikon cek untuk riwayat
import { useRouter } from 'next/navigation';

// --- DUMMY DATA LENGKAP ---
const ALL_DUMMY_RESERVATIONS = [
    {
        id: 1,
        fieldName: 'Lapangan Futsal 1',
        user: 'Budi Santoso',
        date: '25-11-2025',
        timeSlot: '18.00 - 19.00 WIB',
        createdAt: '20-11-2025/10.30 WIB',
        status: 'pending', // Belum dibayar, tidak akan muncul di Riwayat
        price: 60000,
    },
    {
        id: 2,
        fieldName: 'Lapangan Badminton 2',
        user: 'Siti Aisyah',
        date: '26-11-2025',
        timeSlot: '20.00 - 21.00 WIB',
        createdAt: '20-11-2025/11.15 WIB',
        status: 'paid', // SUDAH DIBAYAR, akan muncul di Riwayat
        price: 45000,
    },
    {
        id: 3,
        fieldName: 'Lapangan Futsal 3',
        user: 'Joko Widodo',
        date: '27-11-2025',
        timeSlot: '19.00 - 20.00 WIB',
        createdAt: '21-11-2025/09.00 WIB',
        status: 'paid', // SUDAH DIBAYAR, akan muncul di Riwayat
        price: 60000,
    },
    {
        id: 4,
        fieldName: 'Lapangan Basket',
        user: 'Ani Setiadi',
        date: '28-11-2025',
        timeSlot: '15.00 - 16.00 WIB',
        createdAt: '22-11-2025/12.00 WIB',
        status: 'cancelled', // Dibatalkan, tidak akan muncul di Riwayat Pembayaran
        price: 70000,
    },
];

// Format harga ke mata uang Rupiah
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};


/**
 * Komponen Card Riwayat Reservasi (Inline Component)
 */
const HistoryReservationCard = ({ reservation }) => {
    
    // Menampilkan ikon berdasarkan jenis lapangan (contoh)
    const getFieldIcon = (name) => {
        if (name.toLowerCase().includes('futsal')) {
            return '⚽'; 
        } else if (name.toLowerCase().includes('badminton')) {
            return '🏸';
        } else if (name.toLowerCase().includes('basket')) {
            return '🏀';
        }
        return '🏟️';
    };

    return (
        <div 
            // Riwayat biasanya tidak bisa diklik untuk tindakan, hanya detail
            className="w-full bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200"
        >
            <div className="flex items-start justify-between">
                {/* Bagian Kiri: Detail Lapangan & User */}
                <div className="flex items-center space-x-4">
                    <span className="text-3xl">{getFieldIcon(reservation.fieldName)}</span>
                    <div>
                        <p className="text-lg font-bold font-mono text-gray-800">{reservation.fieldName}</p>
                        <p className="text-sm font-mono text-gray-600 mt-1">
                            **Pemesan:** {reservation.user}
                        </p>
                        <p className="text-sm font-mono text-gray-600">
                            **Jadwal:** {reservation.date} | {reservation.timeSlot}
                        </p>
                        <p className="text-sm font-mono font-bold text-green-700 mt-1">
                            **Total Bayar:** {formatCurrency(reservation.price)}
                        </p>
                    </div>
                </div>
                
                {/* Bagian Kanan: Status Pembayaran */}
                <div className="text-right flex flex-col items-end">
                    <p className="text-xs text-gray-500 font-mono mb-2">
                        Dibuat pada: {reservation.createdAt}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 font-mono">
                        <CheckCircleIcon className="h-4 w-4 mr-1"/> SUDAH DIBAYAR
                    </span>
                </div>
            </div>
        </div>
    );
};


export default function HistoryPage() {
    const router = useRouter();
    // Menggunakan state lokal untuk simulasi
    const [allReservations] = useState(ALL_DUMMY_RESERVATIONS);
    
    // Filter reservasi: hanya tampilkan yang sudah dibayar ('paid')
    const paidReservations = useMemo(() => {
        return allReservations.filter(res => res.status === 'paid');
    }, [allReservations]);

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Riwayat" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-4 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 font-mono text-gray-900">Riwayat Reservasi (Sudah Dibayar)</h2>
                
                {paidReservations.length === 0 ? (
                    // --- Skenario 1: Tidak Ada Riwayat Pembayaran ---
                    <div className="text-center p-10 bg-white rounded-lg shadow-lg mt-10">
                        <p className="text-xl font-mono text-gray-500">
                            Tidak ada riwayat reservasi yang sudah dibayar saat ini
                        </p>
                                            </div>
                ) : (
                    // --- Skenario 2: Ada Riwayat Pembayaran (Render Card) ---
                    <div className="space-y-4">
                        {paidReservations.map((reservation) => (
                            <HistoryReservationCard 
                                key={reservation.id}
                                reservation={reservation}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}