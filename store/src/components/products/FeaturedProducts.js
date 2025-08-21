import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    loadFeaturedProducts();
    loadFavorites();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      // Seleccionar productos destacados (con mejor stock, precio, etc.)
      const featured = allProducts
        .filter(product => product.stock > 0)
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 8);
      
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const toggleFavorite = (productId) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === Math.ceil(featuredProducts.length / (isMobile ? 1 : 3)) - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(featuredProducts.length / (isMobile ? 1 : 3)) - 1 : prev - 1
    );
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const getVisibleProducts = () => {
    const itemsPerSlide = isMobile ? 1 : 3;
    const startIndex = currentSlide * itemsPerSlide;
    return featuredProducts.slice(startIndex, startIndex + itemsPerSlide);
  };

  const totalSlides = Math.ceil(featuredProducts.length / (isMobile ? 1 : 3));

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h2" fontWeight="bold">
          Productos Destacados
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/products')}
          sx={{ textTransform: 'none' }}
        >
          Ver Todos
        </Button>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {/* Carrusel */}
        <Box sx={{ overflow: 'hidden' }}>
          <Grid container spacing={3}>
            {getVisibleProducts().map((product) => (
              <Grid item xs={12} md={4} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    position: 'relative'
                  }}
                >
                  {/* Badge de descuento */}
                  {product.discount && (
                    <Chip
                      label={`-${product.discount}%`}
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 1,
                        fontWeight: 'bold'
                      }}
                    />
                  )}

                  {/* Botón de favorito */}
                  <IconButton
                    onClick={() => toggleFavorite(product.id)}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      }
                    }}
                  >
                    {favorites.includes(product.id) ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  />

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {product.description.substring(0, 80)}...
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ color: 'warning.main', fontSize: 20, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.rating || 4.5} ({product.reviews || 12})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${product.price}
                      </Typography>
                      {product.oldPrice && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${product.oldPrice}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        fullWidth
                        disabled={product.stock === 0}
                        sx={{ textTransform: 'none' }}
                      >
                        {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Stock: {product.stock}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.brand}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Controles de navegación */}
        {totalSlides > 1 && (
          <>
            <IconButton
              onClick={prevSlide}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={nextSlide}
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}
      </Box>

      {/* Indicadores de diapositiva */}
      {totalSlides > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {Array.from({ length: totalSlides }, (_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? 'primary.main' : 'grey.300',
                margin: '0 4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: currentSlide === index ? 'primary.dark' : 'grey.400',
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FeaturedProducts;