'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Menu,
  Badge,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  MailOutline as MailOutlineIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { readMessage } from '@/lib/service/message.service';
import { useMessageStore } from '@/lib/stores/message.store';
import MessageDialog from './MessageDialog';
import GrindInvitationMessageDialog from './GrindInvitationMessageDialog';
import MessageItem from './MessageItem';
import { Message } from '@/types/message.types';
import { getMessages } from '@/lib/service/message.service';

const MESSAGES_PER_PAGE = 10;

const MessageIcon: React.FC = () => {
  const [messageAnchorEl, setMessageAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messageOpen = Boolean(messageAnchorEl);

  const messages: Message[] = useMessageStore((state: any) => state.messages);
  const setMessages = useMessageStore((state: any) => state.setMessages);
  
  const loadMessages = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = page * MESSAGES_PER_PAGE;
      const loadedMessages = await getMessages(offset, MESSAGES_PER_PAGE);
      setMessages(loadedMessages);
      // If we got less than MESSAGES_PER_PAGE messages, there are no more pages
      setHasMore(loadedMessages.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [setMessages]);

  useEffect(() => {
    if (messageOpen) {
      loadMessages(currentPage);
    }
  }, [messageOpen, currentPage, loadMessages]);

  const handleMessageClick = (event: React.MouseEvent<HTMLElement>) => {
    setMessageAnchorEl(event.currentTarget);
    setCurrentPage(0); // Reset to first page when opening menu
  };

  const handleMessageMenuClose = () => {
    setMessageAnchorEl(null);
  };

  const handleMessageItemClick = async (message: Message) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    handleMessageMenuClose();
    
    // Mark message as read if not already read
    if (!message.read) {
      try {
        await readMessage(message.id);
        // Update message in store to mark as read
        const updatedMessages = messages.map((msg: Message) =>
          msg.id === message.id ? { ...msg, read: true } : msg
        );
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleMessageDialogClose = () => {
    setMessageDialogOpen(false);
    setSelectedMessage(null);
  };

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

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'invitation':
        return 'primary';
      case 'invitation_accepted':
        return 'success';
      case 'invitation_rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      {/* Message button */}
      <Box
        onClick={handleMessageClick}
        aria-label="messages"
        aria-controls={messageOpen ? 'message-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={messageOpen ? 'true' : undefined}
        sx={{
          color: 'black',
          cursor: 'pointer',
          '&:hover': {
            color: 'grey.500',
          },
          transition: 'all 0.2s ease-in-out',
          '& svg': {
            fontSize: '2.2rem',
          },
        }}
      >
        <Badge badgeContent={messages.length > 0 ? messages.length : undefined} color="error">
          <MailOutlineIcon />
        </Badge>
      </Box>

      {/* Message Menu */}
      <Menu
        id="message-menu"
        anchorEl={messageAnchorEl}
        open={messageOpen}
        onClose={handleMessageMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.12))',
            mt: 1.5,
            minWidth: 280,
            maxWidth: 320,
            maxHeight: 400,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 1.5, pb: 1 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, fontSize: '1rem' }}>
            Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
            Page {currentPage + 1}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 300, overflow: 'auto', minHeight: 200 }}>
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No messages
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onClick={handleMessageItemClick}
                getMessageTypeColor={getMessageTypeColor}
              />
            ))
          )}
        </Box>
        {(messages.length > 0 || currentPage > 0) && (
          <Box>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
              <IconButton
                onClick={handlePreviousPage}
                disabled={currentPage === 0 || loading}
                size="small"
                sx={{ 
                  '&:disabled': {
                    opacity: 0.3,
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Page {currentPage + 1}
              </Typography>
              <IconButton
                onClick={handleNextPage}
                disabled={!hasMore || loading}
                size="small"
                sx={{ 
                  '&:disabled': {
                    opacity: 0.3,
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Menu>

      {/* Message Detail Dialog */}
      {selectedMessage?.type === 'invitation' ? (
        <GrindInvitationMessageDialog
          open={messageDialogOpen}
          message={selectedMessage}
          onClose={handleMessageDialogClose}
          getMessageTypeColor={getMessageTypeColor}
          formatDate={formatDate}
        />
      ) : (
        <MessageDialog
          open={messageDialogOpen}
          message={selectedMessage}
          onClose={handleMessageDialogClose}
          getMessageTypeColor={getMessageTypeColor}
          formatDate={formatDate}
        />
      )}
    </>
  );
};

export default MessageIcon;

