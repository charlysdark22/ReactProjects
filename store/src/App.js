import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ChatWidget from './components/chat/ChatWidget';
import SEOHead from './components/common/SEOHead';

// Pages - Lazy loading para mejor rendimiento
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Internationalization
import './locales/i18n';

// PWA Utils
import { initializePWA } from './utils/pwaUtils';

const LoadingSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh'
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
  }, []);

  return (
    <HelmetProvider>
      <CustomThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <SEOHead />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh'
                }}
              >
                <Header />
                
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Rutas públicas */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:category" element={<ProductsPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      
                      {/* Rutas protegidas */}
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      
                      {/* Rutas de administrador */}
                      <Route path="/admin/*" element={<AdminDashboard />} />
                      
                      {/* Ruta 404 - TODO: Crear página 404 */}
                      <Route path="*" element={<div>Página no encontrada</div>} />
                    </Routes>
                  </Suspense>
                </Box>
                
                <Footer />
                
                {/* Chat Widget */}
                <ChatWidget />
                
                {/* Toast notifications */}
                <ToastContainer
                  position="bottom-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </Box>
            </Router>
          </CartProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </HelmetProvider>
  );
}

export default App;