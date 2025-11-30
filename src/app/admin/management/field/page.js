// src/app/admin/management/field/page.js
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import CardFieldManagement from '@/components/CardFieldManagement';
import ModalConfirm from '@/components/ModalConfirm'; 
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

// --- Data Dummy Lapangan ---
const DUMMY_FIELDS = [
    { 
        id: 'F001', 
        fieldName: 'Lapangan Futsal 1', 
        price: 'Rp60.000,00/jam', 
        rawPrice: 60000,
        type: 'Futsal' 
    },
    { 
        id: 'F002', 
        fieldName: 'Lapangan Futsal 2', 
        price: 'Rp60.000,00/jam', 
        rawPrice: 60000, 
        type: 'Futsal' 
    },
    { 
        id: 'B001', 
        fieldName: 'Lapangan Badminton 1', 
        price: 'Rp45.000,00/jam', 
        rawPrice: 45000, 
        type: 'Badminton' 
    },
    { 
        id: 'B002', 
        fieldName: 'Lapangan Badminton 2', 
        price: 'Rp45.000,00/jam', 
        rawPrice: 45000, 
        type: 'Badminton' 
    },
];

// Data Jenis Lapangan untuk Dropdown
const FIELD_TYPES = ['Futsal', 'Badminton', 'Basket', 'Voli', 'Lainnya'];

