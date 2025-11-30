'use client'; 
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

// Menggunakan Home Page ini sebagai layout utama untuk halaman ini
export default function HomePage() {
    
  const buttonClasses = "mt-6 text-xl font-bold px-12 py-4 rounded-md shadow-lg transition duration-150 ease-in-out";
  const primaryColorClasses = "bg-[#E86500] hover:bg-[#C95500] text-white border border-[#E86500]"; 

  return (
    // Kontainer utama: Full screen, display flex
    <div className="flex min-h-screen">
      
      {/* 1. Sidebar (Bagian Kiri) */}
      <Sidebar />
      
      {/* 2. Konten Utama (Bagian Kanan) */}
      <main className="flex-1 ml-64">
          
        {/* Area Background Gambar */}
        <div 
            className="w-full h-screen bg-cover bg-center flex items-center justify-center p-8"
            style={{ backgroundImage: "url('/field-bg.jpg')" }} 
        >
            
            {/* Overlay Gelap untuk Keterbacaan Teks */}
            <div className="absolute inset-0 ml-64 bg-black opacity-40"></div> 
            
            {/* Konten Text di Tengah */}
            <div className="relative z-10 max-w-2xl text-white text-left">
                
                {/* Logo dan Judul */}
                <div className="flex items-center space-x-4 mb-4">
                    <Image 
                        src="/logo.png" // Path relatif ke folder public
                        alt="SportField Logo" 
                        width={100}    
                        height={100}     
                        className="text-[#E86500]" 
                    />
                    <h1 className="text-6xl font-bold tracking-wider">
                        SportField
                    </h1>
                </div>
                
                {/* Slogan */}
                <p className="text-xl italic mb-6">
                    "Book the Game, Rule the Time"
                </p>
                
                {/* Deskripsi */}
                <p className="text-lg mb-10 leading-relaxed">
                    Platform reservasi lapangan olahraga yang memudahkan pemesanan jadwal bermain secara online. Pilih lapangan, pilih waktu, dan nikmati olahraga tanpa hambatan.
                </p>
                
                {/* Wrapper Tombol */}
                <div className="text-left">
                    <button 
                        onClick={() => console.log("Navigasi ke halaman reservasi")}
                        className={`${buttonClasses} ${primaryColorClasses}`}
                    >
                        Mulai Reservasi
                    </button>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}