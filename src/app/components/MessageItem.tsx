'use client';

import React from 'react';
import {
  MenuItem,
  Box,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import { Message } from '@/types/message.types';

interface MessageItemProps {
  message: Message;
  onClick: (message: Message) => void;
  getMessageTypeColor: (type: string) => 'primary' | 'success' | 'error' | 'default';
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onClick,
  getMessageTypeColor,  
}) => {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MenuItem
      onClick={() => onClick(message)}
      sx={{
        py: 1.5,
        px: 2,
        pl: message.read ? 2 : 2.5,
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: message.read ? 'transparent' : 'action.selected',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >

      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
      {!message.read && (
        <Box
          sx={{
            left: 4,
            width: 8,
            height: 8,
            mr: 1,
            borderRadius: '50%',
            backgroundColor: 'blue',
          }}
        />
      )}
        <Avatar
          src={message.sender.avatar}
          alt={message.sender.username}
          sx={{ width: 24, height: 24, mr: 1 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: message.read ? 400 : 600 }}>
            {message.sender.username}
          </Typography>
        </Box>
        <Chip
          label={message.type.replace('_', ' ')}
          size="small"
          color={getMessageTypeColor(message.type) as any}
          sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
        />
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          color: message.read ? 'text.secondary' : 'text.primary',
          width: '100%',
          fontSize: '0.8rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          mt: 0.5,
        }}
      >
        {message.content}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.6rem' }}>
        {formatDate(message.createdAt)}
      </Typography>
    </MenuItem>
  );
};

export default MessageItem;

