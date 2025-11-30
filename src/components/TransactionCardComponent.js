'use client'; 
import { MapPinIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

/**
 * Komponen Card untuk menampilkan detail dan status/tanggal transaksi.
 */
export default function TransactionCardComponent({ transaction }) {
    const router = useRouter(); 
    const { locationName, fieldName, status, id, date } = transaction; 

    // Tentukan base path navigasi
    const basePath = (status === 'completed' || status === 'cancelled') ? '/history' : '/transaction';
    
    // --- Data Status dan Styling ---
    let statusText = '';
    let statusClasses = '';
    let icon = MapPinIcon; 

    // LOGIKA REVISI
    switch (status) {
        case 'pending_admin':
        case 'pending_payment':
            statusText = status === 'pending_admin' ? 'Menunggu Konfirmasi Admin' : 'Menunggu Pembayaran';
            statusClasses = status === 'pending_admin' ? 'bg-red-200 text-red-800 border-red-400' : 'bg-yellow-200 text-yellow-800 border-yellow-400';
            icon = MapPinIcon; // Untuk transaksi aktif
            break;

        case 'completed': 
            // KHUSUS RIWAYAT SELESAI: Tampilkan tanggal
            statusText = dayjs(date).format('DD-MM-YYYY'); 
            statusClasses = 'bg-gray-300 text-gray-800 border-gray-400'; 
            icon = BoltIcon; // Gunakan BoltIcon (Futsal) untuk riwayat/selesai
            break;

        case 'cancelled': 
            // Meskipun data ini tidak akan ditampilkan di daftar, logika tetap ada
            statusText = 'Dibatalkan';
            statusClasses = 'bg-gray-400 text-gray-900 border-gray-500';
            icon = BoltIcon;
            break;
            
        default:
            statusText = 'Status Lain';
            statusClasses = 'bg-gray-200 text-gray-800';
    }

    const IconComponent = icon;

    const handleCardClick = () => {
        router.push(`${basePath}/${id}`); 
    };

    return (
        <div 
            className="relative flex items-center p-4 bg-gray-100 rounded-lg shadow-md mb-4 border border-gray-300 hover:bg-gray-200 transition duration-150 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-start flex-1">
                <IconComponent className="w-8 h-8 text-black mr-4 mt-1" /> 
                
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-black">{locationName}</h3>
                    <p className="text-sm text-gray-700">{fieldName}</p>
                </div>
            </div>

            {/* Badge menampilkan status atau tanggal */}
            <div className={`absolute bottom-2 right-4 py-1 px-3 rounded-md text-xs font-bold whitespace-nowrap ${statusClasses}`}>
                {statusText}
            </div>
            
        </div>
    );
}