import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Alert
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCartCheckout,
  ShoppingBag
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { t } = useTranslation();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.info('Producto eliminado del carrito');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} eliminado del carrito`);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('cart.empty')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Agrega algunos productos increíbles a tu carrito
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            sx={{ mt: 2 }}
          >
            {t('cart.continueShopping')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('cart.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Items del carrito */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {cartItems.map((item, index) => (
              <Box key={item.id}>
                <Card elevation={0} sx={{ display: 'flex', p: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'cover' }}
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.brand}
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mt: 1 }}>
                          {formatPrice(item.price)}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      {/* Control de cantidad */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          size="small"
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleQuantityChange(item.id, value);
                          }}
                          size="small"
                          sx={{ width: 60, mx: 1 }}
                          inputProps={{ 
                            min: 1, 
                            max: item.stock,
                            style: { textAlign: 'center' }
                          }}
                        />
                        <IconButton
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          size="small"
                          disabled={item.quantity >= item.stock}
                        >
                          <Add />
                        </IconButton>
                      </Box>

                      {/* Subtotal */}
                      <Typography variant="h6" color="primary">
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                {index < cartItems.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Resumen del pedido */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">
                Subtotal:
              </Typography>
              <Typography variant="body1">
                {formatPrice(getCartTotal())}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Envío:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gratis
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Impuestos:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incluidos
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                {t('cart.total')}:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(getCartTotal())}
              </Typography>
            </Box>

            {!isAuthenticated && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Debes iniciar sesión para continuar con la compra
                </Typography>
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={handleCheckout}
              sx={{ mb: 2 }}
            >
              {t('cart.checkout')}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/products"
            >
              {t('cart.continueShopping')}
            </Button>

            <Button
              fullWidth
              variant="text"
              color="error"
              onClick={() => {
                clearCart();
                toast.success('Carrito vaciado');
              }}
              sx={{ mt: 1 }}
            >
              Vaciar Carrito
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;