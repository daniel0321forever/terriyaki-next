'use client';
import { Box, Typography, Avatar } from '@mui/material';
import { Participant } from '@/types/grind.types';

interface UserCardProps {
  participant: Participant;
}

export default function UserCard({ participant }: UserCardProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar 
        src={participant.avatar}
        sx={{ width: 48, height: 48 }}
      />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem', color: 'grey.600' }}>
          Missed {participant.missedDays} Times
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
          -${participant.totalPenalty}
        </Typography>
      </Box>
    </Box>
  );
} 