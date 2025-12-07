import initialUsers from '../data/users.json';
import initialAdmins from '../data/admins.json';
import initialFields from '../data/fields.json';
import initialCourts from '../data/courts.json';
import initialReservations from '../data/reservations.json';

// --- IMPORT OBSERVERS ---
import { AuditLogObserver, NotificationObserver } from '@/utils/Observers';

class DatabaseService {
    constructor() {
        // --- SINGLETON PATTERN ---
        if (DatabaseService.instance) return DatabaseService.instance;

        this.data = {
            users: this.loadFromStorage('users', initialUsers),
            admins: this.loadFromStorage('admins', initialAdmins),
            fields: this.loadFromStorage('fields', initialFields),
            courts: this.loadFromStorage('courts', initialCourts),
            reservations: this.loadFromStorage('reservations', initialReservations),
            notifications: [], // Awalnya kosong, nanti diisi dari API
        };

        // --- OBSERVER PATTERN SETUP ---
        this.observers = [];
        
        // Daftarkan Observer
        this.addObserver(new AuditLogObserver());
        // Penting: Pass 'this' (instance db) ke NotificationObserver agar bisa panggil addNotification
        this.addObserver(new NotificationObserver(this)); 

        DatabaseService.instance = this;
    }

    loadFromStorage(key, defaultData) {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(key);
            if (stored) return JSON.parse(stored);
        }
        return [...defaultData];
    }

    // ==========================================================
    // 1. AUTHENTICATION
    // ==========================================================

    async registerUser(username, email, password) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal Register');
        this.data.users.push(result.data);
        return result.data;
    }

    async login(email, password, role) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal Login');
        return result.user;
    }

    // ==========================================================
    // 2. DATA GETTERS
    // ==========================================================

    getAllFields() { return this.data.fields; }
    getFieldById(id) { return this.data.fields.find(f => f.id === id); }
    getCourtsByLocation(locationId) { return this.data.courts.filter(c => c.fieldId === locationId); }

    getReservationsByDate(locationId, dateStr) {
        const locationCourtIds = this.getCourtsByLocation(locationId).map(c => c.id);
        return this.data.reservations.filter(r =>
            locationCourtIds.includes(r.courtId) && r.date === dateStr
        );
    }

    
    // ==========================================================
    // 3. RESERVATION ACTIONS (API)
    // ==========================================================
    
    async fetchReservationsAPI(date = null) {
        try {
            const url = date ? `/api/reservations?date=${date}` : '/api/reservations';
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return [];
            
            const data = await res.json();
            this.data.reservations = data; // Sync memory
            return data;
        } catch (error) {
            console.error("Gagal ambil data API:", error);
            return [];
        }
    }
    
    // UPDATE: MENDUKUNG FACTORY METHOD (via Parameter Type)
    async createReservation(userId, courtId, date, timeSlots, totalPrice, type = 'regular') {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Kirim parameter 'type' ke server agar Factory di server bisa bekerja
            body: JSON.stringify({ userId, courtId, date, timeSlots, totalPrice, type }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Gagal menyimpan reservasi");
        this.data.reservations.push(result.data);
        return result.data;
    }

    // UPDATE: MENDUKUNG OBSERVER (Notify setelah update)
    async updateTransactionStatus(id, newStatus, message = null) {
        try {
            // Ambil status lama untuk log
            const oldReservation = this.data.reservations.find(r => r.id === id);
            const oldStatus = oldReservation ? oldReservation.status : 'unknown';
            
            const res = await fetch('/api/reservations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus, message }),
            });

            if (!res.ok) throw new Error('Gagal update status di server');
            const result = await res.json();
            
            const index = this.data.reservations.findIndex(r => r.id === id);
            if (index !== -1) this.data.reservations[index] = result.data;
            
            // --- TRIGGER NOTIFY OBSERVERS ---
            // Setelah data berhasil diupdate di server, beri tahu Observer (Notifikasi & Audit)
            this.notifyObservers({
                id: id,
                oldStatus: oldStatus,
                newStatus: newStatus,
                message: message,
                timestamp: new Date().toISOString()
            });
            // --------------------------------
            
            return result.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }
    
    // ==========================================================
    // 4. PAYMENT ACTIONS (API)
    // ==========================================================
    
    async fetchPaymentsAPI() {
        try {
            const res = await fetch('/api/payments', { cache: 'no-store' });
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Gagal ambil payment history:", error);
            return [];
        }
    }

    async createPayment(reservationId, amount, paymentStatus, paymentMethod) {
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId, amount, paymentStatus, paymentMethod })
            });

            if (!res.ok) throw new Error('Gagal mencatat pembayaran');
            
            // Opsional: Jika ingin notifikasi pembayaran sukses, bisa uncomment ini:
            // this.notifyObservers({ id: reservationId, newStatus: 'paid', message: `Via ${paymentMethod}`, timestamp: new Date().toISOString() });
            
            return await res.json();
        } catch (error) {
            console.error("Create Payment Error:", error);
        }
    }

    // ==========================================================
    // 5. COURT MANAGEMENT (ADMIN)
    // ==========================================================
    
    async fetchCourtsAPI(adminFieldId = null) {
        try {
            const res = await fetch('/api/management/courts', { cache: 'no-store' });
            if (!res.ok) return [];
            const allCourts = await res.json();
            
            this.data.courts = allCourts;
            
            if (adminFieldId) {
                return allCourts.filter(c => c.fieldId === adminFieldId);
            }
            return allCourts;
        } catch (error) {
            console.error("Fetch Courts Error:", error);
            return [];
        }
    }

    async addCourt(fieldId, name, pricePerHour, type) {
        const res = await fetch('/api/management/courts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fieldId, name, pricePerHour, type })
        });
        if (!res.ok) throw new Error('Gagal menambah lapangan');
        const result = await res.json();
        this.data.courts.push(result.data);
        return result.data;
    }
    
    async updateCourt(id, name, pricePerHour, type) {
        const res = await fetch('/api/management/courts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, pricePerHour, type })
        });
        if (!res.ok) throw new Error('Gagal update lapangan');
        const result = await res.json();
        return result.data;
    }
    
    async deleteCourt(id) {
        const res = await fetch(`/api/management/courts?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus lapangan');
        return true;
    }
    
    // ==========================================================
    // 6. FIELD SCHEDULE & HOLIDAYS MANAGEMENT (ADMIN)
    // ==========================================================
    
    async getFieldData(fieldId) {
        try {
            const res = await fetch(`/api/management/fields?t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) return null;
            
            const allFields = await res.json();
            return allFields.find(f => f.id === fieldId);
        } catch (error) {
            console.error("Get Field Error:", error);
            return null;
        }
    }

    async updateFieldSchedule(id, openHour, closeHour, breakHours) {
        try {
            const res = await fetch('/api/management/fields', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, openHour, closeHour, breakHours })
            });

            if (!res.ok) throw new Error('Gagal update jadwal');
            return await res.json();
        } catch (error) {
            console.error("Update Schedule Error:", error);
            throw error;
        }
    }

    async updateFieldHolidays(id, closedDays, specificClosedDates) {
        try {
            const res = await fetch('/api/management/fields', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    closedDays,
                    specificClosedDates
                })
            });
            
            if (!res.ok) throw new Error('Gagal update hari libur');
            return await res.json();
        } catch (error) {
            console.error("Update Holidays Error:", error);
            throw error;
        }
    }
    // ==========================================================
    //  OBSERVER PATTERN METHODS
    // ==========================================================
    
    addObserver(observer) {
        this.observers.push(observer);
    }
    
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    
    notifyObservers(data) {
        this.observers.forEach(observer => {
            try {
                observer.update(data);
            } catch (err) {
                console.error("Observer Error:", err);
            }
        });
    }
    
    // ==========================================================
    //  7. NOTIFICATION MANAGEMENT (SERVER-SIDE)
    // ==========================================================
    
    // Mengambil notifikasi dari Server
    async fetchNotificationsAPI() {
        try {
            // Gunakan timestamp agar tidak kena cache browser
            const res = await fetch(`/api/notifications?t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) return [];
            
            const data = await res.json();
            this.data.notifications = data; // Sync memory
            return data;
        } catch (error) {
            console.error("Gagal ambil notifikasi:", error);
            return [];
        }
    }
    
    // Menambah notifikasi ke Server
    async addNotification(notifObj) {
        // Update memory lokal dulu (Optimistic UI update)
        this.data.notifications.unshift(notifObj);
    
        // Kirim ke API (Background process)
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notifObj)
            });
        } catch (error) {
            console.error("Gagal simpan notifikasi ke server:", error);
        }
    }
    
    // Menghapus semua notifikasi di Server
    async clearAllNotifications() {
        this.data.notifications = []; // Clear memory
        
        try {
            await fetch('/api/notifications', { method: 'DELETE' });
        } catch (error) {
            console.error("Gagal hapus notifikasi server:", error);
        }
    }

    // Helper: Filter Notifikasi khusus User
    // HANYA GUNAKAN SATU VERSI INI (YANG ADA FILTER CATEGORY)
    getUserNotifications(userId) {
        return this.data.notifications
            .filter(n => n.targetUserId === userId && n.category === 'user') 
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
}

const db = new DatabaseService();
export default db;