import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Fab,
  Zoom,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAppState } from '../../store/AppStateManager';

const DRAWER_WIDTH = 240;
const BOTTOM_NAV_HEIGHT = 56;

const ResponsiveLayout = ({ children }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppState();
  
  const [selectedNav, setSelectedNav] = useState(0);

  // قائمة عناصر القائمة الجانبية
  const menuItems = useMemo(() => [
    { text: t('nav.home'), icon: <HomeIcon />, path: '/' },
    { text: t('nav.forms'), icon: <ListAltIcon />, path: '/forms' },
    { text: t('nav.newForm'), icon: <AddIcon />, path: '/forms/new' },
    { text: t('nav.settings'), icon: <SettingsIcon />, path: '/settings' }
  ], [t]); // t is a dependency because it can change if the language changes

  // Find the index of the currently active menu item
  const getSelectedNavIndex = useCallback(() => {
    const currentPath = location.pathname;
    const index = menuItems.findIndex(item => 
      item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)
    );
    return index !== -1 ? index : 0;
  }, [location.pathname, menuItems]);
  
  // Initialize with the correct active index
  useEffect(() => {
    setSelectedNav(getSelectedNavIndex());
  }, [getSelectedNavIndex]);

  // التحكم في ظهور زر العودة للأعلى
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation
  const handleNavigation = (path, index) => {
    setSelectedNav(index);
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  // محتوى القائمة الجانبية
  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {t('app.title')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path, index)}
            selected={selectedNav === index}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: selectedNav === index ? 'primary.main' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                color: selectedNav === index ? 'primary.main' : 'inherit'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // زر العودة للأعلى
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mr: { sm: `${DRAWER_WIDTH}px` },
          ...(state.settings.direction === 'rtl' && {
            mr: { sm: 0 },
            ml: { sm: `${DRAWER_WIDTH}px` }
          })
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {t('app.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <SwipeableDrawer
            variant="temporary"
            anchor={state.settings.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH
              }
            }}
          >
            {drawer}
          </SwipeableDrawer>
        ) : (
          <Drawer
            variant="permanent"
            anchor={state.settings.direction === 'rtl' ? 'right' : 'left'}
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH
              }
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mb: isMobile ? `${BOTTOM_NAV_HEIGHT}px` : 0
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>

        {/* زر العودة للأعلى */}
        <Zoom in={showScrollTop}>
          <Fab
            color="primary"
            size="small"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: isMobile ? BOTTOM_NAV_HEIGHT + 16 : 16,
              right: 16,
              ...(state.settings.direction === 'rtl' && {
                right: 'auto',
                left: 16
              })
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Zoom>

        {/* شريط التنقل السفلي للموبايل */}
        {isMobile && (
          <BottomNavigation
            value={selectedNav}
            onChange={(event, newValue) => {
              setSelectedNav(newValue);
              navigate(menuItems[newValue].path);
            }}
            sx={{
              width: '100%',
              position: 'fixed',
              bottom: 0,
              borderTop: 1,
              borderColor: 'divider',
              height: BOTTOM_NAV_HEIGHT,
              zIndex: theme.zIndex.appBar
            }}
          >
            {menuItems.map((item, index) => (
              <BottomNavigationAction
                key={item.text}
                label={item.text}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        )}
      </Box>
    </Box>
  );
};

export default ResponsiveLayout; 