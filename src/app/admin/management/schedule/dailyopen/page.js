// src/app/admin/management/schedule/dailyopen/page.js
'use client';

import { useState, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; 

// --- Data Awal 24 Jam Operasional ---
const initialDailyHours = Array.from({ length: 24 }, (_, i) => {
    const start = i.toString().padStart(2, '0');
    const endHour = (i + 1) % 24;
    const end = endHour.toString().padStart(2, '0');
    const label = `${start}.00 - ${end}.00 WIB`;
    
    return {
        id: i,
        time: label,
        status: 'default', // 'default' (Hitam), 'open' (Biru), 'close' (Merah)
    };
});

export default function DailyOpenPage() {
    const [dailyHours, setDailyHours] = useState(initialDailyHours);
    const [selectedHours, setSelectedHours] = useState([]);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false); 
    
    // STATE BARU: Untuk menyimpan teks deskripsi ModalInfo yang benar
    const [infoModalDescription, setInfoModalDescription] = useState(""); 

    // --- LOGIKA UTAMA ---

    const handleHourClick = useCallback((id) => {
        setSelectedHours(prevSelected => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(hourId => hourId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    }, []);

    const handleCloseHours = () => {
        setDailyHours(prevHours => 
            prevHours.map(hour => 
                selectedHours.includes(hour.id) 
                    ? { ...hour, status: 'close' } 
                    : hour
            )
        );
        setSelectedHours([]);
    };

    const handleOpenHours = () => {
        setDailyHours(prevHours => 
            prevHours.map(hour => 
                selectedHours.includes(hour.id) 
                    ? { ...hour, status: 'open' } 
                    : hour
            )
        );
        setSelectedHours([]);
    };

    // Fungsi Reset: Membuka Modal Konfirmasi Reset
    const handleResetClick = () => {
        setIsResetConfirmOpen(true);
    };

    // Logika Reset setelah Konfirmasi
    const handleConfirmReset = () => {
        setDailyHours(initialDailyHours); 
        setSelectedHours([]);
        setIsResetConfirmOpen(false); 
        
        // SET DESKRIPSI UNTUK RESET
        setInfoModalDescription("Semua jadwal telah direset ke status default");
        setIsInfoModalOpen(true); 
    };

    const handleCancelReset = () => {
        setIsResetConfirmOpen(false);
    };


    // Fungsi untuk Konfirmasi (menyimpan ke DB)
    const handleKonfirmasiClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = () => {
        setIsConfirmModalOpen(false);
        console.log("Saving changes to database:", dailyHours);
        
        // SET DESKRIPSI UNTUK SIMPAN PERUBAHAN
        setInfoModalDescription("Jadwal disimpan ke database");
        setIsInfoModalOpen(true);
        setSelectedHours([]);
    };

    const handleCancelSave = () => {
        setIsConfirmModalOpen(false);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        // Reset deskripsi setelah ditutup
        setInfoModalDescription(""); 
    };

    const getStatusColor = useCallback((status) => {
        if (status === 'close') return 'text-red-600'; 
        if (status === 'open') return 'text-blue-600'; 
        return 'text-black'; 
    }, []);

    // --- RENDERING (Tidak Berubah) ---
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < 12; i++) {
            result.push([dailyHours[i], dailyHours[i + 12]]);
        }
        return result;
    }, [dailyHours]);

    const renderHourCell = (hour) => {
        if (!hour) return <div className="p-2 border-r border-b border-gray-300"></div>;

        const isSelected = selectedHours.includes(hour.id);
        const colorClass = getStatusColor(hour.status);
        
        return (
            <div 
                key={hour.id} 
                onClick={() => handleHourClick(hour.id)} 
                className={`relative py-2 px-3 border-r border-b border-gray-300 cursor-pointer 
                            transition duration-100 hover:bg-gray-200/70`}
            >
                {/* Overlay Biru Muda Transparan jika terpilih */}
                {isSelected && (
                    <div className="absolute inset-0 bg-blue-200/50 border-2 border-blue-400"></div>
                )}
                <span className={`relative z-10 font-mono text-sm font-bold ${colorClass}`}>
                    {hour.time}
                </span>
            </div>
        );
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Jadwal Harian" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-1 max-w-full">
                
                <div className="max-w-xl mx-auto bg-gray-100 p-6 rounded-xl shadow-xl border border-gray-300"> 
                    
                    <div className="flex items-center space-x-2 mb-4 border-b pb-2">
                        <ClockIcon className="w-6 h-6 text-gray-700" />
                        <h3 className="text-xl font-bold text-gray-800">Pilih Jadwal :</h3>
                    </div>

                    <div className="border-t border-l border-gray-300"> 
                        {rows.map((row, index) => (
                            <div 
                                key={index} 
                                className="grid grid-cols-2"
                            >
                                {renderHourCell(row[0])}
                                {renderHourCell(row[1])}
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
                        
                        <button
                            onClick={handleResetClick}
                            className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-orange-500 rounded-md hover:bg-orange-600 transition duration-150 shadow-md"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            <span>Reset</span>
                        </button>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleCloseHours}
                                disabled={selectedHours.length === 0}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                    ${selectedHours.length > 0 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-gray-400 cursor-not-allowed'}`
                                }
                            >
                                Tutup Jam
                            </button>

                            <button
                                onClick={handleOpenHours}
                                disabled={selectedHours.length === 0}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                    ${selectedHours.length > 0 
                                        ? 'bg-blue-600 hover:bg-blue-700' 
                                        : 'bg-gray-400 cursor-not-allowed'}`
                                }
                            >
                                Buka Jam
                            </button>
                            
                            <button
                                onClick={handleKonfirmasiClick}
                                className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-150 shadow-md"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI (Simpan Perubahan) */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title={"APAKAH ANDA YAKIN UNTUK MELAKUKAN PERUBAHAN"}
                    onCancel={handleCancelSave}
                    onConfirm={handleConfirmSave}
                    cancelText="BATAL" 
                    confirmText="KONFIRMASI" 
                />
            )}
            
            {/* MODAL KONFIRMASI (Reset Jadwal) */}
            {isResetConfirmOpen && (
                <ModalConfirm
                    title={"APAKAH ANDA YAKIN UNTUK MERESET SEMUA JADWAL KE DEFAULT?"}
                    onCancel={handleCancelReset}
                    onConfirm={handleConfirmReset}
                    cancelText="BATAL" 
                    confirmText="RESET" 
                />
            )}

            {/* MODAL INFO (Sekarang menggunakan infoModalDescription) */}
            {isInfoModalOpen && (
                <ModalInfo
                    title={"BERHASIL MELAKUKAN PERUBAHAN"}
                    // Menggunakan state yang sudah diatur di handler Simpan atau Reset
                    description={infoModalDescription} 
                    onClose={handleCloseInfoModal}
                    okText="Oke"
                />
            )}
        </Layout>
    );
}