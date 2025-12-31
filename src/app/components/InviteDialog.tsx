'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { X, UserPlus } from 'lucide-react';
import { checkEmailExists } from '@/lib/service/auth.service';
import { useUserStore } from '@/lib/stores/auth.store';
import { UserStoreState } from '@/lib/stores/auth.store';

import { createInvitationMessage } from '@/lib/service/message.service';

interface InviteDialogProps {
  open: boolean;
  grindID: string;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  existingParticipantEmails?: string[];
}

const InviteDialog: React.FC<InviteDialogProps> = ({
  open,
  grindID,
  onClose,
  title = 'Invite People',
  subtitle = 'Send an invitation to join your grind',
  existingParticipantEmails = [],
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentUser = useUserStore((state: UserStoreState) => state.user);
  const currentUserEmail = currentUser?.email || '';

  const handleClose = () => {
    setEmail('');
    setError(null);
    onClose();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleInvite = async () => {
    if (!email) return;

    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user is trying to invite themselves
      if (trimmedEmail === currentUserEmail) {
        setError('You cannot invite yourself');
        setLoading(false);
        return;
      }

      // Check if user is already in the group
      if (existingParticipantEmails.includes(trimmedEmail)) {
        setError('This user is already in the group');
        setLoading(false);
        return;
      }

      // Check if email exists
      const emailExists = await checkEmailExists(trimmedEmail);
      
      if (!emailExists) {
        setError('This email does not exist. Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // Create invitation message
      await createInvitationMessage(grindID, trimmedEmail);
      handleClose();
    } catch {
      setError('An error occurred while checking the email. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, sm: 4 },
          pt: { xs: 3, sm: 4 },
          pb: 2,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: { xs: 16, sm: 24 },
            top: { xs: 16, sm: 24 },
            color: 'rgb(116, 116, 116)',
            '&:hover': {
              color: 'rgb(0, 0, 0)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <X size={20} />
        </IconButton>
        
        <Typography
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem' },
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'rgb(0, 0, 0)',
            mb: 1,
            lineHeight: 1.1,
            pr: 4,
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '0.95rem', sm: '1rem' },
            color: 'rgb(116, 116, 116)',
            fontWeight: 400,
          }}
        >
          {subtitle}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 3, sm: 4 },
          py: 2,
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleInvite();
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter email address"
            required
            fullWidth
            error={!!error}
            helperText={error || ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: error ? '#d32f2f' : '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: error ? '#d32f2f' : '#FFC15E',
                },
                '&.Mui-focused fieldset': {
                  borderColor: error ? '#d32f2f' : '#FFC15E',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: error ? '#d32f2f' : '#FFC15E',
              },
              '& .MuiFormHelperText-root': {
                color: error ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.875rem',
                marginLeft: 0,
                marginTop: '8px',
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          pt: 2,
          gap: 2,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            color: 'rgb(116, 116, 116)',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: '25px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            '&:hover': {
              color: 'rgb(0, 0, 0)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            transition: 'all 0.2s ease-in-out',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleInvite}
          variant="contained"
          disabled={!email || loading}
          sx={{
            bgcolor: 'rgba(79, 79, 79, 0.86)',
            color: 'white',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: '25px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
            '&:hover': {
              bgcolor: 'rgba(60, 60, 60, 0.95)',
              boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
            },
            '&:disabled': {
              bgcolor: 'rgba(79, 79, 79, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
            transition: 'all 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <>
              <UserPlus size={18} />
              Send Invite
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteDialog;

