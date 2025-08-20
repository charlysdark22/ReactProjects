// Simulando un servicio de productos
const mockProducts = [
  // Computadoras de Escritorio
  {
    id: 1,
    name: 'PC Gamer Intel Core i7',
    category: 'desktop',
    price: 1200.00,
    image: 'https://via.placeholder.com/300x300?text=PC+Gamer+i7',
    description: 'Potente computadora gaming con procesador Intel Core i7, 16GB RAM, GTX 1660',
    specifications: {
      processor: 'Intel Core i7-10700F',
      ram: '16GB DDR4',
      storage: '512GB SSD + 1TB HDD',
      graphics: 'NVIDIA GTX 1660 Super',
      motherboard: 'MSI B460M PRO'
    },
    stock: 15,
    brand: 'Custom Build'
  },
  {
    id: 2,
    name: 'PC Oficina AMD Ryzen 5',
    category: 'desktop',
    price: 800.00,
    image: 'https://via.placeholder.com/300x300?text=PC+Oficina+Ryzen',
    description: 'Computadora ideal para oficina con AMD Ryzen 5, 8GB RAM, SSD 256GB',
    specifications: {
      processor: 'AMD Ryzen 5 3600',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      graphics: 'AMD Radeon Vega 11',
      motherboard: 'ASUS PRIME B450M'
    },
    stock: 25,
    brand: 'Custom Build'
  },
  // Laptops
  {
    id: 3,
    name: 'Laptop Dell Inspiron 15',
    category: 'laptop',
    price: 650.00,
    image: 'https://via.placeholder.com/300x300?text=Dell+Inspiron+15',
    description: 'Laptop Dell Inspiron 15 con Intel Core i5, 8GB RAM, 512GB SSD',
    specifications: {
      processor: 'Intel Core i5-1135G7',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      screen: '15.6" Full HD',
      graphics: 'Intel Iris Xe'
    },
    stock: 20,
    brand: 'Dell'
  },
  {
    id: 4,
    name: 'MacBook Air M2',
    category: 'laptop',
    price: 1299.00,
    image: 'https://via.placeholder.com/300x300?text=MacBook+Air+M2',
    description: 'MacBook Air con chip M2, 8GB RAM unificada, 256GB SSD',
    specifications: {
      processor: 'Apple M2',
      ram: '8GB Unified Memory',
      storage: '256GB SSD',
      screen: '13.6" Liquid Retina',
      graphics: '8-core GPU'
    },
    stock: 10,
    brand: 'Apple'
  },
  // Teléfonos
  {
    id: 5,
    name: 'iPhone 14 Pro',
    category: 'phone',
    price: 1099.00,
    image: 'https://via.placeholder.com/300x300?text=iPhone+14+Pro',
    description: 'iPhone 14 Pro con chip A16 Bionic, cámara de 48MP, pantalla Super Retina XDR',
    specifications: {
      processor: 'A16 Bionic',
      ram: '6GB',
      storage: '128GB',
      screen: '6.1" Super Retina XDR',
      camera: '48MP + 12MP + 12MP'
    },
    stock: 12,
    brand: 'Apple'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S23',
    category: 'phone',
    price: 899.00,
    image: 'https://via.placeholder.com/300x300?text=Galaxy+S23',
    description: 'Samsung Galaxy S23 con Snapdragon 8 Gen 2, cámara de 50MP',
    specifications: {
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB',
      storage: '256GB',
      screen: '6.1" Dynamic AMOLED 2X',
      camera: '50MP + 12MP + 10MP'
    },
    stock: 18,
    brand: 'Samsung'
  },
  // Accesorios
  {
    id: 7,
    name: 'Teclado Mecánico RGB',
    category: 'accessories',
    price: 89.99,
    image: 'https://via.placeholder.com/300x300?text=Teclado+RGB',
    description: 'Teclado mecánico gaming con switches azules y retroiluminación RGB',
    specifications: {
      switches: 'Cherry MX Blue',
      connectivity: 'USB-C',
      lighting: 'RGB personalizable',
      layout: 'Español'
    },
    stock: 30,
    brand: 'Razer'
  },
  {
    id: 8,
    name: 'Mouse Gaming Inalámbrico',
    category: 'accessories',
    price: 69.99,
    image: 'https://via.placeholder.com/300x300?text=Mouse+Gaming',
    description: 'Mouse gaming inalámbrico con sensor óptico de alta precisión',
    specifications: {
      sensor: 'PixArt PMW3360',
      dpi: 'Hasta 12,000 DPI',
      connectivity: '2.4GHz + Bluetooth',
      battery: 'Hasta 70 horas'
    },
    stock: 25,
    brand: 'Logitech'
  },
  {
    id: 9,
    name: 'Auriculares Bluetooth Premium',
    category: 'accessories',
    price: 199.99,
    image: 'https://via.placeholder.com/300x300?text=Auriculares+BT',
    description: 'Auriculares Bluetooth con cancelación de ruido activa',
    specifications: {
      connectivity: 'Bluetooth 5.0',
      battery: 'Hasta 30 horas',
      features: 'Cancelación de ruido activa',
      drivers: '40mm'
    },
    stock: 15,
    brand: 'Sony'
  },
  {
    id: 10,
    name: 'Monitor 4K 27 pulgadas',
    category: 'accessories',
    price: 349.99,
    image: 'https://via.placeholder.com/300x300?text=Monitor+4K',
    description: 'Monitor 4K IPS de 27 pulgadas ideal para trabajo y gaming',
    specifications: {
      size: '27 pulgadas',
      resolution: '3840 x 2160 (4K)',
      panel: 'IPS',
      refreshRate: '60Hz',
      connectivity: 'HDMI, DisplayPort, USB-C'
    },
    stock: 8,
    brand: 'LG'
  }
];

class ProductService {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('mockProducts')) || mockProducts;
    this.saveProducts();
  }

  saveProducts() {
    localStorage.setItem('mockProducts', JSON.stringify(this.products));
  }

  async getAllProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.products);
      }, 500);
    });
  }

  async getProductsByCategory(category) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProducts = this.products.filter(p => p.category === category);
        resolve(filteredProducts);
      }, 500);
    });
  }

  async getProductById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = this.products.find(p => p.id === parseInt(id));
        if (product) {
          resolve(product);
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 500);
    });
  }

  async searchProducts(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProducts = this.products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filteredProducts);
      }, 500);
    });
  }

  async addProduct(productData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          id: Math.max(...this.products.map(p => p.id)) + 1,
          ...productData
        };
        this.products.push(newProduct);
        this.saveProducts();
        resolve(newProduct);
      }, 500);
    });
  }

  async updateProduct(id, productData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...productData };
          this.saveProducts();
          resolve(this.products[index]);
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 500);
    });
  }

  async deleteProduct(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          this.products.splice(index, 1);
          this.saveProducts();
          resolve({ message: 'Producto eliminado' });
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 500);
    });
  }
}

export const productService = new ProductService();