/**
 * 🇿🇼 Nyuchi Platform - Dashboard Layout
 * Shopify-inspired admin interface with Nyuchi branding
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Business as DirectoryIcon,
  Article as ContentIcon,
  EmojiEvents as UbuntuIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  Logout as LogoutIcon,
  FlightTakeoff as TravelIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useTheme as useAppTheme } from '../../components/ThemeProvider';
import { nyuchiColors } from '../../theme/zimbabwe-theme';

const DRAWER_WIDTH = 240;

const navigation = [
  { name: 'Home', href: '/dashboard', icon: DashboardIcon },
  { name: 'Directory', href: '/dashboard/directory', icon: DirectoryIcon },
  { name: 'Travel', href: '/dashboard/travel', icon: TravelIcon },
  { name: 'Content', href: '/dashboard/content', icon: ContentIcon },
  { name: 'Ubuntu', href: '/dashboard/ubuntu', icon: UbuntuIcon },
  { name: 'Admin', href: '/dashboard/admin', icon: AdminIcon, adminOnly: true },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const { toggleMode, mode } = useAppTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const pathname = usePathname();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut();
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push('/dashboard/settings');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: nyuchiColors.charcoal }}>
      {/* Logo Section - Clickable */}
      <Box
        component={Link}
        href="/dashboard"
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textDecoration: 'none',
          '&:hover': { opacity: 0.9 },
        }}
      >
        {/* Zimbabwe Flag Strip */}
        <Box
          sx={{
            width: '4px',
            height: '32px',
            background: `linear-gradient(to bottom,
              ${nyuchiColors.zimbabweGreen} 0%,
              ${nyuchiColors.zimbabweGreen} 14.28%,
              ${nyuchiColors.zimbabweYellow} 14.28%,
              ${nyuchiColors.zimbabweYellow} 28.56%,
              ${nyuchiColors.zimbabweRed} 28.56%,
              ${nyuchiColors.zimbabweRed} 42.84%,
              ${nyuchiColors.zimbabweBlack} 42.84%,
              ${nyuchiColors.zimbabweBlack} 57.12%,
              ${nyuchiColors.zimbabweRed} 57.12%,
              ${nyuchiColors.zimbabweRed} 71.4%,
              ${nyuchiColors.zimbabweYellow} 71.4%,
              ${nyuchiColors.zimbabweYellow} 85.68%,
              ${nyuchiColors.zimbabweGreen} 85.68%,
              ${nyuchiColors.zimbabweGreen} 100%
            )`,
            borderRadius: 0.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            color: nyuchiColors.white,
            letterSpacing: '0.5px',
          }}
        >
          Nyuchi
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navigation.map((item) => {
          if (item.adminOnly && user.role !== 'admin') {
            return null;
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 1,
                  color: isActive ? nyuchiColors.white : 'rgba(255,255,255,0.7)',
                  bgcolor: isActive ? nyuchiColors.sunsetOrange : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? nyuchiColors.sunsetOrange : 'rgba(255,255,255,0.05)',
                  },
                  py: 1.25,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Ubuntu Score Card */}
      {user.ubuntu_score !== undefined && (
        <Box
          sx={{
            m: 2,
            p: 2,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5 }}>
            Ubuntu Score
          </Typography>
          <Typography variant="h5" sx={{ color: nyuchiColors.white, fontWeight: 700 }}>
            {user.ubuntu_score}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={toggleMode}
              size="small"
              sx={{ color: 'text.secondary' }}
              title="Toggle theme"
            >
              {mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                <LightIcon fontSize="small" />
              ) : (
                <DarkIcon fontSize="small" />
              )}
            </IconButton>

            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {user.full_name || user.email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role || 'User'}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                src={user.avatar_url || undefined}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: nyuchiColors.sunsetOrange,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { mt: 1, minWidth: 200 },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role || 'User'}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile & Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
