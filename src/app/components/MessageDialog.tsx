'use client';

import React from 'react';
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
} from '@mui/material';
import { Message } from '@/types/message.types';

interface MessageDialogProps {
  open: boolean;
  message: Message | null;
  onClose: () => void;
  getMessageTypeColor: (type: string) => 'primary' | 'success' | 'error' | 'default';
  formatDate: (dateString: string) => string;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  message,
  onClose,
  getMessageTypeColor,
  formatDate,
}) => {
  if (!message) return null;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={message.sender.avatar}
            alt={message.sender.username}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {message.sender.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={message.type.replace('_', ' ')}
                size="small"
                color={getMessageTypeColor(message.type) as any}
              />
              <Typography variant="caption" color="text.secondary">
                {formatDate(message.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {message.content}
        </Typography>
        {message.grind && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Related Grind
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Duration: {message.grind.duration} days
            </Typography>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDialog;

