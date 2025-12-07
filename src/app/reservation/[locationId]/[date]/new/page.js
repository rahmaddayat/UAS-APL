    'use client';
    import { useState, useEffect, useMemo } from 'react';
    import Layout from '@/components/Layout';
    import { useParams, useRouter } from 'next/navigation';
    import db from '@/services/DatabaseService'; // Pastikan Service sudah diupdate
    import dayjs from 'dayjs';
    import ModalConfirm from '@/components/ModalConfirm';
    import ModalInfo from '@/components/ModalInfo';

    export default function NewReservationPage() {
        const params = useParams();
        const router = useRouter();
        
        const [locationData, setLocationData] = useState(null);
        const [courts, setCourts] = useState([]);
        
        // State Reservasi sekarang diisi dari API
        const [existingReservations, setExistingReservations] = useState([]); 
        const [isLoading, setIsLoading] = useState(true); // Indikator Loading

        const [currentUser, setCurrentUser] = useState(null);
        const [selectedCourtId, setSelectedCourtId] = useState("");
        const [selectedSlots, setSelectedSlots] = useState([]);
        const [generatedSlots, setGeneratedSlots] = useState([]);

        const [showConfirm, setShowConfirm] = useState(false);
        const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', type: '' });

        // Helpers
        const generateTimeSlots = (startHour, endHour) => {
            let slots = [];
            for (let i = startHour; i < endHour; i++) {
                const start = String(i).padStart(2, '0');
                const end = String(i + 1).padStart(2, '0');
                slots.push(`${start}.00 - ${end}.00`);
            }
            return slots;
        };

        const isBreakTime = (slotStr) => {
            if (!locationData?.breakHours) return false;
            const startHour = parseInt(slotStr.split('.')[0]); 
            return locationData.breakHours.includes(startHour);
        };

        // --- LOAD DATA (DENGAN API) ---
        useEffect(() => {
            const initData = async () => {
                setIsLoading(true);
                
                // 1. User Local
                const user = JSON.parse(localStorage.getItem('currentUser'));
                setCurrentUser(user);

                // 2. Data Static (Lokasi & Lapangan) - Masih dari Memory (Aman utk static data)
                const loc = db.getFieldById(params.locationId);
                if (loc) {
                    setLocationData(loc);
                    setGeneratedSlots(generateTimeSlots(loc.openHour, loc.closeHour));
                }
                const courtsData = db.getCourtsByLocation(params.locationId);
                setCourts(courtsData);
                if (courtsData.length > 0) setSelectedCourtId(courtsData[0].id);

                // 3. Data Dinamis (Reservasi) - AMBIL DARI API SERVER!
                // Ini memastikan kita melihat data real-time dari file JSON
                const apiReservations = await db.fetchReservationsAPI(params.date);
                setExistingReservations(apiReservations);
                
                setIsLoading(false);
            };

            initData();
        }, [params.locationId, params.date]);

        // Logic Status Slot (My Pending = Kuning, Booked = Merah)
        const getSlotStatus = (slot) => {
            if (isBreakTime(slot)) return 'break';
            if (selectedSlots.includes(slot)) return 'selected';

            const reservation = existingReservations.find(r => 
                r.courtId === selectedCourtId && r.timeSlots.includes(slot)
            );

            if (!reservation) return 'available';

            const isMine = currentUser && reservation.userId === currentUser.id;

            if (isMine) {
                if (reservation.status === 'pending') return 'my_pending'; // Kuning
                return 'booked'; // Merah
            } else {
                if (reservation.status === 'pending') return 'available'; // Putih
                return 'booked'; // Merah
            }
        };

        const currentCourt = courts.find(c => c.id === selectedCourtId);
        const totalPrice = (currentCourt?.pricePerHour || 0) * selectedSlots.length;

        const handleSlotClick = (slot) => {
            const status = getSlotStatus(slot);
            if (status !== 'available' && status !== 'selected') return;

            if (selectedSlots.includes(slot)) {
                setSelectedSlots(prev => prev.filter(s => s !== slot));
            } else {
                setSelectedSlots(prev => [...prev, slot].sort());
            }
        };

        const handlePreSubmit = () => {
            if (selectedSlots.length === 0) {
                setModalInfo({ show: true, title: "VALIDASI", message: "Pilih minimal 1 slot waktu!", type: "error" });
                return;
            }
            if (!currentUser) {
                setModalInfo({ show: true, title: "AKSES DITOLAK", message: "Anda harus login terlebih dahulu.", type: "error" });
                return;
            }
            setShowConfirm(true);
        };

        const handleConfirmSubmit = async () => {
            setShowConfirm(false);
            try {
                // Write ke API
                await db.createReservation(
                    currentUser.id,
                    selectedCourtId,
                    params.date,
                    selectedSlots,
                    totalPrice
                );
                
                // Refresh Data API agar tampilan langsung update tanpa reload page
                const updatedData = await db.fetchReservationsAPI(params.date);
                setExistingReservations(updatedData);
                setSelectedSlots([]); // Reset pilihan

                setModalInfo({
                    show: true,
                    title: "BERHASIL",
                    message: "Reservasi Berhasil Diajukan! Status: Menunggu Konfirmasi Admin.",
                    type: "success"
                });
            } catch (error) {
                setModalInfo({ show: true, title: "GAGAL", message: error.message, type: "error" });
            }
        };

        const handleCloseModalInfo = () => {
            setModalInfo({ ...modalInfo, show: false });
            if (modalInfo.type === 'success') {
                // Opsional: Redirect atau tetap di halaman
                // router.push(...) 
            }
        };

        // Styling Class
        const getSlotClass = (status) => {
            switch (status) {
                case 'break': return 'bg-gray-200 text-gray-400 cursor-not-allowed italic border-gray-300';
                case 'booked': return 'bg-red-500 text-white cursor-not-allowed opacity-80 border-red-600';
                case 'my_pending': return 'bg-yellow-100 text-yellow-700 cursor-not-allowed border-yellow-400 font-bold';
                case 'selected': return 'bg-blue-100 text-blue-700 border-blue-500 font-bold shadow-md';
                default: return 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer border-gray-200';
            }
        };

        const getStatusLabel = (status) => {
            if (status === 'booked') return <span className="text-xs bg-white text-red-500 px-2 rounded font-bold">Booked</span>;
            if (status === 'my_pending') return <span className="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded font-bold uppercase">Menunggu</span>;
            if (status === 'break') return <span className="text-xs bg-gray-400 text-white px-2 rounded font-bold">Istirahat</span>;
            if (status === 'selected') return <span className="text-xs bg-blue-500 text-white px-2 rounded">Dipilih</span>;
            return null;
        };

        return (
            <Layout showHeader={true} headerTitle={locationData?.name} showBackButton={true} backUrl={`/reservation/${params.locationId}/${params.date}`} showSidebar={true}>
                
                {showConfirm && (
                    <ModalConfirm 
                        title={`Konfirmasi Reservasi:\n${selectedSlots.length} slot di ${currentCourt?.name}?`}
                        onConfirm={handleConfirmSubmit}
                        onCancel={() => setShowConfirm(false)}
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

                <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        Buat Reservasi: {dayjs(params.date).format('DD MMM YYYY')}
                    </h2>

                    {/* Dropdown Lapangan */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Lapangan</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded-md outline-none text-black font-medium"
                            value={selectedCourtId}
                            onChange={(e) => { setSelectedCourtId(e.target.value); setSelectedSlots([]); }}
                        >
                            {courts.map(c => (
                                <option key={c.id} value={c.id} className="text-black">
                                    {c.name} - Rp {c.pricePerHour.toLocaleString()}/jam
                                </option>
                            ))}
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">Memuat Jadwal dari Server...</div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Jadwal Grid */}
                            <div className="border border-gray-300 p-4 rounded-md h-[400px] overflow-y-auto bg-gray-50">
                                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                                    <span>Jam Operasional: {locationData?.openHour}.00 - {locationData?.closeHour}.00</span>
                                </div>
                                <div className="space-y-2">
                                    {generatedSlots.map(slot => {
                                        const status = getSlotStatus(slot);
                                        return (
                                            <div 
                                                key={slot} 
                                                onClick={() => handleSlotClick(slot)} 
                                                className={`p-3 border rounded-md text-center flex justify-between items-center px-4 transition-all ${getSlotClass(status)}`}
                                            >
                                                <span className="font-medium">{slot}</span>
                                                {getStatusLabel(status)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Ringkasan Panel */}
                            <div className="flex flex-col border border-gray-200 p-5 rounded-md bg-white shadow-sm h-full">
                                <h3 className="font-bold mb-4 border-b pb-2">Ringkasan</h3>
                                <div className="flex-1 overflow-y-auto max-h-[200px]">
                                    {selectedSlots.length > 0 ? selectedSlots.map(s => <p key={s} className="text-blue-600 font-medium">• {s}</p>) : <p className="text-gray-400 italic">Belum ada slot dipilih.</p>}
                                </div>
                                <div className="border-t pt-4 mt-auto">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-800 font-bold">Total:</span>
                                        <span className="text-2xl font-extrabold text-[#E86500]">Rp {totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={handlePreSubmit} disabled={selectedSlots.length === 0} className={`w-full mt-4 py-3 rounded font-bold text-white transition ${selectedSlots.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E86500] hover:bg-[#C95500]'}`}>
                                    AJUKAN RESERVASI
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }