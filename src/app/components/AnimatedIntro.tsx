'use client';

import { Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function AnimatedIntro() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
          lineHeight: 1.7,
          color: 'rgb(116, 116, 116)',
          mb: 5,
          fontWeight: 400,
          maxWidth: '90%',
        }}
      >
        Your daily coding challenge tracker. Stay motivated, track your progress, 
        and level up your skills one problem at a time. Join a community of 
        dedicated learners grinding towards their goals.
      </Typography>
    </motion.div>
  );
}

