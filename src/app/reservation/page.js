'use client'; 
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { MapPinIcon } from '@heroicons/react/24/solid'; 
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService';

const LocationCard = ({ title, address, onClick }) => (
    <div 
        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg hover:border-orange-500 transition duration-200"
        onClick={onClick}
    >
        <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
                <MapPinIcon className="w-6 h-6 text-[#E86500]" /> 
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{address}</p>
            </div>
        </div>
    </div>
);

export default function ReservationPage() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    setLocations(db.getAllFields());
  }, []);
  
  return (
    <Layout showHeader={true} headerTitle="Pilih Lokasi" showSidebar={true} showBackButton={false}>
      <div className="space-y-4">
        {locations.map((loc) => (
          <LocationCard 
            key={loc.id}
            title={loc.name}
            address={loc.address}
            onClick={() => router.push(`/reservation/${loc.id}`)} 
          />
        ))}
      </div>
    </Layout>
  );
}