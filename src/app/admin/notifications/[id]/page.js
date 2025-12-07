'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import db from '@/services/DatabaseService';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    InformationCircleIcon, 
    ClockIcon,
    ArrowRightIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

dayjs.locale('id');

export default function NotificationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            setIsLoading(true);
            // Ambil semua notifikasi dari API (karena kita belum buat endpoint getById khusus)
            // Untuk skala kecil ini tidak masalah.
            const allNotifs = await db.fetchNotificationsAPI();
            const found = allNotifs.find(n => n.id === id);
            
            setNotification(found || null);
            setIsLoading(false);
        };
        loadDetail();
    }, [id]);

    // Helper Ikon dan Warna
    const getVisuals = (type) => {
        switch (type) {
            case 'success':
                return { Icon: CheckCircleIcon, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
            case 'error':
                return { Icon: XCircleIcon, bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
            default:
                return { Icon: InformationCircleIcon, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
        }
    };

    if (isLoading) return <Layout showHeader={true}><div className="text-center mt-20">Memuat...</div></Layout>;

    if (!notification) {
        return (
            <Layout showHeader={true} headerTitle="Detail Notifikasi" showSidebar={true} showBackButton={true}>
                <div className="text-center mt-20 text-gray-500">Notifikasi tidak ditemukan.</div>
            </Layout>
        );
    }

    const { Icon, bg, text, border } = getVisuals(notification.type);

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Detail Notifikasi" 
            showSidebar={true} 
            showBackButton={true}
            userRole="admin"
        >
            <div className="p-4 max-w-2xl mx-auto mt-6">
                
                {/* Header Card */}
                <div className={`p-6 rounded-t-xl border-t border-x ${border} ${bg} flex items-center space-x-4`}>
                    <Icon className={`w-12 h-12 ${text}`} />
                    <div>
                        <h2 className={`text-2xl font-bold ${text}`}>{notification.title}</h2>
                        <p className={`text-sm ${text} opacity-80 font-mono mt-1`}>ID: {notification.id}</p>
                    </div>
                </div>

                {/* Body Card */}
                <div className="bg-white p-8 rounded-b-xl shadow-lg border border-gray-200">
                    
                    {/* Waktu */}
                    <div className="flex items-center text-gray-500 mb-6 text-sm">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        <span className="font-semibold">Diterima pada:</span>
                        <span className="ml-2 font-mono">
                            {dayjs(notification.timestamp).format('dddd, DD MMMM YYYY • HH:mm WIB')}
                        </span>
                    </div>

                    <hr className="border-gray-100 mb-6"/>

                    {/* Pesan Utama */}
                    <div className="mb-8">
                        <h3 className="text-gray-900 font-bold mb-2">Pesan:</h3>
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                            {notification.message}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        {/* Jika ada Ref ID (Reservasi), tampilkan tombol lihat detail */}
                        {notification.refId && (
                            <button 
                                onClick={() => router.push(`/admin/history/${notification.refId}`)} // Asumsi masuk ke history karena biasanya sudah selesai
                                className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition font-semibold"
                            >
                                <span>Lihat Transaksi Terkait</span>
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        )}

                        <button 
                            onClick={() => router.push('/admin/notifications')}
                            className="w-full py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-semibold"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                </div>

            </div>
        </Layout>
    );
}