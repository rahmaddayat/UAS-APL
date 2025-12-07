'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
    BellIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    InformationCircleIcon, 
    CalendarIcon 
} from '@heroicons/react/24/outline';
import db from '@/services/DatabaseService'; 
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id'; 
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('id');

const UserNotificationItem = ({ notif, onClick }) => {
    let Icon = InformationCircleIcon;
    let bgClass = "bg-blue-50 border-blue-100";
    let textClass = "text-blue-600";

    if (notif.type === 'success') {
        Icon = CheckCircleIcon;
        bgClass = "bg-green-50 border-green-100";
        textClass = "text-green-600";
    } else if (notif.type === 'error') {
        Icon = XCircleIcon;
        bgClass = "bg-red-50 border-red-100";
        textClass = "text-red-600";
    }

    return (
        <div 
            onClick={onClick}
            className={`flex p-4 rounded-xl border ${bgClass} shadow-sm mb-3 cursor-pointer hover:shadow-md transition duration-200 relative overflow-hidden`}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

            <div className={`mr-4 mt-1 ${textClass}`}>
                <Icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 text-sm md:text-base">{notif.title}</h4>
                    <span className="text-[10px] md:text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-full shadow-sm">
                        {dayjs(notif.timestamp).fromNow()}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                
                <div className="mt-3 flex items-center text-xs text-gray-400">
                    <CalendarIcon className="w-3 h-3 mr-1"/>
                    {dayjs(notif.timestamp).format('DD MMM YYYY, HH:mm')}
                </div>
            </div>
        </div>
    );
};

export default function UserNotificationPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) {
                router.push('/login');
                return;
            }

            await db.fetchNotificationsAPI(); 
            const myNotifs = db.getUserNotifications(user.id);
            setNotifications(myNotifs);
            
            setIsLoading(false);
        };
            
        loadData();
    }, [router]);

    // --- BAGIAN YANG DIPERBAIKI ---
    const handleItemClick = (notifId) => {
        // Langsung arahkan ke halaman detail notifikasi berdasarkan ID
        router.push(`/notification/${notifId}`);
    };
    // ------------------------------

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Notifikasi Saya" 
            showSidebar={true} 
            showBackButton={true}
            userRole="user"
        >
            <div className="p-4 max-w-lg mx-auto min-h-screen">
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                        <p className="text-gray-400 text-sm">Sedang memuat kabar terbaru...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-orange-50 p-6 rounded-full mb-4">
                            <BellIcon className="w-16 h-16 text-orange-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Belum ada notifikasi</h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-xs">
                            Saat kamu melakukan reservasi, status dan info terbarunya akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1 pb-20">
                        {notifications.map((notif) => (
                            <UserNotificationItem 
                                key={notif.id} 
                                notif={notif} 
                                // UPDATE: Kirim ID saja, bukan seluruh objek notif
                                onClick={() => handleItemClick(notif.id)}
                            />
                        ))}
                        
                        <div className="text-center mt-8">
                            <p className="text-xs text-gray-300">——— Anda sudah melihat semua notifikasi ———</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}