'use client';

import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';

import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Grind, Participant, ProgressRecord } from '@/types/grind.types';
import { User } from '@/types/user.types';
import { UserStoreState } from '@/lib/stores/auth.store';
import { CheckCircle, XCircle, Clock, Plus, LogOut } from 'lucide-react';

export default function CurrentGrindsView({ handleCreate }: { handleCreate: () => void }) {
  const router = useRouter();
  const grindsMap = useGrindStore((state) => state.grinds);
  const user: User | null = useUserStore((state: UserStoreState) => state.user);

  // Convert Map to array of grinds
  const grinds = Array.from(Object.values(grindsMap));

  // Helper function to normalize date for comparison
  const normalizeDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    } catch {
      return dateString;
    }
  };

  // Helper function to get today's date string
  const getTodayDateString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Helper function to check if today is completed
  const getTodayStatus = (progress: ProgressRecord[]): 'completed' | 'missed' | 'pending' | null => {
    const today = getTodayDateString();
    const todayRecord = progress.find((record) => {
      const normalizedRecordDate = normalizeDate(record.date);
      return normalizedRecordDate === today;
    });
    return todayRecord ? todayRecord.status : null;
  };

  // Helper function to calculate progress numbers
  const getProgressNumbers = (progress: ProgressRecord[]) => {
    const total = progress.length;
    const completed = progress.filter((p) => p.status === 'completed').length;
    return { completed, total };
  };

  const handleGrindClick = (grindId: string) => {
    router.push(`/grind/${grindId}`);
  };

  const renderTodayStatus = (status: 'completed' | 'missed' | 'pending' | 'quitted' | null) => {
    if (status === 'completed') {
      return (
        <Chip
          icon={<CheckCircle size={16} />}
          label="Completed"
          size="small"
          sx={{
            bgcolor: '#C6F27A',
            color: '#000',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: '#000',
            },
          }}
        />
      );
    } else if (status === 'missed') {
      return (
        <Chip
          icon={<XCircle size={16} />}
          label="Missed"
          size="small"
          sx={{
            bgcolor: '#F2B07A',
            color: '#000',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: '#000',
            },
          }}
        />
      );
    } else if (status === 'pending') {
      return (
        <Chip
          icon={<Clock size={16} />}
          label="Pending"
          size="small"
          sx={{
            bgcolor: '#DDDDDD',
            color: '#666',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: '#666',
            },
          }}
        />
      );
    } else if (status === 'quitted') {
      return (
        <Chip
          icon={<XCircle size={16} />}
          label="Quitted"
          size="small"
          sx={{
            bgcolor: 'rgba(240, 16, 16, 0.8)',
            color: '#ffffff',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: '#ffffff',
            },
          }}
        />
      );
    }
  };


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 3,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {grinds.map((grind: Grind) => {
          const progressNumbers = getProgressNumbers(grind.progress || []);
          const todayStatus = grind.quitted ? 'quitted' : getTodayStatus(grind.progress || []);
          const taskName = grind.taskToday?.title || 'No task assigned';

          return (
            <motion.div
              key={grind.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                onClick={() => handleGrindClick(grind.id)}
                sx={{
                  height: '100%',
                  p: 3,
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* Progress Numbers */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    {progressNumbers.completed}/{progressNumbers.total}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                    }}
                  >
                    Progress
                  </Typography>
                </Box>

                {/* Today's Status */}
                <Box sx={{ mb: 2 }}>
                  {renderTodayStatus(todayStatus)}
                </Box>

                {/* Today's Task Name */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                    }}
                  >
                    Today's Task
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {taskName}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          );
        })}
        
        {/* Create New Grind Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            onClick={handleCreate}
            sx={{
              height: '100%',
              p: 3,
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: 'primary.main',
              },
              border: '2px dashed',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
            }}
          >
            <Plus
              size={48}
              style={{
                color: 'var(--mui-palette-text-secondary)',
                marginBottom: '12px',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Create New Grind
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
