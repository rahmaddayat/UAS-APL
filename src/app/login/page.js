'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService';
import ModalInfo from '@/components/ModalInfo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', message: '', type: '' });

    const router = useRouter();

    const handleSubmit = async (e) => { // <--- ASYNC
        e.preventDefault();
        
        try {
            // Panggil API (AWAIT)
            const loggedInUser = await db.login(email, password, role);

            // Simpan sesi
            localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

            setModal({
                show: true,
                title: 'LOGIN BERHASIL',
                message: `Selamat datang kembali, ${loggedInUser.username}!`,
                type: 'success'
            });

        } catch (error) {
            // Tangkap Error Spesifik dari API
            let errorMessage = "Terjadi kesalahan.";

            if (error.message === "EMAIL_NOT_FOUND") {
                errorMessage = "Email tidak ditemukan. Silakan daftar terlebih dahulu.";
            } else if (error.message === "WRONG_PASSWORD") {
                errorMessage = "Password yang Anda masukkan salah.";
            } else {
                errorMessage = error.message;
            }

            setModal({
                show: true,
                title: 'LOGIN GAGAL',
                message: errorMessage,
                type: 'error'
            });
        }
    };

    const handleCloseModal = () => {
        const isSuccess = modal.type === 'success';
        setModal({ ...modal, show: false });

        if (isSuccess) {
            if (role === 'admin') {
                router.push('/admin/management');
            } else {
                router.push('/home'); 
            }
        }
    };

    const cardBgColor = { backgroundColor: '#E86500' };
    const loginBtnColor = { backgroundColor: '#000000' };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            
            {modal.show && (
                <ModalInfo 
                    title={modal.title}
                    description={modal.message}
                    onClose={handleCloseModal}
                />
            )}

            <div className="w-full max-w-xs md:max-w-sm">
                <div className="p-6 rounded-2xl shadow-xl" style={cardBgColor}>
                    <h1 className="text-3xl font-bold text-white text-center mb-6">SportField</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-white rounded-md bg-white text-black focus:ring-0 focus:border-gray-300"
                                required
                            />
                        </div>
                        
                        <div className="relative">
                            <label className="block text-white text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 pr-10 border border-white rounded-md bg-white text-black focus:ring-0 focus:border-gray-300"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition-colors"
                                >
                                    {showPassword ? (
                                        // Icon Mata Dicoret (Klik untuk Sembunyikan)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        // Icon Mata Biasa (Klik untuk Tampilkan)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-start space-x-4 text-white pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="mr-2 accent-black" /> Admin
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} className="mr-2 accent-black" /> User
                            </label>
                        </div>
                        
                        <button type="submit" style={loginBtnColor} className="w-full text-white font-bold py-2 rounded-md transition duration-200 mt-4 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                            Login
                        </button>
                    </form>

                    <p className="text-center text-xs mt-3 text-white/80">
                        Belum punya akun? <span onClick={() => router.push('/register')} className="font-bold cursor-pointer underline transition duration-200 hover:text-blue-300">Daftar sekarang</span>
                    </p>
                </div>
            </div>
        </div>
    );
}