import API from './api';

class OrderService {
  async createOrder(orderData) {
    const response = await API.post('/orders', orderData);
    return response.data;
  }

  async getMyOrders() {
    const response = await API.get('/orders/my-orders');
    return response.data;
  }

  async getOrder(id) {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  }

  async cancelOrder(id, reason) {
    const response = await API.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  }

  // Payment methods
  async processStripePayment(orderId, paymentMethodId) {
    const response = await API.post(`/orders/${orderId}/pay/stripe`, {
      paymentMethodId
    });
    return response.data;
  }

  async processCubanPayment(orderId, paymentData) {
    const response = await API.post(`/orders/${orderId}/pay/cuban`, paymentData);
    return response.data;
  }

  // Admin functions
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    const response = await API.get(url);
    return response.data;
  }

  async updateOrderStatus(id, statusData) {
    const response = await API.put(`/orders/${id}/status`, statusData);
    return response.data;
  }

  async getOrderAnalytics() {
    const response = await API.get('/orders/analytics/stats');
    return response.data;
  }
}

export const orderService = new OrderService();