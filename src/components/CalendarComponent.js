'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';

const DUMMY_HOLIDAYS = [
  '2025-11-10', 
  '2025-11-25',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarComponent({ locationId, locationName }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(dayjs('2025-11-01')); 

  const daysInMonth = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDay = startOfMonth.day(); // 0 (Sun) - 6 (Sat)
    const totalDays = endOfMonth.date();
    
    const days = [];
    
    // Tambahkan placeholder untuk hari-hari sebelum tanggal 1
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Tambahkan tanggal-tanggal bulan ini
    for (let i = 1; i <= totalDays; i++) {
      days.push(startOfMonth.date(i));
    }
    
    return days;
  }, [currentDate]);

    const handleDateClick = (date) => {
        if (!date) return;

        const dateString = date.format('YYYY-MM-DD');
        const isHoliday = DUMMY_HOLIDAYS.includes(dateString);

        if (isHoliday) {
            alert("Lokasi tutup pada tanggal ini!");
            return;
        }

        router.push(`/reservation/${locationId}/${dateString}`); 
    };

  const getDayClasses = (day) => {
    if (!day) return '';
    const dateString = day.format('YYYY-MM-DD');
    const isHoliday = DUMMY_HOLIDAYS.includes(dateString);
    const isToday = dayjs().isSame(day, 'day');
    
    let classes = 'text-center p-3 font-semibold cursor-pointer transition duration-150 ';

    if (isHoliday) {
      classes += 'bg-red-600 text-white hover:bg-red-700'; // Tanggal Merah (Libur/Tutup)
    } else if (isToday) {
      classes += 'bg-[#E86500] text-white shadow-lg'; // Hari Ini (Warna Utama)
    } else {
      classes += 'text-gray-800 hover:bg-gray-100'; // Tanggal Normal
    }
    
    return classes;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto">
      
      {/* Header Kalender (Nama Tempat, Bulan, Tahun) */}
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}
            className="p-2 rounded-full hover:bg-gray-100"
        >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <div className="text-center">
            <h3 className="text-3xl text-black font-bold">{locationName}</h3>
            <p className="text-xl text-black font-semibold mt-2">{currentDate.format('MMMM YYYY')}</p>
        </div>

        <button 
            onClick={() => setCurrentDate(currentDate.add(1, 'month'))}
            className="p-2 rounded-full hover:bg-gray-100"
        >
            <ArrowRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      
      {/* Kalender Grid */}
      <div className="grid grid-cols-7 gap-px border border-gray-300">
        
        {/* Nama Hari */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-black py-3 font-bold bg-gray-100 border-r border-gray-300 last:border-r-0">
            {day}
          </div>
        ))}

        {/* Tanggal */}
        {daysInMonth.map((day, index) => (
          <div 
            key={index} 
            className={`border border-gray-300 h-16 flex items-center justify-center ${getDayClasses(day)}`}
            onClick={() => handleDateClick(day)}
          >
            {day ? day.date() : ''}
          </div>
        ))}
        
      </div>
    </div>
  );
}