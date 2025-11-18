'use client';
import { Box } from '@mui/material';
import { DayProgress } from '@/types/grind.types';

interface ProgressGridProps {
  progress: DayProgress[];
}

export default function ProgressGrid({ progress }: ProgressGridProps) {
  const getStatusColor = (status: DayProgress['status']) => {
    switch (status) {
      case 'completed':
        return '#C6F27A'; // Light green
      case 'missed':
        return '#F2B07A'; // Orange
      case 'upcoming':
        return '#DDDDDD'; // Light gray
      default:
        return '#d1d5db';
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1,
        maxWidth: '33vw'
      }}
    >
      {progress.map((day) => (
        <Box
          key={day.day}
          sx={{
            width: '3.3vw',
            height: '3.3vw',
            borderRadius: '50%',
            bgcolor: getStatusColor(day.status),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}
        />
      ))}
    </Box>
  );
} 