// src/app/admin/management/schedule/closeday/page.js
'use client';

import { useState, useMemo, useCallback } from 'react';
import Layout from '@/components/Layout'; 
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/id'; // Import locale Bahasa Indonesia

dayjs.locale('id'); // Set locale default ke Bahasa Indonesia
dayjs.extend(isBetween);

// Data Awal (Konstanta)
const initialHolidays = new Set(['2025-11-10', '2025-11-25', '2025-11-03']); 
const initialRecurringDays = new Set([0]); // Contoh: Setiap hari Minggu (0) libur

// 1. Array untuk HEADER KALENDER (Singkatan Inggris)
const headerDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 

// 2. Array MAPPING untuk PESAN PERINGATAN (Lengkap Indonesia)
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
    // --- STATE MANAGEMENT ---
    const [currentDate, setCurrentDate] = useState(dayjs('2025-11-01')); 
    const [holidays, setHolidays] = useState(initialHolidays); 
    const [recurringDays, setRecurringDays] = useState(initialRecurringDays); 
    const [selectedDates, setSelectedDates] = useState(new Set()); // Tanggal spesifik yang sedang dipilih
    const [selectedDay, setSelectedDay] = useState(''); // Hari mingguan (0-6) yang sedang dipilih di dropdown
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoModalDescription, setInfoModalDescription] = useState(""); 
    const [isSaving, setIsSaving] = useState(false); 

    // --- LOGIKA KALENDER (daysInMonth) ---
    const daysInMonth = useMemo(() => {
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startDay = startOfMonth.day(); 
        const totalDays = endOfMonth.date();
        
        const days = [];
        
        // Filler days dari bulan sebelumnya
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        
        // Tanggal di bulan ini
        for (let i = 1; i <= totalDays; i++) {
            days.push(startOfMonth.date(i));
        }
        
        return days;
    }, [currentDate]);

    // --- LOGIKA NAVIGASI BULAN (Baru Ditambahkan/Dipulihkan) ---
    const changeMonth = useCallback((amount) => {
        // Hapus tanggal yang sedang dipilih saat berpindah bulan
        setSelectedDates(new Set()); 
        setSelectedDay('');
        setCurrentDate(prevDate => prevDate.add(amount, 'month'));
    }, []);

    const prevMonth = () => changeMonth(-1);
    const nextMonth = () => changeMonth(1);
    // --------------------------------------------------

    // --- LOGIKA PEMILIHAN (KLIK TANGGAL) ---
    const handleDateClick = useCallback((date) => {
        if (!date) return;
        const dateString = date.format('YYYY-MM-DD');
        
        // Peringatan jika hari tersebut adalah hari libur mingguan global
        if (recurringDays.has(date.day())) {
            setInfoModalDescription(`Hari ${indonesianDayNames[date.day()]} sudah diatur sebagai Hari Libur Mingguan. Anda tidak bisa memilih tanggal individu.`); 
            setIsInfoModalOpen(true); 
            return;
        }

        setSelectedDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dateString)) {
                newSet.delete(dateString); // Unselect
            } else {
                newSet.add(dateString); // Select
            }
            return newSet;
        });
        // Kosongkan pilihan hari jika tanggal dipilih
        setSelectedDay('');
    }, [recurringDays]); 

    // --- LOGIKA AKSI (Tutup/Buka) ---
    const handleCloseAction = (isRecurring = false) => {
        if (isRecurring && selectedDay !== '') {
            const dayValue = parseInt(selectedDay);
            setRecurringDays(prev => {
                const newSet = new Set(prev);
                newSet.add(dayValue);
                return newSet;
            });
            setSelectedDay('');
            setInfoModalDescription("Pengaturan Hari Libur Mingguan diperbarui. Jangan lupa Konfirmasi.");
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
        if (isRecurring && selectedDay !== '') {
            const dayValue = parseInt(selectedDay);
            setRecurringDays(prev => {
                const newSet = new Set(prev);
                newSet.delete(dayValue);
                return newSet;
            });
            setSelectedDay('');
            setInfoModalDescription("Pengaturan Hari Buka Mingguan diperbarui. Jangan lupa Konfirmasi.");
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

    // --- LOGIKA KONFIRMASI DAN MODAL ---
    const handleKonfirmasiClick = () => {
        console.log("Tanggal Libur Spesifik yang akan disimpan:", Array.from(holidays));
        console.log("Hari Libur Mingguan (0-6) yang akan disimpan:", Array.from(recurringDays));
        
        setIsSaving(true);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = () => {
        setIsConfirmModalOpen(false);
        setInfoModalDescription("Daftar Hari Libur (Spesifik & Mingguan) berhasil disimpan ke database.");
        setIsInfoModalOpen(true);
        setIsSaving(false);
    };

    const handleCancelSave = () => {
        setIsConfirmModalOpen(false);
        setIsSaving(false);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setInfoModalDescription(""); 
    };
    // ------------------------------------

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
            
            if (isHolidayRecurring) {
                classes += ' cursor-default'; 
            }
        } else {
            classes += ' text-black hover:bg-gray-100'; 
        }
        
        // Styling Selected (Prioritas visual)
        if (isSelected) {
            classes += ' ring-2 ring-blue-500 bg-blue-100/50';
        }
        
        // Styling untuk hari yang dipilih di dropdown (untuk visibilitas)
        if (selectedDay !== '' && day.day() === parseInt(selectedDay)) {
             classes += ' border-2 border-yellow-500'; 
        }

        return classes;
    };

    const isDateAction = selectedDates.size > 0;
    const isDayAction = selectedDay !== '';
    const isDisabled = !isDateAction && !isDayAction; // Tombol aksi dinonaktifkan jika tidak ada pilihan

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Hari Libur" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-4 max-w-5xl mx-auto">
                
                {/* Header Bulan/Tahun (DIPULIHKAN) */}
                <div className="flex justify-between items-center mb-6 max-w-lg mx-auto">
                    <button 
                        onClick={prevMonth} 
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    <h3 className="text-xl font-bold font-mono text-gray-800">
                        {currentDate.format('MMMM YYYY')} 
                    </h3>
                    <button 
                        onClick={nextMonth} 
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <ArrowRightIcon className="h-5 w-5 text-gray-700" />
                    </button>
                </div>
                
                
                {/* Kalender & Kontrol */}
                <div className="flex justify-center">
                    <div className="flex space-x-8 bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                        
                        {/* 1. Kalender Grid */}
                        <div className="w-full max-w-lg">
                            <div className="grid grid-cols-7 border border-orange-500"> 
                                
                                {/* Nama Hari (Menggunakan headerDayNames/Singkatan) */}
                                {headerDayNames.map((day, dayIndex) => { 
                                    const isRecurringHoliday = recurringDays.has(dayIndex);
                                    let headerClasses = "text-center py-3 font-bold font-mono bg-gray-100 border-r border-orange-500 last:border-r-0 border-b border-orange-500";
                                    
                                    if (isRecurringHoliday) {
                                        headerClasses += ' text-red-600'; 
                                    } else {
                                        headerClasses += ' text-black'; 
                                    }

                                    return (
                                        <div 
                                            key={day} 
                                            className={headerClasses}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}

                                {/* Tanggal */}
                                {daysInMonth.map((day, index) => (
                                    <div 
                                        key={index} 
                                        className={`border-r border-b border-orange-500 ${index % 7 === 6 ? 'border-r-0' : ''} ${getDayClasses(day)}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        {day ? day.date() : ''}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Kontrol Hari */}
                        <div className="space-y-4 pt-10 w-48"> 
                            <h4 className="text-sm font-bold text-gray-800 font-mono">Pilih berdasarkan hari :</h4>
                            
                            {/* Dropdown Hari */}
                            <select
                                value={selectedDay}
                                onChange={(e) => {
                                    setSelectedDay(e.target.value);
                                    setSelectedDates(new Set()); // Kosongkan pilihan tanggal jika hari dipilih
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md font-mono text-black" 
                            >
                                <option value="" className="text-gray-500">Pilih Hari</option>
                                {dayOptions.map(option => {
                                    const isRecurringHoliday = recurringDays.has(option.value);
                                    const optionClasses = isRecurringHoliday ? 'text-red-600 font-bold' : 'text-black';
                                    return (
                                        <option 
                                            key={option.value} 
                                            value={option.value}
                                            className={optionClasses}
                                        >
                                            {option.label}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Tombol Tutup & Buka */}
                            <div className="flex space-x-2">
                                <button
                                    // Jika dayAction aktif, gunakan mode recurring (true), jika tidak, gunakan mode tanggal (false)
                                    onClick={isDayAction ? () => handleCloseAction(true) : () => handleCloseAction(false)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                        ${!isDisabled
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-gray-400 cursor-not-allowed'}`
                                    }
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={isDayAction ? () => handleOpenAction(true) : () => handleOpenAction(false)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                        ${!isDisabled
                                            ? 'bg-blue-600 hover:bg-blue-700' 
                                            : 'bg-gray-400 cursor-not-allowed'}`
                                    }
                                >
                                    Buka
                                </button>
                            </div>

                            {/* Tombol Konfirmasi */}
                            <button
                                onClick={handleKonfirmasiClick}
                                className="w-full py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-150 shadow-md"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title={"APAKAH ANDA YAKIN UNTUK MELAKUKAN PERUBAHAN"}
                    onCancel={handleCancelSave}
                    onConfirm={handleConfirmSave}
                    cancelText="BATAL" 
                    confirmText="KONFIRMASI" 
                />
            )}

            {/* MODAL INFO */}
            {isInfoModalOpen && (
                <ModalInfo
                    title={infoModalDescription.includes("sudah diatur") ? "PERINGATAN" : "BERHASIL MELAKUKAN PERUBAHAN"}
                    description={infoModalDescription}
                    onClose={handleCloseInfoModal}
                    okText="Oke"
                />
            )}
        </Layout>
    );
}