'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StartButton() {
  const router = useRouter();

  const handleStart = async () => {
    router.push(`/login`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
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
  );
}

