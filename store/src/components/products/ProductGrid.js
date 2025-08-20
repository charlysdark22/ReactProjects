import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { productService } from '../../services/productService';

const ProductGrid = ({ category, searchQuery }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadProducts();
  }, [category]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, localSearchQuery, sortBy, filterBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (category) {
        data = await productService.getProductsByCategory(category);
      } else {
        data = await productService.getAllProducts();
      }
      
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (localSearchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    }

    // Filtrar por disponibilidad
    if (filterBy === 'inStock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (filterBy === 'outOfStock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const getBrands = () => {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands;
  };

  const getTitle = () => {
    if (category) {
      return t(`categories.${category}`);
    }
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }
    return 'Todos los Productos';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Título y estadísticas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredProducts.length} productos encontrados
        </Typography>
      </Box>

      {/* Controles de búsqueda y filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t('common.search')}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('common.sort')}</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={t('common.sort')}
              >
                <MenuItem value="name">Nombre A-Z</MenuItem>
                <MenuItem value="price-low">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price-high">Precio: Mayor a Menor</MenuItem>
                <MenuItem value="brand">Marca</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('common.filter')}</InputLabel>
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                label={t('common.filter')}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="inStock">En Stock</MenuItem>
                <MenuItem value="outOfStock">Agotado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {getBrands().slice(0, 3).map((brand) => (
                <Chip
                  key={brand}
                  label={brand}
                  variant="outlined"
                  size="small"
                  clickable
                  onClick={() => setLocalSearchQuery(brand)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Grid de productos */}
      {filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta ajustar los filtros o términos de búsqueda
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductGrid;