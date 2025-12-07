'use client';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/id'; 

export default function TransactionCardComponent({ transaction }) {
    const router = useRouter(); 
    const { id, locationName, fieldName, status, date } = transaction; 

    // UPDATED: 'canceled'
    const isHistory = status === 'paid' || status === 'rejected' || status === 'canceled';
    const basePath = isHistory ? '/history' : '/transaction';

    let statusConfig = { text: '', className: '' };

    switch (status) {
        case 'pending': 
            statusConfig = { text: 'Menunggu Konfirmasi', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
            break;
        case 'confirmed': 
            statusConfig = { text: 'Menunggu Pembayaran', className: 'bg-blue-100 text-blue-800 border-blue-200' };
            break;
        case 'paid':
            statusConfig = { text: 'Selesai', className: 'bg-green-100 text-green-800 border-green-200' };
            break;
        
        // UPDATED: 'canceled'
        case 'rejected':
        case 'canceled':
            statusConfig = { text: 'Dibatalkan', className: 'bg-red-100 text-red-800 border-red-200' };
            break;
            
        default:
            statusConfig = { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }

    const handleCardClick = () => {
        router.push(`${basePath}/${id}`); 
    };

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition duration-200 cursor-pointer flex justify-between items-center"
        >
            <div className="flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-full hidden sm:block">
                    <MapPinIcon className="w-6 h-6 text-[#E86500]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">{locationName}</h3>
                    <p className="text-sm text-gray-600 font-medium">{fieldName}</p>
                    
                    <span className={`inline-block mt-2 sm:hidden px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.className}`}>
                        {statusConfig.text}
                    </span>
                </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
                <p className="text-sm font-semibold text-gray-700">
                    {dayjs(date).locale('id').format('DD MMMM YYYY')}
                </p>
                
                <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                    {statusConfig.text}
                </span>
            </div>
        </div>
    );
}