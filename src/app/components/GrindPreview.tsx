'use client';

import { Box, Typography, Avatar, Divider, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { PlusCircle, LogOut } from 'lucide-react';
import { Grind, Participant } from '@/types/grind.types';
import { User } from '@/types/user.types';
import ProgressGrid from './ProgressGrid';

interface GrindPreviewProps {
  grind: Grind | null;
  user: User | null;
  currentUserParticipant?: Participant;
  missedDays: number;
  duration: number;
  onContinue: () => void;
  onQuit: () => void;
  onCreate: () => void;
}

export default function GrindPreview({
  grind,
  user,
  currentUserParticipant,
  missedDays,
  duration,
  onContinue,
  onQuit,
  onCreate,
}: GrindPreviewProps) {
  console.log("grind: ", grind);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      style={{ width: '100%' }}
    >
      <Box
        sx={{
          width: '100%',
          mb: 3,
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
          {grind ? (
            <>
              {/* Current User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                <Avatar
                  src={currentUserParticipant?.avatar || user?.avatar}
                  sx={{ width: 48, height: 48, mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '1.2rem',
                      mb: 0.5,
                    }}
                  >
                    {currentUserParticipant?.username || user?.username || 'You'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'grey.600', fontSize: '0.95rem', fontWeight: 500 }}
                    >
                      Missed {missedDays} {missedDays === 1 ? 'Day' : 'Days'}
                    </Typography>
                    {currentUserParticipant?.totalPenalty !== undefined && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'grey.600', fontSize: '0.95rem', fontWeight: 500 }}
                      >
                        Penalty: -${currentUserParticipant.totalPenalty}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{ color: 'grey.600', fontSize: '0.95rem', fontWeight: 500 }}
                    >
                      Duration: {duration} {duration === 1 ? 'Day' : 'Days'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

              {/* Progress Diagram */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  Progress Overview
                </Typography>
                <Box
                  sx={{
                    maxWidth: '500px',
                    transform: 'scale(0.85)',
                    transformOrigin: 'top left',
                    mb: -2,
                  }}
                >
                  <ProgressGrid progress={grind.progress || []} onProgressClick={() => {}} />
                </Box>
              </Box>
            </>
          ) : (
            /* Empty Preview - Designed */
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                px: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                No Active Grind
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 400,
                  color: 'grey.600',
                  mb: 3,
                  maxWidth: '500px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Ready to start your next challenge? Create a new grind and begin tracking your daily progress.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {grind ? (
          <>
            <Button
              variant="contained"
              onClick={onContinue}
              sx={{
                bgcolor: 'rgba(79, 79, 79, 0.86)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                px: 5,
                py: 1.25,
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
              CONTINUE
            </Button>
            <Button
              variant="outlined"
              onClick={onQuit}
              startIcon={<LogOut size={16} />}
              sx={{
                borderColor: 'rgba(79, 79, 79, 0.86)',
                color: 'rgba(79, 79, 79, 0.86)',
                fontSize: '1rem',
                fontWeight: 700,
                px: 5,
                py: 1.25,
                borderRadius: '25px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                '&:hover': {
                  borderColor: 'rgba(60, 60, 60, 0.95)',
                  bgcolor: 'rgba(79, 79, 79, 0.05)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              QUIT
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={onCreate}
            startIcon={<PlusCircle size={18} />}
            sx={{
              bgcolor: 'rgba(79, 79, 79, 0.86)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              px: 7,
              py: 1.5,
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
            CREATE NEW GRIND
          </Button>
        )}
      </Box>
    </motion.div>
  );
}

