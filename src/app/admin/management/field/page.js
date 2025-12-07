'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CardFieldManagement from '@/components/CardFieldManagement';
import ModalConfirm from '@/components/ModalConfirm'; 
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; // Import Service

// Data Jenis Lapangan untuk Dropdown
const FIELD_TYPES = ['Futsal', 'Badminton', 'Basket', 'Voli', 'Lainnya'];

export default function FieldManagementPage() {
    const router = useRouter();
    
    // State Data Real
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    
    // State Modal Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState({ id: null, fieldName: '', rawPrice: '', type: FIELD_TYPES[0] });

    // State Modal Hapus
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fieldToDeleteId, setFieldToDeleteId] = useState(null);

    // State Modal Tambah
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newFieldData, setNewFieldData] = useState({ 
        fieldName: '', 
        rawPrice: '', 
        type: FIELD_TYPES[0] 
    });

    // --- 1. LOAD DATA DARI API ---
    const loadCourts = async () => {
        setIsLoading(true);
        try {
            // Ambil session admin
            const sessionUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!sessionUser || sessionUser.role !== 'admin') {
                router.push('/admin/login');
                return;
            }
            setCurrentAdmin(sessionUser);

            // Ambil data dari data/admins.json untuk memastikan fieldId terbaru
            // (karena localStorage mungkin outdated)
            const adminData = db.data.admins.find(a => a.id === sessionUser.id) || sessionUser;

            // Fetch Data dari API via Service
            // Kita pass fieldId admin agar hanya mengambil lapangan milik dia
            const data = await db.fetchCourtsAPI(adminData.fieldId);

            // Mapping format DB (name, pricePerHour) ke format UI (fieldName, rawPrice, price)
            const mappedData = data.map(item => ({
                id: item.id,
                fieldName: item.name,
                rawPrice: item.pricePerHour,
                price: `Rp${item.pricePerHour.toLocaleString('id-ID')},00/jam`,
                type: item.type || 'Lainnya' // Default jika json lama tidak ada type
            }));

            setFields(mappedData);
        } catch (error) {
            console.error("Gagal memuat data:", error);
            alert("Gagal memuat data lapangan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCourts();
    }, []);


    // --- 2. LOGIKA TAMBAH DATA (CREATE) ---
    const handleAddField = () => setIsAddModalOpen(true);
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setNewFieldData({ fieldName: '', rawPrice: '', type: FIELD_TYPES[0] });
    };

    const handleNewFieldChange = (e) => {
        const { name, value } = e.target;
        setNewFieldData(prev => ({
            ...prev,
            [name]: name === 'rawPrice' ? (parseInt(value) || '') : value,
        }));
    };

    const handleSaveNewField = async () => {
        const { fieldName, rawPrice, type } = newFieldData;
        if (!fieldName || !rawPrice || !type) {
            alert('Semua kolom harus diisi.');
            return;
        }

        try {
            // Ambil fieldId admin (lokasi dia bekerja)
            const adminFieldId = currentAdmin?.fieldId; 
            
            if (!adminFieldId) {
                alert("Error: Akun Admin tidak memiliki lokasi (fieldId) yang valid.");
                return;
            }

            // Panggil API Tambah
            await db.addCourt(adminFieldId, fieldName, rawPrice, type);
            
            // Refresh Data
            await loadCourts();
            handleCloseAddModal();
        } catch (error) {
            console.error(error);
            alert("Gagal menambahkan lapangan.");
        }
    };


    // --- 3. LOGIKA EDIT DATA (UPDATE) ---
    const handleEdit = (id) => {
        const fieldToEdit = fields.find(f => f.id === id);
        if (fieldToEdit) {
            setEditingField({
                id: fieldToEdit.id,
                fieldName: fieldToEdit.fieldName,
                rawPrice: fieldToEdit.rawPrice,
                type: fieldToEdit.type
            });
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingField({ id: null, fieldName: '', rawPrice: '', type: FIELD_TYPES[0] });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingField(prev => ({
            ...prev,
            [name]: name === 'rawPrice' ? (parseInt(value) || '') : value,
        }));
    };

    const handleSaveEdit = async () => {
        if (!editingField.fieldName || !editingField.rawPrice) return;

        try {
            // Panggil API Edit
            await db.updateCourt(
                editingField.id, 
                editingField.fieldName, 
                editingField.rawPrice, 
                editingField.type
            );
            
            // Refresh Data
            await loadCourts();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert("Gagal mengupdate lapangan.");
        }
    };


    // --- 4. LOGIKA HAPUS DATA (DELETE) ---
    const handleDelete = (id) => {
        setFieldToDeleteId(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (fieldToDeleteId) {
            try {
                // Panggil API Hapus
                await db.deleteCourt(fieldToDeleteId);
                
                // Refresh Data
                await loadCourts();
            } catch (error) {
                console.error(error);
                alert("Gagal menghapus lapangan.");
            }
        }
        setIsConfirmModalOpen(false);
        setFieldToDeleteId(null);
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setFieldToDeleteId(null);
    };
    

    // --- RENDER UI ---
    return (
        <Layout 
            showHeader={true} 
            headerTitle="Manajemen Lapangan" 
            showSidebar={true}
            showBackButton={true}
            userRole="admin"
        >
            <div className="p-4 max-w-4xl mx-auto">
                
                {isLoading ? (
                    <div className="text-center mt-20">Memuat Data Lapangan...</div>
                ) : fields.length > 0 ? (
                    /* Daftar Card Lapangan */
                    <div className="space-y-4 mb-20"> 
                        {fields.map(field => (
                            <CardFieldManagement 
                                key={field.id} 
                                fieldName={field.fieldName}
                                price={field.price}
                                type={field.type} // Pastikan CardFieldManagement support props ini
                                onEdit={() => handleEdit(field.id)}
                                onDelete={() => handleDelete(field.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center mt-20 text-gray-500">
                        Belum ada lapangan yang terdaftar di lokasi Anda.
                    </div>
                )}
            </div>

            {/* Tombol Tambah Lapangan */}
            <button
                onClick={handleAddField}
                className="fixed bottom-6 right-6 flex items-center space-x-2 
                           bg-orange-600 text-white font-semibold py-3 px-6 rounded-md 
                           transition duration-200 shadow-xl hover:bg-orange-700 hover:shadow-2xl z-20"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Tambah Lapangan</span>
            </button>


            {/* ========================================= */}
            {/* MODAL POP-UP EDIT DATA LAPANGAN           */}
            {/* ========================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Edit Lapangan</h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Nama Lapangan</label>
                                <input
                                    type="text" name="fieldName" value={editingField.fieldName} onChange={handleInputChange}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Jenis Lapangan</label>
                                <select
                                    name="type" value={editingField.type} onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black"
                                >
                                    {FIELD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Harga Per Jam (Rp)</label>
                                <div className="mt-1 flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">Rp</span>
                                    <input
                                        type="text" name="rawPrice" value={editingField.rawPrice} onChange={handleInputChange}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-lg focus:ring-orange-500 focus:border-orange-500 text-black"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                            <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 shadow-md">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ========================================= */}
            {/* MODAL POP-UP TAMBAH DATA LAPANGAN         */}
            {/* ========================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Tambah Lapangan Baru</h3>
                            <button onClick={handleCloseAddModal} className="text-gray-500 hover:text-gray-800">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Nama Lapangan</label>
                                <input
                                    type="text" name="fieldName" value={newFieldData.fieldName} onChange={handleNewFieldChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black placeholder-gray-400"
                                    placeholder="Contoh: Lapangan Futsal 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Jenis Lapangan</label>
                                <select
                                    name="type" value={newFieldData.type} onChange={handleNewFieldChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black"
                                >
                                    {FIELD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Harga Per Jam (Rp)</label>
                                <div className="mt-1 flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">Rp</span>
                                    <input
                                        type="text" name="rawPrice" value={newFieldData.rawPrice} onChange={handleNewFieldChange}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-black"
                                        placeholder="Contoh: 65000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button onClick={handleCloseAddModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                            <button onClick={handleSaveNewField} className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 shadow-md">Tambah</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* MODAL KONFIRMASI HAPUS                    */}
            {/* ========================================= */}
            {isConfirmModalOpen && (
                <ModalConfirm
                    title={"APAKAH ANDA YAKIN INGIN MENGHAPUS LAPANGAN INI?"}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    cancelText="Batal" 
                    confirmText="Hapus" 
                />
            )}
        </Layout>
    );
}