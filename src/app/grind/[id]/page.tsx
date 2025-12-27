'use client';

import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';


import { Box, Typography, Avatar, Divider } from '@mui/material';
import { SettingsIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

import { Grind } from '@/types/grind.types';
import { Participant } from '@/types/grind.types';

import LeetCodeTaskCard from '@/app/grind/[id]/components/LeetCodeTaskCard';
import CustomAppBar from '@/app/components/CustomAppBar';
import ProgressGrid from '@/app/components/ProgressGrid';
import UserCard from '@/app/components/UserCard';
import { User } from '@/types/user.types';
import { getCurrentGrind } from '@/lib/service/grind.service';
import { UserStoreState } from '@/lib/stores/auth.store';


export default function GrindPage() {
  const router = useRouter();

  // Get the grind id from the URL params (/grind/[id])
  const params = useParams();
  const id = params?.id as string;
  const grind: Grind | null = useGrindStore((state) => state.grinds[id] || null);
  const user: User | null = useUserStore((state: UserStoreState) => state.user);

  if (!grind) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomAppBar />
        <Typography variant="h5" sx={{ pt: '100px' }}>Grind not found</Typography>
      </Box>
    );
  }

  const currentUser: Participant | undefined = grind.participants.find((participant: Participant) => participant.id === user?.id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '50px' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', pt: '100px' }}>
        {/* Left Panel */}
        <Box sx={{ flex: 1, px: '100px', bgcolor: 'background.paper', maxWidth: '45vw' }}>
          {/* Header */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 800,
              color: 'text.primary',
              mb: 3,
            }}
          >
            Current Grind
          </Typography>

          {/* Current User Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', mb: 4 }}>
            <Avatar
              src={currentUser?.avatar}
              sx={{ width: 64, height: 64, mr: 3 }}
            />
      
            <Box sx={{ textAlign: 'left', mr: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 450, color: 'black', fontSize: '1.3rem' }}>
                Missed {currentUser?.missedDays} Times
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.600', fontSize: '1.1rem' }}>
                -${currentUser?.totalPenalty}
              </Typography>
            </Box>
          </Box>

          {/* Progress Grid */}
          <Box 
            onClick={() => router.push(`/grind/${id}/progress`)}
            sx={{ cursor: 'pointer' }}
          >
            <ProgressGrid progress={grind.progress} onProgressClick={() => {}} />
          </Box>
          <Divider sx={{ ml: 1, mt: 4, mb: 2, borderColor: 'grey.400', width: '70%' }} />
          
          {/* Other Participants */}
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              px: 1,
              width: '100%',
              transition: 'background 0.2s',
              justifyContent: 'space-between',
              minWidth: 220, // Ensures icon is rightmost; adjust as needed
            }}
            onClick={() => router.push(`/grind/${id}/progress`)}
          >
            <Typography variant="body1" sx={{ fontWeight: 300, fontSize: '1.1rem', color: 'grey.600' }}>
              VIEW OTHER&apos;S RECORD
            </Typography>
            <ChevronRight size={20} color="grey" />
          </Box>


          {/* Settings Button */}
          <Box sx={{ mt: 7, mb: 4}}>
            <Box 
              onClick={() => router.push(`/grind/${id}/settings`)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'start', 
                gap: 2,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 0.7,
                }
              }}
            >
              <SettingsIcon size={20} color="black" />
              <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 300, color: 'text.primary', flex: 1 }}>
                SETTINGS
              </Typography>
              <ChevronRight size={20} />
            </Box>
          </Box>
        </Box>
      
        {/* Right Panel */}
        <Box sx={{ flex: 1, px: 4 }}>
          <Box sx={{
            backgroundColor: 'primary.main', 
            color: 'primary.contrastText',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'none',
            borderRadius: 4,
            mx: 8,
            py: 6,
          }}>
            <LeetCodeTaskCard task={grind.taskToday} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 