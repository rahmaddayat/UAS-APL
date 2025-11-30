'use client';
import Layout from '@/components/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

// --- Data Dummy ---
const MOCK_LOCATIONS = {
    'sport-center': 'Sport Center',
    'embassy-sport': 'Embassy Sport Hall',
};

// Data lapangan dummy dengan harga per jam yang berbeda
const MOCK_FIELDS = [
    { id: 'futsal1', name: 'Lapangan Futsal 1', price: 60000 },
    { id: 'futsal2', name: 'Lapangan Futsal 2', price: 75000 },
    { id: 'futsal3', name: 'Lapangan Futsal 3', price: 50000 },
];

// Daftar semua slot waktu 1 jam
const ALL_SLOTS = [
    '08.00 - 09.00 WIB', '09.00 - 10.00 WIB', '10.00 - 11.00 WIB', '11.00 - 12.00 WIB',
    '12.00 - 13.00 WIB', '13.00 - 14.00 WIB', '14.00 - 15.00 WIB', '15.00 - 16.00 WIB',
    '16.00 - 17.00 WIB', '17.00 - 18.00 WIB', '18.00 - 19.00 WIB', '19.00 - 20.00 WIB',
    '20.00 - 21.00 WIB', '21.00 - 22.00 WIB', '22.00 - 23.00 WIB', '23.00 - 00.00 WIB',
];

// Dummy slot yang sudah dipesan (berubah berdasarkan lapangan yang dipilih)
const BOOKED_SLOTS = {
    'futsal1': ['08.00 - 09.00 WIB', '10.00 - 11.00 WIB'], // Merah
    'futsal2': ['14.00 - 15.00 WIB', '15.00 - 16.00 WIB'],
    'futsal3': ['18.00 - 19.00 WIB'],
};

// Fungsi pembantu untuk memformat Rupiah
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
    }).format(amount);
};


