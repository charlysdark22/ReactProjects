import React from 'react';
import { Container } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import ProductGrid from '../components/products/ProductGrid';

const ProductsPage = () => {
  const { category } = useParams();
  const location = useLocation();
  
  // Extraer query de búsqueda de los parámetros de URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ProductGrid category={category} searchQuery={searchQuery} />
    </Container>
  );
};

export default ProductsPage;