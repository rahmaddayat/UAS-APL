/**
 * STRATEGY PATTERN
 * Interface umum untuk semua metode pembayaran
 */
class PaymentStrategy {
    constructor(name, iconColor) {
        this.name = name;
        this.iconColor = iconColor;
    }

    processPayment(amount) {
        // Simulasi logika spesifik per provider
        return new Promise((resolve) => {
            console.log(`Menghubungkan ke gateway ${this.name}...`);
            setTimeout(() => {
                resolve({ 
                    success: true, 
                    message: `Pembayaran ${this.name} sebesar Rp ${amount} Berhasil!` 
                });
            }, 2000); // Simulasi delay 2 detik
        });
    }
}

// Concrete Strategies
export const strategies = {
    DANA: new PaymentStrategy('DANA', 'bg-blue-500'),
    GOPAY: new PaymentStrategy('GOPAY', 'bg-green-500'),
    OVO: new PaymentStrategy('OVO', 'bg-purple-600'),
};

export const getPaymentStrategy = (key) => strategies[key];