'use client';

import { Box, Typography, Switch, Avatar, Divider } from '@mui/material';
import { SettingsIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import CustomAppBar from '@/app/components/appBar';
import BackButton from '@/app/components/BackButton';
import { useState, useEffect } from 'react';
import { useGrindStore } from '@/lib/stores/grindStore';

function ToggleOption({ title, checked, onChange }: { title: string, checked: boolean, onChange: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: 2 }}>
      <SettingsIcon size={20} color="black" />
      <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 300, color: 'text.primary', flex: 1 }}>
        {title}
      </Typography>
      <Switch 
        checked={checked}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#4ade80',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#4ade80',
          },
        }}
        onChange={onChange}
      />
    </Box>
  )
}

function InfoCard({ title, description }: { title: string, description: string }) {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h4" sx={{ fontSize: '1.4rem', fontWeight: 400, color: 'grey.600' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8, fontSize: '0.8rem' }}>
        {description}
      </Typography>
    </Box>
  )
}

export default function GrindSettings() {
  const params = useParams();
  const grindId = parseInt(params.id as string);
  const getGrindById = useGrindStore((state) => state.getGrindById);
  const initialize = useGrindStore((state) => state.initialize);
  const grind = getGrindById(grindId);
  const [autoRenew, setAutoRenew] = useState(grind?.autoRenew || false);

  useEffect(() => {
    // Initialize store with mock data if empty
    initialize();
    if (grind) {
      setAutoRenew(grind.autoRenew);
    }
  }, [initialize, grind]);

  if (!grind) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomAppBar />
        <Typography variant="h5" sx={{ pt: '100px' }}>Grind not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '50px' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', pt: '100px', px: '100px', maxWidth: '800px', mx: 'auto' }}>
        {/* Back Button */}
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
          Settings
        </Typography>

        {/* Auto Renew Toggle */}
        <Box sx={{ mb: 4 }}>
          <ToggleOption 
            title="Auto Renew" 
            checked={autoRenew} 
            onChange={() => setAutoRenew(!autoRenew)} 
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.400' }} />

        {/* Group Members */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontSize: '1.4rem', fontWeight: 400, color: 'grey.600', mb: 2 }}>
            Group Members
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Current User */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={grind.currentUser.avatar}
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', color: 'text.primary' }}>
                  You
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.9rem' }}>
                  Missed {grind.currentUser.missedDays} Times • -${grind.currentUser.totalPenalty}
                </Typography>
              </Box>
            </Box>
            {/* Other Participants */}
            {grind.participants.map((participant) => (
              <Box key={participant.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={participant.avatar}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', color: 'text.primary' }}>
                    {participant.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.9rem' }}>
                    Missed {participant.missedDays} Times • -${participant.totalPenalty}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.400' }} />

        {/* Duration Information */}
        <Box sx={{ mb: 4 }}>
          <InfoCard 
            title="Duration" 
            description={`${grind.duration} days (${grind.startDate} - ${grind.endDate})`}
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.400' }} />

        {/* Punishment Information */}
        <Box sx={{ mb: 4 }}>
          <InfoCard 
            title="Punishment" 
            description={`Initial Price: $${grind.punishment.initialPrice} • Daily Rate: $${grind.punishment.dailyRate}/day`}
          />
        </Box>
      </Box>
    </Box>
  );
}

