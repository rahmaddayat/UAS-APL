// src/app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Mencoba Register:", { username, email, password });
        alert("Pendaftaran Berhasil! Silakan Login.");
        router.push('/login'); 
    };

    const cardBgColor = { backgroundColor: '#E86500' };
    const registerBtnColor = { backgroundColor: '#000000' };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-xs md:max-w-sm">
                
                {/* Register Card */}
                <div 
                    className="p-6 rounded-2xl shadow-xl" 
                    style={cardBgColor}
                >
                    <h1 className="text-3xl font-bold text-white text-center mb-6">SportField</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Input Username */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-1">Username</label>
                            {/* Disesuaikan: bg-white, text-black, focus:ring-0 */}
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 border border-white rounded-md bg-white text-black focus:ring-0 focus:border-gray-300"
                                required
                            />
                        </div>

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
                        
                        {/* Tombol Register */}
                        {/* Disesuaikan: animasi hover timbul */}
                        <button
                            type="submit"
                            style={registerBtnColor}
                            className="w-full text-white font-bold py-2 rounded-md transition duration-200 mt-4 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Register
                        </button>
                    </form>

                    {/* Link Login */}
                    <p className="text-center text-xs mt-3 text-white/80">
                        Sudah punya akun? <span 
                            onClick={() => router.push('/login')} 
                            // Disesuaikan: hover text biru
                            className="font-bold cursor-pointer underline transition duration-200 hover:text-blue-300"
                        >
                            Login sekarang
                        </span>
                    </p>
                </div>
                
            </div>
        </div>
    );
}