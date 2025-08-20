import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  ShoppingBag,
  Receipt
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const orders = await paymentService.getOrderHistory(user.id);
      setUserOrders(orders);
    } catch (error) {
      toast.error('Error al cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // En una aplicación real, aquí llamarías a un servicio para actualizar el perfil
      toast.success('Perfil actualizado exitosamente');
      setEditing(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CU');
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      transfermovil: 'Transfermóvil',
      enzona: 'Enzona',
      bank_transfer: 'Transferencia Bancaria'
    };
    return methods[method] || method;
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Debes iniciar sesión para ver tu perfil
          </Typography>
          <Button variant="contained" href="/login">
            Iniciar Sesión
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Información del perfil */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={user.role === 'admin' ? 'Administrador' : 'Usuario'}
                color={user.role === 'admin' ? 'secondary' : 'primary'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Información de Contacto
              </Typography>
              <Typography variant="body2">
                <strong>Teléfono:</strong> {user.phone}
              </Typography>
              <Typography variant="body2">
                <strong>Dirección:</strong> {user.address}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
              disabled={editing}
            >
              Editar Perfil
            </Button>
          </Paper>
        </Grid>

        {/* Contenido principal */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Información Personal" />
              <Tab label="Historial de Pedidos" />
            </Tabs>

            {/* Tab 1: Información Personal */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellidos"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!editing}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>

                {editing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditing(false);
                        setProfileData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 2: Historial de Pedidos */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Historial de Pedidos
                </Typography>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userOrders.length === 0 ? (
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <ShoppingBag sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No hay pedidos aún
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cuando realices tu primera compra, aparecerá aquí
                      </Typography>
                      <Button
                        variant="contained"
                        href="/products"
                        sx={{ mt: 2 }}
                      >
                        Explorar Productos
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID Transacción</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Método</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">
                                {order.transactionId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(order.date)}
                            </TableCell>
                            <TableCell>
                              {getPaymentMethodText(order.method)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {formatPrice(order.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(order.status)}
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;