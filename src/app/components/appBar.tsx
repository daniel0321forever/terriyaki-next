'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface AppBarProps {
  title?: string;
}

const CustomAppBar: React.FC<AppBarProps> = () => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleAccountClick = () => {
    // You can customize this to navigate to account page or show account menu
    console.log('Account button clicked');
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: 'background.default',
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
            '&:hover': {
              color: 'grey.500',
            },
            transition: 'all 0.2s ease-in-out',
            '& svg': {
              fontSize: '2.2rem',
            },
          }}
        >
          <HomeIcon />
        </Box>

        {/* Right side - Account button */}
        <Box
          onClick={handleAccountClick}
          aria-label="account"
          sx={{
            color: 'black',
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
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
