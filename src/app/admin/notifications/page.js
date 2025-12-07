'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
    BellIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, TrashIcon 
} from '@heroicons/react/24/outline';
import db from '@/services/DatabaseService'; 
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id'; 
import ModalConfirm from '@/components/ModalConfirm';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('id');

const NotificationItem = ({ notif, onClick }) => {
    let Icon = InformationCircleIcon;
    let colorClass = "text-blue-600 bg-blue-50";

    if (notif.type === 'success') {
        Icon = CheckCircleIcon;
        colorClass = "text-green-600 bg-green-50";
    } else if (notif.type === 'error') {
        Icon = XCircleIcon;
        colorClass = "text-red-600 bg-red-50";
    }

    return (
        <div 
            onClick={onClick} 
            className="flex items-start p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-orange-300 cursor-pointer transition mb-3"
        >
            <div className={`p-2 rounded-full mr-4 ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                    <span className="text-xs text-gray-400 font-mono">
                        {dayjs(notif.timestamp).fromNow()}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">Ref ID: {notif.refId}</p>
            </div>
        </div>
    );
};

export default function NotificationPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- PERBAIKAN: DEFINISI STATE MODAL ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    // ---------------------------------------

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await db.fetchNotificationsAPI(); 
            // Filter hanya notifikasi Admin
            const adminNotifs = data.filter(n => n.category === 'admin');
            setNotifications(adminNotifs);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleClearAllClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleProceedClear = async () => {
        setIsConfirmModalOpen(false); 
        await db.clearAllNotifications(); 
        setNotifications([]); 
    };

    const handleItemClick = (notifId) => {
        router.push(`/admin/notifications/${notifId}`);
    };

    return (
        <Layout showHeader={true} headerTitle="Pusat Notifikasi" showSidebar={true} userRole="admin">
            
            {/* Modal Konfirmasi */}
            {isConfirmModalOpen && (
                <ModalConfirm 
                    title="Hapus semua riwayat notifikasi secara permanen?"
                    onCancel={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleProceedClear}
                    cancelText="Batal"
                    confirmText="Hapus"
                />
            )}

            <div className="p-4 max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="flex items-center gap-2">
                        <BellIcon className="w-6 h-6 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-800">Riwayat Aktivitas</h2>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                            {notifications.length}
                        </span>
                    </div>
                    {notifications.length > 0 && (
                        <button onClick={handleClearAllClick} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition font-semibold">
                            <TrashIcon className="w-4 h-4" /> Hapus Semua
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">Memuat notifikasi...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Belum ada notifikasi baru.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => (
                            <NotificationItem 
                                key={notif.id} 
                                notif={notif} 
                                onClick={() => handleItemClick(notif.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}