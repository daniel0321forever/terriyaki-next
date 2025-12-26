'use client';

import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, Users, Sparkles } from 'lucide-react'; // Import necessary icons

export default function AnimatedIntro() {
  // Define the intro items, each with an icon and label
  const introItems = [
    {
      icon: <Sparkles size={22} color="rgb(234,179,8)" style={{ marginRight: 10 }} />,
      label: (
        <>
          <b>AI-powered reviewing</b> to clarify your solutions
        </>
      ),
    },
    {
      icon: <Users size={22} color="rgb(0,147,17)" style={{ marginRight: 10 }} />,
      label: (
        <>
          <b>Grinding</b> together with your friends
        </>
      ),
    },
    // You can add more items here if needed
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Big Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: 'spring', bounce: 0.45 }}
        >
          <Brain size={46} color="#000" style={{ background: "rgba(249,237,209,0.65)", borderRadius: '50%', padding: '8px', boxShadow: '0 1px 6px #ffeeba22' }} />
        </motion.div>
      </Box>
      {/* Subtitle */}
      <Typography
        variant="h5"
        sx={{
          fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2.1rem' },
          fontFamily: 'Inter',
          fontWeight: 600,
          color: '#232323',
          lineHeight: 1.15,
          mb: 3.5,
          letterSpacing: '-0.01em',
        }}
      >
        Let's do LeetCode together
      </Typography>

      {/* Introduction, now with icons for each item */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mt: 0.5,
          mb: 1,
        }}
      >
        {introItems.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Icon on left */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '1.00rem', sm: '1.06rem', md: '1.13rem' },
                lineHeight: 1.7,
                color: 'rgb(116, 116, 116)',
                fontWeight: 400,
                maxWidth: '100%',
              }}
              component="span"
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  );
}

