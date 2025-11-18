'use client';

import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { BookOpen, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { Task } from '@/types/task.types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { MOCK_GRINDS } from '@/data/mockData';

const taskIcons: Record<'LeetCode' | 'GRE', React.ReactNode> = {
  'LeetCode': <Code size={100} color="rgba(250, 199, 111, 0.86)" />,
  'GRE': <BookOpen size={100} color="rgba(250, 199, 111, 0.86)" />,
}

function StartButton({ onStart }: { onStart: () => void }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button
        variant="contained"
        size="large"
        sx={{
          bgcolor: 'rgba(79, 79, 79, 0.86)',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 700,
          px: '20px',
          py: '10px',
          borderRadius: '22px',
          border: 'none',
          '&:hover': {
            bgcolor: 'rgba(60,60,60,0.95)',
          },
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
        onClick={onStart}
      >
        START
      </Button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        display: "inline-block",
        borderRadius: "25px",
        background: "rgba(79, 79, 79, 0.86)",
        padding: "4px",
      }}
      suppressHydrationWarning
    >
      <Button
        variant="contained"
        size="large"
        sx={{
          bgcolor: 'transparent',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 700,
          px: '20px',
          py: '10px',
          borderRadius: '22px',
          border: 'none',
          position: 'relative',
          zIndex: 2,
          '&:hover': {
            bgcolor: 'rgba(60,60,60,0.95)',
          },
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          transition: 'background 0.3s',
        }}
        onClick={onStart}
      >
        START
      </Button>
    </motion.div>
  )
}

function TaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Box 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, cursor: 'pointer' }}
        onClick={onClick}
      >
        <Box>
          {taskIcons[task.type]}
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'grey.700', 
            fontWeight: 400,
            fontSize: '1.1rem',
            textAlign: 'center'
          }}
        >
          {task.title}
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, cursor: 'pointer' }}
      suppressHydrationWarning
      onClick={onClick}
    >
      <Box>
        {taskIcons[task.type]}
      </Box>
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'grey.700', 
          fontWeight: 400,
          fontSize: '1.1rem',
          textAlign: 'center'
        }}
      >
        {task.title}
      </Typography>
    </motion.div>
  );
}

export default function TodayGrind() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tasks = MOCK_GRINDS.map((grind) => grind.taskToday);

  const handleStartTask = () => {
    router.push('/task');
  };

  const handleTaskClick = () => {
    router.push('/task');
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5e6d3', // beige/tan background
        padding: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
      suppressHydrationWarning
    > 
      {/* Main content */}
      <Box sx={{ textAlign: 'center', zIndex: 1 }}>
        {/* TODAY TASK Header */}
        {isMounted ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            suppressHydrationWarning
          >
            <Typography 
              variant="h1" 
              sx={{ 
                color: '#FFC15E', // yellow/orange color
                fontSize: { xs: '3.5rem', md: '6rem' },
                fontWeight: 650,
                mb: '40px',
              }}
            >
              TODAY
            </Typography>
          </motion.div>
        ) : (
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#FFC15E', // yellow/orange color
              fontSize: { xs: '3.5rem', md: '6rem' },
              fontWeight: 650,
              mb: '40px',
            }}
          >
            TODAY
          </Typography>
        )}
        
        {/* Task Cards */}
        <Box sx={{ display: 'flex', gap: 6, mb: 6, justifyContent: 'center' }}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onClick={handleTaskClick} />
          ))}
        </Box>
        
        {/* Start Button */}
        <StartButton onStart={handleStartTask}/>
      </Box>
    </Box>
  );
} 