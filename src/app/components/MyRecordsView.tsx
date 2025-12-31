'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useUserStore } from '@/lib/stores/auth.store';
import { Grind, Participant, ProgressRecord } from '@/types/grind.types';
import { UserStoreState } from '@/lib/stores/auth.store';
import { User } from '@/types/user.types';
import { CheckCircle, XCircle, DollarSign, AlertCircle } from 'lucide-react';
import { useGrindStore } from '@/lib/stores/grind.store';


interface GrindRecord {
  grind: Grind;
  participant: Participant;
  solved: number;
  missed: number;
  pending: number;
  penalty: number;
  quitted: boolean;
}

export default function MyRecordsView() {
  const [records, setRecords] = useState<GrindRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const user: User | null = useUserStore((state: UserStoreState) => state.user);


  const grinds = useGrindStore((state) => state.grinds);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Process each grind to extract user's record
        const userRecords: GrindRecord[] = Object.values(grinds)
          .map((grind: Grind) => {
            // Find the current user's participant data
            const participant = grind.participants.find(
              (p: Participant) => p.id === user.id
            );

            // If user is not a participant, skip this grind
            if (!participant) return null;

            // Calculate statistics from progress records
            const progress = grind.progress || [];
            const solved = progress.filter((p: ProgressRecord) => p.status === 'completed').length;
            const missed = progress.filter((p: ProgressRecord) => p.status === 'missed').length;
            const pending = progress.filter((p: ProgressRecord) => p.status === 'pending').length;

            return {
              grind,
              participant,
              solved,
              missed,
              pending,
              penalty: participant.totalPenalty || 0,
              quitted: grind.quitted || false,
            };
          })
          .filter((record): record is GrindRecord => record !== null)
          .sort((a, b) => {
            // Sort by start date, most recent first
            return new Date(b.grind.startDate).getTime() - new Date(a.grind.startDate).getTime();
          });

        setRecords(userRecords);
      } catch (error) {
        console.error('Failed to fetch grind records:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  // Calculate summary statistics
  const summary = {
    totalGrinds: records.length,
    quittedGrinds: records.filter((r) => r.quitted).length,
    totalSolved: records.reduce((sum, r) => sum + r.solved, 0),
    totalMissed: records.reduce((sum, r) => sum + r.missed, 0),
    totalPenalty: records.reduce((sum, r) => sum + r.penalty, 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          Please log in to view your records
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Summary Statistics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Total Grinds
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {summary.totalGrinds}
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Quitted
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: summary.quittedGrinds > 0 ? 'error.main' : 'text.primary',
              }}
            >
              {summary.quittedGrinds}
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Problems Solved
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#84cc16',
              }}
            >
              {summary.totalSolved}
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Problems Missed
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#f97316',
              }}
            >
              {summary.totalMissed}
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Total Penalty
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: summary.totalPenalty > 0 ? 'error.main' : 'text.primary',
              }}
            >
              ${summary.totalPenalty.toFixed(2)}
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Grind Records */}
      {records.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No Records Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You haven&apos;t participated in any grinds yet.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {records.map((record, index) => (
            <motion.div
              key={record.grind.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                {/* Header with Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {formatDate(record.grind.startDate)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                      }}
                    >
                      Duration: {record.grind.duration} days
                    </Typography>
                  </Box>
                  {record.quitted && (
                    <Chip
                      icon={<AlertCircle size={16} />}
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
                  )}
                </Box>

                {/* Statistics Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {/* Problems Solved */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CheckCircle size={16} color="#84cc16" />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 600,
                        }}
                      >
                        Solved
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#84cc16',
                      }}
                    >
                      {record.solved}
                    </Typography>
                  </Box>

                  {/* Problems Missed */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <XCircle size={16} color="#f97316" />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 600,
                        }}
                      >
                        Missed
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#f97316',
                      }}
                    >
                      {record.missed}
                    </Typography>
                  </Box>
                </Box>

                {/* Penalty Section */}
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <DollarSign size={16} color={record.penalty > 0 ? '#f01610' : '#000'} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      Penalty
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: record.penalty > 0 ? 'error.main' : 'text.primary',
                    }}
                  >
                    ${record.penalty.toFixed(2)}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 6,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${record.grind.progress?.length > 0 ? (record.solved / record.grind.progress.length) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: '#84cc16',
                        transition: 'width 0.3s ease-in-out',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      mt: 0.5,
                      display: 'block',
                    }}
                  >
                    {record.solved} of {record.grind.progress.length} completed
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}
