'use client';

import { Box, Typography, Switch, Avatar, Divider } from '@mui/material';
import { SettingsIcon } from 'lucide-react';
import CustomAppBar from '@/app/components/CustomAppBar';
import BackButton from '@/app/components/BackButton';
import InviteDialog from '@/app/components/InviteDialog';
import { useState } from 'react';
import { useGrindStore } from '@/lib/stores/grind.store';
import { Grind, Participant } from '@/types/grind.types';
import { User } from '@/types/user.types';
import { useUserStore } from '@/lib/stores/auth.store';
import { useParams } from 'next/navigation';

import { ArrowRight } from 'lucide-react';


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
  const id = params?.id as string;
  const grind: Grind | null = useGrindStore((state) => state.grinds[id]);
  const [autoRenew, setAutoRenew] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  if (!grind) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomAppBar />
        <Typography variant="h5" sx={{ pt: '100px' }}>Grind not found</Typography>
      </Box>
    );
  }

  const handleInvite = () => {
    setInviteDialogOpen(true);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '50px' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', pt: '100px', px: '100px', maxWidth: '800px', mx: 'auto' }}>
        {/* Back Button */}
        <BackButton href={`/grind/${id}`} />

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
        {/* <Box sx={{ mb: 4 }}>
          <ToggleOption 
            title="Auto Renew" 
            checked={autoRenew} 
            onChange={() => setAutoRenew(!autoRenew)} 
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.400' }} /> */}

        {/* Group Members */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" sx={{ fontSize: '1.4rem', fontWeight: 400, color: 'grey.600' }}>
              Group Members
            </Typography>
            <Box>
              <button
                style={{
                  padding: '6px 16px',
                  backgroundColor: '#C6F27A',
                  color: '#222',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: 'none'
                }}
                onClick={handleInvite}
              >
                Invite
              </button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Other Participants */}
            {grind.participants.map((participant: Participant) => (
              <Box key={participant.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={participant.avatar}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', color: 'text.primary' }}>
                    {participant.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.9rem' }}>
                    Missed {participant.missedDays} Times • -${participant.totalPenalty}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 3, borderColor: 'grey.400' }} />

        {/* Duration Information */}
        <Box sx={{ mb: 4 }}>
          <InfoCard 
            title="Duration" 
            description={`${grind.duration} days`}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0 }}>
            <Typography sx={{ fontSize: '1rem', color: 'text.primary', fontWeight: 500 }}>
              {new Date(grind.startDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </Typography>
            <ArrowRight size={20} color="black" />
            <Typography sx={{ fontSize: '1rem', color: 'text.primary', fontWeight: 500 }}>
              {new Date(
                new Date(grind.startDate).getTime() + (grind.duration - 1) * 24 * 60 * 60 * 1000
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{mb: 3, borderColor: 'grey.400' }} />

        {/* Punishment Information */}
        <Box sx={{ mb: 4 }}>
          <InfoCard 
            title="Punishment"
            description={`If you miss a day, a penalty is deducted from your initial price.`}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'grey.700', fontWeight: 600, letterSpacing: 1 }}>
                Daily Penalty
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.2rem' }}>
                ${Math.round(grind.budget / grind.duration)}/day
              </Typography>
            </Box>
          </Box>
          
        </Box>
      </Box>

      <InviteDialog
        open={inviteDialogOpen}
        grindID={id}
        onClose={() => setInviteDialogOpen(false)}
        title="Invite People"
        subtitle="Send an invitation to join your grind"
        existingParticipantEmails={[]}
      />
    </Box>
  );
}

