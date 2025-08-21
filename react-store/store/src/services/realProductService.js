import API from './api';

class RealProductService {
  async getAllProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    const response = await API.get(url);
    return response.data;
  }

  async getProductsByCategory(category, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/products/category/${category}?${queryString}` : `/products/category/${category}`;
    const response = await API.get(url);
    return response.data;
  }

  async getProductById(id) {
    const response = await API.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(query, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/products/search/${query}?${queryString}` : `/products/search/${query}`;
    const response = await API.get(url);
    return response.data;
  }

  async getFeaturedProducts() {
    const response = await API.get('/products/featured');
    return response.data;
  }

  // Admin functions
  async createProduct(productData) {
    const response = await API.post('/products', productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await API.delete(`/products/${id}`);
    return response;
  }

  async updateStock(id, stockData) {
    const response = await API.put(`/products/${id}/stock`, stockData);
    return response.data;
  }

  async getProductAnalytics() {
    const response = await API.get('/products/analytics');
    return response.data;
  }
}

export const realProductService = new RealProductService();