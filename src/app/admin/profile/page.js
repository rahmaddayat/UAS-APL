// src/app/admin/profile/page.js
'use client'; // Pastikan ini ada di baris pertama!

import { useState } from 'react';
import Layout from '@/components/Layout'; 
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// --- DUMMY DATA PROFIL ADMIN ---
const DUMMY_ADMIN_PROFILE = {
    userID: '14152135141412',
    username: 'Admin_SportField',
    email: 'admin@sportfield.com',
    password: 'mysecureadminpassword', 
};

/**
 * Komponen Input Field Khusus untuk Profil (READ-ONLY)
 */
const ProfileField = ({ label, value, type = 'text' }) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const inputType = (type === 'password' && showPassword) ? 'text' : type;

    return (
        <div className="flex flex-col font-mono">
            <label className="text-black font-bold mb-1">{label}</label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    disabled={true} 
                    className="w-full p-2 pr-10 border border-gray-400 rounded-md text-black bg-gray-200 cursor-not-allowed"
                />
                
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};


// PASTIKAN ADA 'export default' DI DEPAN FUNGSI INI
export default function ProfilePage() { 
    const router = useRouter();
    const [profile] = useState(DUMMY_ADMIN_PROFILE);

    const handleLogout = () => {
        console.log('Admin Logout...');
        router.push('/admin/login'); 
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Profil" 
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
            <div className="p-4 max-w-lg mx-auto">
                <div className="bg-gray-100 p-8 rounded-xl shadow-2xl border border-gray-300 mt-8">
                    
                    <div className="flex justify-center mb-6">
                        <UserCircleIcon className="h-24 w-24 text-gray-500" />
                    </div>

                    <div className="space-y-4">
                        
                        <ProfileField label="UserID" value={profile.userID} />
                        <ProfileField label="Username" value={profile.username} />
                        <ProfileField label="Email" type="email" value={profile.email} />
                        <ProfileField label="Password" type="password" value={profile.password} />
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-200 shadow-lg font-mono"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}