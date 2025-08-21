import API from './api';

class RealAuthService {
  async login(email, password) {
    const response = await API.post('/auth/login', { email, password });
    return response;
  }

  async register(userData) {
    const response = await API.post('/auth/register', userData);
    return response;
  }

  async logout() {
    const response = await API.get('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response;
  }

  async getMe() {
    const response = await API.get('/auth/me');
    return response;
  }

  async updateProfile(userData) {
    const response = await API.put('/auth/updatedetails', userData);
    return response;
  }

  async updatePassword(passwordData) {
    const response = await API.put('/auth/updatepassword', passwordData);
    return response;
  }

  async forgotPassword(email) {
    const response = await API.post('/auth/forgotpassword', { email });
    return response;
  }

  async resetPassword(resetToken, password) {
    const response = await API.put(`/auth/resetpassword/${resetToken}`, { password });
    return response;
  }

  async verifyEmail(token) {
    const response = await API.get(`/auth/verify-email/${token}`);
    return response;
  }
}

export const realAuthService = new RealAuthService();