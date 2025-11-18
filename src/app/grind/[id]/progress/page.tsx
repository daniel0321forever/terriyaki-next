'use client';

import { Box, Typography, Avatar, Divider, Card, CardContent, Tooltip } from '@mui/material';
import ProgressGrid from '@/app/components/ProgressGrid';
import { useParams } from 'next/navigation';
import CustomAppBar from '@/app/components/appBar';
import BackButton from '@/app/components/BackButton';
import { useState, useEffect } from 'react';
import { useGrindStore } from '@/lib/stores/grindStore';

export default function GrindProgress() {
  const params = useParams();
  const grindId = parseInt(params.id as string);
  const getGrindById = useGrindStore((state) => state.getGrindById);
  const initialize = useGrindStore((state) => state.initialize);
  const grind = getGrindById(grindId);
  const [selectedUserId, setSelectedUserId] = useState<string>('current');

  useEffect(() => {
    // Initialize store with mock data if empty
    initialize();
  }, [initialize]);

  if (!grind) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomAppBar />
        <Typography variant="h5" sx={{ pt: '100px' }}>Grind not found</Typography>
      </Box>
    );
  }

  const allUsers = [
    {
      id: 'current',
      name: 'You',
      avatar: grind.currentUser.avatar,
      missedDays: grind.currentUser.missedDays,
      totalPenalty: grind.currentUser.totalPenalty,
      progress: grind.progress,
    },
    ...grind.participants.map(p => ({
      id: p.id.toString(),
      name: p.name,
      avatar: p.avatar,
      missedDays: p.missedDays,
      totalPenalty: p.totalPenalty,
      progress: grind.progress, // In a real app, this would be user-specific
    }))
  ];

  const selectedUser = allUsers.find(u => u.id === selectedUserId) || allUsers[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '50px' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', pt: '100px', pl: '16vw', gap: 4 }}>
        {/* Left Sidebar - Avatar Column */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            alignItems: 'center',
            minWidth: '120px',
            pt: 8,
          }}
        >
          {allUsers.map((user) => {
            const isSelected = user.id === selectedUserId;
            return (
              <Tooltip
                key={user.id}
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      Missed: {user.missedDays} days
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Penalty: -${user.totalPenalty}
                    </Typography>
                  </Box>
                }
                placement="right"
                arrow
              >
                <Box
                  onClick={() => setSelectedUserId(user.id)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{ 
                      width: 64, 
                      height: 64,
                      border: isSelected ? '3px solid #4ade80' : '3px solid transparent',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#4ade80',
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* Right Content - Selected User's Progress */}
        <Box sx={{ flex: 1, maxWidth: '800px' }}>
          <BackButton href={`/grind/${grindId}`} />
          
          {/* Header */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 800,
              color: 'text.primary',
              mb: 4,
            }}
          >
            Progress & Punishment
          </Typography>

          {/* Selected User Card */}
          <Card 
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  src={selectedUser.avatar}
                  sx={{ width: 64, height: 64 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.5rem', mb: 0.5 }}>
                    {selectedUser.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                    <Typography variant="body1" sx={{ color: 'grey.600', fontSize: '1rem' }}>
                      Missed {selectedUser.missedDays} Times
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'grey.600', fontSize: '1rem' }}>
                      Total Penalty: -${selectedUser.totalPenalty}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'grey.300' }} />
              <Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 400, color: 'grey.600', mb: 2 }}>
                  Progress
                </Typography>
                <Box sx={{ maxWidth: '500px' }}>
                  <ProgressGrid progress={selectedUser.progress} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

