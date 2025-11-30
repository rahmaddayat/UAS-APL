'use client';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';

// --- Data Dummy ---
const MOCK_LOCATIONS = {
  'sport-center': 'Sport Center',
  'embassy-sport': 'Embassy Sport Hall',
};

const DUMMY_RESERVATIONS = [
  { pemesan: 'Andi', lapangan: 'Lapangan Futsal 1', jadwal: '08.00 - 09.00 WIB' },
  { pemesan: 'Budi', lapangan: 'Lapangan Futsal 2', jadwal: '08.00 - 10.00 WIB' },
  { pemesan: 'Charlie', lapangan: 'Lapangan Futsal 1', jadwal: '09.00 - 10.00 WIB' },
  { pemesan: 'Diana', lapangan: 'Lapangan Futsal 3', jadwal: '10.00 - 12.00 WIB' },
  { pemesan: 'Edo', lapangan: 'Lapangan Futsal 2', jadwal: '10.00 - 11.00 WIB' },
];

export default function SlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const locationId = params.locationId;
  // Parameter sekarang langsung diambil dari [date]
  const dateString = params.date; // Format YYYY-MM-DD
  
  const locationName = MOCK_LOCATIONS[locationId] || "Nama Tempat";
  
  const formattedDate = dayjs(dateString).format('DD-MM-YYYY');

  const handleReservationClick = () => {
    // Navigasi ke halaman form pemesanan yang baru dibuat
    router.push(`/reservation/${locationId}/${dateString}/new`);
  };

  return (
    <Layout 
      showHeader={true} 
      headerTitle={locationName} 
      showBackButton={true}
      showSidebar={true}
    >
      
      <div className="bg-white p-6 rounded-lg shadow-xl">
        
        {/* Header Tanggal dan Tombol Reservasi */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-xl font-bold text-gray-800">{formattedDate}</p>
          
          <button 
            onClick={handleReservationClick} 
            className="flex items-center bg-[#E86500] hover:bg-[#C95500] text-white font-bold py-2 px-4 rounded-md shadow transition duration-150"
          >
            RESERVASI +
          </button>
        </div>

        {/* Tabel Reservasi Lain (Sesuai image_4689c4.png) */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-center text-sm font-extrabold text-gray-700 uppercase tracking-wider border border-gray-300">
                  Pemesan
                </th>
                <th className="py-3 px-6 text-center text-sm font-extrabold text-gray-700 uppercase tracking-wider border border-gray-300">
                  Lapangan
                </th>
                <th className="py-3 px-6 text-center text-sm font-extrabold text-gray-700 uppercase tracking-wider border border-gray-300">
                  Jadwal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DUMMY_RESERVATIONS.map((res, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700 text-center border border-gray-300">
                    {res.pemesan}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700 text-center border border-gray-300">
                    {res.lapangan}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700 text-center border border-gray-300">
                    {res.jadwal}
                  </td>
                </tr>
              ))}
              {[...Array(3)].map((_, index) => (
                <tr key={`empty-${index}`} className="h-12">
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </Layout>
  );
}