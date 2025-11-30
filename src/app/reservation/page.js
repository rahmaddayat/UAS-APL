'use client'; 
import Layout from '@/components/Layout';
import { MapPinIcon } from '@heroicons/react/24/solid'; 
import { useRouter } from 'next/navigation';

// Data Dummy Daftar Lokasi/Pusat Olahraga (TETAP SAMA)
const DUMMY_LOCATIONS = [
  { title: 'Sport Center', address: 'Jl. ABC-123-Jakarta', id: 'sport-center' },
  { title: 'Embassy Sport Hall', address: 'Jl. DEF-456-Bandung', id: 'embassy-sport' },
  { title: 'ZENS Sport Arena', address: 'Jl. GHI-789-Surabaya', id: 'zens-sport' },
];

// Komponen LocationCard (TETAP SAMA)
const LocationCard = ({ title, address, onClick }) => (
    <div 
        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition duration-200"
        onClick={onClick}
    >
        <div className="flex items-center space-x-4">
            <MapPinIcon className="w-8 h-8 text-gray-500 shrink-0" /> 
            
            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{address}</p>
            </div>
        </div>
    </div>
);


export default function ReservationPage() {
  const router = useRouter();
  
  return (
    <Layout 
      // AKTIFKAN HEADER UNIVERSAL dan berikan judul
      showHeader={true} 
      headerTitle="Reservation"
      
      // Pastikan Sidebar dan Tombol Kembali disetel
      showSidebar={true}
      showBackButton={false} // Halaman utama menu tidak perlu tombol kembali
    >
      
      {/* KONTEN UTAMA: Tanpa Header Kustom */}
      <div className="space-y-4">
        {DUMMY_LOCATIONS.map((location, index) => (
          <LocationCard 
            key={index}
            title={location.title}
            address={location.address}
            // NAVIGASI BARU: Ke halaman detail lokasi
            onClick={() => router.push(`/reservation/${location.id}`)} 
          />
        ))}
      </div>
          
    </Layout>
  );
}