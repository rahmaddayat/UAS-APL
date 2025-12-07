'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout'; 
import { CheckCircleIcon, XCircleIcon, ClockIcon, MapPinIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; 
import dayjs from 'dayjs';

/**
 * Komponen Card Riwayat Reservasi (Inline Component)
 */
// Tambahkan properti onClick
const HistoryReservationCard = ({ reservation, onClick }) => {
    
    // Menampilkan ikon berdasarkan jenis lapangan
    const getFieldIcon = (name) => {
        if (name.toLowerCase().includes('futsal')) {
            return '⚽'; 
        } else if (name.toLowerCase().includes('badminton')) {
            return '🏸';
        } else if (name.toLowerCase().includes('basket')) {
            return '🏀';
        }
        return '🏟️';
    };

    // Tentukan styling dan ikon berdasarkan status
    const isPaid = reservation.status === 'paid';
    const isCanceled = reservation.status === 'canceled';

    const statusBadge = useMemo(() => {
        if (isPaid) {
            return (
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 font-mono tracking-wider shadow-sm">
                    <CheckCircleIcon className="h-4 w-4 mr-1"/> SUDAH DIBAYAR
                </span>
            );
        }
        if (isCanceled) {
            return (
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 font-mono tracking-wider shadow-sm">
                    <XCircleIcon className="h-4 w-4 mr-1"/> DIBATALKAN
                </span>
            );
        }
        return null;
    }, [isPaid, isCanceled]);

    return (
        <div 
            // Tambahkan onClick handler dan styling cursor
            onClick={onClick}
            className={`w-full bg-white p-4 rounded-xl shadow-lg mb-4 border border-gray-200 cursor-pointer hover:shadow-xl transition 
                        ${isPaid ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}
        >
            <div className="flex items-start justify-between">
                
                {/* Kiri: Icon & Detail Utama */}
                <div className="flex items-center space-x-4">
                    <span className="text-4xl opacity-80">{getFieldIcon(reservation.fieldName)}</span>
                    
                    <div className='flex flex-col'>
                        {/* Nama Lapangan (Title) */}
                        <p className="text-xl font-extrabold text-gray-900 leading-tight">
                            {reservation.fieldName}
                        </p>
                        
                        {/* Detail yang diminta (Lokasi, Pemesan, Tanggal) */}
                        <div className="mt-3 pt-2 border-t border-gray-100 text-sm font-mono text-gray-700 space-y-1">
                            
                            <p>
                                <span className="font-bold text-gray-800">Lokasi:</span> {reservation.locationName}
                            </p>
                            <p>
                                <span className="font-bold text-gray-800">Pemesan:</span> {reservation.user}
                            </p>
                            <p>
                                <span className="font-bold text-gray-800">Tanggal:</span> {dayjs(reservation.date).format('DD MMM YYYY')}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Kanan: Status & Timestamp */}
                <div className="text-right flex flex-col items-end">
                    
                    {/* Status Badge */}
                    <div className="mb-2">{statusBadge}</div>

                    {/* Timestamp Reservasi Dibuat */}
                    <p className="text-xs text-gray-400 font-mono mt-4">
                        Dibuat: {dayjs(reservation.createdAt).format('DD/MM HH:mm')}
                    </p>
                </div>
            </div>
        </div>
    );
};


export default function HistoryPage() {
    const router = useRouter();
    const [historyReservations, setHistoryReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [managedFieldId, setManagedFieldId] = useState(null); 
    
    // --- 1. LOAD DATA RIWAYAT ---
    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);

            // 1. Cek Admin Login & Ambil Field ID
            const sessionUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!sessionUser || sessionUser.role !== 'admin') {
                router.push('/admin/login');
                return;
            }
            
            const adminData = db.data.admins.find(a => a.id === sessionUser.id) || sessionUser;
            setManagedFieldId(adminData.fieldId);
            
            if (!adminData.fieldId) {
                setIsLoading(false);
                return;
            }

            try {
                // 2. Load Data Referensi
                const allCourts = db.data.courts; 
                const allFields = db.data.fields;
                const allUsers = db.data.users;

                // 3. Load Reservasi dari API
                const allReservations = await db.fetchReservationsAPI(); 
                
                // 4. Filter & Mapping Data
                const historyData = allReservations
                    .filter(res => {
                        // a. Filter Status: PAID atau CANCELED
                        const isHistoryStatus = res.status === 'paid' || res.status === 'canceled'; 

                        // b. Filter Lokasi (Hanya yang dikelola admin ini)
                        const court = allCourts.find(c => c.id === res.courtId);
                        const isMyField = court && court.fieldId === adminData.fieldId;
                        
                        return isHistoryStatus && isMyField;
                    })
                    .map(res => {
                        const court = allCourts.find(c => c.id === res.courtId);
                        const location = court ? allFields.find(f => f.id === court.fieldId) : null;
                        const user = allUsers.find(u => String(u.id) === String(res.userId));

                        return {
                            id: res.id,
                            locationName: location ? location.name : 'Unknown Location',
                            fieldName: court ? court.name : 'Unknown Court',
                            user: user ? user.username : 'Unknown User',
                            date: res.date,
                            timeSlots: res.timeSlots,
                            createdAt: res.createdAt,
                            status: res.status,
                            totalPrice: res.totalPrice,
                            message: res.message || null, 
                        };
                    });
                
                // Urutkan berdasarkan tanggal dibuat (terbaru di atas)
                historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setHistoryReservations(historyData);

            } catch (error) {
                console.error("Error loading history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [router]);

    // --- NAVIGASI KE HALAMAN DETAIL RIWAYAT ---
    const handleCardClick = (reservationId) => {
        // Mengarahkan ke halaman detail riwayat
        router.push(`/admin/history/${reservationId}`); 
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Riwayat" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-4 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 font-mono text-gray-900 border-b pb-2">
                    Riwayat Reservasi ({historyReservations.length})
                </h2>
                
                {managedFieldId === null ? (
                    <div className="text-center p-10 bg-red-50 border border-red-300 text-red-700 rounded-lg shadow-md mt-10">
                        ⚠️ **Akses Ditolak.** Akun Admin Anda tidak terhubung dengan lokasi lapangan (`fieldId`).
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                        Memuat riwayat reservasi...
                    </div>
                ) : historyReservations.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-lg shadow-lg mt-10 border border-gray-100">
                        <p className="text-xl font-mono text-gray-500">
                            Tidak ada riwayat reservasi yang **Sudah Dibayar** atau **Dibatalkan** di lokasi Anda ({db.getFieldById(managedFieldId)?.name || 'N/A'}).
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyReservations.map((reservation) => (
                            <HistoryReservationCard 
                                key={reservation.id}
                                reservation={reservation}
                                // PASANG onClick handler
                                onClick={() => handleCardClick(reservation.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}