import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme
} from '@mui/material';
import {
  Home,
  Search,
  ShoppingCart,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions = [
    {
      icon: <Home />,
      title: 'Ir al Inicio',
      description: 'Volver a la página principal',
      action: () => navigate('/'),
      color: 'primary'
    },
    {
      icon: <Search />,
      title: 'Buscar Productos',
      description: 'Explorar nuestro catálogo',
      action: () => navigate('/products'),
      color: 'secondary'
    },
    {
      icon: <ShoppingCart />,
      title: 'Ver Carrito',
      description: 'Revisar tus productos',
      action: () => navigate('/cart'),
      color: 'success'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        {/* Ilustración 404 */}
        <Box
          sx={{
            fontSize: '120px',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          404
        </Box>

        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          ¡Ups! Página no encontrada
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
          La página que buscas no existe o ha sido movida.
          <br />
          No te preocupes, te ayudamos a encontrar lo que necesitas.
        </Typography>

        {/* Botón principal */}
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 6, px: 4, py: 1.5, textTransform: 'none' }}
        >
          Volver Atrás
        </Button>

        {/* Acciones rápidas */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Acciones Rápidas
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mt: 3
          }}>
            {quickActions.map((action, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                    borderColor: `${action.color}.main`
                  }
                }}
                onClick={action.action}
              >
                <Box
                  sx={{
                    color: `${action.color}.main`,
                    mb: 2,
                    '& svg': { fontSize: 48 }
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Información adicional */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            ¿Necesitas ayuda? Nuestro equipo de soporte está disponible 24/7.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/contact')}
              sx={{ textTransform: 'none' }}
            >
              Contactar Soporte
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/help')}
              sx={{ textTransform: 'none' }}
            >
              Centro de Ayuda
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;