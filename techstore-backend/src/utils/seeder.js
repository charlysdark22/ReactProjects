const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'TechStore',
    email: 'admin@techstore.cu',
    password: 'admin123',
    phone: '+53 5555 5555',
    address: 'La Habana, Cuba',
    role: 'admin',
    emailVerified: true
  },
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    password: 'user123',
    phone: '+53 5555 1234',
    address: 'Santiago de Cuba, Cuba',
    role: 'user',
    emailVerified: true
  },
  {
    firstName: 'María',
    lastName: 'González',
    email: 'maria@example.com',
    password: 'user123',
    phone: '+53 5555 5678',
    address: 'Holguín, Cuba',
    role: 'user',
    emailVerified: true
  }
];

const products = [
  {
    name: 'PC Gamer Intel Core i7',
    description: 'Potente computadora gaming con procesador Intel Core i7, 16GB RAM, GTX 1660',
    category: 'desktop',
    brand: 'Custom Build',
    price: 1200.00,
    stock: 15,
    images: [
      { url: 'https://via.placeholder.com/500x500?text=PC+Gamer+i7', isMain: true }
    ],
    specifications: {
      processor: 'Intel Core i7-10700F',
      ram: '16GB DDR4',
      storage: '512GB SSD + 1TB HDD',
      graphics: 'NVIDIA GTX 1660 Super',
      motherboard: 'MSI B460M PRO'
    },
    isFeatured: true,
    sku: 'DES-CUS-001'
  },
  {
    name: 'Laptop Dell Inspiron 15',
    description: 'Laptop Dell Inspiron 15 con Intel Core i5, 8GB RAM, 512GB SSD',
    category: 'laptop',
    brand: 'Dell',
    price: 650.00,
    stock: 20,
    images: [
      { url: 'https://via.placeholder.com/500x500?text=Dell+Inspiron+15', isMain: true }
    ],
    specifications: {
      processor: 'Intel Core i5-1135G7',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      screen: '15.6" Full HD',
      graphics: 'Intel Iris Xe'
    },
    isFeatured: true,
    sku: 'LAP-DEL-001'
  },
  {
    name: 'iPhone 14 Pro',
    description: 'iPhone 14 Pro con chip A16 Bionic, cámara de 48MP, pantalla Super Retina XDR',
    category: 'phone',
    brand: 'Apple',
    price: 1099.00,
    stock: 12,
    images: [
      { url: 'https://via.placeholder.com/500x500?text=iPhone+14+Pro', isMain: true }
    ],
    specifications: {
      processor: 'A16 Bionic',
      ram: '6GB',
      storage: '128GB',
      screen: '6.1" Super Retina XDR',
      camera: '48MP + 12MP + 12MP'
    },
    isFeatured: true,
    sku: 'PHO-APP-001'
  },
  {
    name: 'Teclado Mecánico RGB',
    description: 'Teclado mecánico gaming con switches azules y retroiluminación RGB',
    category: 'accessories',
    brand: 'Razer',
    price: 89.99,
    stock: 30,
    images: [
      { url: 'https://via.placeholder.com/500x500?text=Teclado+RGB', isMain: true }
    ],
    specifications: {
      switches: 'Cherry MX Blue',
      connectivity: 'USB-C',
      lighting: 'RGB personalizable',
      layout: 'Español'
    },
    sku: 'ACC-RAZ-001'
  },
  {
    name: 'Monitor 4K 27 pulgadas',
    description: 'Monitor 4K IPS de 27 pulgadas ideal para trabajo y gaming',
    category: 'accessories',
    brand: 'LG',
    price: 349.99,
    stock: 8,
    images: [
      { url: 'https://via.placeholder.com/500x500?text=Monitor+4K', isMain: true }
    ],
    specifications: {
      size: '27 pulgadas',
      resolution: '3840 x 2160 (4K)',
      panel: 'IPS',
      refreshRate: '60Hz',
      connectivity: 'HDMI, DisplayPort, USB-C'
    },
    sku: 'ACC-LG-001'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Delete all data
    await User.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();

    // Create admin user first
    const adminUser = await User.create(users[0]);
    
    // Create other users
    const regularUsers = await User.create(users.slice(1));

    // Add createdBy field to products
    const productsWithCreator = products.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    // Create products
    const createdProducts = await Product.create(productsWithCreator);

    // Create some sample reviews
    const reviews = [
      {
        title: 'Excelente PC para gaming',
        comment: 'Muy buena computadora, corre todos los juegos sin problemas. La recomiendo.',
        rating: 5,
        user: regularUsers[0]._id,
        product: createdProducts[0]._id,
        verified: true,
        moderationStatus: 'approved'
      },
      {
        title: 'Buena laptop para trabajo',
        comment: 'Perfecta para trabajo de oficina, muy rápida y con buena pantalla.',
        rating: 4,
        user: regularUsers[1]._id,
        product: createdProducts[1]._id,
        verified: true,
        moderationStatus: 'approved'
      }
    ];

    await Review.create(reviews);

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();

    console.log('Data deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Use -i to import data or -d to delete data');
  process.exit();
}