import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Flag,
  MoreVert,
  Edit,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-toastify';

const ReviewCard = ({ review, onUpdate, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.count || 0);
  const [reportDialog, setReportDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: review.title,
    comment: review.comment,
    rating: review.rating
  });

  const isOwner = user?.id === review.user?._id;
  const canEdit = isOwner || user?.role === 'admin';

  const handleHelpful = async () => {
    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para marcar como útil');
      return;
    }

    try {
      if (helpful) {
        await reviewService.unmarkHelpful(review._id);
        setHelpful(false);
        setHelpfulCount(prev => prev - 1);
      } else {
        await reviewService.markHelpful(review._id);
        setHelpful(true);
        setHelpfulCount(prev => prev + 1);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReport = async () => {
    try {
      await reviewService.reportReview(review._id);
      toast.success('Reseña reportada exitosamente');
      setReportDialog(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = async () => {
    try {
      const updatedReview = await reviewService.updateReview(review._id, editForm);
      toast.success('Reseña actualizada exitosamente');
      setEditDialog(false);
      if (onUpdate) {
        onUpdate(updatedReview);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta reseña?')) {
      try {
        await reviewService.deleteReview(review._id);
        toast.success('Reseña eliminada exitosamente');
        if (onDelete) {
          onDelete(review._id);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              src={review.user?.avatar}
              alt={`${review.user?.firstName} ${review.user?.lastName}`}
              sx={{ mr: 2 }}
            >
              {review.user?.firstName?.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {review.user?.firstName} {review.user?.lastName}
                </Typography>
                {review.verified && (
                  <Chip
                    label="Compra verificada"
                    size="small"
                    color="success"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {formatDate(review.createdAt)}
                </Typography>
              </Box>
            </Box>

            {canEdit && (
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            )}
          </Box>

          {/* Content */}
          <Typography variant="h6" gutterBottom>
            {review.title}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {review.comment}
          </Typography>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={helpful ? <ThumbUp /> : <ThumbUpOutlined />}
                onClick={handleHelpful}
                color={helpful ? 'primary' : 'inherit'}
              >
                Útil ({helpfulCount})
              </Button>
              
              <Button
                size="small"
                startIcon={<Flag />}
                onClick={() => setReportDialog(true)}
                color="inherit"
              >
                Reportar
              </Button>
            </Box>

            {canEdit && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => setEditDialog(true)}>
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={handleDelete} color="error">
                  <Delete />
                </IconButton>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)}>
        <DialogTitle>Reportar Reseña</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres reportar esta reseña? 
            Nuestro equipo la revisará y tomará las medidas apropiadas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancelar</Button>
          <Button onClick={handleReport} color="error" variant="contained">
            Reportar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Reseña</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Calificación
            </Typography>
            <Rating
              value={editForm.rating}
              onChange={(e, newValue) => setEditForm({ ...editForm, rating: newValue })}
              size="large"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Título"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Comentario"
              value={editForm.comment}
              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
              multiline
              rows={4}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEdit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewCard;