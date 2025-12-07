'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import TransactionCardComponent from '@/components/TransactionCardComponent';
import db from '@/services/DatabaseService';
import { useRouter } from 'next/navigation';

export default function TransaksiPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTransactions = async () => {
            setIsLoading(true);

            // 1. Cek User Login
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) {
                router.push('/login');
                return;
            }

            // 2. Load Referensi
            const allCourts = db.data.courts; 
            const allFields = db.data.fields;

            // 3. Load Reservasi
            const allReservations = await db.fetchReservationsAPI(); 
            
            // DEBUG: Cek data mentah di Console Browser (F12)
            console.log("User ID:", user.id);
            console.log("All Res:", allReservations);

            // 4. Filter & Mapping
            const activeData = allReservations
                .filter(res => {
                    // FIX: Gunakan String() agar aman (angka vs teks)
                    const isMyTransaction = String(res.userId) === String(user.id);
                    
                    // Filter Status Active
                    const isActiveStatus = res.status === 'pending' || res.status === 'confirmed';

                    return isMyTransaction && isActiveStatus;
                })
                .map(res => {
                    const court = allCourts.find(c => c.id === res.courtId);
                    const location = court ? allFields.find(f => f.id === court.fieldId) : null;

                    return {
                        id: res.id,
                        locationName: location ? location.name : 'Unknown Location',
                        fieldName: court ? court.name : 'Unknown Court',
                        status: res.status, // Kirim 'pending' apa adanya
                        date: res.date,
                        totalPrice: res.totalPrice,
                        timeSlots: res.timeSlots
                    };
                });
            
            activeData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(activeData);
            setIsLoading(false);
        };

        loadTransactions();
    }, [router]);

    // ... (Bagian return render TETAP SAMA seperti kode Anda)
    return (
       <Layout 
           showHeader={true} 
           headerTitle="Transaksi" 
           showSidebar={true}
       >
           <div className="p-6 max-w-5xl mx-auto">
               <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-[#E86500] pl-3">
                   Transaksi Berlangsung
               </h2>
               
               <div className="space-y-4">
                   {isLoading ? (
                       <div className="text-center py-20 text-gray-500">Memuat data...</div>
                   ) : transactions.length > 0 ? (
                       transactions.map(transaction => (
                           <TransactionCardComponent 
                               key={transaction.id}
                               transaction={transaction}
                           />
                       ))
                   ) : (
                       <div className="text-center py-10 bg-gray-50 border border-gray-200 rounded-lg">
                           <p className="text-gray-500">Tidak ada transaksi aktif.</p>
                       </div>
                   )}
               </div>
           </div>
       </Layout>
    );
}