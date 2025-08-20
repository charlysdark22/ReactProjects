// Simulando servicios de pago cubanos
class PaymentService {
  constructor() {
    this.orders = JSON.parse(localStorage.getItem('mockOrders')) || [];
  }

  saveOrders() {
    localStorage.setItem('mockOrders', JSON.stringify(this.orders));
  }

  async processTransfermovil(paymentData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulando validación de Transfermóvil
        if (paymentData.phoneNumber && paymentData.phoneNumber.length === 8) {
          const transactionId = `TM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const order = {
            id: this.orders.length + 1,
            transactionId,
            method: 'transfermovil',
            amount: paymentData.amount,
            phoneNumber: paymentData.phoneNumber,
            status: 'completed',
            date: new Date().toISOString(),
            items: paymentData.items,
            userId: paymentData.userId
          };
          this.orders.push(order);
          this.saveOrders();
          resolve({
            success: true,
            transactionId,
            message: 'Pago procesado exitosamente con Transfermóvil'
          });
        } else {
          reject(new Error('Número de teléfono inválido para Transfermóvil'));
        }
      }, 2000);
    });
  }

  async processEnzona(paymentData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulando validación de Enzona
        if (paymentData.cardNumber && paymentData.cardNumber.length >= 16) {
          const transactionId = `EZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const order = {
            id: this.orders.length + 1,
            transactionId,
            method: 'enzona',
            amount: paymentData.amount,
            cardNumber: `****-****-****-${paymentData.cardNumber.slice(-4)}`,
            status: 'completed',
            date: new Date().toISOString(),
            items: paymentData.items,
            userId: paymentData.userId
          };
          this.orders.push(order);
          this.saveOrders();
          resolve({
            success: true,
            transactionId,
            message: 'Pago procesado exitosamente con Enzona'
          });
        } else {
          reject(new Error('Datos de tarjeta inválidos para Enzona'));
        }
      }, 2000);
    });
  }

  async processBankTransfer(paymentData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulando transferencia bancaria
        const validBanks = ['bandec', 'bpa', 'metropolitano'];
        if (validBanks.includes(paymentData.bank) && paymentData.accountNumber) {
          const transactionId = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const order = {
            id: this.orders.length + 1,
            transactionId,
            method: 'bank_transfer',
            amount: paymentData.amount,
            bank: paymentData.bank,
            accountNumber: paymentData.accountNumber,
            status: 'pending', // Las transferencias bancarias requieren verificación manual
            date: new Date().toISOString(),
            items: paymentData.items,
            userId: paymentData.userId
          };
          this.orders.push(order);
          this.saveOrders();
          resolve({
            success: true,
            transactionId,
            message: 'Transferencia bancaria registrada. Será verificada en 24-48 horas.',
            status: 'pending'
          });
        } else {
          reject(new Error('Datos bancarios inválidos'));
        }
      }, 1500);
    });
  }

  async getOrderHistory(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userOrders = this.orders.filter(order => order.userId === userId);
        resolve(userOrders);
      }, 500);
    });
  }

  async getAllOrders() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.orders);
      }, 500);
    });
  }

  async updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = this.orders.findIndex(order => order.id === parseInt(orderId));
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = status;
          this.saveOrders();
          resolve(this.orders[orderIndex]);
        } else {
          reject(new Error('Orden no encontrada'));
        }
      }, 500);
    });
  }

  // Método para obtener estadísticas de pagos (para admin)
  async getPaymentStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          totalOrders: this.orders.length,
          totalRevenue: this.orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.amount, 0),
          methodStats: {
            transfermovil: this.orders.filter(o => o.method === 'transfermovil').length,
            enzona: this.orders.filter(o => o.method === 'enzona').length,
            bank_transfer: this.orders.filter(o => o.method === 'bank_transfer').length
          },
          statusStats: {
            completed: this.orders.filter(o => o.status === 'completed').length,
            pending: this.orders.filter(o => o.status === 'pending').length,
            failed: this.orders.filter(o => o.status === 'failed').length
          }
        };
        resolve(stats);
      }, 500);
    });
  }
}

export const paymentService = new PaymentService();