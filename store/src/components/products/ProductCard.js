import {
  ShoppingCart,
  Visibility,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} añadido al carrito`);
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.id}`);
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={handleViewProduct}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Chip de categoría */}
        <Chip
          label={t(`categories.${product.category}`)}
          color={getCategoryColor(product.category)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8
          }}
        />

        {/* Estado de stock */}
        {product.stock <= 0 && (
          <Chip
            label={t('product.outOfStock')}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8
            }}
          />
        )}

        {/* Botón de favoritos */}
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' }
          }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar funcionalidad de favoritos
            toast.info('Funcionalidad de favoritos próximamente');
          }}
        >
          <FavoriteBorder />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description
          }
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Marca:
          </Typography>
          <Chip label={product.brand} size="small" variant="outlined" />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatPrice(product.price)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Stock: {product.stock}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Visibility />}
          onClick={handleViewProduct}
          sx={{ mr: 1 }}
        >
          Ver Detalles
        </Button>
        
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? 'Agotado' : 'Añadir'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;