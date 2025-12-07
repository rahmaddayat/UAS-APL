'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import Layout from '@/components/Layout'; 
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { ArrowLeftIcon, BoltIcon } from '@heroicons/react/24/solid'; // BoltIcon
// FIX: ClockIcon ditambahkan di sini
import { MapPinIcon, UserIcon, CalendarIcon, CurrencyDollarIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'; 
import dayjs from 'dayjs';
import db from '@/services/DatabaseService'; 

// --- Komponen Modal Penolakan (Meminta Pesan) ---
const ModalReject = ({ isOpen, onCancel, onConfirm }) => {
    const [reason, setReason] = useState('');
    const isDisabled = reason.length < 10;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative">
                <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">Tolak Reservasi</h3>
                <p className="text-sm text-gray-700 mb-4">
                    Mohon berikan alasan penolakan (min. 10 karakter) yang akan dikirimkan kepada pemesan.
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


export default function ConfirmReservationPage() {
    const router = useRouter();
    const params = useParams(); 
    const transactionId = params.id; 
    
    // State Data
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State Modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); 
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [modalActionType, setModalActionType] = useState(null); 
    const [modalDescription, setModalDescription] = useState("");

    // --- LOGIKA LOAD DATA ---
    useEffect(() => {
        const loadReservation = async () => {
            setIsLoading(true);
            try {
                // Fetch semua reservasi
                const allReservations = await db.fetchReservationsAPI(); 
                const res = allReservations.find(r => String(r.id) === String(transactionId));

                if (!res) throw new Error("Reservasi tidak ditemukan.");

                // Enrich Data (Tambahkan Nama User, Lapangan, Lokasi)
                const user = db.data.users.find(u => String(u.id) === String(res.userId));
                const court = db.data.courts.find(c => c.id === res.courtId);
                const location = court ? db.data.fields.find(f => f.id === court.fieldId) : null;

                setReservation({
                    ...res,
                    user: user ? user.username : 'User Tidak Dikenal',
                    fieldName: court ? court.name : 'Lapangan Tidak Dikenal',
                    locationName: location ? location.name : 'Lokasi Tidak Dikenal',
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

    // --- HANDLER AKSI (KONFIRMASI / TOLAK) ---

    // A. Fungsi Utama untuk Memproses Perubahan Status
    const updateReservationStatus = async (status, message = null) => {
        try {
            await db.updateTransactionStatus(transactionId, status, message);
            
            // Set pesan dan buka modal info
            setModalDescription(`Reservasi berhasil di ${status === 'confirmed' ? 'KONFIRMASI.' : 'TOLAK.'}`);
            setIsInfoModalOpen(true);

        } catch (error) {
            console.error("Error updating status:", error);
            setModalDescription(`Gagal memproses. Error: ${error.message}`);
            setIsInfoModalOpen(true);
        }
    };

    // B. Handler Tombol Konfirmasi
    const handleConfirmButtonClick = () => {
        setModalActionType('confirm');
        setIsConfirmModalOpen(true);
    };

    const handleProceedConfirmation = () => {
        setIsConfirmModalOpen(false);
        updateReservationStatus('confirmed');
    };

    // C. Handler Tombol Tolak
    const handleRejectButtonClick = () => {
        setModalActionType('reject');
        setIsRejectModalOpen(true);
    };

    const handleProceedReject = (reason) => {
        setIsRejectModalOpen(false);
        updateReservationStatus('canceled', reason);
    };
    
    const handleCancelReject = () => {
        setIsRejectModalOpen(false);
    };


    // D. Handler Modal Info (Setelah Aksi Berhasil)
    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        // Kembali ke daftar reservasi setelah berhasil
        router.push('/admin/reservation'); 
    };
    
    // --- HELPER RENDERING ---
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


    // --- RENDERING UTAMA ---
    if (isLoading) {
        return <Layout showHeader={true}><div className="text-center mt-20">Memuat Detail Reservasi...</div></Layout>;
    }

    if (!reservation) {
        return (
            <Layout showHeader={true} headerTitle="Reservasi" showSidebar={true} showBackButton={true} userRole="admin">
                <div className="p-4 max-w-xl mx-auto text-center mt-10">
                    <h2 className="text-2xl font-bold font-mono text-gray-900">Reservasi Tidak Ditemukan</h2>
                    <p className="text-gray-600 mt-2 font-mono">ID Reservasi: {transactionId}</p>
                </div>
            </Layout>
        );
    }
    
    const isPending = reservation.status === 'pending';
    const isConfirmed = reservation.status === 'confirmed';
    const isCanceled = reservation.status === 'canceled';

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Konfirmasi Reservasi" 
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
                        {isCanceled && reservation.message && (
                            <div className="pt-3">
                                <p className="text-sm font-semibold text-red-600">Alasan Penolakan:</p>
                                <p className="text-sm italic text-red-700 bg-red-50 p-2 rounded-md border border-red-200">{reservation.message}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Card: Created At & Actions */}
                    <div className="flex justify-between items-end text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div>
                            <p className="font-mono text-xs">ID Transaksi: {reservation.id}</p>
                            <p className="font-mono text-xs">Dibuat: {dayjs(reservation.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        </div>
                        
                        {/* Tombol Aksi (Hanya tampil jika status 'pending') */}
                        {isPending && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleRejectButtonClick}
                                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-200 shadow-md font-mono"
                                >
                                    Tolak
                                </button>
                                <button
                                    onClick={handleConfirmButtonClick}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200 shadow-md font-mono"
                                >
                                    Konfirmasi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI (untuk Konfirmasi Aksi) */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title="YAKIN INGIN KONFIRMASI RESERVASI INI?"
                    onCancel={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleProceedConfirmation}
                    cancelText="BATAL" 
                    confirmText="KONFIRMASI" 
                />
            )}

            {/* MODAL TOLAK (untuk Meminta Pesan) */}
            {isRejectModalOpen && (
                <ModalReject
                    isOpen={isRejectModalOpen}
                    onCancel={handleCancelReject}
                    onConfirm={handleProceedReject}
                />
            )}

            {/* MODAL INFO SETELAH PROSES */}
            {isInfoModalOpen && (
                <ModalInfo
                    title="PROSES SELESAI"
                    description={modalDescription}
                    onClose={handleCloseInfoModal}
                    okText="Oke"
                />
            )}
        </Layout>
    );
}