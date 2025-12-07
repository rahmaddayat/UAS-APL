'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import ModalConfirm from '@/components/ModalConfirm'; 
import ModalInfo from '@/components/ModalInfo'; 
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; 
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; 

// Generator Template 24 Jam Kosong
const generateInitialHours = () => Array.from({ length: 24 }, (_, i) => {
    const start = i.toString().padStart(2, '0');
    const endHour = (i + 1) % 24;
    const end = endHour.toString().padStart(2, '0');
    return {
        id: i,
        time: `${start}.00 - ${end}.00 WIB`,
        status: 'default', // default (hitam/tutup sementara sebelum load)
    };
});

export default function DailyOpenPage() {
    const router = useRouter();
    
    // State Data
    const [dailyHours, setDailyHours] = useState(generateInitialHours());
    const [selectedHours, setSelectedHours] = useState([]);
    const [fieldData, setFieldData] = useState(null); // Menyimpan data asli dari DB
    const [isLoading, setIsLoading] = useState(true);

    // State Modals
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false); 
    const [infoModalDescription, setInfoModalDescription] = useState(""); 

    // --- 1. LOAD DATA DARI API ---
    const loadSchedule = async () => {
        setIsLoading(true);
        try {
            // Cek Admin Login
            const sessionUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!sessionUser || sessionUser.role !== 'admin') {
                router.push('/admin/login');
                return;
            }

            // Ambil data admin terbaru (untuk dapat fieldId)
            // Note: Di real case sebaiknya pakai API auth/me, tapi ini simulasi:
            const admin = db.data.admins.find(a => a.id === sessionUser.id) || sessionUser;
            
            if (!admin.fieldId) {
                alert("Akun ini tidak terhubung dengan lokasi lapangan manapun.");
                return;
            }

            // Ambil Data Field
            const data = await db.getFieldData(admin.fieldId);
            setFieldData(data); // Simpan data mentah untuk referensi/reset

            // KONVERSI DATA JSON -> VISUAL STATE (24 Jam)
            if (data) {
                const mappedHours = generateInitialHours().map(h => {
                    const hour = h.id;
                    let status = 'open'; // Default anggap buka dulu

                    // Logika Tutup:
                    // 1. Sebelum jam buka
                    // 2. Setelah jam tutup
                    // 3. Ada di jam istirahat
                    if (hour < data.openHour || hour >= data.closeHour || data.breakHours.includes(hour)) {
                        status = 'close';
                    }

                    return { ...h, status };
                });
                setDailyHours(mappedHours);
            }

        } catch (error) {
            console.error("Gagal memuat jadwal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSchedule();
    }, []);


    // --- 2. INTERAKSI UI (SELECT/OPEN/CLOSE) ---

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
                selectedHours.includes(hour.id) ? { ...hour, status: 'close' } : hour
            )
        );
        setSelectedHours([]);
    };

    const handleOpenHours = () => {
        setDailyHours(prevHours => 
            prevHours.map(hour => 
                selectedHours.includes(hour.id) ? { ...hour, status: 'open' } : hour
            )
        );
        setSelectedHours([]);
    };


    // --- 3. LOGIKA SIMPAN KE DATABASE (CALCULATE JSON) ---
    const handleKonfirmasiClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        setIsConfirmModalOpen(false);

        if (!fieldData) return;

        // ALGORITMA KONVERSI VISUAL -> JSON
        // 1. Cari jam buka paling awal
        const openTimes = dailyHours.filter(h => h.status === 'open').map(h => h.id);
        
        if (openTimes.length === 0) {
            // Kasus tutup total seharian
            try {
                await db.updateFieldSchedule(fieldData.id, 0, 0, []);
                setInfoModalDescription("Lokasi diatur TUTUP TOTAL untuk hari ini.");
                setIsInfoModalOpen(true);
                await loadSchedule(); // Refresh
            } catch (e) { alert("Gagal menyimpan"); }
            return;
        }

        const newOpenHour = Math.min(...openTimes);
        const maxOpenHour = Math.max(...openTimes);
        const newCloseHour = maxOpenHour + 1; // Close hour adalah batas akhir (eksklusif)

        // 2. Cari break hours (jam 'close' yang berada DI ANTARA jam buka dan tutup)
        const newBreakHours = dailyHours
            .filter(h => h.id > newOpenHour && h.id < newCloseHour && h.status === 'close')
            .map(h => h.id);

        console.log("Saving Data:", { newOpenHour, newCloseHour, newBreakHours });

        try {
            await db.updateFieldSchedule(fieldData.id, newOpenHour, newCloseHour, newBreakHours);
            
            setInfoModalDescription("Jadwal operasional berhasil diperbarui ke database.");
            setIsInfoModalOpen(true);
            setSelectedHours([]);
            await loadSchedule(); // Refresh data dari server untuk memastikan sinkron
        } catch (error) {
            console.error(error);
            setInfoModalDescription("Gagal menyimpan perubahan.");
            setIsInfoModalOpen(true);
        }
    };


    // --- 4. LOGIKA RESET ---
    const handleResetClick = () => setIsResetConfirmOpen(true);

    const handleConfirmReset = () => {
        setIsResetConfirmOpen(false);
        // Reset cukup dengan memanggil ulang loadSchedule(), 
        // karena itu akan mengambil data terakhir yang tersimpan di DB
        loadSchedule();
        setInfoModalDescription("Tampilan direset ke jadwal tersimpan terakhir.");
        setIsInfoModalOpen(true);
        setSelectedHours([]);
    };


    // --- HELPER UI ---
    const getStatusColor = useCallback((status) => {
        if (status === 'close') return 'text-red-600'; 
        if (status === 'open') return 'text-blue-600'; 
        return 'text-gray-400'; 
    }, []);

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
                            transition duration-100 hover:bg-gray-200/70 select-none`}
            >
                {isSelected && (
                    <div className="absolute inset-0 bg-blue-200/50 border-2 border-blue-400"></div>
                )}
                <div className="flex justify-between items-center">
                    <span className={`relative z-10 font-mono text-sm font-bold ${colorClass}`}>
                        {hour.time}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${colorClass}`}>
                        {hour.status === 'open' ? 'BUKA' : 'TUTUP'}
                    </span>
                </div>
            </div>
        );
    };

    if (isLoading) return <Layout showHeader={true}><div className="text-center mt-20">Memuat Jadwal...</div></Layout>;

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Jadwal Harian" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin"
        >
            <div className="p-1 max-w-full pb-24">
                
                <div className="max-w-xl mx-auto bg-gray-100 p-6 rounded-xl shadow-xl border border-gray-300"> 
                    
                    {/* Header Info Lokasi */}
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="w-6 h-6 text-gray-700" />
                            <h3 className="text-xl font-bold text-gray-800">Atur Jam Operasional</h3>
                        </div>
                        {fieldData && (
                            <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                {fieldData.name}
                            </span>
                        )}
                    </div>

                    {/* Grid Jadwal */}
                    <div className="border-t border-l border-gray-300 bg-white shadow-inner"> 
                        {rows.map((row, index) => (
                            <div key={index} className="grid grid-cols-2">
                                {renderHourCell(row[0])}
                                {renderHourCell(row[1])}
                            </div>
                        ))}
                    </div>
                    
                    {/* Controls */}
                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={handleResetClick}
                            className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-orange-500 rounded-md hover:bg-orange-600 transition duration-150 shadow-md"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            <span>Reset</span>
                        </button>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleCloseHours}
                                disabled={selectedHours.length === 0}
                                className={`px-3 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                    ${selectedHours.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Set TUTUP
                            </button>

                            <button
                                onClick={handleOpenHours}
                                disabled={selectedHours.length === 0}
                                className={`px-3 py-2 text-sm font-semibold text-white rounded-md transition duration-150 shadow-md
                                    ${selectedHours.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Set BUKA
                            </button>
                            
                            <button
                                onClick={handleKonfirmasiClick}
                                className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-150 shadow-md ml-2"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title="SIMPAN PERUBAHAN JADWAL?"
                    onCancel={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmSave}
                    cancelText="BATAL" 
                    confirmText="SIMPAN" 
                />
            )}
            
            {isResetConfirmOpen && (
                <ModalConfirm
                    title="RESET KE JADWAL TERAKHIR?"
                    onCancel={() => setIsResetConfirmOpen(false)}
                    onConfirm={handleConfirmReset}
                    cancelText="BATAL" 
                    confirmText="RESET" 
                />
            )}

            {isInfoModalOpen && (
                <ModalInfo
                    title="INFORMASI"
                    description={infoModalDescription} 
                    onClose={() => {
                        setIsInfoModalOpen(false);
                        setInfoModalDescription("");
                    }}
                    okText="Oke"
                />
            )}
        </Layout>
    );
}