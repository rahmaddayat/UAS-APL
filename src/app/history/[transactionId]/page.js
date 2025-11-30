// src/app/history/[transactionId]/page.js
'use client';

import Layout from '@/components/Layout';
// Kita akan pastikan ukuran BoltIcon dibatasi dengan baik
import { BoltIcon } from '@heroicons/react/24/outline'; 
import { useParams, useRouter } from 'next/navigation';

// --- Data Dummy Riwayat Transaksi LENGKAP ---
const RAW_HISTORY_DETAILS = [
    { 
        id: '101', 
        locationName: 'Sport Center', 
        fieldName: 'Futsal 1', // Diperbaiki agar rapi saat digabung dengan 'Lapangan'
        status: 'completed', 
        date: '20-11-2025', 
        schedule: '20.00 - 23.00 WIB',
        price: 'Rp120.000,00',
        paymentMethod: 'DANA',
        createdAt: '19-11-2025/10.00 WIB'
    },
    { 
        id: '103', 
        locationName: 'Home Futsal', 
        fieldName: 'Futsal A', 
        status: 'completed', 
        date: '28-11-2025', 
        schedule: '15.00 - 17.00 WIB',
        price: 'Rp100.000,00',
        paymentMethod: 'GOPAY',
        createdAt: '27-11-2025/14.30 WIB'
    },
];

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { transactionId } = params;

    const transaction = RAW_HISTORY_DETAILS.find(t => t.id === transactionId);

    if (!transaction) {
        return (
            <Layout showHeader={true} headerTitle="Detail Riwayat">
                <div className="p-6 text-center text-red-500 font-bold">Riwayat Transaksi tidak ditemukan.</div>
            </Layout>
        );
    }
    
    const handleTutup = () => {
        router.push('/history');
    };

    const tutupButtonStyle = {
        backgroundColor: '#E86500',
    };
    
    return (
        <Layout 
            showHeader={true} 
            headerTitle="Riwayat" 
            showSidebar={true}
        >
            <div className="p-6 max-w-xl mx-auto"> 
                {/* Card Detail */}
                <div className="bg-gray-100 p-8 rounded-lg shadow-xl border border-gray-300 relative">
                   
                    <div className="flex items-start mb-6"> 
                        {/* <BoltIcon className="w-10 h-10 text-black mr-4 flex-shrink:0" />  */}
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-bold text-black">{transaction.locationName}</h3>
                            <p className="text-base text-gray-700">Lapangan {transaction.fieldName}</p>
                        </div>
                    </div>
                    
                    {/* Garis pemisah antara header dan detail */}
                    <hr className=" border-gray-300"/> 
                    
                    {/* Detail Transaksi (Menggunakan Flexbox + Inline Styling untuk min-width) */}
                    <div className="space-y-6"> {/* Mengubah space-y-10 menjadi space-y-4 agar rapi */}
                        
                        {/* Baris Tanggal */}
                        <div className="flex items-start text-lg"> {/* Menggunakan text-lg agar lebih besar dari base */}
                            <span className="font-normal text-gray-700 inline-block" style={{minWidth: '140px'}}>Tanggal</span> 
                            <span className="font-normal text-gray-700 mx-2">:</span> 
                            <span className="font-bold text-black">{transaction.date}</span>
                        </div>
                        
                        {/* Baris Jadwal */}
                        <div className="flex items-start text-lg">
                            <span className="font-normal text-gray-700 inline-block" style={{minWidth: '140px'}}>Jadwal</span> 
                            <span className="font-normal text-gray-700 mx-2">:</span> 
                            <span className="font-bold text-black">{transaction.schedule}</span>
                        </div>
                        
                        {/* Baris Harga */}
                        <div className="flex items-start text-lg">
                            <span className="font-normal text-gray-700 inline-block" style={{minWidth: '140px'}}>Harga</span> 
                            <span className="font-normal text-gray-700 mx-2">:</span> 
                            <span className="font-bold text-black">{transaction.price}</span>
                        </div>
                        
                        {/* Baris Pembayaran */}
                        <div className="flex items-start text-lg">
                            <span className="font-normal text-gray-700 inline-block" style={{minWidth: '140px'}}>Pembayaran</span> 
                            <span className="font-normal text-gray-700 mx-2">:</span> 
                            <span className="font-bold text-black">{transaction.paymentMethod}</span>
                        </div>
                        
                    </div>

                    <hr className="border-gray-300"/> 

                    {/* Footer Informasi & Tombol TUTUP */}
                    <div className="mt-4 pt-4 flex justify-between items-end">
                        <div className="text-sm text-gray-500 leading-relaxed">
                            <p>Created at {transaction.createdAt}</p>
                            <p>Reservation ID : {transaction.id}</p>
                        </div>
                        
                        {/* Tombol Tutup */}
                        <button
                            onClick={handleTutup}
                            style={tutupButtonStyle} 
                            className="text-white font-bold py-2 px-6 rounded-md transition duration-150 shadow-md"
                        >
                            TUTUP
                        </button>
                    </div>

                </div>
            </div>
        </Layout>
    );
}