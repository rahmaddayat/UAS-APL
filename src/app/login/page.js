// src/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); 
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Mencoba Login:", { email, password, role });
        alert(`Login Berhasil sebagai ${role}. Mengarahkan ke Home.`);
        router.push('/home'); 
    };

    const cardBgColor = { backgroundColor: '#E86500' };
    const loginBtnColor = { backgroundColor: '#000000' };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-xs md:max-w-sm">
                
                {/* Login Card */}
                <div 
                    className="p-6 rounded-2xl shadow-xl" 
                    style={cardBgColor}
                >
                    <h1 className="text-3xl font-bold text-white text-center mb-6">SportField</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Input Email */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-1">Email</label>
                            {/* Disesuaikan: bg-white, text-black, focus:ring-0 */}
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-white rounded-md bg-white text-black focus:ring-0 focus:border-gray-300"
                                required
                            />
                        </div>
                        
                        {/* Input Password */}
                        <div className="relative">
                            <label className="block text-white text-sm font-medium mb-1">Password</label>
                            {/* Disesuaikan: bg-white, text-black, focus:ring-0 */}
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-white rounded-md bg-white text-black focus:ring-0 focus:border-gray-300"
                                required
                            />
                        </div>

                        {/* Pilihan Role (Admin/User) */}
                        <div className="flex justify-start space-x-4 text-white pt-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === 'admin'}
                                    onChange={() => setRole('admin')}
                                    className="mr-2"
                                />
                                Admin
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="role"
                                    value="user"
                                    checked={role === 'user'}
                                    onChange={() => setRole('user')}
                                    className="mr-2"
                                />
                                User
                            </label>
                        </div>
                        
                        {/* Tombol Login */}
                        {/* Disesuaikan: animasi hover timbul */}
                        <button
                            type="submit"
                            style={loginBtnColor}
                            className="w-full text-white font-bold py-2 rounded-md transition duration-200 mt-4 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Login
                        </button>
                    </form>

                    {/* Link Register */}
                    <p className="text-center text-xs mt-3 text-white/80">
                        Belum punya akun? <span 
                            onClick={() => router.push('/register')} 
                            // Disesuaikan: hover text biru
                            className="font-bold cursor-pointer underline transition duration-200 hover:text-blue-300"
                        >
                            Daftar sekarang
                        </span>
                    </p>
                </div>
                
            </div>
        </div>
    );
}