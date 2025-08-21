import React, { useState, useEffect } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  Button,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  Clear,
  PriceCheck
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  products 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [localFilters, setLocalFilters] = useState({
    priceRange: [0, 5000],
    brands: [],
    categories: [],
    inStock: false,
    onSale: false,
    rating: 0
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);

  useEffect(() => {
    if (products && products.length > 0) {
      // Extraer marcas únicas
      const brands = [...new Set(products.map(p => p.brand))].sort();
      setAvailableBrands(brands);
      
      // Extraer categorías únicas
      const categories = [...new Set(products.map(p => p.category))].sort();
      setAvailableCategories(categories);
      
      // Encontrar precio máximo
      const max = Math.max(...products.map(p => p.price));
      setMaxPrice(max);
      
      // Actualizar rango de precios
      setLocalFilters(prev => ({
        ...prev,
        priceRange: [0, max]
      }));
    }
  }, [products]);

  useEffect(() => {
    if (filters) {
      setLocalFilters(prev => ({ ...prev, ...filters }));
    }
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...localFilters };
    
    if (filterType === 'brands') {
      if (newFilters.brands.includes(value)) {
        newFilters.brands = newFilters.brands.filter(b => b !== value);
      } else {
        newFilters.brands = [...newFilters.brands, value];
      }
    } else if (filterType === 'categories') {
      if (newFilters.categories.includes(value)) {
        newFilters.categories = newFilters.categories.filter(c => c !== value);
      } else {
        newFilters.categories = [...newFilters.categories, value];
      }
    } else {
      newFilters[filterType] = value;
    }
    
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (event, newValue) => {
    const newFilters = { ...localFilters, priceRange: newValue };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      priceRange: [0, maxPrice],
      brands: [],
      categories: [],
      inStock: false,
      onSale: false,
      rating: 0
    };
    
    setLocalFilters(clearedFilters);
    onClearFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.brands.length > 0) count += localFilters.brands.length;
    if (localFilters.categories.length > 0) count += localFilters.categories.length;
    if (localFilters.inStock) count++;
    if (localFilters.onSale) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < maxPrice) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3">
          Filtros Avanzados
        </Typography>
        {activeFiltersCount > 0 && (
          <Chip
            label={activeFiltersCount}
            color="primary"
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Rango de Precios</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>
              ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
            </Typography>
            <Slider
              value={localFilters.priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              step={50}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField
                label="Min"
                type="number"
                value={localFilters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [
                  parseInt(e.target.value) || 0,
                  localFilters.priceRange[1]
                ])}
                size="small"
                sx={{ width: '50%' }}
              />
              <TextField
                label="Max"
                type="number"
                value={localFilters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [
                  localFilters.priceRange[0],
                  parseInt(e.target.value) || maxPrice
                ])}
                size="small"
                sx={{ width: '50%' }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Marcas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {availableBrands.map((brand) => (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={localFilters.brands.includes(brand)}
                    onChange={() => handleFilterChange('brands', brand)}
                    size="small"
                  />
                }
                label={brand}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Categorías</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {availableCategories.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={localFilters.categories.includes(category)}
                    onChange={() => handleFilterChange('categories', category)}
                    size="small"
                  />
                }
                label={t(`categories.${category}`)}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Disponibilidad</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  size="small"
                />
              }
              label="Solo en stock"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.onSale}
                  onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                  size="small"
                />
              }
              label="En oferta"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Calificación</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>
              Mínimo: {localFilters.rating} estrellas
            </Typography>
            <Slider
              value={localFilters.rating}
              onChange={(e, value) => handleFilterChange('rating', value)}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: '0' },
                { value: 2.5, label: '2.5' },
                { value: 5, label: '5' }
              ]}
              sx={{ mt: 2 }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClearFilters}
          fullWidth
          disabled={activeFiltersCount === 0}
        >
          Limpiar Filtros
        </Button>
      </Box>
    </Box>
  );
};

export default AdvancedFilters;