import {
  ShoppingCart,
  Payment,
  CheckCircle,
  CreditCard,
  AccountBalance,
  Phone
} from '@mui/icons-material';
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { paymentService } from '../services/paymentService';


const CheckoutPage = () => {
  const { t } = useTranslation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('transfermovil');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Formularios
  const [shippingData, setShippingData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [paymentData, setPaymentData] = useState({
    // Transfermóvil
    phoneNumber: '',
    // Enzona
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    // Transferencia bancaria
    bank: '',
    accountNumber: ''
  });

  const steps = [
    'Información de Envío',
    'Método de Pago',
    'Confirmación'
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar datos de envío
      if (!shippingData.firstName || !shippingData.lastName || !shippingData.address || !shippingData.phone) {
        toast.error('Por favor completa todos los campos obligatorios');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Validar datos de pago según el método
      if (paymentMethod === 'transfermovil' && !paymentData.phoneNumber) {
        toast.error('Ingresa tu número de teléfono para Transfermóvil');
        return;
      }
      if (paymentMethod === 'enzona' && (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv)) {
        toast.error('Completa todos los datos de la tarjeta');
        return;
      }
      if (paymentMethod === 'bank_transfer' && (!paymentData.bank || !paymentData.accountNumber)) {
        toast.error('Completa los datos bancarios');
        return;
      }
    }

    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      const orderData = {
        amount: getCartTotal(),
        items: cartItems,
        userId: user.id,
        shippingAddress: shippingData,
        ...paymentData
      };

      let result;
      
      switch (paymentMethod) {
        case 'transfermovil':
          result = await paymentService.processTransfermovil(orderData);
          break;
        case 'enzona':
          result = await paymentService.processEnzona(orderData);
          break;
        case 'bank_transfer':
          orderData.bank = paymentData.bank;
          result = await paymentService.processBankTransfer(orderData);
          break;
        default:
          throw new Error('Método de pago no válido');
      }

      if (result.success) {
        setTransactionId(result.transactionId);
        setOrderComplete(true);
        clearCart();
        toast.success(result.message);
        setActiveStep(activeStep + 1);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirigir si no hay items en el carrito
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartItems, orderComplete, navigate]);

  const renderShippingForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Nombre"
          value={shippingData.firstName}
          onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Apellidos"
          value={shippingData.lastName}
          onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Dirección"
          value={shippingData.address}
          onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Teléfono"
          value={shippingData.phone}
          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Email"
          type="email"
          value={shippingData.email}
          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
        />
      </Grid>
    </Grid>
  );

  const renderPaymentForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('payment.selectMethod')}
      </Typography>
      
      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        sx={{ mb: 3 }}
      >
        <FormControlLabel
          value="transfermovil"
          control={<Radio />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ mr: 1 }} />
              {t('payment.transfermovil')}
            </Box>
          }
        />
        <FormControlLabel
          value="enzona"
          control={<Radio />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CreditCard sx={{ mr: 1 }} />
              {t('payment.enzona')}
            </Box>
          }
        />
        <FormControlLabel
          value="bank_transfer"
          control={<Radio />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ mr: 1 }} />
              {t('payment.bankTransfer')}
            </Box>
          }
        />
      </RadioGroup>

      {/* Formularios específicos por método de pago */}
      {paymentMethod === 'transfermovil' && (
        <TextField
          fullWidth
          label="Número de teléfono"
          placeholder="5XXXXXXX"
          value={paymentData.phoneNumber}
          onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
          helperText="Ingresa tu número de Transfermóvil (8 dígitos)"
        />
      )}

      {paymentMethod === 'enzona' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('payment.cardNumber')}
              value={paymentData.cardNumber}
              onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
              placeholder="1234 5678 9012 3456"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('payment.expiryDate')}
              value={paymentData.expiryDate}
              onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
              placeholder="MM/YY"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('payment.cvv')}
              value={paymentData.cvv}
              onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
              placeholder="123"
            />
          </Grid>
        </Grid>
      )}

      {paymentMethod === 'bank_transfer' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Banco</InputLabel>
              <Select
                value={paymentData.bank}
                onChange={(e) => setPaymentData({ ...paymentData, bank: e.target.value })}
              >
                <MenuItem value="bandec">{t('payment.banks.bandec')}</MenuItem>
                <MenuItem value="bpa">{t('payment.banks.bpa')}</MenuItem>
                <MenuItem value="metropolitano">{t('payment.banks.metropolitano')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Número de cuenta"
              value={paymentData.accountNumber}
              onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderOrderSummary = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Resumen del Pedido
      </Typography>
      
      {cartItems.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            {item.name} x {item.quantity}
          </Typography>
          <Typography variant="body2">
            {formatPrice(item.price * item.quantity)}
          </Typography>
        </Box>
      ))}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6" color="primary">
          {formatPrice(getCartTotal())}
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Información de Envío
          </Typography>
          <Typography variant="body2">
            {shippingData.firstName} {shippingData.lastName}
          </Typography>
          <Typography variant="body2">
            {shippingData.address}
          </Typography>
          <Typography variant="body2">
            {shippingData.phone}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  const renderOrderComplete = () => (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        ¡Pedido Completado!
      </Typography>
      <Typography variant="body1" paragraph>
        Tu pedido ha sido procesado exitosamente.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        ID de Transacción: {transactionId}
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/profile')}
        sx={{ mr: 2 }}
      >
        Ver Mis Pedidos
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
      >
        Volver al Inicio
      </Button>
    </Box>
  );

  if (orderComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {renderOrderComplete()}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Finalizar Compra
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={2} sx={{ p: 3 }}>
        {activeStep === 0 && renderShippingForm()}
        {activeStep === 1 && renderPaymentForm()}
        {activeStep === 2 && renderOrderSummary()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Atrás
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handlePlaceOrder}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
            >
              {loading ? t('payment.processing') : t('payment.payNow')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Siguiente
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutPage;