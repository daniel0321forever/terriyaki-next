'use client';

import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AnimatedTitle() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '3.5rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem' },
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'rgb(0, 0, 0)',
          mb: 3,
          lineHeight: 1.1,
        }}
      >
        TERRIYAKI
      </Typography>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '3.5rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem' },
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'rgb(0, 0, 0)',
          mb: 3,
          lineHeight: 1.1,
        }}
      >
        TERRIYAKI
      </Typography>
    </motion.div>
  );
}

