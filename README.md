# 🚀 TechStore Cuba - E-commerce Completo

Una tienda online moderna y completa para tecnología en Cuba, construida con React, Node.js y MongoDB.

![TechStore Cuba](https://via.placeholder.com/1200x600?text=TechStore+Cuba+-+E-commerce+Completo)

## ✨ Características Principales

### 🛍️ **E-commerce Completo**
- **Catálogo de productos** con 4 categorías (Computadoras, Laptops, Teléfonos, Accesorios)
- **Carrito de compras** persistente con localStorage
- **Sistema de checkout** completo con múltiples métodos de pago
- **Gestión de inventario** en tiempo real
- **Búsqueda y filtros** avanzados

### 🔐 **Autenticación y Usuarios**
- **Login/Registro** con validación completa
- **Perfiles de usuario** editables
- **Roles** (Usuario/Administrador)
- **Recuperación de contraseña** por email
- **Verificación de email**

### 💳 **Pasarelas de Pago Cubanas**
- **Transfermóvil** - Pago instantáneo
- **Enzona** - Tarjetas de débito/crédito
- **Transferencias Bancarias**:
  - BANDEC
  - BPA (Banco Popular de Ahorro)
  - Banco Metropolitano
- **Stripe** (internacional)

### ⭐ **Sistema de Reseñas**
- **Reseñas y calificaciones** de productos
- **Sistema de moderación** para administradores
- **Marcar como útil** y reportar reseñas
- **Estadísticas** de calificaciones
- **Reseñas verificadas** para compradores

### 💬 **Chat de Soporte en Tiempo Real**
- **Socket.IO** para comunicación instantánea
- **Asignación automática** a agentes de soporte
- **Indicadores de escritura** en tiempo real
- **Historial de conversaciones**
- **Panel de administración** para agentes

### 🌍 **Multiidioma**
- **4 idiomas**: Español, Inglés, Francés, Portugués
- **Traducción completa** de la interfaz
- **Selector dinámico** de idioma
- **SEO multiidioma**

### 🌙 **Modo Oscuro**
- **Toggle dinámico** entre modo claro y oscuro
- **Persistencia** de preferencias
- **Material-UI theming** completo

### 🔍 **SEO Optimizado**
- **Meta tags** dinámicos
- **Open Graph** y Twitter Cards
- **Structured Data** (JSON-LD)
- **Sitemap.xml** y robots.txt
- **URLs amigables**

### 📱 **PWA (Progressive Web App)**
- **Service Worker** para cache offline
- **Instalable** en dispositivos móviles
- **Push notifications**
- **Background sync** para acciones offline
- **App shortcuts** y iconos adaptativos

### 👨‍💼 **Panel de Administración**
- **Dashboard** con estadísticas en tiempo real
- **Gestión de productos** (CRUD completo)
- **Gestión de pedidos** y estados
- **Moderación de reseñas**
- **Analíticas** de ventas y usuarios
- **Chat de soporte** centralizado

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Framework principal
- **Material-UI** - Componentes y theming
- **React Router** - Navegación
- **React Hook Form + Yup** - Formularios y validación
- **React i18next** - Internacionalización
- **Socket.IO Client** - Chat en tiempo real
- **React Helmet Async** - SEO dinámico
- **React Toastify** - Notificaciones

### Backend
- **Node.js + Express** - Servidor API
- **MongoDB + Mongoose** - Base de datos
- **Socket.IO** - WebSockets para chat
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **Stripe** - Procesamiento de pagos
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging de requests

### DevOps y Herramientas
- **Docker** - Containerización
- **Git** - Control de versiones
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 14+
- MongoDB 4.4+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/techstore-cuba.git
cd techstore-cuba
```

### 2. Configurar Backend
```bash
cd techstore-backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

### 3. Configurar Frontend
```bash
cd store
npm install --legacy-peer-deps
cp .env.example .env
# Editar .env con tus configuraciones
npm start
```

### 4. Sembrar datos de prueba (Opcional)
```bash
cd techstore-backend
npm run seed -i
```

## 🔧 Variables de Entorno

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techstore-cuba
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=https://techstore.cu
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_public
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_PWA=true
```

## 📊 Estructura del Proyecto

```
techstore-cuba/
├── store/                          # Frontend React
│   ├── public/
│   │   ├── sw.js                   # Service Worker
│   │   ├── manifest.json           # PWA Manifest
│   │   ├── sitemap.xml            # SEO Sitemap
│   │   └── robots.txt             # SEO Robots
│   └── src/
│       ├── components/            # Componentes React
│       │   ├── auth/             # Autenticación
│       │   ├── cart/             # Carrito
│       │   ├── chat/             # Chat de soporte
│       │   ├── common/           # Componentes comunes
│       │   ├── products/         # Productos
│       │   └── reviews/          # Sistema de reseñas
│       ├── context/              # React Context
│       ├── hooks/                # Custom Hooks
│       ├── locales/              # Traducciones i18n
│       ├── pages/                # Páginas principales
│       ├── services/             # Servicios API
│       └── utils/                # Utilidades
│
└── techstore-backend/              # Backend API
    └── src/
        ├── controllers/           # Controladores
        ├── models/               # Modelos MongoDB
        ├── routes/               # Rutas API
        ├── middleware/           # Middleware
        ├── utils/                # Utilidades
        └── config/               # Configuración
```

## 🎯 Funcionalidades por Módulo

### 🛍️ E-commerce
- [x] Catálogo de productos con categorías
- [x] Búsqueda y filtros avanzados
- [x] Carrito de compras persistente
- [x] Proceso de checkout completo
- [x] Gestión de inventario
- [x] Cálculo de envío y impuestos

### 👥 Usuarios
- [x] Registro y login
- [x] Verificación de email
- [x] Recuperación de contraseña
- [x] Perfiles editables
- [x] Historial de pedidos
- [x] Sistema de roles

### 💰 Pagos
- [x] Transfermóvil (simulado)
- [x] Enzona (simulado)
- [x] Transferencias bancarias cubanas
- [x] Stripe (internacional)
- [x] Estados de pago
- [x] Reembolsos y cancelaciones

### ⭐ Reseñas
- [x] Crear y editar reseñas
- [x] Sistema de calificaciones (1-5 estrellas)
- [x] Marcar como útil
- [x] Reportar reseñas inapropiadas
- [x] Moderación administrativa
- [x] Estadísticas de reseñas

### 💬 Chat de Soporte
- [x] Chat en tiempo real con Socket.IO
- [x] Asignación de agentes
- [x] Indicadores de escritura
- [x] Historial de conversaciones
- [x] Calificación de satisfacción
- [x] Panel administrativo

### 🌐 Internacional
- [x] Soporte para 4 idiomas
- [x] Traducción completa
- [x] SEO multiidioma
- [x] Detección automática de idioma
- [x] URLs localizadas

### 📱 PWA
- [x] Service Worker para cache
- [x] Instalación en dispositivos
- [x] Funcionamiento offline
- [x] Push notifications
- [x] Background sync
- [x] App shortcuts

## 🔐 Seguridad

- **Autenticación JWT** con expiración
- **Encriptación bcrypt** para contraseñas
- **Validación** de entrada en frontend y backend
- **Rate limiting** para prevenir ataques
- **Helmet.js** para headers de seguridad
- **CORS** configurado correctamente
- **Sanitización** de datos de entrada

## 📈 Rendimiento

- **Lazy loading** de componentes React
- **Optimización de imágenes**
- **Compresión gzip** en el servidor
- **Cache** con Service Worker
- **Paginación** de productos y reseñas
- **Índices MongoDB** optimizados

## 🧪 Testing

```bash
# Frontend
cd store
npm test

# Backend
cd techstore-backend
npm test
```

## 🚀 Despliegue

### Producción con Docker
```bash
# Construir imágenes
docker-compose build

# Ejecutar en producción
docker-compose up -d
```

### Despliegue manual
1. **Backend**: Heroku, DigitalOcean, AWS
2. **Frontend**: Netlify, Vercel, GitHub Pages
3. **Base de datos**: MongoDB Atlas, mLab

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**TechStore Cuba Team**
- Website: [https://techstore.cu](https://techstore.cu)
- Email: info@techstore.cu
- GitHub: [@techstore-cuba](https://github.com/techstore-cuba)

## 🙏 Agradecimientos

- [Material-UI](https://mui.com/) por los componentes
- [React](https://reactjs.org/) por el framework
- [Node.js](https://nodejs.org/) por el runtime
- [MongoDB](https://www.mongodb.com/) por la base de datos
- [Socket.IO](https://socket.io/) por WebSockets
- Comunidad open source por las librerías

---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!** ⭐

📧 **¿Preguntas? Contacta con nosotros en info@techstore.cu**

🚀 **¡Contribuciones bienvenidas!**