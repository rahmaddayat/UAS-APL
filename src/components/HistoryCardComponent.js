// src/components/HistoryCardComponent.js
'use client'; 
import { BoltIcon } from '@heroicons/react/24/outline'; 
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

/**
 * Komponen Card khusus untuk halaman Riwayat (/history).
 */
export default function HistoryCardComponent({ transaction }) {
    const router = useRouter(); 
    const { locationName, fieldName, status, id, date } = transaction; 

    const basePath = '/history';
    
    // --- Logika Badge Riwayat ---
    let badgeContent = null; 

    // 1. Jika statusnya "completed" (Selesai), tampilkan tanggal.
    if (status === 'completed') {
        badgeContent = (
            <div className="absolute bottom-2 right-4 py-1 px-3 rounded-md text-xs font-bold whitespace-nowrap bg-gray-300 text-gray-800 border-gray-400">
                {dayjs(date).format('DD-MM-YYYY')}
            </div>
        );
    } 
    // 2. Jika status "cancelled" (Dibatalkan) atau lainnya, badgeContent tetap null.
    //    Ini memenuhi permintaan Anda untuk tidak menampilkan status teks di sudut kanan bawah.
    
    const handleCardClick = () => {
        router.push(`${basePath}/${id}`); 
    };

    return (
        <div 
            className="relative flex items-center p-4 bg-white rounded-lg shadow-md mb-4 border border-gray-300 hover:bg-gray-200 transition duration-150 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-start flex-1">
                <BoltIcon className="w-8 h-8 text-black mr-4 mt-1" /> 
                
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-black">{locationName}</h3>
                    <p className="text-sm text-gray-700">{fieldName}</p>
                </div>
            </div>

            {/* Render badge hanya jika ada isinya (hanya untuk status completed) */}
            {badgeContent} 
        </div>
    );
}