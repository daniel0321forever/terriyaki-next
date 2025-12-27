'use client';

import { Box, Avatar, Tooltip, Typography } from '@mui/material';

interface UserAvatarSelectorProps {
  users: Array<{
    id: string;
    username: string;
    avatar: string;
    missedDays: number;
    totalPenalty: number;
  }>;
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export default function UserAvatarSelector({ users, selectedUserId, onSelect }: UserAvatarSelectorProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3,
        alignItems: 'center',
        minWidth: '120px',
        pt: 8,
      }}
    >
      {users.map((user) => {
        const isSelected = user.id === selectedUserId;
        return (
          <Tooltip
            key={user.id}
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {user.username}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  Missed: {user.missedDays} days
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Penalty: -${user.totalPenalty}
                </Typography>
              </Box>
            }
            placement="right"
            arrow
          >
            <Box
              onClick={() => onSelect(user.id)}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
            >
              <Avatar
                src={user.avatar}
                sx={{ 
                  width: 64, 
                  height: 64,
                  border: isSelected ? '3px solid #4ade80' : '3px solid transparent',
                  transition: 'border-color 0.2s',
                }}
              />
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#4ade80',
                  }}
                />
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

