'use client';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; 
import { useRouter } from 'next/navigation'; 

// Tambahkan prop 'backUrl'
export default function Header({ title, showBackButton, backUrl }) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      // Jika ada URL tujuan spesifik (Navigasi Terstruktur/Aman)
      router.push(backUrl);
    } else {
      // Jika tidak, gunakan history browser (Default)
      router.back();
    }
  };

  return (
    <div className="bg-white border-b border-gray-300 py-4 px-8 flex items-center sticky top-0 z-30">
      
      {showBackButton && (
        <button 
          onClick={handleBack} // Gunakan handler baru
          className="mr-4 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}
      
      <h2 className="text-4xl font-bold text-gray-800">{title}</h2> 
    </div>
  );
}