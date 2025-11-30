// src/app/profile/page.js (User Profile)
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout'; 
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// --- DUMMY DATA PROFIL USER ---
const DUMMY_USER_PROFILE = {
    userID: '20250101USER123',
    username: 'John',
    email: 'John@gmail.com',
    password: 'userpassword123', 
};

/**
 * Komponen Input Field Khusus untuk Profil (READ-ONLY)
 * Ini sama dengan yang digunakan Admin
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


export default function UserProfilePage() {
    const router = useRouter();
    const [profile] = useState(DUMMY_USER_PROFILE); // Menggunakan data User

    const handleLogout = () => {
        console.log('User Logout...');
        router.push('/login'); // Asumsi halaman login user ada di /login
    };

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Profil" 
            showSidebar={true}
            showBackButton={true} 
            userRole="user" // PENTING: Menggunakan role 'user'
            // Sidebar items berdasarkan image_bffcb5.png: Home, Reservasi, Transaksi, Riwayat, Profil
            sidebarItems={[
                { label: 'Home', href: '/home' },
                { label: 'Reservasi', href: '/reservation' },
                { label: 'Transaksi', href: '/transaction' },
                { label: 'Riwayat', href: '/history' },
                { label: 'Profil', href: '/profile' },
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