'use client';

import { Box, Typography } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href: string;
  label?: string;
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter();

  return (
    <Box 
      onClick={() => router.push(href)}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        mb: 3,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        '&:hover': {
          opacity: 0.7,
        }
      }}
    >
      <ChevronLeft size={24} color="black" />
      <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 400, color: 'text.primary' }}>
        {label}
      </Typography>
    </Box>
  );
}

