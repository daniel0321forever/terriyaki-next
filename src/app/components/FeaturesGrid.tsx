'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Code, TrendingUp, Users, Target } from 'lucide-react';

const features = [
  {
    icon: <Code size={40} color="#FFC15E" />,
    title: 'Daily Challenges',
    description: 'Track your LeetCode and GRE progress with daily tasks',
  },
  {
    icon: <TrendingUp size={40} color="#FFC15E" />,
    title: 'Progress Tracking',
    description: 'Visualize your improvement with detailed analytics',
  },
  {
    icon: <Users size={40} color="#FFC15E" />,
    title: 'Social Grinding',
    description: 'Compete with friends and stay accountable together',
  },
  {
    icon: <Target size={40} color="#FFC15E" />,
    title: 'Stay Motivated',
    description: 'Build consistency with streaks and achievements',
  },
];

export default function FeaturesGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        width: '100%',
        maxWidth: '600px',
        zIndex: 1,
      }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <Box>{feature.icon}</Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'rgb(0, 0, 0)',
              }}
            >
              {feature.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.95rem',
                color: 'rgb(116, 116, 116)',
                lineHeight: 1.5,
              }}
            >
              {feature.description}
            </Typography>
          </Box>
        </motion.div>
      ))}
    </motion.div>
  );
}

