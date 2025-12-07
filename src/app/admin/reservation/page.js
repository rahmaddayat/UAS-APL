'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout'; 
import { BoltIcon, ClockIcon, MapPinIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; 
import dayjs from 'dayjs';

/**
 * Komponen Card Reservasi (Inline Component)
 */
const ReservationCard = ({ reservation, onClick }) => {
    // Helper untuk menampilkan emoji lapangan
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

    // Helper untuk format slot waktu (fungsi tetap ada tapi tidak dipakai di return)
    const formatTimeSlots = (slots) => {
        if (!slots || slots.length === 0) return '';
        const sortedSlots = [...slots].sort();
        return `${sortedSlots[0].split(' - ')[0]} - ${sortedSlots[sortedSlots.length - 1].split(' - ')[1]} WIB`;
    };

    return (
        <div 
            onClick={onClick}
            // Gaya: Border kiri oranye untuk menarik perhatian
            className="w-full bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-200 cursor-pointer 
                       border-l-4 border-orange-500 hover:border-orange-600 mb-4" 
        >
            <div className="flex justify-between items-start">
                
                {/* Kiri: Icon & Detail Utama */}
                <div className="flex items-center space-x-4 grow">
                    {/* Icon Emoji Lapangan */}
                    <span className="text-4xl opacity-80">{getFieldIcon(reservation.fieldName)}</span>
                    
                    <div className='flex flex-col'>
                        {/* Lokasi (Field Name sebagai Title) */}
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
                            {/* SLOT JAM DIHAPUS SESUAI PERMINTAAN */}
                        </div>
                    </div>
                </div>
                
                {/* Kanan: Status & Timestamp */}
                <div className="flex flex-col items-end justify-between h-full">
                    
                    {/* Status */}
                    <span className="px-3 py-1 text-sm font-bold rounded-full bg-yellow-50 text-yellow-700 shadow-sm tracking-wider border border-yellow-200">
                        {reservation.status.toUpperCase()}
                    </span>
                    
                    {/* Timestamp Reservasi Dibuat */}
                    <p className="text-xs text-gray-400 font-mono mt-4">
                        Dibuat: {dayjs(reservation.createdAt).format('DD/MM HH:mm')}
                    </p>
                </div>
            </div>
        </div>
    );
};


export default function AdminReservationPage() {
    const router = useRouter();
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [managedFieldId, setManagedFieldId] = useState(null); 

    // --- 1. LOAD DATA TRANSAKSI ---
    useEffect(() => {
        const loadReservations = async () => {
            setIsLoading(true);

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
                const allCourts = db.data.courts; 
                const allFields = db.data.fields;
                const allUsers = db.data.users;

                const allReservations = await db.fetchReservationsAPI(); 
                
                const pendingReservations = allReservations
                    .filter(res => {
                        const isPending = res.status === 'pending'; 
                        const court = allCourts.find(c => c.id === res.courtId);
                        const isMyField = court && court.fieldId === adminData.fieldId;
                        
                        return isPending && isMyField;
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
                        };
                    });
                
                pendingReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setReservations(pendingReservations);

            } catch (error) {
                console.error("Error loading reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadReservations();
    }, [router]);

    // --- 2. HANDLE CARD CLICK (Navigasi ke Detail Konfirmasi) ---
    const handleCardClick = (reservationId) => {
        router.push(`/admin/reservation/${reservationId}`); 
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Reservasi Masuk" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-4 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 font-mono text-gray-900 border-b pb-2">
                    Reservasi Baru ({reservations.length})
                </h2>
                
                {managedFieldId === null ? (
                    <div className="text-center p-10 bg-red-50 border border-red-300 text-red-700 rounded-lg shadow-md mt-10">
                        ⚠️ **Akses Ditolak.** Akun Admin Anda tidak terhubung dengan lokasi lapangan (`fieldId`).
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                        Memuat daftar reservasi...
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-lg shadow-lg mt-10 border border-gray-100">
                        <p className="text-xl font-mono text-gray-500">
                            Tidak ada reservasi untuk dikonfirmasi di lokasi Anda ({db.getFieldById(managedFieldId)?.name || 'N/A'}).
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((reservation) => (
                            <ReservationCard 
                                key={reservation.id}
                                reservation={reservation}
                                onClick={() => handleCardClick(reservation.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}