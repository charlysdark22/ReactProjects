import { Container, Grid, Box, useTheme, useMediaQuery } from '@mui/material';
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

import AdvancedFilters from '../components/products/AdvancedFilters';
import ProductGrid from '../components/products/ProductGrid';

const ProductsPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Extraer query de búsqueda de los parámetros de URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Filtros laterales */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <AdvancedFilters />
            </Box>
          </Grid>
        )}
        
        {/* Grid de productos */}
        <Grid item xs={12} md={9}>
          <ProductGrid category={category} searchQuery={searchQuery} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductsPage;