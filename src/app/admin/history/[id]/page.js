'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import Layout from '@/components/Layout'; 
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { BoltIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, UserIcon, CalendarIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'; 
import dayjs from 'dayjs';
import db from '@/services/DatabaseService'; 

// --- Komponen Modal Penolakan (Hanya perlu didefinisikan untuk keperluan handler) ---
// CATATAN: Modal ini tidak akan muncul karena status history (paid/canceled) tidak memerlukan aksi reject.
const ModalReject = ({ isOpen, onCancel, onConfirm }) => {
    const [reason, setReason] = useState('');
    const isDisabled = reason.length < 10;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative">
                <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">Tolak Reservasi</h3>
                <p className="text-sm text-gray-700 mb-4">
                    Mohon berikan alasan penolakan (min. 10 karakter).
                </p>
                <textarea
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800"
                    placeholder="Contoh: Lapangan rusak atau jam tersebut sudah dibooking secara offline."
                />
                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Batal
                    </button>
                    <button 
                        onClick={() => onConfirm(reason)} 
                        disabled={isDisabled}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-md shadow-md ${
                            isDisabled ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        Tolak & Kirim Pesan
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function HistoryDetailPage() {
    const router = useRouter();
    const params = useParams(); 
    const transactionId = params.id; 
    
    // State Data
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State Modal (Hanya diperlukan untuk meniru struktur aksi, meskipun tidak digunakan untuk status history)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); 
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [modalDescription, setModalDescription] = useState("");

    // --- LOGIKA LOAD DATA ---
    useEffect(() => {
        const loadReservation = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch data dasar reservasi
                const allReservations = await db.fetchReservationsAPI(); 
                const res = allReservations.find(r => String(r.id) === String(transactionId));

                if (!res) throw new Error("Reservasi tidak ditemukan.");

                // 2. Fetch data Payments
                const allPayments = await db.fetchPaymentsAPI();
                // Cari data pembayaran yang PAID untuk reservasi ini
                const payment = allPayments.find(p => String(p.reservationId) === String(res.id) && p.paymentStatus === 'paid');


                // 3. Enrich Data (Tambahkan User, Lapangan, Lokasi, dan Payment Info)
                const user = db.data.users.find(u => String(u.id) === String(res.userId));
                const court = db.data.courts.find(c => c.id === res.courtId);
                const location = court ? db.data.fields.find(f => f.id === court.fieldId) : null;

                setReservation({
                    ...res,
                    user: user ? user.username : 'User Tidak Dikenal',
                    fieldName: court ? court.name : 'Lapangan Tidak Dikenal',
                    locationName: location ? location.name : 'Lokasi Tidak Dikenal',
                    paymentMethod: payment ? payment.paymentMethod : null, 
                    paymentTime: payment ? payment.paymentTime : null,     
                });

            } catch (error) {
                console.error("Error loading reservation:", error);
                setReservation(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (transactionId) {
            loadReservation();
        }
    }, [transactionId]);

    // --- HELPER UNTUK RENDERING ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatTimeSlots = (slots) => {
        if (!slots || slots.length === 0) return '';
        const sortedSlots = [...slots].sort();
        return `${sortedSlots[0].split(' - ')[0]} - ${sortedSlots[sortedSlots.length - 1].split(' - ')[1]} WIB`;
    };
    
    const DetailRow = ({ label, value, icon: Icon, colorClass = "text-gray-700" }) => (
        <div className="flex items-center space-x-3 py-2 border-b border-gray-100">
            <Icon className={`w-5 h-5 ${colorClass}`} />
            <p className={`font-semibold font-mono w-32 ${colorClass}`}>{label}</p>
            <p className={`font-mono flex-1 ${colorClass}`}>{value}</p>
        </div>
    );
    
    // Handler Navigasi Kembali
    const handleBackToHistory = () => {
        router.push('/admin/history');
    };


    // --- RENDERING UTAMA ---
    if (isLoading) {
        return <Layout showHeader={true}><div className="text-center mt-20">Memuat Detail Riwayat Reservasi...</div></Layout>;
    }

    if (!reservation) {
        return (
            <Layout showHeader={true} headerTitle="Riwayat Reservasi" showSidebar={true} showBackButton={true} userRole="admin">
                <div className="p-4 max-w-xl mx-auto text-center mt-10">
                    <h2 className="text-2xl font-bold font-mono text-gray-900">Reservasi Tidak Ditemukan</h2>
                </div>
            </Layout>
        );
    }
    
    const isPending = reservation.status === 'pending';
    const isConfirmed = reservation.status === 'confirmed';
    const isCanceled = reservation.status === 'canceled';
    const isPaid = reservation.status === 'paid' || reservation.status === 'confirmed'; // Confirmed/Paid dianggap lunas jika ada paymentMethod

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Detail Riwayat Reservasi" 
            showSidebar={true}
            showBackButton={true}
            userRole="admin"
        >
            <div className="p-4 max-w-xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 mt-8">
                    
                    {/* Header Card: Lapangan & Status */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <BoltIcon className="h-8 w-8 text-orange-500 mr-3" />
                            <div>
                                <p className="text-xl font-bold font-mono text-gray-800">{reservation.fieldName}</p>
                                <p className="text-sm font-mono text-gray-600 flex items-center gap-1">
                                    <MapPinIcon className="w-3 h-3"/> {reservation.locationName}
                                </p>
                            </div>
                        </div>
                        
                        <span className={`px-3 py-1 text-sm font-bold rounded-full font-mono shadow-sm 
                            ${isPending ? 'bg-yellow-100 text-yellow-800' : 
                              isConfirmed ? 'bg-green-100 text-green-800' :
                              isCanceled ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {reservation.status.toUpperCase()}
                        </span>
                    </div>

                    {/* Detail Reservasi */}
                    <div className="space-y-1 mb-6">
                        <DetailRow 
                            label="Pemesan" 
                            value={reservation.user} 
                            icon={UserIcon}
                        />
                        <DetailRow 
                            label="Tanggal" 
                            value={dayjs(reservation.date).format('DD MMMM YYYY')} 
                            icon={CalendarIcon}
                        />
                        <DetailRow 
                            label="Jadwal" 
                            value={formatTimeSlots(reservation.timeSlots)} 
                            icon={ClockIcon}
                        />
                        <DetailRow 
                            label="Total Harga" 
                            value={formatCurrency(reservation.totalPrice)} 
                            icon={CurrencyDollarIcon}
                            colorClass="text-green-600 font-extrabold"
                        />
                        
                        {/* KONDISIONAL: Alasan Penolakan (Jika CANCELED) */}
                        {isCanceled && reservation.message && (
                            <div className="pt-3">
                                <p className="text-sm font-semibold text-red-600">Alasan Penolakan/Pembatalan:</p>
                                <p className="text-sm italic text-red-700 bg-red-50 p-2 rounded-md border border-red-200">{reservation.message}</p>
                            </div>
                        )}

                        {/* KONDISIONAL: Metode Pembayaran (Jika PAID/CONFIRMED dan ada metode) */}
                        {reservation.paymentMethod && isPaid && (
                            <div className="pt-3">
                                <p className="text-sm font-semibold text-blue-600">Informasi Pembayaran:</p>
                                <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-200">
                                    <p><span className="font-bold">Metode:</span> {reservation.paymentMethod}</p>
                                    <p><span className="font-bold">Waktu Bayar:</span> {dayjs(reservation.paymentTime).format('DD/MM/YYYY HH:mm')}</p>
                                </div>
                            </div>
                        )}
                        
                    </div>

                    {/* Footer Card: Created At & Actions */}
                    <div className="flex justify-between items-end text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div>
                            <p className="font-mono text-xs">ID Transaksi: {reservation.id}</p>
                            <p className="font-mono text-xs">Dibuat: {dayjs(reservation.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        </div>
                        
                        {/* Tombol Navigasi Kembali ke Riwayat */}
                        <button
                            onClick={handleBackToHistory}
                            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition duration-200 shadow-md font-mono"
                        >
                            Kembali ke Riwayat
                        </button>
                        
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI DAN TOLAK TETAP ADA UNTUK KELENGKAPAN APLIKASI, TAPI TIDAK DIKONTROL KARENA STATUS NON-PENDING */}
            {isConfirmModalOpen && (
                <ModalConfirm title="YAKIN INGIN KONFIRMASI RESERVASI INI?" onCancel={() => setIsConfirmModalOpen(false)} onConfirm={() => {}} cancelText="BATAL" confirmText="KONFIRMASI" />
            )}
            {isRejectModalOpen && (
                <ModalReject isOpen={isRejectModalOpen} onCancel={() => setIsRejectModalOpen(false)} onConfirm={() => {}}/>
            )}
            {isInfoModalOpen && (
                <ModalInfo title="PROSES SELESAI" description={modalDescription} onClose={() => setIsInfoModalOpen(false)} okText="Oke"/>
            )}
        </Layout>
    );
}