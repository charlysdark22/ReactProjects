import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Rating,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  Add,
  Remove
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      toast.success(`${product.name} añadido al carrito`);
    }
  };

  const handleBuyNow = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryColor = (category) => {
    const colors = {
      desktop: 'primary',
      laptop: 'secondary',
      phone: 'success',
      accessories: 'warning'
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Producto no encontrado
        </Alert>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper elevation={2} sx={{ overflow: 'hidden' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 500,
                  objectFit: 'cover'
                }}
              />
            </Paper>
          </Box>
        </Grid>

        {/* Información del producto */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Breadcrumb y categoría */}
            <Box sx={{ mb: 2 }}>
              <Chip
                label={t(`categories.${product.category}`)}
                color={getCategoryColor(product.category)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={product.brand}
                variant="outlined"
                size="small"
              />
            </Box>

            {/* Título */}
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            {/* Rating (simulado) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                (128 reseñas)
              </Typography>
            </Box>

            {/* Precio */}
            <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
              {formatPrice(product.price)}
            </Typography>

            {/* Stock */}
            <Box sx={{ mb: 3 }}>
              {product.stock > 0 ? (
                <Chip
                  label={`${product.stock} en stock`}
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label={t('product.outOfStock')}
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Descripción corta */}
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            {/* Controles de cantidad */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Cantidad:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    if (val >= 1 && val <= product.stock) {
                      setQuantity(val);
                    }
                  }}
                  size="small"
                  sx={{ width: 80, mx: 1, textAlign: 'center' }}
                  inputProps={{ min: 1, max: product.stock, style: { textAlign: 'center' } }}
                />
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ flex: 1 }}
              >
                {t('product.addToCart')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                sx={{ flex: 1 }}
              >
                {t('product.buyNow')}
              </Button>
            </Box>

            {/* Botones secundarios */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setIsFavorite(!isFavorite)}
                color={isFavorite ? 'error' : 'default'}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton
                onClick={() => {
                  navigator.share?.({
                    title: product.name,
                    text: product.description,
                    url: window.location.href
                  }) || toast.info('Función de compartir no disponible');
                }}
              >
                <Share />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs con información adicional */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Especificaciones" />
          <Tab label="Descripción" />
          <Tab label="Reseñas" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Especificaciones Técnicas
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Typography>
                        <Typography variant="body2">
                          {value}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Descripción Detallada
                </Typography>
                <Typography variant="body1">
                  {product.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {selectedTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reseñas de Clientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Las reseñas estarán disponibles próximamente.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;