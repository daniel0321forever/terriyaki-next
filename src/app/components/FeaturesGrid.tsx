'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Code, TrendingUp, Users, Target } from 'lucide-react';

const features = [
  {
    icon: Code,
    title: 'Daily Challenges',
    intro: 'Consistent practice builds expertise',
    color: 'rgb(246, 177, 18)', // Moderate blue
    backgroundColor: 'rgb(249, 237, 209)',
  },
  {
    icon: TrendingUp,
    title: 'Mocking Interviews',
    intro: 'Practice your skills with mock interviews',
    color: 'rgb(0, 147, 17)', // Moderate green
    backgroundColor: 'rgb(225, 249, 209)',
  },
  {
    icon: Users,
    title: 'Social Grinding',
    intro: 'Learn together, grow together',
    color: 'rgb(0, 57, 127)', // Moderate purple
    backgroundColor: 'rgb(205, 231, 234)',
  },
  {
    icon: Target,
    title: 'Stay Motivated',
    intro: 'Achieve your goals with focus',
    color: 'rgb(234, 179, 8)', // Moderate orange
    backgroundColor: 'rgb(255, 243, 209)',
  },
];

export default function FeaturesGrid() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
      }}
    >
      {/* Features list - connected in one thread */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          mt: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {features.map((feature, index) => {
          const isLast = index === features.length - 1;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.8 + index * 0.15, 
                ease: 'easeOut' 
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Connecting line before title (except for first item) */}
              {index > 0 && (
                <Box
                  sx={{
                    width: { xs: '20px', sm: '40px' },
                    height: '1px',
                    backgroundColor: '#000000',
                  }}
                />
              )}

              {/* Colored title */}
              <Box
                sx={{
                  backgroundColor: feature.backgroundColor,
                  padding: 1.5,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    fontWeight: 600,
                    color: feature.color,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {feature.title}
                </Typography>
              </Box>

              {/* Connecting line after title (except for last item) */}
              {!isLast && (
                <Box
                  sx={{
                    width: { xs: '20px', sm: '40px' },
                    height: '1px',
                    backgroundColor: '#000000',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}

