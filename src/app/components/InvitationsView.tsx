'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { Message } from '@/types/message.types';
import { useMessageStore } from '@/lib/stores/message.store';
import { getMessages, readMessage } from '@/lib/service/message.service';
import GrindInvitationMessageDialog from './GrindInvitationMessageDialog';

const MESSAGES_PER_PAGE = 20;

export default function InvitationsView() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const messages: Message[] = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.setMessages);

  // Filter for invitation messages only
  const invitationMessages = useMemo(() => {
    return messages.filter(
      (message: Message) => 
        message.type === 'invitation' || 
        message.type === 'invitation_accepted' || 
        message.type === 'invitation_rejected'
    );
  }, [messages]);

  const loadMessages = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = page * MESSAGES_PER_PAGE;
      const loadedMessages = await getMessages(offset, MESSAGES_PER_PAGE);
      setMessages(loadedMessages);
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
    loadMessages(currentPage);
  }, [currentPage, loadMessages]);

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    // Mark message as read if not already read
    if (!message.read) {
      try {
        await readMessage(Number(message.id));
        const updatedMessages = messages.map((msg: Message) =>
          msg.id === message.id ? { ...msg, read: true } : msg
        );
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedMessage(null);
  };

  const handleActionComplete = () => {
    // Reload messages to get updated status
    loadMessages(currentPage);
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

  const getMessageTypeColor = (type: string): 'primary' | 'success' | 'error' | 'default' => {
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

  const formatStartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isResponded = (message: Message) => {
    return message.invitationAccepted || 
           message.invitationRejected || 
           message.type === 'invitation_accepted' || 
           message.type === 'invitation_rejected';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading && invitationMessages.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : invitationMessages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No Invitations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You don't have any invitations at the moment.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
          {invitationMessages.map((message) => {
            const responded = isResponded(message);
            
            return (
              <Box
                key={message.id}
                onClick={() => handleMessageClick(message)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  p: 2,
                  // border: message.read ? '1px solid' : '2px solid',
                  borderColor: message.read ? 'divider' : 'primary.main',
                  borderRadius: 1,
                  backgroundColor: message.read ? 'background.paper' : 'action.selected',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar
                    src={message.sender.avatar}
                    alt={message.sender.username}
                    sx={{ width: 48, height: 48, mt: 1 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {/* Show the sender username */}
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                        {message.sender.username}
                      </Typography>

                      {/* Show the response status */}
                      {responded && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: message.invitationAccepted || message.type === 'invitation_accepted'
                              ? 'success.light'
                              : 'error.light',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: message.invitationAccepted || message.type === 'invitation_accepted'
                                ? 'success.dark'
                                : 'error.dark',
                              fontSize: '0.75rem',
                            }}
                          >
                            {message.invitationAccepted || message.type === 'invitation_accepted'
                              ? '✓ Accepted'
                              : '✗ Rejected'}
                          </Typography>
                        </Box>
                      )}

                      {/* Show the unread status */}
                      {!message.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                          }}
                        />
                      )}
                    </Box>
                      
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {message.content}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1.5 }}
                    >
                      {formatDate(message.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
          
          {/* Pagination controls */}
          {(invitationMessages.length > 0 || currentPage > 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                variant="outlined"
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                Page {currentPage + 1}
              </Typography>
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasMore || loading}
                variant="outlined"
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Invitation Dialog */}
      {selectedMessage && (
        <GrindInvitationMessageDialog
          open={dialogOpen}
          message={selectedMessage}
          onClose={handleDialogClose}
          getMessageTypeColor={getMessageTypeColor}
          formatDate={formatDate}
          onActionComplete={handleActionComplete}
        />
      )}
    </Box>
  );
}
