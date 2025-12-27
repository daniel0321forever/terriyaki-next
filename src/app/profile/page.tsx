'use client';

import { Box, Typography, Avatar, IconButton, TextField, Badge, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Edit, ArrowLeft, Check, X, Camera } from 'lucide-react';
import { useUserStore, UserStoreState } from '@/lib/stores/auth.store';
import { uploadPhoto, updateProfile } from '@/lib/service/profile.service';
import { User } from '@/types/user.types';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state: UserStoreState) => state.user);
  const setUser = useUserStore((state: UserStoreState) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditedUsername(user.username);
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing && user) {
      // Reset to original values when entering edit mode
      setEditedUsername(user.username);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditedUsername(user.username);
    }
  };

  const handleSave = async () => {
    if (editedUsername !== user?.username) {
      setUser({ ...user, username: editedUsername } as User);
      setIsEditing(false);
      
      await updateProfile(editedUsername);
    }
  };    

  const handleAvatarClick = () => {
    if (isEditing && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await uploadPhoto(file);
      
      // Update user with new avatar URL
      // Assuming the backend returns the updated user or avatar URL
      if (response.user) {
        setUser(response.user);
      } else if (response.avatar && user) {
        // If only avatar is returned, update the user object
        setUser({ ...user, avatar: response.avatar });
      } else if (user) {
        // Fallback: update with the avatar from the response if available
        const avatarUrl = response.avatar || response.data?.avatar;
        if (avatarUrl) {
          setUser({ ...user, avatar: avatarUrl });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      setUploadError(errorMessage);
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, sm: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '500px', md: '600px' },
        }}
      >
        {/* Header with Back and Edit buttons */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            onClick={() => router.push('/')}
            sx={{
              color: 'rgb(116, 116, 116)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                color: 'rgb(0, 0, 0)',
              },
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Box>

          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handleSave}
                sx={{
                  color: '#4ade80',
                  '&:hover': {
                    bgcolor: 'rgba(74, 222, 128, 0.1)',
                  },
                  transition: 'all 0.2s',
                  borderRadius: '12px',
                }}
              >
                <Check size={20} />
              </IconButton>
              <IconButton
                onClick={handleCancel}
                sx={{
                  color: 'rgb(116, 116, 116)',
                  '&:hover': {
                    color: '#f97316',
                    bgcolor: 'rgba(249, 115, 22, 0.1)',
                  },
                  transition: 'all 0.2s',
                  borderRadius: '12px',
                }}
              >
                <X size={20} />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              onClick={handleEditClick}
              sx={{
                color: 'rgb(116, 116, 116)',
                '&:hover': {
                  color: '#FFC15E',
                  bgcolor: 'rgba(255, 193, 94, 0.1)',
                },
                transition: 'all 0.2s',
                borderRadius: '12px',
              }}
            >
              <Edit size={20} />
            </IconButton>
          )}
        </Box>

        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'rgb(0, 0, 0)',
              lineHeight: 1.1,
            }}
          >
            Profile
          </Typography>

          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isEditing ? (
                <Box
                  onClick={handleAvatarClick}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: isUploading ? 'rgba(0, 0, 0, 0.5)' : '#FFC15E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.15)',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': isUploading ? {} : {
                      transform: 'scale(1.1)',
                      bgcolor: '#ffb84d',
                    },
                  }}
                >
                  {isUploading ? (
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                  ) : (
                    <Camera size={16} color="white" />
                  )}
                </Box>
              ) : null
            }
          >
            <Avatar
              src={user.avatar}
              alt={user.username}
              onClick={handleAvatarClick}
              sx={{
                width: { xs: 72, sm: 96 },
                height: { xs: 72, sm: 96 },
                border: '3px solid #FFC15E',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.10)',
                mr: 2,
                cursor: isEditing && !isUploading ? 'pointer' : 'default',
                opacity: isUploading ? 0.7 : 1,
                transition: 'all 0.2s',
                '&:hover': isEditing && !isUploading ? {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
                } : {},
              }}
            />
          </Badge>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </Box>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', sm: '1.2rem' },
            color: 'rgb(116, 116, 116)',
            mb: 5,
            fontWeight: 400,
          }}
        >
          {isEditing ? 'Edit your profile information' : 'View and manage your profile information'}
        </Typography>

        {/* Profile Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            bgcolor: 'white',
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Profile Information */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Username Field */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'rgb(116, 116, 116)',
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Username
              </Typography>
              {isEditing ? (
                <TextField
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFC15E',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFC15E',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#FFC15E',
                    },
                  }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 500,
                    color: 'rgb(0, 0, 0)',
                    bgcolor: '#f5f5f5',
                    borderRadius: '12px',
                    p: 2,
                  }}
                >
                  {user.username}
                </Typography>
              )}
            </Box>

            {/* Email Field */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'rgb(116, 116, 116)',
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Email
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 500,
                  color: 'rgb(116, 116, 116)',
                  bgcolor: '#f5f5f5',
                  borderRadius: '12px',
                  p: 2,
                }}
              >
                {user.email}
              </Typography>
            </Box>

            {/* User ID Field (optional, less prominent) */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'rgb(116, 116, 116)',
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                User ID
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: 'rgb(116, 116, 116)',
                  bgcolor: '#f5f5f5',
                  borderRadius: '12px',
                  p: 2,
                  fontFamily: 'monospace',
                }}
              >
                {user.id}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!uploadError}
        autoHideDuration={6000}
        onClose={() => setUploadError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setUploadError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {uploadError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

