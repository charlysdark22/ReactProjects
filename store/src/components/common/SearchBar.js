import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  useTheme
} from '@mui/material';
import {
  Search,
  Clear,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService';

const SearchBar = ({ onSearch, placeholder, fullWidth = false, showSuggestions = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Simular búsquedas populares
    setTrendingSearches([
      'iPhone', 'MacBook', 'Gaming PC', 'SSD', 'RAM', 'Monitor'
    ]);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const generateSuggestions = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(filtered);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) return;
    
    // Guardar en búsquedas recientes
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    // Navegar a la página de productos con la búsqueda
    navigate(`/products?search=${encodeURIComponent(query)}`);
    
    // Limpiar y ocultar sugerencias
    setSearchQuery('');
    setShowSuggestionsList(false);
    
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.id) {
      // Es un producto específico
      navigate(`/product/${suggestion.id}`);
    } else {
      // Es una búsqueda por texto
      handleSearch(suggestion);
    }
    setShowSuggestionsList(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestionsList(false);
  };

  const toggleSuggestions = () => {
    setShowSuggestionsList(!showSuggestionsList);
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        fullWidth={fullWidth}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setShowSuggestionsList(true)}
        placeholder={placeholder || t('common.search')}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <Clear />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }
        }}
      />

      {showSuggestions && showSuggestionsList && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
                Búsquedas recientes
              </Typography>
              <List dense>
                {recentSearches.map((search, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(search)}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.300' }}>
                        <Search sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Búsquedas populares */}
          {trendingSearches.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
                <TrendingUp sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Búsquedas populares
              </Typography>
              <List dense>
                {trendingSearches.map((search, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(search)}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                        <TrendingUp sx={{ fontSize: 16, color: 'white' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Sugerencias de productos */}
          {suggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
                Productos sugeridos
              </Typography>
              <List dense>
                {suggestions.map((product) => (
                  <ListItem
                    key={product.id}
                    button
                    onClick={() => handleSuggestionClick(product)}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={product.image}
                        sx={{ width: 32, height: 32 }}
                      >
                        {product.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.brand} - $${product.price}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Mensaje cuando no hay sugerencias */}
          {suggestions.length === 0 && recentSearches.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Escribe para buscar productos
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;