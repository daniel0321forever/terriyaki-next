'use client';

import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function AnimatedTitle() {
  return (
    <Box
      sx={{
        position: 'relative',
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >

      {/* Horizontal line - left */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        style={{ 
          flex: 1, 
          maxWidth: '100px',
          height: '4px', 
          backgroundColor: '#000000', 
          transformOrigin: 'left' 
        }}
      />

      {/* Left circle dot */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Box
          sx={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#000000',
            flexShrink: 0,
          }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
        style={{ flexShrink: 0 }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '3.0rem', sm: '4.0rem', md: '5.0rem', lg: '6.0rem' },
            fontFamily: 'Inter',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'rgb(0, 0, 0)',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            mx: 2,
          }}
        >
          TERRIYAKI
        </Typography>
      </motion.div>

      {/* Right circle dot */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Box
          sx={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#000000',
            flexShrink: 0,
          }}
        />
      </motion.div>

      {/* Horizontal line - right */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        style={{ 
          flex: 1, 
          height: '4px', 
          backgroundColor: '#000000', 
          transformOrigin: 'right' 
        }}
      />


    </Box>
  );
}

