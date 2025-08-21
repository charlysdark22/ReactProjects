import {
  Notifications,
  LocalOffer,
  Payment,
  LocalShipping,
  CheckCircle,
  Info
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const checkForNewNotifications = useCallback(() => {
    // Simular nuevas notificaciones
    const random = Math.random();
    if (random < 0.1) { // 10% de probabilidad
      addNotification({
        type: 'promo',
        title: 'Nueva Oferta',
        message: 'Descuentos especiales en accesorios gaming',
        icon: <LocalOffer color="warning" />
      });
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Simular notificaciones en tiempo real
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [checkForNewNotifications]);

  const loadNotifications = () => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    } else {
      // Notificaciones iniciales de ejemplo
      const initialNotifications = [
        {
          id: 1,
          type: 'order',
          title: 'Pedido Confirmado',
          message: 'Tu pedido #12345 ha sido confirmado y está siendo procesado',
          timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
          read: false,
          icon: <CheckCircle color="success" />
        },
        {
          id: 2,
          type: 'promo',
          title: 'Oferta Especial',
          message: '20% de descuento en laptops gaming. ¡Válido hasta mañana!',
          timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
          read: false,
          icon: <LocalOffer color="warning" />
        },
        {
          id: 3,
          type: 'shipping',
          title: 'Envío en Camino',
          message: 'Tu pedido #12345 ha sido enviado. Llegará en 2-3 días',
          timestamp: new Date(Date.now() - 10800000), // 3 horas atrás
          read: true,
          icon: <LocalShipping color="info" />
        }
      ];
      
      setNotifications(initialNotifications);
      setUnreadCount(2);
      localStorage.setItem('notifications', JSON.stringify(initialNotifications));
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
      read: false
    };
    
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    setUnreadCount(prev => prev + 1);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    setNotifications(updated);
    setUnreadCount(prev => Math.max(0, prev - 1));
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'order':
        navigate('/profile?tab=orders');
        break;
      case 'shipping':
        navigate('/profile?tab=orders');
        break;
      case 'promo':
        navigate('/products');
        break;
      case 'payment':
        navigate('/profile?tab=payments');
        break;
      default:
        break;
    }
    
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <CheckCircle color="success" />;
      case 'promo':
        return <LocalOffer color="warning" />;
      case 'shipping':
        return <LocalShipping color="info" />;
      case 'payment':
        return <Payment color="primary" />;
      default:
        return <Info color="action" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return timestamp.toLocaleDateString();
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'success.main';
      case 'promo':
        return 'warning.main';
      case 'shipping':
        return 'info.main';
      case 'payment':
        return 'primary.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Notificaciones</Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Marcar todas como leídas
              </Button>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: notification.read ? 'grey.300' : getNotificationColor(notification.type),
                        color: 'white'
                      }}
                    >
                      {notification.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? 'normal' : 'bold',
                          color: notification.read ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        ml: 1
                      }}
                    />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                navigate('/profile?tab=notifications');
                handleMenuClose();
              }}
              sx={{ textTransform: 'none' }}
            >
              Ver Todas las Notificaciones
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationCenter;