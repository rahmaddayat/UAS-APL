'use client'; 

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout'; 
import { UserCircleIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; 

// --- KOMPONEN INPUT READ-ONLY ---
const ProfileField = ({ label, value, type = 'text', icon = null }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = (type === 'password' && showPassword) ? 'text' : type;

    return (
        <div className="flex flex-col font-mono">
            <label className="text-gray-700 font-bold mb-1 text-sm flex items-center gap-1">
                {icon} {label}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value || ''} 
                    disabled={true} 
                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg text-gray-800 bg-gray-100 cursor-not-allowed focus:outline-none"
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function AdminProfilePage() { 
    const router = useRouter();
    
    const [profile, setProfile] = useState(null);
    const [managedFieldName, setManagedFieldName] = useState('Memuat...'); 
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. LOAD DATA ---
    useEffect(() => {
        const sessionUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!sessionUser) {
            router.push('/admin/login');
            return;
        }

        if (sessionUser.role !== 'admin') {
            alert("Akses Ditolak.");
            router.push('/login');
            return;
        }

        // Ambil data terbaru dari DB
        const fullAdminData = db.data.admins.find(a => a.id === sessionUser.id);
        const adminData = fullAdminData || sessionUser;

        setProfile(adminData);

        // --- LOGIKA MENCARI NAMA LOKASI ---
        if (adminData.fieldId) {
            // Cari nama lapangan berdasarkan ID
            const field = db.getFieldById(adminData.fieldId);
            setManagedFieldName(field ? field.name : `Unknown Field (${adminData.fieldId})`);
        } else {
            setManagedFieldName('Global / Super Admin');
        }
        
        setIsLoading(false);
    }, [router]);

    // --- 2. LOGOUT ---
    const handleLogout = () => {
        // Hapus sesi
        localStorage.removeItem('currentUser');
        
        // PERUBAHAN DISINI: Redirect ke /login (bukan /admin/login)
        router.push('/login'); 
    };

    if (isLoading) return <div className="text-center mt-20">Loading...</div>;
    if (!profile) return null;

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Profil Administrator" 
            showSidebar={true}
            showBackButton={true} 
            userRole="admin" 
            sidebarItems={[
                { label: 'Managemen', href: '/admin/management' },
                { label: 'Reservasi', href: '/admin/reservation' },
                { label: 'Riwayat', href: '/admin/history' },
                { label: 'Laporan', href: '/admin/report' },
                { label: 'Profil', href: '/admin/profile' },
            ]}
        >
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 mt-4 relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-30 from-red-600 to-orange-500"></div>

                    {/* Header Profil */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative">
                            <div className="p-4 bg-orange-50 rounded-full shadow-sm border border-orange-100 mb-3">
                                <UserCircleIcon className="h-20 w-20 text-[#E86500]" />
                            </div>
                            <div className="absolute bottom-2 right-0 bg-red-600 text-white p-1 rounded-full shadow-md">
                                <ShieldCheckIcon className="h-5 w-5" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
                        
                        {/* BADGE LOKASI */}
                        <div className="flex items-center gap-1 mt-2 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="font-bold">Mengelola: {managedFieldName}</span>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <ProfileField label="Admin ID" value={profile.id} />
                        <ProfileField label="Username" value={profile.username} />
                        <ProfileField label="Email Resmi" type="email" value={profile.email} />
                        
                        {/* Field Khusus Area Kelolaan */}
                        <div className="pt-2 border-t border-gray-200">
                            <ProfileField 
                                label="Area / Cabang Kelolaan" 
                                value={`${managedFieldName} (ID: ${profile.fieldId || 'All'})`} 
                                icon={<MapPinIcon className="w-4 h-4 text-orange-600"/>}
                            />
                        </div>

                        <ProfileField label="Password Akses" type="password" value={profile.password} />
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition duration-200 shadow-lg font-mono"
                        >
                            KELUAR (LOGOUT)
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}