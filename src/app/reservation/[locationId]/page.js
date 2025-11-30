'use client';
import Layout from '@/components/Layout';
import CalendarComponent from '@/components/CalendarComponent';
import { useParams } from 'next/navigation';

// Data Dummy untuk mendapatkan Nama Lokasi
const MOCK_LOCATIONS = {
  'sport-center': 'Sport Center',
  'embassy-sport': 'Embassy Sport Hall',
  'zens-sport': 'ZENS Sport Arena',
};

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.locationId;
  
  // Ambil nama lokasi berdasarkan ID
  const locationName = MOCK_LOCATIONS[locationId] || "Nama Tempat";

  // Pastikan Anda sudah mengimplementasikan tombol kembali di Header.js
  return (
    <Layout 
      showHeader={true} 
      headerTitle={locationName} // Judul Header adalah Nama Tempat
      showBackButton={true} // Tampilkan tombol kembali
      showSidebar={true}
    >
      
      <div className="mt-8">
        <CalendarComponent 
            locationId={locationId} 
            locationName={locationName} 
        />
      </div>
      
    </Layout>
  );
}