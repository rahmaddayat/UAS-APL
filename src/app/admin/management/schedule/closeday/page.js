'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '@/components/Layout'; 
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline'; // Tambah MapPinIcon
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/id'; 
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; // Import Service

dayjs.locale('id'); 
dayjs.extend(isBetween);

// Data Konstanta (Dibuat konstan di sini, tidak perlu inisiasi dari data dummy)
const headerDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
const indonesianDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; 

const dayOptions = [
    { value: 0, label: 'Minggu' },
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
];

export default function ClosedayPage() {
    const router = useRouter();

    // --- STATE DATA (Diisi dari API) ---
    const [currentDate, setCurrentDate] = useState(dayjs()); 
    const [holidays, setHolidays] = useState(new Set()); // specificClosedDates
    const [recurringDays, setRecurringDays] = useState(new Set()); // closedDays
    const [fieldData, setFieldData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- STATE INTERAKSI UI ---
    const [selectedDates, setSelectedDates] = useState(new Set()); 
    const [selectedDay, setSelectedDay] = useState(''); 
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoModalDescription, setInfoModalDescription] = useState(""); 
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Kunci untuk reload data

    // --- 1. LOAD DATA DARI API ---
    const loadData = async () => {
        setIsLoading(true);
        try {
            const sessionUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!sessionUser || sessionUser.role !== 'admin') {
                router.push('/admin/login');
                return;
            }

            const admin = db.data.admins.find(a => a.id === sessionUser.id) || sessionUser;
            if (!admin.fieldId) {
                alert("Akun ini tidak terhubung dengan lokasi lapangan.");
                return;
            }

            // Fetch Data dari JSON
            const data = await db.getFieldData(admin.fieldId);
            setFieldData(data);

            if (data) {
                // PENTING: Mengisi state dengan data dari database
                setRecurringDays(new Set(data.closedDays || []));
                setHolidays(new Set(data.specificClosedDates || []));
            }

        } catch (error) {
            console.error("Gagal memuat data libur:", error);
            setInfoModalDescription("Gagal memuat data libur dari server.");
            setIsInfoModalOpen(true); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [router, refreshKey]); // Refresh saat refreshKey berubah

    // --- LOGIKA KALENDER ---
    const daysInMonth = useMemo(() => {
        // ... (Logika Kalender Tetap Sama)
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startDay = startOfMonth.day(); 
        const totalDays = endOfMonth.date();
        
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null); 
        for (let i = 1; i <= totalDays; i++) days.push(startOfMonth.date(i)); 
        
        return days;
    }, [currentDate]);

    const changeMonth = useCallback((amount) => {
        setSelectedDates(new Set()); 
        setSelectedDay('');
        setCurrentDate(prevDate => prevDate.add(amount, 'month'));
    }, []);

    const prevMonth = () => changeMonth(-1);
    const nextMonth = () => changeMonth(1);

    // --- LOGIKA PEMILIHAN (KLIK TANGGAL) ---
    const handleDateClick = useCallback((date) => {
        if (!date || isLoading) return; // Nonaktifkan saat loading

        const dateString = date.format('YYYY-MM-DD');
        
        if (recurringDays.has(date.day())) {
            setInfoModalDescription(`Hari ${indonesianDayNames[date.day()]} sudah diatur sebagai Hari Libur Mingguan. Anda tidak bisa memilih tanggal individu.`); 
            setIsInfoModalOpen(true); 
            return;
        }

        setSelectedDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dateString)) newSet.delete(dateString);
            else newSet.add(dateString);
            return newSet;
        });
        setSelectedDay('');
    }, [recurringDays, isLoading]); 

    // --- LOGIKA AKSI (Tutup/Buka di UI) ---
    const handleCloseAction = (isRecurring = false) => {
        if (!fieldData || isLoading) return;

        if (isRecurring && selectedDay !== '') {
            const dayValue = parseInt(selectedDay);
            setRecurringDays(prev => new Set(prev).add(dayValue));
            setSelectedDay('');
            setInfoModalDescription(`Hari ${indonesianDayNames[dayValue]} diatur TUTUP. Jangan lupa Konfirmasi.`);
            setIsInfoModalOpen(true); 
            
        } else if (!isRecurring && selectedDates.size > 0) {
            setHolidays(prev => {
                const newSet = new Set(prev);
                selectedDates.forEach(date => newSet.add(date));
                return newSet;
            });
            setSelectedDates(new Set());
            setInfoModalDescription("Tanggal Libur spesifik diperbarui. Jangan lupa Konfirmasi.");
            setIsInfoModalOpen(true);
        }
    };

    const handleOpenAction = (isRecurring = false) => {
        if (!fieldData || isLoading) return;

        if (isRecurring && selectedDay !== '') {
            const dayValue = parseInt(selectedDay);
            setRecurringDays(prev => {
                const newSet = new Set(prev);
                newSet.delete(dayValue);
                return newSet;
            });
            setSelectedDay('');
            setInfoModalDescription(`Hari ${indonesianDayNames[dayValue]} diatur BUKA. Jangan lupa Konfirmasi.`);
            setIsInfoModalOpen(true);
            
        } else if (!isRecurring && selectedDates.size > 0) {
            setHolidays(prev => {
                const newSet = new Set(prev);
                selectedDates.forEach(date => newSet.delete(date));
                return newSet;
            });
            setSelectedDates(new Set());
            setInfoModalDescription("Tanggal Buka spesifik diperbarui. Jangan lupa Konfirmasi.");
            setIsInfoModalOpen(true);
        }
    };

    // --- 2. LOGIKA SIMPAN KE DATABASE ---
    const handleKonfirmasiClick = () => {
        if (isSaving || isLoading) return;
        setIsSaving(true);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        setIsConfirmModalOpen(false);
        if (!fieldData) return;

        try {
            // Konversi Set ke Array untuk JSON (PENTING)
            const closedDaysArray = Array.from(recurringDays).sort((a, b) => a - b);
            const specificDatesArray = Array.from(holidays).sort();

            // Panggil API Service
            await db.updateFieldHolidays(fieldData.id, closedDaysArray, specificDatesArray);

            setInfoModalDescription("Daftar Hari Libur berhasil disimpan ke database!");
            setIsInfoModalOpen(true);

            // Trigger reload data dari server
            setRefreshKey(prev => prev + 1); 

        } catch (error) {
            console.error(error);
            setInfoModalDescription("Gagal menyimpan data ke server.");
            setIsInfoModalOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelSave = () => {
        setIsConfirmModalOpen(false);
        setIsSaving(false);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setInfoModalDescription(""); 
    };

    // --- LOGIKA STYLING HARI ---
    const getDayClasses = (day) => {
        if (!day) return '';
        const dateString = day.format('YYYY-MM-DD');
        
        const isHolidaySpecific = holidays.has(dateString);
        const isHolidayRecurring = recurringDays.has(day.day()); 
        const isSelected = selectedDates.has(dateString);
        
        let classes = 'text-center p-3 font-semibold cursor-pointer transition duration-150 relative h-16 flex items-center justify-center';

        // Styling Libur
        if (isHolidaySpecific || isHolidayRecurring) {
            classes += ' text-red-600 font-bold'; 
            if (isHolidayRecurring) classes += ' cursor-default'; 
        } else {
            classes += ' text-black hover:bg-gray-100'; 
        }
        
        // Styling Selected
        if (isSelected) {
            classes += ' ring-2 ring-blue-500 bg-blue-100/50';
        }
        
        // Styling Selected Dropdown Day
        if (selectedDay !== '' && day.day() === parseInt(selectedDay)) {
             classes += ' border-2 border-yellow-500 bg-yellow-50'; 
        }

        return classes;
    };

    const isDateAction = selectedDates.size > 0;
    const isDayAction = selectedDay !== '';
    const isDisabled = !isDateAction && !isDayAction || isLoading; 

    // --- UI UTAMA ---
    if (isLoading) return <Layout showHeader={true}><div className="text-center mt-20">Memuat Data Libur...</div></Layout>;

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Hari Libur" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-4 max-w-5xl mx-auto pb-24">
                
                {/* Header Info Lokasi */}
                {fieldData && (
                    <div className="text-center mb-4">
                        <span className="text-sm font-bold bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-200 flex items-center justify-center mx-auto gap-1 w-fit">
                            <MapPinIcon className="w-4 h-4" />
                            Lokasi: {fieldData.name}
                        </span>
                    </div>
                )}

                {/* Navigasi Bulan */}
                <div className="flex justify-between items-center mb-6 max-w-lg mx-auto">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    <h3 className="text-xl font-bold font-mono text-gray-800">
                        {currentDate.format('MMMM YYYY')} 
                    </h3>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <ArrowRightIcon className="h-5 w-5 text-gray-700" />
                    </button>
                </div>
                
                <div className="flex justify-center">
                    <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8 bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                        
                        {/* 1. Kalender Grid */}
                        <div className="w-full max-w-lg">
                            <div className="grid grid-cols-7 border border-orange-500 select-none"> 
                                {/* Header Hari */}
                                {headerDayNames.map((day, dayIndex) => { 
                                    const isRecurringHoliday = recurringDays.has(dayIndex);
                                    let headerClasses = "text-center py-3 font-bold font-mono bg-gray-100 border-r border-orange-500 last:border-r-0 border-b border-orange-500";
                                    if (isRecurringHoliday) headerClasses += ' text-red-600'; 
                                    else headerClasses += ' text-black'; 

                                    return <div key={day} className={headerClasses}>{day}</div>;
                                })}

                                {/* Tanggal */}
                                {daysInMonth.map((day, index) => (
                                    <div 
                                        key={index} 
                                        className={`border-r border-b border-orange-500 ${index % 7 === 6 ? 'border-r-0' : ''} ${getDayClasses(day)}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        {day ? day.date() : ''}
                                        {(holidays.has(day?.format('YYYY-MM-DD')) && !recurringDays.has(day.day())) && (
                                            <span className="absolute bottom-1 right-1 text-[8px] font-bold text-red-500 bg-red-50 px-1 rounded-sm">Libur</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Kontrol Panel */}
                        <div className="space-y-4 pt-4 lg:pt-10 w-full lg:w-48"> 
                            <h4 className="text-sm font-bold text-gray-800 font-mono">Pilih berdasarkan hari :</h4>
                            
                            {/* Dropdown Hari */}
                            <select
                                value={selectedDay}
                                onChange={(e) => {
                                    setSelectedDay(e.target.value);
                                    setSelectedDates(new Set()); 
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md font-mono text-black" 
                            >
                                <option value="" className="text-gray-500">Pilih Hari</option>
                                {dayOptions.map(option => {
                                    const isRecurringHoliday = recurringDays.has(option.value);
                                    return (
                                        <option 
                                            key={option.value} 
                                            value={option.value}
                                            className={isRecurringHoliday ? 'text-red-600 font-bold' : 'text-black'}
                                        >
                                            {option.label} {isRecurringHoliday ? '(Libur Mingguan)' : '(Buka)'}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Tombol Aksi */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={isDayAction ? () => handleCloseAction(true) : () => handleCloseAction(false)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                        ${!isDisabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={isDayAction ? () => handleOpenAction(true) : () => handleOpenAction(false)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                        ${!isDisabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                >
                                    Buka
                                </button>
                            </div>

                            {/* Tombol Konfirmasi */}
                            <button
                                onClick={handleKonfirmasiClick}
                                disabled={isSaving || isLoading}
                                className={`w-full py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md mt-4
                                    ${isSaving || isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isSaving ? 'Menyimpan...' : 'Konfirmasi Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title="SIMPAN PERUBAHAN JADWAL LIBUR?"
                    onCancel={handleCancelSave}
                    onConfirm={handleConfirmSave}
                    cancelText="BATAL" 
                    confirmText="KONFIRMASI" 
                />
            )}

            {isInfoModalOpen && (
                <ModalInfo
                    title={infoModalDescription.includes("sudah diatur") || infoModalDescription.includes("Gagal") ? "PERINGATAN" : "INFORMASI"}
                    description={infoModalDescription}
                    onClose={handleCloseInfoModal}
                    okText="Oke"
                />
            )}
        </Layout>
    );
}