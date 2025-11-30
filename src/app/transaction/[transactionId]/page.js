'use client';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { BoltIcon } from '@heroicons/react/24/outline'; 

// Fungsi pembantu untuk memformat Rupiah
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
    }).format(amount);
};

// --- Data Dummy Transaksi Detail ---
// Key HARUS sesuai dengan ID yang dikirim dari Card (yaitu '1', '2', '3')
const DUMMY_TRANSACTIONS = {
    '1': { 
        locationName: 'Sport Center',
        fieldName: 'Lapangan Futsal 1',
        date: '2025-12-10',
        slots: ['20.00 - 21.00 WIB', '21.00 - 22.00 WIB', '22.00 - 23.00 WIB'], // 3 jam
        pricePerHour: 40000,
        status: 'pending_admin',
        createdAt: '2025-11-30T08:00:00',
    },
    '2': { 
        locationName: 'Sport Center',
        fieldName: 'Lapangan Futsal 2',
        date: '2025-12-12',
        slots: ['18.00 - 19.00 WIB', '19.00 - 20.00 WIB'], // 2 jam
        pricePerHour: 60000,
        status: 'pending_payment',
        createdAt: '2025-11-30T09:30:00',
    },
    '3': { 
        locationName: 'Embassy Sport',
        fieldName: 'Lapangan Futsal 1',
        date: '2025-12-15',
        slots: ['10.00 - 11.00 WIB'], // 1 jam
        pricePerHour: 50000,
        status: 'pending_admin',
        createdAt: '2025-11-30T10:00:00',
    },
};

export default function TransactionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const transactionId = params.transactionId; // Akan menjadi string, misal: "1"

    // Mencari data menggunakan ID dari URL
    const transaction = DUMMY_TRANSACTIONS[transactionId]; 

    // --- ALERT: Tampilkan alert jika status Admin Pending ---
    useEffect(() => {
        if (transaction && transaction.status === 'pending_admin') {
            alert("Reservasi Anda sedang menunggu konfirmasi dari Admin.");
        }
    }, [transaction]);

    if (!transaction) {
        return (
            <Layout showHeader={true} headerTitle="Transaksi" showBackButton={true}>
                <div className="p-6 text-center">
                    <p className="text-xl text-red-600">Transaksi tidak ditemukan.</p>
                </div>
            </Layout>
        );
    }
    
    // --- Perhitungan dan Pemformatan ---
    const totalHours = transaction.slots.length;
    const totalPrice = useMemo(() => totalHours * transaction.pricePerHour, [totalHours, transaction.pricePerHour]);
    const formattedDate = dayjs(transaction.date).format('DD-MM-YYYY');
    
    // Gabungkan slot menjadi rentang waktu tunggal (e.g., 20.00 - 23.00 WIB)
    const timeSlotsDisplay = `${transaction.slots[0].split(' - ')[0]} - ${transaction.slots[transaction.slots.length - 1].split(' - ')[1]}`;
    const formattedCreatedAt = dayjs(transaction.createdAt).format('DD-MM-YYYY/HH.mm');

    // --- Status Teks dan Warna ---
    let statusText = '';
    let statusClasses = '';
    const isPaymentRequired = transaction.status === 'pending_payment';
    
    if (transaction.status === 'pending_admin') {
        statusText = 'Menunggu Konfirmasi Admin';
        statusClasses = 'bg-red-200 text-red-800 border-red-400';
    } else if (transaction.status === 'pending_payment') {
        statusText = 'Menunggu Pembayaran';
        statusClasses = 'bg-yellow-200 text-yellow-800 border-yellow-400';
    } else {
        statusText = 'Status Lain';
        statusClasses = 'bg-gray-200 text-gray-800';
    }

    const handleBayarClick = () => {
        alert(`Melanjutkan proses pembayaran untuk total ${formatCurrency(totalPrice)}.`);
    }
    
    // --- Komponen Pembantu ---
    const DetailRow = ({ label, value }) => (
        <div className="flex justify-start items-center mb-1">
            <p className="text-lg font-normal text-gray-800 w-1/4 min-w:[80px]">{label}</p>
            <p className="text-xl font-bold text-gray-800 mx-2">:</p>
            <p className="text-xl font-bold text-gray-800 flex-1">{value}</p>
        </div>
    );
    
    const PaymentButton = ({ name }) => (
        <button className="flex-1 border border-gray-400 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-200 transition duration-150 shadow-sm">
            {name}
        </button>
    );

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Detail Transaksi" 
            showBackButton={true}
            onBackClick={() => router.back()}
        >
            <div className="p-6 max-w-lg mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-300">
                    
                    {/* Header Card (Lokasi, Lapangan, Status) */}
                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div className="flex items-start">
                            <BoltIcon className="w-8 h-8 text-black mr-4" /> 
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-black">{transaction.locationName}</h3>
                                <p className="text-md text-gray-700">{transaction.fieldName}</p>
                            </div>
                        </div>
                        {/* Status Badge */}
                        <div className={`py-1 px-3 rounded-md text-sm font-bold whitespace-nowrap ${statusClasses} mt-1`}>
                            {statusText}
                        </div>
                    </div>
                    
                    {/* Detail Transaksi (Tanggal, Jadwal, Harga) */}
                    <div className="space-y-4 mb-8">
                        <DetailRow label="Tanggal" value={formattedDate} />
                        <DetailRow label="Jadwal" value={timeSlotsDisplay} />
                        <DetailRow label="Harga" value={formatCurrency(totalPrice)} />
                    </div>

                    {/* Pembayaran Section */}
                    {isPaymentRequired && (
                        <div className="flex flex-col space-y-4">
                            <div className="flex space-x-3">
                                <PaymentButton name="DANA" />
                                <PaymentButton name="GOPAY" />
                                <PaymentButton name="OVO" />
                            </div>
                            <button 
                                onClick={handleBayarClick}
                                className="w-full bg-[#E86500] hover:bg-[#C95500] text-white font-bold py-3 rounded-md text-lg shadow-md transition duration-200"
                            >
                                Bayar
                            </button>
                        </div>
                    )}

                    {/* Footer Informasi Transaksi (Created at dan Reservation ID) */}
                    <div className="text-xs text-gray-500 mt-6 pt-4 border-t">
                        <p>Created at **{formattedCreatedAt}** WIB</p>
                        <p>Reservation ID : {transactionId}</p>
                    </div>

                </div>
            </div>
        </Layout>
    );
}