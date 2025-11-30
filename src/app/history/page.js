// src/app/history/page.js
'use client';
import Layout from '@/components/Layout';
import HistoryCardComponent from '@/components/HistoryCardComponent'; 
import { useRouter } from 'next/navigation'; 

// --- Data Dummy Riwayat Transaksi LENGKAP ---
const RAW_HISTORY_TRANSACTIONS = [
    { id: 101, locationName: 'Sport Center', fieldName: 'Lapangan Futsal 1', status: 'completed', date: '2025-11-20' },
    { id: 102, locationName: 'Embassy Sport', fieldName: 'Lapangan Futsal 2', status: 'cancelled', date: '2025-11-25' },
    { id: 103, locationName: 'Home Futsal', fieldName: 'Lapangan Futsal A', status: 'completed', date: '2025-11-28' },
];

export default function HistoryPage() {
    
    // SOLUSI: Filter KETAT! HANYA status 'completed' yang ditampilkan.
    const COMPLETED_TRANSACTIONS = RAW_HISTORY_TRANSACTIONS.filter(
        transaction => transaction.status === 'completed' 
    );
    
    const containerClasses = "p-6 max-w-4xl mx-auto";

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Riwayat" 
            activeMenu="Riwayat" 
            showSidebar={true}
        >
            {COMPLETED_TRANSACTIONS.length > 0 ? (
                
                <div className={containerClasses}>
                    <div className="space-y-4">
                        {COMPLETED_TRANSACTIONS.map(transaction => (
                            <HistoryCardComponent 
                                key={transaction.id}
                                transaction={transaction}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                // Empty state (sesuai image_1cacd4.png, tanpa header "Riwayat Transaksi")
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-300">
                        <p className="text-xl font-normal text-gray-500 italic">
                            Belum ada riwayat reservasi yang dilakukan
                        </p>
                    </div>
                </div>
            )}
        </Layout>
    );
}