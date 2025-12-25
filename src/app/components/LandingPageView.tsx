
'use client';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

import StartButton from '@/app/components/StartButton';
import FeaturesGrid from '@/app/components/FeaturesGrid';
import AnimatedTitle from '@/app/components/AnimatedTitle';
import AnimatedIntro from '@/app/components/AnimatedIntro';


export default function LandingPageView() {
  const connectionLineLeft = { xs: '6px', sm: '16px', md: '26px', lg: '46px' };
  const connectionDotLeft = { xs: '0px', sm: '10px', md: '20px', lg: '40px' };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        overflow: 'hidden',
        py: { xs: 4, sm: 6, md: 8, lg: 10 },
        position: 'relative',
      }}
    >

      {/* Vertical line at right end with margin */}
      <Box
        component={motion.div}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        sx={{
          position: 'absolute',
          right: { xs: '16px', sm: '24px', md: '32px', lg: '48px' },
          top: 0,
          height: '90%',
          width: '2px',
          backgroundColor: '#000000',
          transformOrigin: 'top',
          zIndex: 1,
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Main vertical connecting line - spans all sections (now on the left) */}
        <Box
          component={motion.div}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          sx={{
            position: 'absolute',
            left: connectionLineLeft,
            top: 0,
            height: '60%',
            width: '2px',
            backgroundColor: '#000000',
            transformOrigin: 'top',
            zIndex: 1,
          }}
        />

        {/* Title Section */}
        <AnimatedTitle />

        {/* Intro Box - aligned to left, with vertical line and dot on the left */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            position: 'relative',
            mt: 4,
            mb: 3,
            pl: { xs: 2, sm: 4, md: 6, lg: 8 },
          }}
        >
          {/* Circle dot for intro connection */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8, ease: 'easeOut' }}
            sx={{
              position: 'absolute',
              left: connectionDotLeft,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              zIndex: 2,
            }}
          />
          <Box
            sx={{
              maxWidth: '60%',
              textAlign: 'left',
              marginLeft: { xs: '24px', sm: '44px', md: '64px', lg: '84px' }, // Offset to accommodate the line/dot
            }}
          >
            <AnimatedIntro />
          </Box>
        </Box>

        {/* START Button Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            ml: '9%',
            position: 'relative',
            gap: 1,
          }}
        >
          {/* Features Section */}
          <FeaturesGrid />
          <StartButton />
        </Box>
      </Box>
    </Box>
  );
}