export default function FieldManagementPage() {
    const router = useRouter();
    const [fields, setFields] = useState(DUMMY_FIELDS);
    
    // State untuk Modal Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState({ id: null, fieldName: '', rawPrice: '' });

    // State untuk Modal Hapus (Konfirmasi)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fieldToDeleteId, setFieldToDeleteId] = useState(null);

    // STATE BARU untuk Modal Tambah
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newFieldData, setNewFieldData] = useState({ 
        fieldName: '', 
        rawPrice: '', 
        type: FIELD_TYPES[0] // Default ke jenis pertama
    });

    // --- LOGIKA MODAL EDIT (Tidak Berubah) ---
    const handleEdit = (id) => {
        const fieldToEdit = fields.find(f => f.id === id);
        if (fieldToEdit) {
            setEditingField(fieldToEdit);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingField({ id: null, fieldName: '', rawPrice: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingField(prev => ({
            ...prev,
            [name]: name === 'rawPrice' ? (parseInt(value) || '') : value,
        }));
    };

    const handleSaveEdit = () => {
        if (!editingField.fieldName || !editingField.rawPrice) {
            return; 
        }

        const updatedFields = fields.map(field => {
            if (field.id === editingField.id) {
                const formattedPrice = `Rp${editingField.rawPrice.toLocaleString('id-ID')},00/jam`;
                return { 
                    ...field, 
                    fieldName: editingField.fieldName, 
                    rawPrice: editingField.rawPrice,
                    price: formattedPrice
                };
            }
            return field;
        });

        setFields(updatedFields);
        handleCloseModal();
    };

    // --- LOGIKA MODAL HAPUS (Tidak Berubah) ---
    const handleDelete = (id) => {
        setFieldToDeleteId(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (fieldToDeleteId) {
            const remainingFields = fields.filter(f => f.id !== fieldToDeleteId);
            setFields(remainingFields);
        }
        setIsConfirmModalOpen(false);
        setFieldToDeleteId(null);
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setFieldToDeleteId(null);
    };
    
    // --- LOGIKA MODAL TAMBAH (BARU) ---
    const handleAddField = () => {
        setIsAddModalOpen(true); // Membuka modal tambah
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        // Reset form data saat modal ditutup
        setNewFieldData({ fieldName: '', rawPrice: '', type: FIELD_TYPES[0] });
    };

    const handleNewFieldChange = (e) => {
        const { name, value } = e.target;
        setNewFieldData(prev => ({
            ...prev,
            [name]: name === 'rawPrice' ? (parseInt(value) || '') : value,
        }));
    };

    const handleSaveNewField = () => {
        const { fieldName, rawPrice, type } = newFieldData;

        if (!fieldName || !rawPrice || !type) {
            alert('Semua kolom harus diisi.');
            return;
        }

        // Simulasikan pembuatan ID baru
        const newId = `G${Date.now().toString().slice(-4)}`;
        const formattedPrice = `Rp${rawPrice.toLocaleString('id-ID')},00/jam`;

        const newField = {
            id: newId,
            fieldName,
            rawPrice,
            type,
            price: formattedPrice,
        };

        setFields(prev => [...prev, newField]);
        // alert(`Lapangan baru "${fieldName}" berhasil ditambahkan.`); // Anda bisa ganti dengan notifikasi non-alert
        handleCloseAddModal();
    };
    // ------------------------------------

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Manajemen Lapangan" 
            showSidebar={true}
            showBackButton={true}
            userRole="admin"
        >
            <div className="p-4 max-w-4xl mx-auto">
                
                {/* Daftar Card Lapangan */}
                <div className="space-y-4 mb-20"> 
                    {fields.map(field => (
                        <CardFieldManagement 
                            key={field.id} 
                            fieldName={field.fieldName}
                            price={field.price}
                            onEdit={() => handleEdit(field.id)}
                            onDelete={() => handleDelete(field.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Tombol Tambah Lapangan (FIXED) */}
            <button
                onClick={handleAddField} // Memanggil fungsi untuk membuka modal tambah
                className="fixed bottom-6 right-6 flex items-center space-x-2 
                           bg-orange-600 text-white font-semibold py-3 px-6 rounded-md 
                           transition duration-200 shadow-xl hover:bg-orange-700 hover:shadow-2xl z-20"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Tambah Lapangan</span>
            </button>


            {/* ========================================= */}
            {/* MODAL POP-UP EDIT DATA LAPANGAN           */}
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
                                <label htmlFor="fieldName" className="block text-sm font-medium text-black mb-1">Nama Lapangan</label>
                                <input
                                    type="text" id="fieldName" name="fieldName" value={editingField.fieldName} onChange={handleInputChange}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black placeholder-gray-400"
                                    placeholder="Masukkan nama lapangan"
                                />
                            </div>
                            <div>
                                <label htmlFor="rawPrice" className="block text-sm font-medium text-black mb-1">Harga Per Jam (Rp)</label>
                                <div className="mt-1 flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">Rp</span>
                                    <input
                                        type="text" id="rawPrice" name="rawPrice" value={editingField.rawPrice} onChange={handleInputChange}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-lg focus:ring-orange-500 focus:border-orange-500 text-black placeholder-gray-400"
                                        placeholder="Contoh: 60000"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150">Batal</button>
                            <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-150 shadow-md">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ========================================= */}
            {/* MODAL POP-UP TAMBAH DATA LAPANGAN (BARU)           */}
            {/* ========================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative">
                        {/* Header Modal Tambah */}
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Tambah Lapangan Baru</h3>
                            <button onClick={handleCloseAddModal} className="text-gray-500 hover:text-gray-800">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form Input */}
                        <div className="space-y-4">
                            {/* Input Nama Lapangan */}
                            <div>
                                <label htmlFor="newFieldName" className="block text-sm font-medium text-black mb-1">Nama Lapangan</label>
                                <input
                                    type="text" id="newFieldName" name="fieldName" value={newFieldData.fieldName} onChange={handleNewFieldChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black placeholder-gray-400"
                                    placeholder="Contoh: Lapangan Futsal 1"
                                />
                            </div>

                            {/* Dropdown Jenis Lapangan */}
                            <div>
                                <label htmlFor="newFieldType" className="block text-sm font-medium text-black mb-1">Jenis Lapangan</label>
                                <select
                                    id="newFieldType" name="type" value={newFieldData.type} onChange={handleNewFieldChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black"
                                >
                                    {FIELD_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Input Harga */}
                            <div>
                                <label htmlFor="newRawPrice" className="block text-sm font-medium text-black mb-1">Harga Per Jam (Rp)</label>
                                <div className="mt-1 flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">Rp</span>
                                    <input
                                        type="text" id="newRawPrice" name="rawPrice" value={newFieldData.rawPrice} onChange={handleNewFieldChange}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-black placeholder-gray-400"
                                        placeholder="Contoh: 65000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button onClick={handleCloseAddModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150">Batal</button>
                            <button onClick={handleSaveNewField} className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-150 shadow-md">Tambah</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* MODAL KONFIRMASI HAPUS (ModalConfirm)           */}
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