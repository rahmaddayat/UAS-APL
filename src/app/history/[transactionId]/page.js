'use client';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { BoltIcon, DocumentCheckIcon, XCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline'; 
import db from '@/services/DatabaseService';

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
    }).format(amount);
};

const formatTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return '-';
    const sortedSlots = [...slots].sort();
    let groups = [];
    let currentStart = null;
    let currentEnd = null;

    sortedSlots.forEach((slot, index) => {
        const [startStr, endStr] = slot.split(' - '); 
        const startHour = parseInt(startStr);
        const prevEndHour = currentEnd ? parseInt(currentEnd) : null;

        if (index === 0) {
            currentStart = startStr;
            currentEnd = endStr;
        } else if (startHour === prevEndHour) {
            currentEnd = endStr;
        } else {
            groups.push(`${currentStart} - ${currentEnd}`);
            currentStart = startStr;
            currentEnd = endStr;
        }
    });

    if (currentStart) {
        groups.push(`${currentStart} - ${currentEnd}`);
    }
    return groups.join(', ');
};

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const transactionId = params.transactionId;

    const [transaction, setTransaction] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Ambil Data Reservasi via API Service
                const allReservations = await db.fetchReservationsAPI();
                const foundRes = allReservations.find(r => r.id === transactionId);

                if (foundRes) {
                    // Enrich Data Lokasi
                    const court = db.data.courts.find(c => c.id === foundRes.courtId);
                    const location = court ? db.data.fields.find(f => f.id === court.fieldId) : null;

                    setTransaction({
                        ...foundRes,
                        locationName: location ? location.name : 'Unknown Location',
                        fieldName: court ? court.name : 'Unknown Court',
                    });

                    // 2. Ambil Data Payment via API Service
                    const allPayments = await db.fetchPaymentsAPI();
                    const foundPay = allPayments.find(p => p.reservationId === transactionId);
                    setPaymentInfo(foundPay || null);

                } else {
                    setTransaction(null);
                }
            } catch (error) {
                console.error("Error fetching detail:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (transactionId) fetchData();
    }, [transactionId]);

    // --- UI LOADING & NOT FOUND ---
    if (isLoading) return <Layout showHeader={true}><div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div></Layout>;
    if (!transaction) return <Layout showHeader={true}><div className="text-center mt-20 text-gray-500">Data Transaksi Tidak Ditemukan.</div></Layout>;

    // --- FORMATTING ---
    const formattedDate = dayjs(transaction.date).locale('id').format('DD MMMM YYYY');
    const timeSlotsDisplay = formatTimeSlots(transaction.timeSlots) + " WIB";
    const formattedCreatedAt = dayjs(transaction.createdAt).format('DD/MM/YYYY HH:mm');
    const formattedPaymentTime = paymentInfo ? dayjs(paymentInfo.paymentTime).format('DD/MM/YYYY HH:mm') : '-';

    // --- STATUS CONFIGURATION ---
    let statusConfig = { text: '', classes: '', icon: null };
    
    switch (transaction.status) {
        case 'paid': 
            statusConfig = { 
                text: 'Lunas / Selesai', 
                classes: 'bg-green-100 text-green-800 border-green-300',
                icon: <DocumentCheckIcon className="w-5 h-5 mr-2" />
            };
            break;
        case 'canceled': 
        case 'rejected': 
            statusConfig = { 
                text: 'Dibatalkan', 
                classes: 'bg-red-100 text-red-800 border-red-300',
                icon: <XCircleIcon className="w-5 h-5 mr-2" />
            }; 
            break;
        default: 
            statusConfig = { text: transaction.status, classes: 'bg-gray-200 text-gray-800' };
    }

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Detail Riwayat" 
            showBackButton={true}
            backUrl="/history"
        >
            <div className="p-6 max-w-lg mx-auto pb-32">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 relative">
                    
                    {/* 1. Header Lokasi */}
                    <div className="flex justify-between items-start mb-6 border-b border-dashed pb-4">
                        <div className="flex items-start">
                            <div className="bg-orange-50 p-2 rounded-full mr-3">
                                <BoltIcon className="w-6 h-6 text-[#E86500]" /> 
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{transaction.locationName}</h3>
                                <p className="text-sm text-gray-600">{transaction.fieldName}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Status Badge */}
                    <div className={`w-full py-3 px-3 rounded-lg text-sm font-bold text-center mb-6 border flex items-center justify-center ${statusConfig.classes}`}>
                        {statusConfig.icon}
                        {statusConfig.text}
                    </div>

                    {/* 3. Detail Reservasi */}
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600 text-sm w-24">Tanggal</span>
                            <span className="font-bold text-gray-900 text-sm text-right flex-1">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600 text-sm w-24">Jadwal</span>
                            <span className="font-bold text-gray-900 text-sm text-right flex-1">{timeSlotsDisplay}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600 text-sm w-24">Durasi</span>
                            <span className="font-bold text-gray-900 text-sm text-right flex-1">{transaction.timeSlots.length} Jam</span>
                        </div>
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                            <span className="text-gray-600 text-sm font-semibold">Total Tagihan</span>
                            <span className="font-extrabold text-[#E86500] text-lg">{formatCurrency(transaction.totalPrice)}</span>
                        </div>
                    </div>

                    {/* 4. Informasi Pembayaran / Pembatalan */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <CreditCardIcon className="w-4 h-4 mr-1 text-gray-500" />
                            Rincian Transaksi
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm space-y-2">
                            {/* Jika PAID */}
                            {transaction.status === 'paid' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Metode Bayar</span>
                                        <span className="font-bold text-gray-900">
                                            {paymentInfo?.paymentMethod || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Waktu Bayar</span>
                                        <span className="font-mono text-gray-700">{formattedPaymentTime}</span>
                                    </div>
                                </>
                            )}

                            {/* Jika CANCELED */}
                            {(transaction.status === 'canceled' || transaction.status === 'rejected') && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Keterangan</span>
                                        <span className="font-bold text-red-600 text-right">
                                            {transaction.message || paymentInfo?.paymentMethod || 'Dibatalkan'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Waktu Batal</span>
                                        <span className="font-mono text-gray-700">{formattedPaymentTime !== '-' ? formattedPaymentTime : dayjs().format('DD/MM/YYYY')}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 5. Footer Timestamp */}
                    <div className="text-[10px] text-gray-400 mt-6 pt-4 border-t text-center font-mono space-y-1">
                        <p>Booking ID: <span className="text-gray-500">{transactionId}</span></p>
                        <p>Dibuat: {formattedCreatedAt}</p>
                    </div>
                </div>
            </div>

            {/* --- FLOATING CLOSE BUTTON --- */}
            <div className="fixed bottom-0 right-0 left-0 sm:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-40">
                <button 
                    onClick={() => router.push('/history')}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    TUTUP
                </button>
            </div>
        </Layout>
    );
}