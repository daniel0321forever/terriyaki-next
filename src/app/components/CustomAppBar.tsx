'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/service/auth.service';
import { UserStoreState, useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';
import MessageIcon from './MessageIcon';
import { Grind } from '@/types/grind.types';
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
    router.push('/');
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
              '& svg': {
                fontSize: '2.5rem',
              },
            }}
          >
            <AccountCircleIcon />
          </Box>
        </Box>

        {/* Account Menu */}
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              alignItems: 'center',
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <Typography>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <Typography sx={{ color: 'error.main' }}>Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
