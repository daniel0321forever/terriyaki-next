'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CustomAppBar from '@/app/components/CustomAppBar';
import BackButton from '@/app/components/BackButton';
import { getGrinds } from '@/lib/service/grind.service';
import { useGrindStore } from '@/lib/stores/grind.store';
import { useUserStore } from '@/lib/stores/auth.store';
import { Grind } from '@/types/grind.types';

export default function MyGrindsPage() {
  const router = useRouter();
  const [grinds, setGrinds] = useState<Grind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentGrind = useGrindStore((state: any) => state.currentGrind);
  const user = useUserStore((state: any) => state.user);

  useEffect(() => {
    const fetchGrinds = async () => {
      try {
        setLoading(true);
        const allGrinds = await getGrinds();
        setGrinds(allGrinds);
      } catch (err) {
        console.error('Failed to fetch grinds:', err);
        setError(err instanceof Error ? err.message : 'Failed to load grinds');
      } finally {
        setLoading(false);
      }
    };

    fetchGrinds();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCurrentUserParticipant = (grind: Grind) => {
    return grind?.participants?.find(
      (participant) => participant.id === user?.id
    );
  };

  const handleGrindClick = (grind: Grind) => {
    // If it's the current grind, navigate to /grind
    // Otherwise, we could navigate to a detail page or progress page
    if (currentGrind && currentGrind.id === grind.id) {
      router.push('/grind');
    } else {
      // For now, navigate to progress page
      router.push(`/grind/${grind.id}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5e6d3',
        overflow: 'hidden',
        flexDirection: 'column',
      }}
    >
      <CustomAppBar />
      
      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 4, sm: 6, md: 8, lg: 10 },
          py: { xs: 2, sm: 3, md: 6 },
          overflowY: 'auto',
          pt: '100px',
        }}
      >
        <BackButton href="/" />
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'rgb(0, 0, 0)',
              mb: 1.5,
              lineHeight: 1.1,
            }}
          >
            MY GRINDS
          </Typography>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
              lineHeight: 1.6,
              color: 'rgb(116, 116, 116)',
              mb: 4,
              fontWeight: 400,
              maxWidth: '90%',
            }}
          >
            View all your coding challenges and track your progress across different grinds.
          </Typography>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ color: 'grey.600' }}>
              Loading grinds...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ color: 'error.main' }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Grinds Catalog */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {grinds.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 4,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  No Grinds Yet
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 400,
                    color: 'grey.600',
                    maxWidth: '500px',
                    mx: 'auto',
                  }}
                >
                  Start your first coding challenge to see it here.
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
                {grinds.map((grind, index) => {
                  const isCurrentGrind = currentGrind && currentGrind.id === grind.id;
                  const participant = getCurrentUserParticipant(grind);
                  const penalty = participant?.totalPenalty || 0;

                  return (
                    <motion.div
                      key={grind.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <Card
                        onClick={() => handleGrindClick(grind)}
                        sx={{
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                          border: '1px solid',
                          borderColor: isCurrentGrind ? 'rgba(79, 79, 79, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 12px -2px rgb(0 0 0 / 0.15), 0 4px 6px -3px rgb(0 0 0 / 0.1)',
                            borderColor: 'rgba(79, 79, 79, 0.7)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                          {/* Current Grind Badge */}
                          {isCurrentGrind && (
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                icon={<Target size={14} />}
                                label="Current Grind"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(79, 79, 79, 0.86)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                }}
                              />
                            </Box>
                          )}

                          {/* Grind Info */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Start Date */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Calendar size={18} color="rgba(79, 79, 79, 0.7)" />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '0.95rem',
                                  fontWeight: 500,
                                  color: 'text.primary',
                                }}
                              >
                                {formatDate(grind.startDate)}
                              </Typography>
                            </Box>

                            {/* Duration */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Clock size={18} color="rgba(79, 79, 79, 0.7)" />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '0.95rem',
                                  fontWeight: 500,
                                  color: 'text.primary',
                                }}
                              >
                                {grind.duration} {grind.duration === 1 ? 'Day' : 'Days'}
                              </Typography>
                            </Box>

                            {/* Current Penalty */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <DollarSign size={18} color="rgba(79, 79, 79, 0.7)" />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '0.95rem',
                                  fontWeight: 500,
                                  color: penalty > 0 ? 'error.main' : 'text.primary',
                                }}
                              >
                                Penalty: -${penalty}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </Box>
            )}
          </motion.div>
        )}
      </Box>
    </Box>
  );
}

