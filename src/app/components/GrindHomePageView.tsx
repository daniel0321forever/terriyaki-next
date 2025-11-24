'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';
import { useMessageStore } from '@/lib/stores/message.store';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import CustomAppBar from '@/app/components/CustomAppBar';
import GrindPreview from '@/app/components/GrindPreview';
import { quitGrind } from '@/lib/service/grind.service';
import { Grind } from '@/types/grind.types';
import { User } from '@/types/user.types';
import { Message } from '@/types/message.types';
import { getMessages } from '@/lib/service/message.service';

export default function GrindHomePageView() {
  const router = useRouter();
  const grind: Grind | null = useGrindStore((state: any) => state.currentGrind);
  const user: User | null = useUserStore((state: any) => state.user);

  const currentUserParticipant = grind?.participants?.find(
    (participant: any) => participant.id === user?.id
  );

  // Calculate duration from progress or use grind.duration
  const duration = grind?.duration || grind?.progress?.length || 0;

  // Get missed days from current user participant
  const missedDays = currentUserParticipant?.missedDays || 0;

  const handleContinue = () => {
    router.push('/grind');
  };

  const handleQuit = () => {
    if (!grind) {
      console.error("Grind not found");
      return;
    }
    quitGrind(grind.id).then((data) => {
      useGrindStore.setState({ currentGrind: null });
    }).catch((error) => {
      console.error("Failed to quit grind: ", error);
    });
  };

  const handleCreate = () => {
    router.push('/grind/new');
  };

  const menuItems = [
    { label: 'My Grind', icon: Target, path: '/mygrinds', active: grind !== null },
    { label: 'Progress', icon: TrendingUp, path: '/grind/progress', active: false },
  ];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
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
        }}
      >
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
            TERRIYAKI
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
              mb: 3,
              fontWeight: 400,
              maxWidth: '90%',
            }}
          >
            {grind 
              ? 'Keep up the momentum! Track your progress and stay accountable on your coding journey.'
              : 'Ready to start your next challenge? Create a new grind and begin tracking your daily progress.'
            }
          </Typography>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 3,
              flexWrap: 'wrap',
            }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  startIcon={<Icon size={20} />}
                  variant={item.active ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: item.active ? 'rgba(79, 79, 79, 0.86)' : 'transparent',
                    color: item.active ? 'white' : 'rgb(79, 79, 79)',
                    borderColor: 'rgba(79, 79, 79, 0.86)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: '25px',
                    textTransform: 'none',
                    boxShadow: item.active ? '0 4px 14px 0 rgba(0, 0, 0, 0.2)' : 'none',
                    '&:hover': {
                      bgcolor: item.active ? 'rgba(60, 60, 60, 0.95)' : 'rgba(79, 79, 79, 0.1)',
                      borderColor: 'rgba(79, 79, 79, 0.86)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </motion.div>

        {/* Grind Preview Component */}
        <GrindPreview
          grind={grind}
          user={user}
          currentUserParticipant={currentUserParticipant}
          missedDays={missedDays}
          duration={duration}
          onContinue={handleContinue}
          onQuit={handleQuit}
          onCreate={handleCreate}
        />
      </Box>
    </Box>
  );
}