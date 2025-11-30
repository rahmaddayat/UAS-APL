'use client';
import Layout from '@/components/Layout';
import TransactionCardComponent from '@/components/TransactionCardComponent';

// --- Data Dummy Transaksi Aktif ---
const ACTIVE_TRANSACTIONS = [
    {
        id: 1, // ID numerik
        locationName: 'Sport Center',
        fieldName: 'Lapangan Futsal 1',
        status: 'pending_admin', // Menunggu Konfirmasi Admin
        date: '2025-12-10',
    },
    {
        id: 2, // ID numerik
        locationName: 'Sport Center',
        fieldName: 'Lapangan Futsal 2',
        status: 'pending_payment', // Menunggu Pembayaran
        date: '2025-12-12',
    },
    {
        id: 3, // ID numerik
        locationName: 'Embassy Sport',
        fieldName: 'Lapangan Futsal 1',
        status: 'pending_admin',
        date: '2025-12-15',
    },
];

export default function TransaksiPage() {
    return (
        <Layout 
            showHeader={true} 
            headerTitle="Transaksi" 
            showSidebar={true}
        >
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Transaksi Aktif</h2>
                <div className="space-y-4">
                    {ACTIVE_TRANSACTIONS.length > 0 ? (
                        ACTIVE_TRANSACTIONS.map(transaction => (
                            <TransactionCardComponent 
                                key={transaction.id}
                                transaction={transaction}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 rounded-lg border border-gray-200 bg-white">
                            <p className="text-lg text-gray-600 italic">Tidak ada transaksi yang sedang berlangsung</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}