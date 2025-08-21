import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Información de la empresa */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              TechStore Cuba
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              La mejor tienda de tecnología en Cuba. Computadoras, laptops, teléfonos y accesorios de las mejores marcas.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="primary" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="primary" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="primary" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Categorías */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('nav.products')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products/desktop" color="inherit" underline="hover">
                {t('categories.desktop')}
              </Link>
              <Link href="/products/laptop" color="inherit" underline="hover">
                {t('categories.laptop')}
              </Link>
              <Link href="/products/phone" color="inherit" underline="hover">
                {t('categories.phone')}
              </Link>
              <Link href="/products/accessories" color="inherit" underline="hover">
                {t('categories.accessories')}
              </Link>
            </Box>
          </Grid>

          {/* Enlaces útiles */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              Enlaces Útiles
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/about" color="inherit" underline="hover">
                Sobre Nosotros
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contacto
              </Link>
              <Link href="/shipping" color="inherit" underline="hover">
                Envíos
              </Link>
              <Link href="/warranty" color="inherit" underline="hover">
                Garantía
              </Link>
              <Link href="/privacy" color="inherit" underline="hover">
                Política de Privacidad
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Términos y Condiciones
              </Link>
            </Box>
          </Grid>

          {/* Información de contacto */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" fontSize="small" />
                <Typography variant="body2">
                  La Habana, Cuba
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="primary" fontSize="small" />
                <Typography variant="body2">
                  +53 5555 5555
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" fontSize="small" />
                <Typography variant="body2">
                  info@techstore.cu
                </Typography>
              </Box>
            </Box>

            {/* Métodos de pago */}
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              Métodos de Pago
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                • Transfermóvil
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Enzona
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • BANDEC
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • BPA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Banco Metropolitano
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2024 TechStore Cuba. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Desarrollado con ❤️ en Cuba
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;