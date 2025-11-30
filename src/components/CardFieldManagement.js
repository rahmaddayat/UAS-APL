// src/components/CardFieldManagement.js
import { PencilIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Menggunakan solid ikon

/**
 * CardFieldManagement Component
 * Menampilkan informasi lapangan (nama, harga) dan tombol aksi (edit, hapus).
 * * Props:
 * - fieldName: string, nama lapangan
 * - price: string, harga per jam (misal: "Rp60.000,00/jam")
 * - onEdit: function, handler ketika tombol edit diklik
 * - onDelete: function, handler ketika tombol hapus diklik
 */
const CardFieldManagement = ({ fieldName, price, onEdit, onDelete }) => {
    return (
        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300">
            
            {/* Kiri: Ikon dan Detail Lapangan */}
            <div className="flex items-center space-x-4">
                {/* Ikon roda gigi, diasumsikan dari mockup, menggunakan ikon generik jika tidak ada spesifik */}
                {/* Untuk ikon spesifik roda gigi, Anda mungkin perlu Heroicons GearIcon jika ada */}
                {/* Saya akan gunakan lingkaran hitam seperti di mockup untuk representasi ikon */}
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                    {/* Placeholder untuk ikon atau bisa diganti dengan GearIcon jika mau */}
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-800">{fieldName}</p>
                    <p className="text-sm text-gray-600">{price}</p>
                </div>
            </div>

            {/* Kanan: Tombol Aksi */}
            <div className="flex items-center space-x-2">
                {/* Tombol Edit (biru) */}
                <button
                    onClick={onEdit}
                    className="p-2 bg-blue-600 text-white rounded-md shadow-sm 
                               hover:bg-blue-700 transition duration-150"
                    aria-label={`Edit ${fieldName}`}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                {/* Tombol Hapus (merah) */}
                <button
                    onClick={onDelete}
                    className="p-2 bg-red-600 text-white rounded-md shadow-sm 
                               hover:bg-red-700 transition duration-150"
                    aria-label={`Hapus ${fieldName}`}
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CardFieldManagement;