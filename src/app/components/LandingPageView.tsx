
'use client';
import { Box } from '@mui/material';

import StartButton from '@/app/components/StartButton';
import FeaturesGrid from '@/app/components/FeaturesGrid';
import AnimatedTitle from '@/app/components/AnimatedTitle';
import AnimatedIntro from '@/app/components/AnimatedIntro';


export default function LandingPageView() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f5e6d3',
        overflow: 'hidden',
      }}
    >
      {/* Left Side - Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 4, sm: 6, md: 8, lg: 10 },
          py: { xs: 4, sm: 6, md: 8 },
          justifyContent: 'center',
          maxWidth: { md: '50%' },
        }}
      >
        {/* Title */}
        <AnimatedTitle />

        {/* Introduction */}
        <AnimatedIntro />

        {/* START Button */}
        <StartButton />
      </Box>

      {/* Right Side - Features Grid */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'primary.main',
          position: 'relative',
          overflow: 'hidden',
          px: { md: 4, lg: 6 },
          py: { md: 4, lg: 6 },
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 193, 94, 0.2)',
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 193, 94, 0.15)',
            filter: 'blur(50px)',
          }}
        />

        {/* Features Grid */}
        <FeaturesGrid />
      </Box>
    </Box>
  );
}