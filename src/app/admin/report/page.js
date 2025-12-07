'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { ChartBarSquareIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import db from '@/services/DatabaseService'; 
import dayjs from 'dayjs';

// --- HELPER UNTUK FORMATTING ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// --- KOMPONEN METRIK RINGKAS ---
const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-semibold text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
        </div>
        <Icon className={`h-10 w-10 ${color}`} />
    </div>
);

export default function ReportPage() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [managedFieldId, setManagedFieldId] = useState(null);

    // --- LOGIKA PEMROSESAN DATA ---
    useEffect(() => {
        const loadReportData = async () => {
            setIsLoading(true);

            // 1. Cek Admin & Ambil Field ID
            const sessionUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!sessionUser || sessionUser.role !== 'admin') {
                router.push('/admin/login');
                return;
            }
            const adminData = db.data.admins.find(a => a.id === sessionUser.id) || sessionUser;
            setManagedFieldId(adminData.fieldId);

            if (!adminData.fieldId) {
                setIsLoading(false);
                return;
            }

            try {
                // 2. Ambil Semua Data yang Dibutuhkan
                const allReservations = await db.fetchReservationsAPI();
                const allCourts = db.data.courts;

                // 3. Filter Reservasi berdasarkan Lokasi Admin
                const courtIds = allCourts.filter(c => c.fieldId === adminData.fieldId).map(c => c.id);
                
                const myReservations = allReservations.filter(res => courtIds.includes(res.courtId));

                // 4. Hitung Metrik Ringkas
                let totalRevenue = 0;
                let paidCount = 0;
                let canceledCount = 0;
                let pendingCount = 0;
                const monthlyRevenue = {};

                myReservations.forEach(res => {
                    if (res.status === 'paid') {
                        totalRevenue += res.totalPrice;
                        paidCount++;
                        
                        // Hitung Tren Pendapatan per Bulan
                        const dateKey = dayjs(res.date).format('YYYY-MM');
                        if (!monthlyRevenue[dateKey]) {
                            monthlyRevenue[dateKey] = 0;
                        }
                        monthlyRevenue[dateKey] += res.totalPrice;

                    } else if (res.status === 'confirmed') {
                        paidCount++; 
                    } else if (res.status === 'canceled') {
                        canceledCount++;
                    } else if (res.status === 'pending') {
                        pendingCount++;
                    }
                });

                // Konversi data tren ke array terurut
                const trendData = Object.keys(monthlyRevenue)
                    .sort()
                    .map(month => ({
                        month: month,
                        revenue: monthlyRevenue[month],
                        displayRevenue: formatCurrency(monthlyRevenue[month]) 
                    }));


                // 5. Simpan Hasil
                setStats({
                    totalRevenue: totalRevenue,
                    paidCount: paidCount,
                    canceledCount: canceledCount,
                    totalTransactions: myReservations.length,
                    pendingCount: pendingCount,
                    monthlyTrend: trendData,
                });

            } catch (error) {
                console.error("Error loading report data:", error);
                setStats(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadReportData();
    }, [router]);


    // --- RENDERING UTAMA ---

    if (isLoading) {
        return <Layout showHeader={true}><div className="text-center mt-20">Memuat Laporan Kinerja...</div></Layout>;
    }

    if (!managedFieldId) {
        return <Layout showHeader={true}><div className="text-center mt-20 text-red-600">Admin tidak terhubung ke lokasi lapangan.</div></Layout>;
    }
    
    const fieldName = db.getFieldById(managedFieldId)?.name || "Lokasi Anda";


    return (
        <Layout 
            showHeader={true} 
            headerTitle={`Laporan ${fieldName}`} 
            showSidebar={true}
            userRole="admin"
        >
            <div className="p-4 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                    <ChartBarSquareIcon className="w-8 h-8 text-orange-600" />
                    Ringkasan Kinerja
                </h2>
                <p className="text-gray-600 mb-6">Metrik dihitung berdasarkan data reservasi Anda secara keseluruhan.</p>

                {stats && (
                    <>
                        {/* Grid Metrik Ringkas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <MetricCard 
                                title="Total Pendapatan Bersih" 
                                value={formatCurrency(stats.totalRevenue)} 
                                icon={CurrencyDollarIcon}
                                color="text-green-600"
                            />
                            <MetricCard 
                                title="Reservasi Selesai (Paid)" 
                                value={`${stats.paidCount}`} 
                                icon={CheckCircleIcon}
                                color="text-blue-600"
                            />
                            <MetricCard 
                                title="Total Pembatalan" 
                                value={`${stats.canceledCount}`} 
                                icon={XCircleIcon}
                                color="text-red-600"
                            />
                            <MetricCard 
                                title="Menunggu Konfirmasi" 
                                value={`${stats.pendingCount}`} 
                                icon={ClockIcon}
                                color="text-yellow-600"
                            />
                        </div>

                        {/* Detail Laporan Lanjutan (Tren Pendapatan per Bulan) */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                                Tren Pendapatan per Bulan
                            </h3>
                            <div className="h-64 pt-4">
                                {/* FIX ERROR: Tambahkan pengecekan if (stats.monthlyTrend) sebelum mengakses .length */}
                                {stats.monthlyTrend && stats.monthlyTrend.length > 0 ? (
                                    <div className="text-gray-700 space-y-2">
                                        {stats.monthlyTrend.map(item => (
                                            <div key={item.month} className="flex justify-between text-sm font-mono">
                                                <span className="font-semibold">{dayjs(item.month).format('MMMM YYYY')}</span>
                                                <span className="text-green-700">{item.displayRevenue}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 italic">
                                        Data pendapatan tidak cukup untuk menampilkan tren bulanan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}