export default function NewReservationPage() {
    const params = useParams();
    const router = useRouter();

    const locationId = params.locationId;
    const dateString = params.date; 

    const locationName = MOCK_LOCATIONS[locationId] || "Nama Tempat";
    const formattedDate = dayjs(dateString).format('DD-MM-YYYY');
    
    // --- State Management ---
    // Default Lapangan Futsal 1 yang dipilih
    const [selectedFieldId, setSelectedFieldId] = useState(MOCK_FIELDS[0].id); 
    
    // ⭐️ PERBAIKAN: Set default state menjadi array kosong
    const [selectedSlots, setSelectedSlots] = useState([]); 

    const selectedField = MOCK_FIELDS.find(f => f.id === selectedFieldId);
    
    // --- Calculation: Hitung Total Harga ---
    const totalPrice = useMemo(() => {
        // Total harga = Jumlah jam x Harga per jam lapangan yang dipilih
        if (selectedField) {
            return selectedSlots.length * selectedField.price;
        }
        return 0;
    }, [selectedSlots, selectedField]);
    
    const bookedSlotsForField = BOOKED_SLOTS[selectedFieldId] || [];

    // --- Handlers ---
    const handleFieldChange = (e) => {
        // Reset slot yang dipilih ketika user mengganti lapangan
        setSelectedFieldId(e.target.value);
        setSelectedSlots([]);
    };

    const handleSlotClick = (slot) => {
        // Jika slot sudah dipesan, batalkan aksi klik
        if (bookedSlotsForField.includes(slot)) {
            return;
        }

        setSelectedSlots(prev => {
            if (prev.includes(slot)) {
                // Hapus slot jika sudah dipilih (Deselect)
                return prev.filter(s => s !== slot);
            } else {
                // Tambahkan slot baru (Select) dan urutkan untuk tampilan konsisten
                return [...prev, slot].sort(); 
            }
        });
    };

    const handleReservationSubmit = () => {
        if (selectedSlots.length === 0) {
            alert("Harap pilih minimal satu jadwal untuk reservasi.");
            return;
        }
        
        // Simulasikan navigasi ke halaman pembayaran
        alert(`Reservasi diajukan untuk ${selectedField.name} pada ${formattedDate} selama ${selectedSlots.length} jam. Total: ${formatCurrency(totalPrice)}`);
        // router.push('/payment'); // Implementasi navigasi ke halaman pembayaran berikutnya
    };

    // --- Component Rendering Helper ---
    const getSlotClass = (slot) => {
        if (bookedSlotsForField.includes(slot)) {
            // Merah (Jadwal tidak tersedia)
            return 'text-red-600 font-bold cursor-not-allowed'; 
        } else if (selectedSlots.includes(slot)) {
            // Biru Muda Transparan (Jadwal terpilih)
            // Sesuai desain image_4673fa.png
            return 'bg-blue-100 text-gray-800 font-bold border border-blue-500 cursor-pointer'; 
        } else {
            // Tersedia
            return 'text-gray-800 hover:bg-gray-100 cursor-pointer'; 
        }
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle={locationName} 
            showBackButton={true}
            showSidebar={true}
        >
            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-300 max-w-4xl mx-auto">
                
                {/* Header: Tanggal & Dropdown Lapangan */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-xl font-bold text-gray-800">{formattedDate}</p>
                    
                    <select 
                        value={selectedFieldId}
                        onChange={handleFieldChange}
                        className="p-2 border border-gray-400 rounded-md bg-white text-gray-800 font-semibold shadow-sm"
                    >
                        {MOCK_FIELDS.map(field => (
                            <option key={field.id} value={field.id}>
                                {field.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Main Content: Jadwal & Ringkasan */}
                <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 border border-gray-300 rounded-lg">
                    
                    {/* Kolom Kiri: Daftar Jadwal */}
                    <div className="border border-gray-300 p-4 bg-white h-[400px] overflow-y-auto shadow-inner">
                        {ALL_SLOTS.map(slot => (
                            <div 
                                key={slot}
                                className={`text-lg py-2 px-3 mb-1 rounded-md transition duration-100 ${getSlotClass(slot)}`}
                                onClick={() => handleSlotClick(slot)}
                            >
                                {slot}
                            </div>
                        ))}
                    </div>

                    {/* Kolom Kanan: Jadwal Dipilih & Total Harga */}
                    <div className="flex flex-col space-y-6">
                        
                        {/* Box Jadwal Yang Dipilih */}
                        <div className="border border-gray-300 p-4 flex-1 bg-white shadow-sm">
                            <h4 className="text-lg font-bold mb-3">Jadwal Yang Dipilih :</h4>
                            <div className="space-y-1 h-48 overflow-y-auto">
                                {selectedSlots.length > 0 ? (
                                    selectedSlots.map(slot => (
                                        // Teks biru sesuai desain image_4673fa.png
                                        <p key={slot} className="text-lg text-blue-700 font-semibold">
                                            {slot}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic text-sm">Belum ada jadwal yang dipilih.</p>
                                )}
                            </div>
                        </div>

                        {/* Box Total Harga */}
                        <div className="p-4 bg-gray-100 border border-gray-400">
                            <h4 className="text-lg font-bold mb-3">Total Harga :</h4>
                            <div className="bg-white p-2 border border-gray-300 rounded-sm">
                                <p className="text-2xl font-extrabold text-gray-800">
                                    {formatCurrency(totalPrice)}
                                </p>
                            </div>
                        </div>

                        {/* Tombol Reservasi (Warna Oranye sesuai tema) */}
                        <button 
                            onClick={handleReservationSubmit}
                            className="w-full bg-[#E86500] hover:bg-[#C95500] text-white font-bold py-3 rounded-md text-lg shadow-lg transition duration-200 mt-auto"
                        >
                            RESERVASI
                        </button>
                    </div>
                </div>

            </div>
        </Layout>
    );
}