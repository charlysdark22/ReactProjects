import {
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  Payment,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  AttachMoney,
  ShoppingBag
} from '@mui/icons-material';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { productService } from '../services/productService';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  // Estados para el diálogo de productos
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'desktop',
    price: '',
    brand: '',
    description: '',
    stock: '',
    image: '',
    specifications: {}
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [isAdmin, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData, statsData] = await Promise.all([
        productService.getAllProducts(),
        paymentService.getAllOrders(),
        paymentService.getPaymentStats()
      ]);
      
      setProducts(productsData);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
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

  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productForm);
        toast.success('Producto actualizado');
      } else {
        await productService.addProduct(productForm);
        toast.success('Producto creado');
      }
      
      setProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'desktop',
        price: '',
        brand: '',
        description: '',
        stock: '',
        image: '',
        specifications: {}
      });
      
      loadDashboardData();
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      brand: product.brand,
      description: product.description,
      stock: product.stock.toString(),
      image: product.image,
      specifications: product.specifications || {}
    });
    setProductDialog(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productService.deleteProduct(productId);
        toast.success('Producto eliminado');
        loadDashboardData();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await paymentService.updateOrderStatus(orderId, status);
      toast.success('Estado actualizado');
      loadDashboardData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder al panel de administración
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin.dashboard')}
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<Dashboard />} label="Dashboard" />
        <Tab icon={<Inventory />} label="Productos" />
        <Tab icon={<ShoppingCart />} label="Pedidos" />
        <Tab icon={<Payment />} label="Pagos" />
      </Tabs>

      {/* Tab 0: Dashboard Overview */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {/* Tarjetas de estadísticas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Ingresos Totales
                    </Typography>
                    <Typography variant="h5">
                      {formatPrice(stats?.totalRevenue || 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingBag color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Pedidos
                    </Typography>
                    <Typography variant="h5">
                      {stats?.totalOrders || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Productos
                    </Typography>
                    <Typography variant="h5">
                      {products.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Pedidos Completados
                    </Typography>
                    <Typography variant="h5">
                      {stats?.statusStats?.completed || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Métodos de pago */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Métodos de Pago
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Transfermóvil:</Typography>
                  <Typography>{stats?.methodStats?.transfermovil || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Enzona:</Typography>
                  <Typography>{stats?.methodStats?.enzona || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Transferencia Bancaria:</Typography>
                  <Typography>{stats?.methodStats?.bank_transfer || 0}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Estados de pedidos */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Estados de Pedidos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Completados:</Typography>
                  <Chip label={stats?.statusStats?.completed || 0} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Pendientes:</Typography>
                  <Chip label={stats?.statusStats?.pending || 0} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Fallidos:</Typography>
                  <Chip label={stats?.statusStats?.failed || 0} color="error" size="small" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Gestión de Productos */}
      {selectedTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              Gestión de Productos
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setProductDialog(true)}
            >
              Añadir Producto
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        color={product.stock > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditProduct(product)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteProduct(product.id)}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 2: Gestión de Pedidos */}
      {selectedTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Gestión de Pedidos
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.transactionId}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.method}</TableCell>
                    <TableCell>{formatPrice(order.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <MenuItem value="pending">Pendiente</MenuItem>
                          <MenuItem value="completed">Completado</MenuItem>
                          <MenuItem value="failed">Fallido</MenuItem>
                          <MenuItem value="cancelled">Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 3: Estadísticas de Pagos */}
      {selectedTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Estadísticas de Pagos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="body1">
                  Panel de estadísticas de pagos detalladas - Próximamente
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Diálogo para añadir/editar producto */}
      <Dialog
        open={productDialog}
        onClose={() => setProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <MenuItem value="desktop">Computadoras</MenuItem>
                  <MenuItem value="laptop">Laptops</MenuItem>
                  <MenuItem value="phone">Teléfonos</MenuItem>
                  <MenuItem value="accessories">Accesorios</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marca"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL de Imagen"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleProductSubmit}
            variant="contained"
          >
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;