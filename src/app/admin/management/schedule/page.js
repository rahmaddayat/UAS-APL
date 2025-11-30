// src/app/admin/management/schedule/page.js
'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function ScheduleManagementPage() {
    const router = useRouter();

    // Fungsi untuk mengarahkan ke halaman Jadwal Harian
    const handleDailyScheduleClick = () => {
        router.push('/admin/management/schedule/dailyopen');
        console.log("Navigasi ke halaman Jadwal Harian");
    };

    // Fungsi untuk mengarahkan ke halaman Hari Libur
    const handleHolidayClick = () => {
        router.push('/admin/management/schedule/closeday');
        console.log("Navigasi ke halaman Hari Libur");
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Jadwal Operasional" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            {/* Mengubah p-4 menjadi p-1 agar konsisten dengan management/page.js */}
            <div className="p-1 max-w-4xl mx-auto">
                
                {/* Container Card */}
                <div className="space-y-4"> 
                    
                    {/* CARD: Jadwal Harian */}
                    <button
                        onClick={handleDailyScheduleClick}
                        // Styling disamakan dengan card di management/page.js
                        className="w-full text-left bg-gray-100 p-4 rounded-md shadow-md border border-gray-300 cursor-pointer 
                                   hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2"
                    >
                        <span className="text-xl font-bold text-gray-800">
                            Jadwal Harian
                        </span>
                    </button>

                    {/* CARD: Hari Libur */}
                    <button
                        onClick={handleHolidayClick}
                        // Styling disamakan dengan card di management/page.js
                        className="w-full text-left bg-gray-100 p-4 rounded-md shadow-md border border-gray-300 cursor-pointer 
                                   hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2"
                    >
                        <span className="text-xl font-bold text-gray-800">
                            Hari Libur
                        </span>
                    </button>

                </div>
            </div>
        </Layout>
    );
}