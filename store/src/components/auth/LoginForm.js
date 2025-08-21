import { yupResolver } from '@hookform/resolvers/yup';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import { useAuth } from '../../context/AuthContext';


const schema = yup.object().shape({
  email: yup
    .string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida')
});

const LoginForm = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.login')}
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" paragraph>
          Accede a tu cuenta para continuar comprando
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              t('auth.login')
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ display: 'block', mb: 2 }}
            >
              {t('auth.forgotPassword')}
            </Link>

            <Typography variant="body2">
              {t('auth.noAccount')}{' '}
              <Link component={RouterLink} to="/register">
                {t('auth.register')}
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Cuentas de demostración */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cuentas de demostración:
          </Typography>
          <Typography variant="caption" display="block">
            <strong>Admin:</strong> admin@techstore.cu / admin123
          </Typography>
          <Typography variant="caption" display="block">
            <strong>Usuario:</strong> user@example.com / user123
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;