import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  useTheme
} from '@mui/material';
import {
  Computer,
  Laptop,
  Phone,
  Extension,
  LocalShipping,
  Security,
  SupportAgent,
  Payment
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FeaturedProducts from '../components/products/FeaturedProducts';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const categories = [
    {
      key: 'desktop',
      icon: <Computer sx={{ fontSize: 60 }} />,
      path: '/products/desktop',
      color: theme.palette.primary.main
    },
    {
      key: 'laptop',
      icon: <Laptop sx={{ fontSize: 60 }} />,
      path: '/products/laptop',
      color: theme.palette.secondary.main
    },
    {
      key: 'phone',
      icon: <Phone sx={{ fontSize: 60 }} />,
      path: '/products/phone',
      color: theme.palette.success.main
    },
    {
      key: 'accessories',
      icon: <Extension sx={{ fontSize: 60 }} />,
      path: '/products/accessories',
      color: theme.palette.warning.main
    }
  ];

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: 'Envío Gratuito',
      description: 'Envío gratuito en pedidos superiores a $100'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Compra Segura',
      description: 'Transacciones 100% seguras con encriptación'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      title: 'Soporte 24/7',
      description: 'Atención al cliente disponible las 24 horas'
    },
    {
      icon: <Payment sx={{ fontSize: 40 }} />,
      title: 'Pagos Locales',
      description: 'Transfermóvil, Enzona y bancos cubanos'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                {t('hero.title')}
              </Typography>
              <Typography variant="h5" paragraph>
                {t('hero.subtitle')}
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
                {t('hero.description')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/products')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                {t('hero.shopNow')}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300
                }}
              >
                <img
                  src="https://via.placeholder.com/400x300?text=TechStore+Cuba"
                  alt="TechStore Cuba"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: theme.shape.borderRadius
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Categorías */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Nuestras Categorías
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Explora nuestra amplia gama de productos tecnológicos
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.key}>
                <Card
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => navigate(category.path)}
                >
                  <CardContent sx={{ py: 4 }}>
                    <Box sx={{ color: category.color, mb: 2 }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {t(`categories.${category.key}`)}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(category.path);
                      }}
                    >
                      Ver Productos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Características */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            ¿Por qué elegir TechStore Cuba?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Productos destacados */}
        <FeaturedProducts />

        {/* Call to Action */}
        <Box sx={{ mb: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
              color: 'white'
            }}
          >
            <Typography variant="h4" gutterBottom>
              ¿Listo para comprar?
            </Typography>
            <Typography variant="body1" paragraph>
              Explora nuestro catálogo completo y encuentra la tecnología que necesitas
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Ver Todos los Productos
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;