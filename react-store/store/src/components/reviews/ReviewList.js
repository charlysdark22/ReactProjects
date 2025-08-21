import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-toastify';

const ReviewList = ({ productId, showForm = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId, sortBy, filterRating, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        product: productId,
        page,
        limit: 10
      };

      if (sortBy === 'helpful') {
        params.sort = 'helpful';
      } else if (sortBy === 'rating-high') {
        params.sort = 'rating-high';
      } else if (sortBy === 'rating-low') {
        params.sort = 'rating-low';
      }

      if (filterRating !== 'all') {
        params.rating = filterRating;
      }

      const response = await reviewService.getReviews(params);
      setReviews(response.data);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      setError(error.message);
      toast.error('Error cargando reseñas');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reviewService.getReviewStats(productId);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    loadStats(); // Refresh stats
    toast.success('¡Gracias por tu reseña!');
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev => 
      prev.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      )
    );
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(prev => prev.filter(review => review._id !== reviewId));
    loadStats(); // Refresh stats
  };

  const getRatingPercentage = (rating) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingDistribution[rating] / stats.totalReviews) * 100);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Review Form */}
      {showForm && (
        <ReviewForm 
          productId={productId} 
          onReviewAdded={handleReviewAdded}
        />
      )}

      {/* Review Stats */}
      {stats && (
        <Box sx={{ mb: 3, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Reseñas de Clientes
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
              {stats.averageRating}
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                de 5 estrellas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalReviews} reseñas
              </Typography>
            </Box>
          </Box>

          {/* Rating Distribution */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>
                  {rating}★
                </Typography>
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    height: 8, 
                    bgcolor: 'grey.200', 
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      height: '100%', 
                      bgcolor: 'primary.main',
                      width: `${getRatingPercentage(rating)}%`,
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 40 }}>
                  {getRatingPercentage(rating)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Filters and Sorting */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FilterList />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Ordenar por"
          >
            <MenuItem value="newest">Más recientes</MenuItem>
            <MenuItem value="helpful">Más útiles</MenuItem>
            <MenuItem value="rating-high">Calificación: Alta a Baja</MenuItem>
            <MenuItem value="rating-low">Calificación: Baja a Alta</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filtrar</InputLabel>
          <Select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            label="Filtrar"
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="5">5 estrellas</MenuItem>
            <MenuItem value="4">4 estrellas</MenuItem>
            <MenuItem value="3">3 estrellas</MenuItem>
            <MenuItem value="2">2 estrellas</MenuItem>
            <MenuItem value="1">1 estrella</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Reviews List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No hay reseñas aún
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sé el primero en escribir una reseña para este producto
          </Typography>
        </Box>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onUpdate={handleReviewUpdated}
              onDelete={handleReviewDeleted}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ReviewList;