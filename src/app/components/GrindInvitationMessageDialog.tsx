'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Message } from '@/types/message.types';
import { acceptInvitationMessage, rejectInvitationMessage } from '@/lib/service/message.service';
import { useMessageStore } from '@/lib/stores/message.store';

interface GrindInvitationMessageDialogProps {
  open: boolean;
  message: Message | null;
  onClose: () => void;
  getMessageTypeColor: (type: string) => 'primary' | 'success' | 'error' | 'default';
  formatDate: (dateString: string) => string;
  onActionComplete?: () => void;
}

function ActionButton({
  loading,
  onClick,
  color = 'primary',
  disabled = false,
  children,
}: {
  loading: boolean;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      disableElevation
      sx={{
        px: 2.4,
        py: 1.2,
        minWidth: 28,
        backgroundColor: color,
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: 600,
        borderRadius: '12px',
        boxShadow: 'none',
        lineHeight: 1.1,
        textTransform: 'none',
        '&:disabled': {
          backgroundColor: 'action.disabledBackground',
          color: 'action.disabled',
        },
      }}
      size="small"
      variant="contained"
    >
      {loading ? (
        <CircularProgress size={16} color="inherit" sx={{ mr: 0 }} />
      ) : (
        children
      )}
    </Button>
  );
}

const GrindInvitationMessageDialog: React.FC<GrindInvitationMessageDialogProps> = ({
  open,
  message,
  onClose,
  getMessageTypeColor,
  formatDate,
  onActionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const setMessages = useMessageStore((state) => state.setMessages);
  const messages = useMessageStore((state) => state.messages);

  if (!message || !message.grind) return null;

  const isResponded = message.invitationAccepted || message.invitationRejected || 
                      message.type === 'invitation_accepted' || message.type === 'invitation_rejected';

  const handleAccept = async () => {
    if (!message.grind || !message.sender) return;
    
    setLoading(true);
    setActionError(null);
    
    try {
      await acceptInvitationMessage(message.id);
      
      // Update message in store to mark as accepted
      const updatedMessages = messages.map((msg: Message) =>
        msg.id === message.id
          ? { ...msg, type: 'invitation_accepted' as const, read: true, invitationAccepted: true, invitationRejected: false }
          : msg
      );
      setMessages(updatedMessages);
      
      onActionComplete?.();
      onClose();
    } catch (error: unknown) {
      setActionError((error as Error).message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!message.grind || !message.sender) return;
    
    setLoading(true);
    setActionError(null);
    
    try {
      await rejectInvitationMessage(message.id);
      
      // Update message in store to mark as rejected
      const updatedMessages = messages.map((msg: Message) =>
        msg.id === message.id
          ? { ...msg, type: 'invitation_rejected' as const, read: true, invitationAccepted: false, invitationRejected: true }
          : msg
      );
      setMessages(updatedMessages);
      
      onActionComplete?.();
      onClose();
    } catch (error: unknown) {  
      setActionError((error as Error).message || 'Failed to reject invitation');
    } finally {
      setLoading(false);
    }
  };

  const formatStartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={message.sender.avatar}
                alt={message.sender.username}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {message.sender.username}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              to
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={message.receiver.avatar}
                alt={message.receiver.username}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {message.receiver.username}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={message.type.replace('_', ' ')}
              size="small"
              color={getMessageTypeColor(message.type)}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(message.createdAt)}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {message.content}
        </Typography>
        
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Grind Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Duration
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {message.grind.duration} days
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Start Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatStartDate(message.grind.startDate)}
              </Typography>
            </Box>
            {message.grind.budget && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Budget
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ${message.grind.budget}
                </Typography>
              </Box>
            )}
            {message.grind.participants && message.grind.participants.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Participants
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {message.grind.participants.length} participant{message.grind.participants.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {actionError && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark">
              {actionError}
            </Typography>
          </Box>
        )}

        {isResponded && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: message.invitationAccepted || message.type === 'invitation_accepted' 
                ? 'success.light' 
                : 'error.light', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: message.invitationAccepted || message.type === 'invitation_accepted'
                  ? 'success.dark'
                  : 'error.dark',
              }}
            >
              {message.invitationAccepted || message.type === 'invitation_accepted'
                ? '✓ Invitation Accepted'
                : '✗ Invitation Rejected'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <ActionButton 
          loading={loading} 
          color="rgb(255, 107, 99)" 
          onClick={handleReject}
          disabled={isResponded}
        >
          Reject
        </ActionButton>
        <ActionButton 
          loading={loading} 
          color="rgb(137, 216, 51)" 
          onClick={handleAccept}
          disabled={isResponded}
        >
          Accept
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default GrindInvitationMessageDialog;

