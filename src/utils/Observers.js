export class AuditLogObserver {
    update(data) {
        console.log(`[AUDIT] ${data.id}: ${data.oldStatus} -> ${data.newStatus}`);
    }
}

export class NotificationObserver {
    constructor(dbService) {
        this.db = dbService;
    }

    update(data) {
        const { id, newStatus, message, timestamp } = data;

        // Cari User ID
        const reservation = this.db.data.reservations.find(r => r.id === id);
        const userId = reservation ? reservation.userId : null;
        const now = timestamp || new Date().toISOString();

        // ======================================================
        // A. BUAT NOTIFIKASI UNTUK USER
        // ======================================================
        if (userId) { 
            let userTitle = '';
            let userMessage = '';
            let userType = 'info';

            if (newStatus === 'confirmed') {
                userTitle = 'Booking Dikonfirmasi! 🥳';
                userMessage = `Hore! Reservasi #${id} telah disetujui Admin.`;
                userType = 'success';
            } 
            else if (newStatus === 'canceled') {
                userTitle = 'Reservasi Dibatalkan 😔';
                userMessage = `Maaf, reservasi #${id} ditolak. Alasan: "${message || '-'}"`;
                userType = 'error';
            }
            else if (newStatus === 'paid') {
                userTitle = 'Pembayaran Berhasil 💸';
                userMessage = `Terima kasih! Pembayaran untuk #${id} telah diverifikasi.`;
                userType = 'success';
            }

            if (userTitle) {
                this.db.addNotification({
                    id: `notif-u-${Date.now()}`, // ID Unik User
                    refId: id,
                    targetUserId: userId,
                    category: 'user', // <--- PENANDA KATEGORI
                    title: userTitle,
                    message: userMessage,
                    type: userType,
                    timestamp: now,
                    isRead: false
                });
            }
        }

        // ======================================================
        // B. BUAT NOTIFIKASI UNTUK ADMIN
        // ======================================================
        let adminTitle = '';
        let adminMessage = '';
        let adminType = 'info';

        if (newStatus === 'confirmed') {
            adminTitle = 'Reservasi Disetujui';
            adminMessage = `Admin menyetujui Reservasi #${id}.`;
            adminType = 'success';
        } 
        else if (newStatus === 'canceled') {
            adminTitle = 'Reservasi Ditolak';
            adminMessage = `Reservasi #${id} dibatalkan dengan alasan: ${message}`;
            adminType = 'error';
        }
        else if (newStatus === 'paid') {
            adminTitle = 'Pembayaran Diverifikasi';
            adminMessage = `Status pembayaran #${id} diperbarui menjadi Paid.`;
            adminType = 'success';
        }

        if (adminTitle) {
            this.db.addNotification({
                id: `notif-a-${Date.now()}`, // ID Unik Admin
                refId: id,
                targetUserId: null, // Admin tidak butuh target user spesifik di field ini
                category: 'admin', // <--- PENANDA KATEGORI
                title: adminTitle,
                message: adminMessage,
                type: adminType,
                timestamp: now,
                isRead: false
            });
        }
    }
}