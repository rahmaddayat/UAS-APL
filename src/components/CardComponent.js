// src/components/CardComponent.js
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid'; 
// Asumsi Anda menggunakan Heroicons (npm install @heroicons/react)
import Image from 'next/image';

const ICON_STYLES = "w-6 h-6 text-gray-500 mr-3";

// Helper untuk Badge Status
const StatusBadge = ({ status }) => {
  let color = 'bg-gray-200 text-gray-800';
  let text = status;

  switch (status) {
    case 'MENUNGGU PEMBAYARAN':
      color = 'bg-yellow-500 text-white';
      break;
    case 'MENUNGGU KONFIRMASI ADMIN':
      color = 'bg-red-600 text-white';
      break;
    case 'DIKONFIRMASI':
      color = 'bg-green-600 text-white';
      break;
    default:
      // Misalnya, untuk format tanggal
      if (status && status.match(/^\d{2}-\d{2}-\d{4}$/)) {
        color = 'bg-blue-600 text-white';
      }
      break;
  }
  
  // Format teks untuk tampilan tanggal yang lebih baik
  if (status && status.match(/^\d{2}-\d{2}-\d{4}$/)) {
    text = status; // Biarkan tanggal apa adanya
  } else {
    text = status.toUpperCase();
  }

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default function CardComponent({ 
  type, 
  title, 
  subtitle, 
  detail, 
  status, 
  createdAt,
  // Props opsional
  icon = 'ball', // 'ball' atau 'location'
  onClick 
}) {
  
  // Menentukan ikon utama
  const MainIcon = icon === 'location' ? (
    <MapPinIcon className="w-8 h-8 text-gray-700" />
  ) : (
    // Placeholder Bola Futsal (jika tidak menggunakan gambar asli)
    <Image 
        src="/futsal-ball.svg" // Pastikan ada file ini di public/
        alt="Futsal Icon" 
        width={32} 
        height={32} 
    />
  );

  return (
    <div 
      className="bg-white p-4 my-3 rounded-lg shadow-md border-t-4 border-[#E86500] cursor-pointer hover:shadow-lg transition duration-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="mr-4 p-2 bg-gray-100 rounded-full">
            {MainIcon}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        {/* Detail/Status di Kanan */}
        <div className="text-right flex flex-col items-end space-y-1">
          {/* Menampilkan Status Badge atau Tanggal Reservasi */}
          {status && <StatusBadge status={status} />}
          
          {/* Menampilkan Detail Tambahan (misalnya Tanggal Created atau Lokasi) */}
          {detail && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              {type === 'Location' ? (
                 <MapPinIcon className={ICON_STYLES} />
              ) : (
                <ClockIcon className={ICON_STYLES} />
              )}
              {detail}
            </p>
          )}

          {createdAt && (
             <p className="text-xs text-gray-400">
               Created at {createdAt}
             </p>
          )}
        </div>
      </div>
      
    </div>
  );
}