// src/components/Sidebar.js
import Link from 'next/link';

// --- DEFINISI MENU ---

// Menu untuk User Biasa (Role 'user')
const USER_MENU_ITEMS = [
    { name: 'Home', href: '/home' },
    { name: 'Reservasi', href: '/reservation' },
    { name: 'Transaksi', href: '/transaction' },
    { name: 'Riwayat', href: '/history' },
    { name: 'Profil', href: '/profile' },
    { name: 'Notifikasi', href: '/notification' }
];
// Berdasarkan mockup: image_124a3c.png, image_106698.png

// Menu untuk Admin (Role 'admin')
const ADMIN_MENU_ITEMS = [
    { name: 'Manajemen', href: '/admin/management' },
    { name: 'Reservasi', href: '/admin/reservation' },
    { name: 'Riwayat', href: '/admin/history' },
    { name: 'Laporan', href: '/admin/report' }, 
    { name: 'Profil', href: '/admin/profile' },
    { name: 'Notifikasi', href: '/admin/notifications' },
];
// Berdasarkan mockup: image_0feef5.png

// Default Sidebar (User mode)
export default function Sidebar({ userRole = 'user' }) {
    
    // Pilih set menu berdasarkan userRole
    const menuItems = userRole === 'admin' ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

    return (
        // Sidebar dengan lebar 64 dan warna oranye (#E86500)
        <div className="w-64 bg-[#E86500] text-white flex flex-col h-full fixed top-0 left-0">
            
            {/* Area Logo / Spasi Atas */}
            {/* Memberi padding yang cukup agar menu tidak menempel pada header/top bar */}
            <div className="p-2 h-18 border-b border-white/20">
                {/* Opsional: Tambahkan logo kecil di sini jika ada */}
            </div>
            
            <nav className="flex-1 p-4 space-y-4 pt-16"> 
                {menuItems.map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        // Styling menu item
                        className="block px-3 py-1 text-2xl font-semibold hover:text-gray-200 transition duration-150"
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Simbol N di Kiri Bawah (diasumsikan dari mockup image_122cd1.png) */}
            <div className="p-4 flex items-center justify-start border-t border-white/20">
                <span className="text-3xl font-bold">N</span> 
            </div>
        </div>
    );
}