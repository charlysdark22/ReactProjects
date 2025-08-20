import axios from 'axios';

// Simulando un backend - en producción esto sería una API real
const API_BASE_URL = 'http://localhost:3001/api';

// Datos simulados para desarrollo
const mockUsers = [
  {
    id: 1,
    email: 'admin@techstore.cu',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'TechStore',
    role: 'admin',
    phone: '+53 5555 5555',
    address: 'La Habana, Cuba'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    firstName: 'Usuario',
    lastName: 'Ejemplo',
    role: 'user',
    phone: '+53 5555 1234',
    address: 'Santiago de Cuba, Cuba'
  }
];

class AuthService {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('mockUsers')) || mockUsers;
    this.saveUsers();
  }

  saveUsers() {
    localStorage.setItem('mockUsers', JSON.stringify(this.users));
  }

  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          const token = `mock-token-${user.id}-${Date.now()}`;
          resolve({
            user: userWithoutPassword,
            token
          });
        } else {
          reject(new Error('Credenciales inválidas'));
        }
      }, 1000);
    });
  }

  async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = this.users.find(u => u.email === userData.email);
        if (existingUser) {
          reject(new Error('El email ya está registrado'));
          return;
        }

        const newUser = {
          id: this.users.length + 1,
          ...userData,
          role: 'user'
        };

        this.users.push(newUser);
        this.saveUsers();

        const { password: _, ...userWithoutPassword } = newUser;
        const token = `mock-token-${newUser.id}-${Date.now()}`;
        
        resolve({
          user: userWithoutPassword,
          token
        });
      }, 1000);
    });
  }

  async forgotPassword(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === email);
        if (user) {
          resolve({ message: 'Email de recuperación enviado' });
        } else {
          reject(new Error('Email no encontrado'));
        }
      }, 1000);
    });
  }

  async updateProfile(userId, userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...userData };
          this.saveUsers();
          const { password: _, ...userWithoutPassword } = this.users[userIndex];
          resolve({ user: userWithoutPassword });
        } else {
          reject(new Error('Usuario no encontrado'));
        }
      }, 1000);
    });
  }
}

export const authService = new AuthService();