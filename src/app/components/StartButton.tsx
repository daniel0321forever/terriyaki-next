'use client';

import { Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StartButton() {
  const router = useRouter();

  const handleStart = async () => {
    router.push(`/login`);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mt: 4,
      }}
    >
      {/* Left circle dot */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.4, ease: 'easeOut' }}
      >
        <Box
          sx={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#000000',
            flexShrink: 0,
          }}
        />
      </motion.div>

      {/* Horizontal line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
        style={{ 
          width: '60px', 
          height: '2px', 
          backgroundColor: '#000000', 
          transformOrigin: 'left',
          flexShrink: 0,
        }}
      />

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.5, ease: 'easeOut' }}
      >
        <Button
          variant="contained"
          onClick={handleStart}
          sx={{
            bgcolor: 'rgba(79, 79, 79, 0.86)',
            color: 'white',
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            fontWeight: 700,
            px: { xs: 5, sm: 6 },
            py: { xs: 1.5, sm: 2 },
            borderRadius: '25px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
            '&:hover': {
              bgcolor: 'rgba(60, 60, 60, 0.95)',
              boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          START
        </Button>
      </motion.div>
    </Box>
  );
}

