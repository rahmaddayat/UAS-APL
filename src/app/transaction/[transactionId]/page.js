'use client';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { BoltIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'; 
import db from '@/services/DatabaseService';
import ModalConfirm from '@/components/ModalConfirm';
import ModalInfo from '@/components/ModalInfo';
import { getPaymentStrategy, strategies } from '@/strategies/PaymentStrategies';

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

// --- COMPONENT UTAMA ---

export default function TransactionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const transactionId = params.transactionId;

    // State Data
    const [transaction, setTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // State Pembayaran & Timer
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null); 
    const [isExpired, setIsExpired] = useState(false);

    // State Modal
    const [showConfirmPay, setShowConfirmPay] = useState(false); 
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', type: '' });

    // --- 1. FETCH DATA DETAIL ---
    const fetchTransactionDetail = async () => {
        setIsLoading(true);
        try {
            const allReservations = await db.fetchReservationsAPI();
            const foundRes = allReservations.find(r => r.id === transactionId);

            if (foundRes) {
                const court = db.data.courts.find(c => c.id === foundRes.courtId);
                const location = court ? db.data.fields.find(f => f.id === court.fieldId) : null;

                setTransaction({
                    ...foundRes,
                    locationName: location ? location.name : 'Unknown Location',
                    fieldName: court ? court.name : 'Unknown Court',
                    slots: foundRes.timeSlots || [] 
                });
            } else {
                setTransaction(null);
            }
        } catch (error) {
            console.error("Gagal ambil detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (transactionId) fetchTransactionDetail();
    }, [transactionId]);


    // --- 2. TIMER LOGIC ---
    useEffect(() => {
        if (!transaction || transaction.status !== 'confirmed') return;

        // 🔥 KODE TESTING (Hapus saat production) 🔥
        const testingStartTime = dayjs(); 

        const interval = setInterval(() => {
            // const startTime = transaction.confirmedAt || transaction.createdAt;
            const startTime = testingStartTime; 
            
            const deadline = dayjs(startTime).add(30, 'minute');
            const now = dayjs();
            const diffSeconds = deadline.diff(now, 'second');

            if (diffSeconds <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                handleAutoCancel(); 
            } else {
                setTimeLeft(diffSeconds);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [transaction]);

    const formatTimer = (seconds) => {
        if (seconds === null) return '--:--';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };


    // --- 3. AUTO CANCEL HANDLER ---
    const handleAutoCancel = async () => {
        if (isExpired) return; 
        setIsExpired(true);
        
        try {
            // 1. Update Status Reservasi
            await db.updateTransactionStatus(
                transactionId, 
                'canceled', 
                'Anda tidak melakukan pembayaran saat reservasi (Timeout 30 Menit).'
            );

            // 2. 🔥 REKAM KE PAYMENTS.JSON (Status Canceled) 🔥
            if (transaction) {
                await db.createPayment(
                    transactionId, 
                    transaction.totalPrice, 
                    'canceled', 
                    'System Timeout'
                );
            }

            await fetchTransactionDetail();
            setModalInfo({
                show: true, title: "WAKTU HABIS",
                message: "Waktu pembayaran telah habis. Reservasi otomatis dibatalkan.", type: "error"
            });
        } catch (error) {
            console.error("Gagal Auto Cancel:", error);
        }
    };

    // --- 4. MANUAL CANCEL HANDLER ---
    const handleRequestCancel = () => {
        setShowConfirmCancel(true);
    };

    const handleConfirmCancel = async () => {
        setShowConfirmCancel(false);
        try {
            // 1. Update Status Reservasi
            await db.updateTransactionStatus(
                transactionId,
                'canceled',
                'Dibatalkan oleh Pengguna.'
            );

            // 2. 🔥 REKAM KE PAYMENTS.JSON (Status Canceled) 🔥
            if (transaction) {
                await db.createPayment(
                    transactionId, 
                    transaction.totalPrice, 
                    'canceled', 
                    'User Request'
                );
            }
            
            await fetchTransactionDetail();
            setModalInfo({
                show: true,
                title: "DIBATALKAN",
                message: "Reservasi berhasil dibatalkan.",
                type: "success"
            });
        } catch (error) {
            setModalInfo({ show: true, title: "ERROR", message: "Gagal membatalkan reservasi.", type: "error" });
        }
    }


    // --- 5. PAYMENT HANDLERS ---
    const handleMethodSelect = (key) => {
        if (isExpired) return;
        setSelectedMethod(key);
    };

    const handlePrePay = () => {
        if (!selectedMethod) {
            setModalInfo({ show: true, title: "PILIH METODE", message: "Silakan pilih metode pembayaran terlebih dahulu.", type: "error" });
            return;
        }
        if (timeLeft <= 0) {
            handleAutoCancel();
            return;
        }
        setShowConfirmPay(true);
    };

    const handleConfirmPay = async () => {
        setShowConfirmPay(false);
        const strategy = getPaymentStrategy(selectedMethod);
        if (!strategy) return;

        try {
            // 1. Proses Strategy
            await strategy.processPayment(transaction.totalPrice);
            
            // 2. Update Status Reservasi
            await db.updateTransactionStatus(transactionId, 'paid');

            // 3. 🔥 REKAM KE PAYMENTS.JSON (Status Paid) 🔥
            await db.createPayment(
                transactionId, 
                transaction.totalPrice, 
                'paid', 
                selectedMethod
            );

            await fetchTransactionDetail();
            setModalInfo({ show: true, title: "PEMBAYARAN BERHASIL", message: `Terima kasih! Pembayaran via ${selectedMethod} berhasil.`, type: "success" });
        } catch (error) {
            setModalInfo({ show: true, title: "GAGAL", message: "Terjadi kesalahan saat memproses pembayaran.", type: "error" });
        }
    };

    const handleCloseModalInfo = () => {
        const type = modalInfo.type;
        setModalInfo({ ...modalInfo, show: false });
        
        if (type === 'success') {
            if (transaction.status === 'canceled') {
                 router.push('/history'); 
            } else {
                 router.push('/transaction'); 
            }
        }
    };


    // --- RENDER UI ---
    if (isLoading) return <Layout showHeader={true}><div className="text-center mt-20">Loading...</div></Layout>;
    if (!transaction) return <Layout showHeader={true}><div className="text-center mt-20">Data tidak ditemukan</div></Layout>;

    // Formatting
    const formattedDate = dayjs(transaction.date).format('DD MMMM YYYY');
    const timeSlotsDisplay = formatTimeSlots(transaction.slots) + " WIB";
    const formattedCreatedAt = dayjs(transaction.createdAt).format('DD-MM-YYYY / HH.mm');

    // Status Check
    const isPaymentRequired = transaction.status === 'confirmed';
    const isCancelled = transaction.status === 'canceled' || transaction.status === 'rejected';
    const isCancellable = transaction.status === 'pending' || transaction.status === 'confirmed';

    let statusText, statusClasses;
    switch (transaction.status) {
        case 'pending': statusText = 'Menunggu Konfirmasi Admin'; statusClasses = 'bg-yellow-100 text-yellow-800 border-yellow-300'; break;
        case 'confirmed': statusText = 'Menunggu Pembayaran'; statusClasses = 'bg-blue-100 text-blue-800 border-blue-300'; break;
        case 'paid': statusText = 'Lunas / Selesai'; statusClasses = 'bg-green-100 text-green-800 border-green-300'; break;
        
        case 'canceled': 
        case 'rejected': statusText = 'Dibatalkan'; statusClasses = 'bg-red-100 text-red-800 border-red-300'; break;
        
        default: statusText = transaction.status; statusClasses = 'bg-gray-200 text-gray-800';
    }

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Detail Transaksi" 
            showBackButton={true}
            backUrl={['paid', 'rejected', 'canceled'].includes(transaction.status) ? '/history' : '/transaction'}
        >
            {/* Modal Confirm PAY */}
            {showConfirmPay && (
                <ModalConfirm 
                    title={`Konfirmasi Pembayaran:\nVia ${selectedMethod} senilai ${formatCurrency(transaction.totalPrice)}?`}
                    confirmText="BAYAR SEKARANG"
                    cancelText="KEMBALI"
                    onConfirm={handleConfirmPay}
                    onCancel={() => setShowConfirmPay(false)}
                />
            )}

            {/* Modal Confirm CANCEL */}
            {showConfirmCancel && (
                <ModalConfirm 
                    title="Apakah Anda yakin ingin membatalkan reservasi ini?"
                    confirmText="YA, BATALKAN"
                    cancelText="TIDAK"
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setShowConfirmCancel(false)}
                />
            )}

            {modalInfo.show && (
                <ModalInfo 
                    title={modalInfo.title}
                    description={modalInfo.message}
                    type={modalInfo.type}
                    onClose={handleCloseModalInfo}
                />
            )}

            <div className={`p-6 max-w-lg mx-auto pb-32 ${isPaymentRequired ? 'mb-20' : ''}`}>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 relative">
                    
                    {/* Header */}
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
                    
                    {/* Status Badge */}
                    <div className={`w-full py-2 px-3 rounded-md text-sm font-bold text-center mb-6 border ${statusClasses}`}>
                        {statusText}
                    </div>

                    {/* Alert Message */}
                    {isCancelled && transaction.message && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 italic">
                            Info: {transaction.message}
                        </div>
                    )}

                    {/* Timer */}
                    {isPaymentRequired && (
                        <div className="mb-6 flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200 animate-pulse">
                            <span className="text-sm text-blue-800 font-semibold">Sisa Waktu Pembayaran:</span>
                            <div className="flex items-center text-red-600 font-bold font-mono text-lg">
                                <ClockIcon className="w-5 h-5 mr-2" />
                                {timeLeft <= 0 ? '00:00' : formatTimer(timeLeft)}
                            </div>
                        </div>
                    )}
                    
                    {/* Detail Table */}
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
                            <span className="font-bold text-gray-900 text-sm text-right flex-1">{transaction.slots.length} Jam</span>
                        </div>
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                            <span className="text-gray-600 text-sm font-semibold">Total Tagihan</span>
                            <span className="font-extrabold text-[#E86500] text-lg">{formatCurrency(transaction.totalPrice)}</span>
                        </div>
                    </div>

                    {/* TOMBOL BATALKAN */}
                    {isCancellable && (
                        <div className="mb-6 text-center">
                            <button 
                                onClick={handleRequestCancel}
                                className="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 hover:border-red-400 px-4 py-2 rounded-full transition-all flex items-center justify-center mx-auto gap-2"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                Batalkan Reservasi
                            </button>
                        </div>
                    )}

                    {/* METODE PEMBAYARAN */}
                    {isPaymentRequired && (
                        <div className="animate-fade-in-up">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Metode Pembayaran:</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.keys(strategies).map((key) => {
                                    const isActive = selectedMethod === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleMethodSelect(key)}
                                            className={`py-3 px-2 rounded-lg border-2 text-sm font-bold transition-all duration-200 ${
                                                isActive 
                                                ? 'border-[#E86500] bg-orange-50 text-[#E86500] shadow-md transform scale-105' 
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            {strategies[key].name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="text-[10px] text-gray-400 mt-6 pt-4 border-t text-center font-mono">
                        <p>ID: {transactionId}</p>
                        <p>Created: {formattedCreatedAt}</p>
                    </div>
                </div>
            </div>

            {/* FLOATING BUTTON (BAYAR) */}
            {isPaymentRequired && (
                <div className="fixed bottom-0 right-0 left-0 sm:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-40 flex justify-end items-center gap-4">
                    <div className="hidden sm:block text-right mr-4">
                        <p className="text-xs text-gray-500">Total Tagihan</p>
                        <p className="text-xl font-extrabold text-[#E86500]">{formatCurrency(transaction.totalPrice)}</p>
                    </div>
                    <button 
                        onClick={handlePrePay}
                        disabled={timeLeft <= 0}
                        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 w-full sm:w-auto ${
                            timeLeft <= 0 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-[#E86500] hover:bg-[#C95500] hover:shadow-orange-200'
                        }`}
                    >
                        BAYAR SEKARANG
                    </button>
                </div>
            )}
        </Layout>
    );
}