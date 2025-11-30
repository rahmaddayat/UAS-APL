// src/app/admin/management/page.js
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function ManagementPage() {
    
    return (
        <Layout 
            showHeader={true} 
            headerTitle="Manajemen" 
            showSidebar={true}
            userRole="admin" // Memastikan Sidebar Admin tampil
        >
            {/* p-1 digunakan, max-w-4xl tetap ada */}
            <div className="p-1 max-w-4xl mx-auto"> 
                
                {/* Container untuk kartu. 'space-y-4' dipertahankan. 'max-w-lg' DIHAPUS untuk lebar satu baris. */}
                <div className="space-y-4">
                    
                    {/* --- Card Lapangan (Inlined) --- */}
                    <Link href="/admin/management/field" passHref>
                        <div className="bg-gray-100 p-4 rounded-md shadow-md border border-gray-300 cursor-pointer 
                                      hover:shadow-lg transition duration-200 mb-6"> 
                            <h3 className="text-xl font-bold text-gray-800">Lapangan</h3>
                        </div>
                    </Link>
                    
                    {/* --- Card Jadwal Operasional (Inlined) --- */}
                    <Link href="/admin/management/schedule" passHref>
                        <div className="bg-gray-100 p-4 rounded-md shadow-md border border-gray-300 cursor-pointer 
                                      hover:shadow-lg transition duration-200 mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Jadwal Operasional</h3>
                        </div>
                    </Link>
                    
                </div>
            </div>
        </Layout>
    );
}