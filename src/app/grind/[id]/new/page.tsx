'use client';

import { Box } from '@mui/material';
import CustomAppBar from '@/app/components/CustomAppBar';
import CreateNewGrindView from '@/app/components/CreateNewGrindView';

export default function NewGrindPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <CustomAppBar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          backgroundColor: 'white',
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 4, sm: 6 },
          pt: '120px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          <CreateNewGrindView />
        </Box>
      </Box>
    </Box>
  );
}
