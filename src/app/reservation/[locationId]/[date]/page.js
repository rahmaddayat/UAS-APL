'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import db from '@/services/DatabaseService';
import dayjs from 'dayjs';

export default function DailySchedulePage() {
  const params = useParams();
  const router = useRouter();
  
  const [location, setLocation] = useState(null);
  const [scheduleRows, setScheduleRows] = useState([]); 

  // --- HELPER: Menggabungkan Slot Berurutan ---
  const mergeTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return [];
    
    const startHours = slots.map(s => parseInt(s.split('.')[0])).sort((a, b) => a - b);
    
    let merged = [];
    if (startHours.length === 0) return [];

    let currentStart = startHours[0];
    let currentEnd = currentStart + 1;

    for (let i = 1; i < startHours.length; i++) {
        const nextStart = startHours[i];
        if (nextStart === currentEnd) {
            currentEnd = nextStart + 1;
        } else {
            merged.push(`${String(currentStart).padStart(2, '0')}.00 - ${String(currentEnd).padStart(2, '0')}.00`);
            currentStart = nextStart;
            currentEnd = nextStart + 1;
        }
    }
    merged.push(`${String(currentStart).padStart(2, '0')}.00 - ${String(currentEnd).padStart(2, '0')}.00`);
    
    return merged;
  };

  useEffect(() => {
    // 1. Load Data Lokasi & Lapangan
    const locData = db.getFieldById(params.locationId);
    setLocation(locData);
    const courtsData = db.getCourtsByLocation(params.locationId);

    // 2. Load Reservasi
    const resData = db.getReservationsByDate(params.locationId, params.date);
    
    // 3. Load Data User (PERBAIKAN DISINI) 
    // Jangan ambil dari localStorage manual, ambil langsung dari memory DatabaseService
    const usersData = db.data.users; 

    // 4. PROSES DATA (Filter & Formatting)
    let processedRows = [];

    resData.forEach(res => {
        // A. FILTER: Hanya tampilkan yang statusnya 'paid'
        if (res.status !== 'paid') return;

        // B. Cari Nama Court & Nama User
        const courtName = courtsData.find(c => c.id === res.courtId)?.name || "Unknown Field";
        
        // Cari user berdasarkan ID yang ada di reservasi
        const user = usersData.find(u => u.id === res.userId);
        const userName = user ? user.username : "Unknown User"; // <--- Nama sekarang akan muncul

        // C. MERGE SLOT
        const mergedSlots = mergeTimeSlots(res.timeSlots);

        // D. SPLIT BARIS
        mergedSlots.forEach(slotBlock => {
            processedRows.push({
                id: res.id,
                userName: userName,
                courtName: courtName,
                timeSlot: slotBlock 
            });
        });
    });

    // Urutkan jadwal
    processedRows.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    setScheduleRows(processedRows);

  }, [params.locationId, params.date]);

  if (!location) return <div>Loading...</div>;

  return (
    <Layout showHeader={true} headerTitle={location.name} showBackButton={true} backUrl={`/reservation/${params.locationId}`} showSidebar={true}>
      <div className="bg-white p-6 rounded-lg shadow-xl min-h-[500px]">
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-xl font-bold text-gray-800">
            {dayjs(params.date).format('DD MMMM YYYY')}
          </p>
          <button 
            onClick={() => router.push(`/reservation/${params.locationId}/${params.date}/new`)} 
            className="bg-[#E86500] hover:bg-[#C95500] text-white font-bold py-2 px-4 rounded-md shadow"
          >
            RESERVASI +
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-sm font-extrabold text-gray-700 uppercase text-center">Pemesan</th>
                <th className="py-3 px-6 text-sm font-extrabold text-gray-700 uppercase text-center">Lapangan</th>
                <th className="py-3 px-6 text-sm font-extrabold text-gray-700 uppercase text-center">Jam Main</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduleRows.length > 0 ? (
                scheduleRows.map((row, index) => (
                  <tr key={`${row.id}-${index}`} className="hover:bg-gray-50 text-center">
                    <td className="py-3 px-6 text-sm text-gray-700 font-medium">
                        {row.userName}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                        {row.courtName}
                    </td>
                    <td className="py-3 px-6 text-sm font-bold text-blue-600">
                        {row.timeSlot}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500 italic">
                        Belum ada jadwal terkonfirmasi hari ini.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}