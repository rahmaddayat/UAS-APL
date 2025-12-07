'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout'; 
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; // Import Database Service

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
                    value={value || ''} // Handle jika value undefined/null
                    disabled={true} 
                    className="w-full p-2 pr-10 border border-gray-400 rounded-md text-black bg-gray-200 cursor-not-allowed"
                />
                
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? 
                        <EyeIcon className="h-5 w-5" />
                        : 
                        <EyeSlashIcon className="h-5 w-5" /> 
                        }
                    </button>
                )}
            </div>
        </div>
    );
};

export default function UserProfilePage() {
    const router = useRouter();
    
    // State untuk menyimpan data profil
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. LOAD DATA USER DARI STORAGE & DB ---
    useEffect(() => {
        // Cek apakah user sedang login
        const sessionUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!sessionUser) {
            // Jika tidak ada session, lempar ke login
            router.push('/login');
            return;
        }

        // Ambil data lengkap dari 'DatabaseService' (Single Source of Truth)
        // Kita cari user berdasarkan ID dari session
        const fullUserData = db.data.users.find(u => u.id === sessionUser.id);

        if (fullUserData) {
            setProfile(fullUserData);
        } else {
            // Fallback jika data tidak ditemukan di DB (tapi ada di session)
            setProfile(sessionUser);
        }
        
        setIsLoading(false);
    }, [router]);

    // --- 2. HANDLE LOGOUT ---
    const handleLogout = () => {
        // Hapus session dari LocalStorage
        localStorage.removeItem('currentUser');
        
        // Opsional: Hapus role jika Anda menyimpannya terpisah
        // localStorage.removeItem('userRole');

        // Redirect ke halaman login
        router.push('/login');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Profil...</div>;
    }

    if (!profile) {
        return null; // Akan redirect di useEffect
    }

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Profil Saya" 
            showSidebar={true}
            showBackButton={true} 
            userRole="user"
            // Pastikan backUrl mengarah ke Home atau Dashboard
            backUrl="/home"
        >
            <div className="p-4 max-w-lg mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 mt-8">
                    
                    {/* Icon User Besar */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="p-4 bg-gray-50 rounded-full shadow-inner mb-2">
                            <UserCircleIcon className="h-24 w-24 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{profile.username}</h2>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-1">User Account</span>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5">
                        <ProfileField label="User ID" value={profile.id} />
                        <ProfileField label="Username" value={profile.username} />
                        <ProfileField label="Email" type="email" value={profile.email} />
                        
                        {/* Note: Password asli biasanya di-hash, tapi karena sistem kita simpel, kita tampilkan */}
                        <ProfileField label="Password" type="password" value={profile.password} />
                    </div>
                    
                    {/* Tombol Logout */}
                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 active:bg-red-800 transition duration-200 shadow-md hover:shadow-lg font-mono tracking-wide"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}