'use client';

import { Box, Typography, Avatar, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { ChevronRight, SettingsIcon, Upload } from 'lucide-react';
import ProgressGrid from '@/app/components/ProgressGrid';
import UserCard from '@/app/components/UserCard';
import { useParams, useRouter } from 'next/navigation';
import { Task } from '@/types/task.types';
import CustomAppBar from '@/app/components/appBar';
import { useState, useEffect } from 'react';
import { useGrindStore } from '@/lib/stores/grindStore';

function LeetCodeTaskDetail({ task }: { task: Task }) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [code, setCode] = useState('');

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
    setCode('');
  };

  const handleSubmit = () => {
    // Handle code submission here
    console.log('Submitting code:', code);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* TODAY Header */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, mb: 2, textAlign: 'center', letterSpacing: '0.05rem', fontSize: '4.5rem', color: 'rgb(0, 0, 0)' }}
      >
        TODAY
      </Typography>

      {/* LeetCode Problem Link */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 500,
          mb: 3,
          color: 'rgb(59, 37, 0)',
          background: 'none',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          p: 0,
          transition: 'color 0.2s',
          '&:hover': {
            color: '#FFC15E',
          }
        }}
        onClick={() => {/* you can add action here if needed */}}
      >
        {task.title}
      </Box>

      {/* LeetCode Problem Description */}
      <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'rgb(116, 116, 116)', mb: 4, px: 6 }}>
        To complete today's LeetCode task, please copy and paste your solution code from your code editor or the LeetCode website into the dialog by clicking the button below.
      </Typography>

      
      {/* Upload Button */}
      <Box
        onClick={handleUpload}
        sx={{
          bgcolor: 'orange',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 600,
          px: 3,
          py: 2,
          borderRadius: '25px',
          textTransform: 'none',
          transition: 'background-color 0.5s, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            bgcolor: '#FFC15E',
            transform: 'scale(1.05)',
          },
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Upload size={20} style={{ marginRight: 10 }} />
        UPLOAD
      </Box>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600, pb: 1 }}>
          Submit Your Code
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={15}
            fullWidth
            variant="outlined"
            placeholder="Paste your solution code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              bgcolor: 'orange',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: '#FFC15E',
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


export default function GrindDetail() {
  const router = useRouter();
  const params = useParams();
  const grindId = parseInt(params.id as string);
  const getGrindById = useGrindStore((state) => state.getGrindById);
  const initialize = useGrindStore((state) => state.initialize);
  const grind = getGrindById(grindId);

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
              src={grind.currentUser.avatar}
              sx={{ width: 64, height: 64, mr: 3 }}
            />
      
            <Box sx={{ textAlign: 'left', mr: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 450, color: 'black', fontSize: '1.3rem' }}>
                Missed {grind.currentUser.missedDays} Times
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.600', fontSize: '1.1rem' }}>
                -${grind.currentUser.totalPenalty}
              </Typography>
            </Box>
          </Box>

          {/* Progress Grid */}
          <Box 
            onClick={() => router.push(`/grind/${grindId}/progress`)}
            sx={{ cursor: 'pointer' }}
          >
            <ProgressGrid progress={grind.progress} />
          </Box>
          <Divider sx={{ ml: 1, my: 4, borderColor: 'grey.400', width: '70%' }} />
          
          {/* Other Participants */}
          <Box 
            onClick={() => router.push(`/grind/${grindId}/progress`)}
            sx={{ mt: 4, display: 'flex', gap: 2, cursor: 'pointer' }}
          >
            {grind.participants.map((participant) => (
              <UserCard key={participant.id} participant={participant} />
            ))}
          </Box>


          {/* Settings Button */}
          <Box sx={{ mt: 7, mb: 4}}>
            <Box 
              onClick={() => router.push(`/grind/${grindId}/settings`)}
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
            <LeetCodeTaskDetail task={grind.taskToday} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 