'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { Message } from '@/types/message.types';
import { useMessageStore } from '@/lib/stores/message.store';
import { getMessages, getSentMessages, readMessage } from '@/lib/service/message.service';
import GrindInvitationMessageDialog from './GrindInvitationMessageDialog';

const MESSAGES_PER_PAGE = 20;

type TabType = 'invitations' | 'response' | 'sent';

export default function InvitationsView() {
  const [selectedTab, setSelectedTab] = useState<TabType>('invitations');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);

  const messages: Message[] = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.setMessages);

  // Filter messages based on selected tab
  const filteredMessages = useMemo(() => {
    if (selectedTab === 'invitations') {
      return messages.filter((message: Message) => message.type === 'invitation');
    } else if (selectedTab === 'response') {
      return messages.filter(
        (message: Message) => 
          message.type === 'invitation_accepted' || 
          message.type === 'invitation_rejected'
      );
    } else {
      // sent tab
      return sentMessages;
    }
  }, [messages, sentMessages, selectedTab]);

  const loadMessages = useCallback(async (page: number, tab: TabType) => {
    setLoading(true);
    try {
      const offset = page * MESSAGES_PER_PAGE;
      if (tab === 'sent') {
        const loadedMessages = await getSentMessages(offset, MESSAGES_PER_PAGE);
        setSentMessages(loadedMessages);
        setHasMore(loadedMessages.length === MESSAGES_PER_PAGE);
      } else {
        const loadedMessages = await getMessages(offset, MESSAGES_PER_PAGE);
        setMessages(loadedMessages);
        setHasMore(loadedMessages.length === MESSAGES_PER_PAGE);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (tab === 'sent') {
        setSentMessages([]);
      } else {
        setMessages([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [setMessages]);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when tab changes
  }, [selectedTab]);

  useEffect(() => {
    loadMessages(currentPage, selectedTab);
  }, [currentPage, selectedTab, loadMessages]);

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    // Mark message as read if not already read
    if (!message.read) {
      try {
        await readMessage(message.id);
        if (selectedTab === 'sent') {
          const updatedMessages = sentMessages.map((msg: Message) =>
            msg.id === message.id ? { ...msg, read: true } : msg
          );
          setSentMessages(updatedMessages);
        } else {
          const updatedMessages = messages.map((msg: Message) =>
            msg.id === message.id ? { ...msg, read: true } : msg
          );
          setMessages(updatedMessages);
        }
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
    loadMessages(currentPage, selectedTab);
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

  const isResponded = (message: Message) => {
    return message.invitationAccepted || 
           message.invitationRejected || 
           message.type === 'invitation_accepted' || 
           message.type === 'invitation_rejected';
  };

  const getEmptyMessage = () => {
    switch (selectedTab) {
      case 'invitations':
        return { title: 'No Invitations', description: "You don't have any invitations at the moment." };
      case 'response':
        return { title: 'No Responses', description: "You don't have any responses at the moment." };
      case 'sent':
        return { title: 'No Sent Messages', description: "You haven't sent any messages yet." };
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tab Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box
          onClick={() => setSelectedTab('invitations')}
          sx={{
            cursor: 'pointer',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: selectedTab === 'invitations' ? 'primary.main' : 'divider',
            backgroundColor: selectedTab === 'invitations' ? 'primary.light' : 'background.paper',
            color: selectedTab === 'invitations' ? 'primary.contrastText' : 'text.primary',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: selectedTab === 'invitations' ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: selectedTab === 'invitations' ? 600 : 400 }}>
            Invitations
          </Typography>
        </Box>
        <Box
          onClick={() => setSelectedTab('response')}
          sx={{
            cursor: 'pointer',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: selectedTab === 'response' ? 'primary.main' : 'divider',
            backgroundColor: selectedTab === 'response' ? 'primary.light' : 'background.paper',
            color: selectedTab === 'response' ? 'primary.contrastText' : 'text.primary',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: selectedTab === 'response' ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: selectedTab === 'response' ? 600 : 400 }}>
            Response
          </Typography>
        </Box>
        <Box
          onClick={() => setSelectedTab('sent')}
          sx={{
            cursor: 'pointer',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: selectedTab === 'sent' ? 'primary.main' : 'divider',
            backgroundColor: selectedTab === 'sent' ? 'primary.light' : 'background.paper',
            color: selectedTab === 'sent' ? 'primary.contrastText' : 'text.primary',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: selectedTab === 'sent' ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: selectedTab === 'sent' ? 600 : 400 }}>
            Sent
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ mb: 3 }} />

      {/* Messages List */}
      {loading && filteredMessages.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredMessages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            {getEmptyMessage().title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {getEmptyMessage().description}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
          {filteredMessages.map((message) => {
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
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Show the sender avatar */}
                  <Avatar
                    src={message.sender.avatar}
                    alt={message.sender.username}
                    sx={{ width: 48, height: 48, mt: 1 }}
                  />

                  {/* Show the message content */}
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

                  {/* show the reading status */}
                  {!message.read && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'black',
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
          
          {/* Pagination controls */}
          {(filteredMessages.length > 0 || currentPage > 0) && (
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
