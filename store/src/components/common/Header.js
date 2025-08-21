import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Brightness4,
  Brightness7,
  Language,
  Menu as MenuIcon,
  Home,
  Computer,
  Laptop,
  Phone,
  Extension,
  AdminPanelSettings,
  Login,
  PersonAdd
} from '@mui/icons-material';
import SearchBar from './SearchBar';
import NotificationCenter from './NotificationCenter';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    handleLanguageMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  const navigationItems = [
    { text: t('nav.home'), icon: <Home />, path: '/' },
    { text: t('categories.desktop'), icon: <Computer />, path: '/products/desktop' },
    { text: t('categories.laptop'), icon: <Laptop />, path: '/products/laptop' },
    { text: t('categories.phone'), icon: <Phone />, path: '/products/phone' },
    { text: t('categories.accessories'), icon: <Extension />, path: '/products/accessories' }
  ];

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {navigationItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                toggleMobileDrawer();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          {isAdmin && (
            <ListItem
              button
              onClick={() => {
                navigate('/admin');
                toggleMobileDrawer();
              }}
            >
              <ListItemIcon><AdminPanelSettings /></ListItemIcon>
              <ListItemText primary={t('nav.admin')} />
            </ListItem>
          )}
          
          {!isAuthenticated && (
            <>
              <ListItem
                button
                onClick={() => {
                  navigate('/login');
                  toggleMobileDrawer();
                }}
              >
                <ListItemIcon><Login /></ListItemIcon>
                <ListItemText primary={t('nav.login')} />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  navigate('/register');
                  toggleMobileDrawer();
                }}
              >
                <ListItemIcon><PersonAdd /></ListItemIcon>
                <ListItemText primary={t('nav.register')} />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            TechStore Cuba
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ textTransform: 'none' }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Barra de búsqueda */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 300, mr: 2 }}>
              <SearchBar placeholder="Buscar productos..." />
            </Box>

            {/* Selector de idioma */}
            <IconButton
              color="inherit"
              onClick={handleLanguageMenuOpen}
              title={t('common.language')}
            >
              <Language />
            </IconButton>

            {/* Toggle modo oscuro */}
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              title={t('common.darkMode')}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Centro de notificaciones */}
            <NotificationCenter />

            {/* Carrito */}
            <IconButton
              color="inherit"
              component={Link}
              to="/cart"
              title={t('nav.cart')}
            >
              <Badge badgeContent={getCartItemsCount()} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Menú de usuario */}
            {isAuthenticated ? (
              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                title={user?.firstName}
              >
                <AccountCircle />
              </IconButton>
            ) : (
              !isMobile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    sx={{ textTransform: 'none' }}
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/register"
                    sx={{ textTransform: 'none' }}
                  >
                    {t('nav.register')}
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menú de idiomas */}
      <Menu
        anchorEl={languageAnchorEl}
        open={Boolean(languageAnchorEl)}
        onClose={handleLanguageMenuClose}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={i18n.language === lang.code}
          >
            {lang.flag} {lang.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Menú de perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          {t('nav.profile')}
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
            {t('nav.admin')}
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          {t('nav.logout')}
        </MenuItem>
      </Menu>

      <MobileDrawer />
    </>
  );
};

export default Header;