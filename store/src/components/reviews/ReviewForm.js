import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-toastify';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(-1);

  const ratingLabels = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para escribir una reseña');
      return;
    }

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const reviewData = {
        title: title.trim(),
        comment: comment.trim(),
        rating,
        product: productId
      };

      const newReview = await reviewService.createReview(reviewData);
      toast.success('Reseña enviada exitosamente');
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Alert severity="info">
          <Typography variant="body1">
            Debes iniciar sesión para escribir una reseña
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Escribir una reseña
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Calificación *
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              onChangeActive={(event, newHover) => setHover(newHover)}
              size="large"
              emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            {rating !== null && (
              <Typography variant="body2" color="text.secondary">
                {ratingLabels[hover !== -1 ? hover : rating]}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Title */}
        <TextField
          fullWidth
          label="Título de la reseña *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          placeholder="Resumen de tu experiencia"
          inputProps={{ maxLength: 100 }}
          helperText={`${title.length}/100 caracteres`}
        />

        {/* Comment */}
        <TextField
          fullWidth
          label="Comentario *"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={4}
          margin="normal"
          placeholder="Cuéntanos más sobre tu experiencia con este producto..."
          inputProps={{ maxLength: 1000 }}
          helperText={`${comment.length}/1000 caracteres`}
        />

        {/* Submit Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || rating === 0 || !title.trim() || !comment.trim()}
            size="large"
          >
            {loading ? 'Enviando...' : 'Publicar Reseña'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewForm;