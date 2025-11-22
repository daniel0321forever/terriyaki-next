'use client';
import { Box, Tooltip, Typography } from '@mui/material';
import { ProgressRecord } from '@/types/grind.types';

interface ProgressGridProps {
  progress: ProgressRecord[];
  onProgressClick: (progressRecord: ProgressRecord) => void;
}

export default function ProgressGrid({ progress, onProgressClick }: ProgressGridProps) {
  const getStatusColor = (status: ProgressRecord['status']) => {
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatStatus = (status: ProgressRecord['status']): string => {
    const statusMap = {
      completed: 'Completed',
      missed: 'Missed',
      upcoming: 'Upcoming'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusLabelColor = (status: ProgressRecord['status']): string => {
    switch (status) {
      case 'completed':
        return '#84cc16'; // lime-500
      case 'missed':
        return '#f97316'; // orange-500
      case 'upcoming':
        return '#6b7280'; // gray-500
      default:
        return '#6b7280';
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
      {progress.map((progressRecord: ProgressRecord) => (
        <Tooltip
          key={progressRecord.date}
          title={
            <Box sx={{ textAlign: 'center', py: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  mb: 1.5,
                  letterSpacing: '0.01em',
                }}
              >
                {formatDate(progressRecord.date)}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                  backgroundColor: getStatusLabelColor(progressRecord.status),
                  opacity: 0.95,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {formatStatus(progressRecord.status)}
                </Typography>
              </Box>
            </Box>
          }
          arrow
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxWidth: '200px',
              }
            },
            arrow: {
              sx: {
                color: 'rgba(31, 41, 55, 0.95)',
              }
            }
          }}
        >
          <Box
            onClick={() => onProgressClick(progressRecord)}
            sx={{
              width: '3.3vw',
              height: '3.3vw',
              borderRadius: '50%',
              bgcolor: getStatusColor(progressRecord.status),
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
        </Tooltip>
      ))}
    </Box>
  );
} 