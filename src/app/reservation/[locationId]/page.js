'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import db from '@/services/DatabaseService';
import dayjs from 'dayjs';

export default function LocationCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  
  // State untuk tanggal
  const [date, setDate] = useState(null); // Awalnya null agar tidak langsung select hari ini

  // HITUNG TANGGAL BESOK (H+1)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  useEffect(() => {
    const locData = db.getFieldById(params.locationId);
    if (locData) setLocation(locData);
    
    // Set default selection ke besok
    setDate(tomorrow);
  }, [params.locationId]);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month' && location) {
      const day = date.getDay(); 
      const dateStr = dayjs(date).format('YYYY-MM-DD');
      if (location.closedDays.includes(day)) return true;
      if (location.specificClosedDates.includes(dateStr)) return true;
    }
    return false;
  };

  const handleDateChange = (newDate) => {
    const formatted = dayjs(newDate).format('YYYY-MM-DD');
    router.push(`/reservation/${params.locationId}/${formatted}`);
  };

  if (!location) return <div>Loading...</div>;

  return (
    <Layout showHeader={true} headerTitle={location.name} showBackButton={true} backUrl="/reservation" showSidebar={true}>
      <div className="flex flex-col items-center mt-8 space-y-4 px-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-md flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Pilih Tanggal Booking</h2>
            
            <Calendar 
                onChange={handleDateChange} 
                value={date}
                tileDisabled={tileDisabled}
                minDate={tomorrow} // <--- UPDATE DI SINI (Minimal Besok)
                locale="id-ID"
            />
            
            {/* ...Legenda (tetap sama)... */}
        </div>
      </div>
    </Layout>
  );
}