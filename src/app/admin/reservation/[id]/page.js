// src/app/admin/reservation/[id]/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // Untuk mendapatkan [id] dari URL
import Layout from '@/components/Layout'; 
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { ArrowLeftIcon, BoltIcon } from '@heroicons/react/24/solid'; // BoltIcon untuk ikon lapangan

// --- DUMMY DATA RESERVASI ---
// Ini akan mensimulasikan data dari database
const DUMMY_RESERVATIONS = [
    {
        id: '1', // ID sebagai string karena dari useParams() juga string
        fieldCategory: 'Sport Center',
        fieldName: 'Lapangan Futsal 1',
        pemesan: 'Riki',
        tanggal: '25-11-2025',
        jadwal: '20.00 - 23.00 WIB',
        harga: 120000,
        createdAt: '20-11-2025/10.30 WIB',
        reservationId: '1123R3151341241',
        status: 'pending' // Status awal
    },
    {
        id: '2',
        fieldCategory: 'Sport Center',
        fieldName: 'Lapangan Badminton 2',
        pemesan: 'Siti Aisyah',
        tanggal: '26-11-2025',
        jadwal: '20.00 - 21.00 WIB',
        harga: 80000,
        createdAt: '20-11-2025/11.15 WIB',
        reservationId: '1123R3151341242',
        status: 'pending'
    },
];

export default function ConfirmReservationPage() {
    const router = useRouter();
    const params = useParams(); // Mengambil parameter dari URL, misal '1' dari /confirm/1
    const reservationId = params.id;

    // Cari data reservasi berdasarkan ID dari dummy data
    const reservation = DUMMY_RESERVATIONS.find(res => res.id === reservationId);

    // State untuk modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Format harga ke mata uang Rupiah
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Jika reservasi tidak ditemukan (misal ID salah di URL)
    if (!reservation) {
        return (
            <Layout
                showHeader={true}
                headerTitle="Reservasi"
                showSidebar={true}
                showBackButton={true}
                userRole="admin"
            >
                <div className="p-4 max-w-xl mx-auto text-center mt-10">
                    <h2 className="text-2xl font-bold font-mono text-gray-900">Reservasi Tidak Ditemukan</h2>
                    <p className="text-gray-600 mt-2 font-mono">ID Reservasi: {reservationId}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-5 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Kembali
                    </button>
                </div>
            </Layout>
        );
    }

    // --- HANDLER UNTUK MODAL KONFIRMASI ---
    const handleConfirmButtonClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleCancelConfirmation = () => {
        setIsConfirmModalOpen(false);
    };

    const handleProceedConfirmation = () => {
        setIsConfirmModalOpen(false);
        // Di sini Anda akan mengirim permintaan ke API untuk mengubah status reservasi
        console.log(`Reservasi ID ${reservationId} dikonfirmasi.`);
        
        // Simulasikan perubahan status
        reservation.status = 'confirmed'; // (Ini hanya akan memengaruhi objek lokal)

        // Tampilkan ModalInfo
        setIsInfoModalOpen(true);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        // Opsional: Redirect kembali ke halaman daftar reservasi setelah konfirmasi
        router.push('/admin/reservation'); 
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Reservasi" 
            showSidebar={true}
            showBackButton={true} // Tombol kembali di header akan mengarahkan ke /admin/reservation
            userRole="admin"
        >
            <div className="p-4 max-w-xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 mt-8">
                    
                    {/* Header Card: Sport Center & Lapangan */}
                    <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                        <BoltIcon className="h-8 w-8 text-gray-700 mr-3" />
                        <div>
                            <p className="text-lg font-bold font-mono text-gray-800">{reservation.fieldCategory}</p>
                            <p className="text-sm font-mono text-gray-600">{reservation.fieldName}</p>
                        </div>
                    </div>

                    {/* Detail Reservasi */}
                    <div className="grid grid-cols-3 gap-y-3 gap-x-4 mb-6 text-gray-700">
                        <p className="font-semibold font-mono col-span-1">Pemesan</p>
                        <p className="col-span-2 font-mono">: {reservation.pemesan}</p>

                        <p className="font-semibold font-mono col-span-1">Tanggal</p>
                        <p className="col-span-2 font-mono">: {reservation.tanggal}</p>

                        <p className="font-semibold font-mono col-span-1">Jadwal</p>
                        <p className="col-span-2 font-mono">: {reservation.jadwal}</p>

                        <p className="font-semibold font-mono col-span-1">Harga</p>
                        <p className="col-span-2 font-mono">: {formatCurrency(reservation.harga)}</p>
                    </div>

                    {/* Footer Card: Created At & Reservation ID */}
                    <div className="flex justify-between items-end text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div>
                            <p className="font-mono">Created at {reservation.createdAt}</p>
                            <p className="font-mono">Reservation ID : {reservation.reservationId}</p>
                        </div>
                        
                        {/* Tombol Konfirmasi */}
                        {reservation.status === 'pending' && (
                            <button
                                onClick={handleConfirmButtonClick}
                                className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition duration-200 shadow-md font-mono"
                            >
                                Konfirmasi
                            </button>
                        )}
                        {reservation.status === 'confirmed' && (
                            <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-md font-mono">
                                Dikonfirmasi
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title="APAKAH ANDA YAKIN UNTUK MELAKUKAN KONFIRMASI?"
                    onCancel={handleCancelConfirmation}
                    onConfirm={handleProceedConfirmation}
                    cancelText="BATAL" 
                    confirmText="KONFIRMASI" 
                />
            )}

            {/* MODAL INFO SETELAH KONFIRMASI */}
            {isInfoModalOpen && (
                <ModalInfo
                    title="KONFIRMASI BERHASIL"
                    description="Menunggu Pembayaran dari Pemesan."
                    onClose={handleCloseInfoModal}
                    okText="Oke"
                />
            )}
        </Layout>
    );
}