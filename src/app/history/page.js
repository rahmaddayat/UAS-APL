'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import TransactionCardComponent from '@/components/TransactionCardComponent';
import db from '@/services/DatabaseService';
import { useRouter } from 'next/navigation'; 

export default function HistoryPage() {
    const router = useRouter();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const containerClasses = "p-6 max-w-4xl mx-auto";

    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);

            // 1. Cek User Login
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) {
                router.push('/login');
                return;
            }

            // 2. Ambil Data
            const allCourts = db.data.courts; 
            const allFields = db.data.fields;
            const allReservations = await db.fetchReservationsAPI();

            // 3. Filter Data
            const processedData = allReservations
                .filter(res => {
                    const isMyData = String(res.userId) === String(user.id);
                    // UPDATED: 'canceled'
                    const isHistoryStatus = ['paid', 'canceled', 'rejected'].includes(res.status);
                    
                    return isMyData && isHistoryStatus;
                })
                .map(res => {
                    const court = allCourts.find(c => c.id === res.courtId);
                    const location = court ? allFields.find(f => f.id === court.fieldId) : null;

                    return {
                        id: res.id,
                        locationName: location ? location.name : 'Unknown Location',
                        fieldName: court ? court.name : 'Unknown Court',
                        status: res.status, 
                        date: res.date,
                        totalPrice: res.totalPrice,
                        timeSlots: res.timeSlots
                    };
                });

            // 4. Sort Descending
            processedData.sort((a, b) => new Date(b.date) - new Date(a.date));

            setHistoryData(processedData);
            setIsLoading(false);
        };

        loadHistory();
    }, [router]);

    return (
        <Layout 
            showHeader={true} 
            headerTitle="Riwayat" 
            activeMenu="Riwayat" 
            showSidebar={true}
            showBackButton={false}
        >
            <div className={containerClasses}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                    </div>
                ) : historyData.length > 0 ? (
                    <div className="space-y-4">
                        {historyData.map(transaction => (
                            <TransactionCardComponent 
                                key={transaction.id}
                                transaction={transaction}
                            />
                        ))}
                    </div>
                ) : (
                    // Empty state
                     <div className="text-center py-10 bg-gray-50 border border-gray-200 rounded-lg">
                           <p className="text-gray-500">Belum ada reservasi yang dilakukan</p>
                       </div>
                )}
            </div>
        </Layout>
    );
}