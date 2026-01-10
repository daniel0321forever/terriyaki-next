'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/service/auth.service';
import { UserStoreState, useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';
import MessageIcon from './MessageIcon';
import { User } from '@/types/user.types';

interface AppBarProps {
  title?: string;
  onHomeClick?: () => void;
}

const CustomAppBar: React.FC<AppBarProps> = ({ onHomeClick }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setUser = useUserStore((state) => state.setUser);
  const setGrinds = useGrindStore((state) => state.setGrinds);

  const currentUser: User | null = useUserStore((state: UserStoreState) => state.user);

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      router.push('/');
    }
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    router.push('/profile');
  };

  const handlePaymentClick = () => {
    handleMenuClose();
    router.push('/payment');
  };

  const handleLogoutClick = async () => {
    handleMenuClose();
    try {
      await logout();
      setUser(null);
      setGrinds({});
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      setGrinds({});
      router.push('/login');
    }
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: 'none',
        zIndex: 1000,
        height: '60px', 
      }}
    >
      <Toolbar sx={{ alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left side - Home button */}
        <Box
          onClick={handleHomeClick}
          aria-label="home"
          sx={{
            color: 'black',
            cursor: 'pointer',
            '&:hover': {
              color: 'grey.500',
            },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transition: 'all 0.2s ease-in-out',
            '& svg': {
              fontSize: '2.2rem',
            },
          }}
        >
          <HomeIcon />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.3rem' }}>TERRIYAKI</Typography>
        </Box>

        {/* Right side - Message and Account buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Message button */}
          <MessageIcon />

          {/* Account button */}
          <Box
            onClick={handleAccountClick}
            aria-label="account"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{
              color: 'black',
              cursor: 'pointer',
              '&:hover': {
                color: 'grey.500',
              },
              transition: 'all 0.2s ease-in-out',
              '& svg, & .MuiAvatar-root': {
                fontSize: '2.5rem',
                width: '2.5rem',
                height: '2.5rem',
              },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {currentUser && currentUser.avatar && currentUser.avatar !== 'none' && currentUser.avatar.trim() !== '' ? (
              <Avatar
                alt={currentUser.username}
                src={currentUser.avatar}
                sx={{ width: '2.5rem', height: '2.5rem', bgcolor: 'grey.200', fontSize: '1.3rem' }}
              />
            ) : (
              <AccountCircleIcon />
            )}
          </Box>
        </Box>

        {/* Account Menu */}
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 1,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                gap: 1.5,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&:first-of-type': {
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                },
                '&:last-of-type': {
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                },
              },
              '& .MuiDivider-root': {
                mx: 1,
                my: 0.5,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircleIcon sx={{ fontSize: '1.25rem', color: 'text.secondary' }} />
            <Typography>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handlePaymentClick}>
            <CreditCardIcon sx={{ fontSize: '1.25rem', color: 'text.secondary' }} />
            <Typography>Payment</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick}>
            <Typography sx={{ color: 'error.main', fontWeight: 500 }}>Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
