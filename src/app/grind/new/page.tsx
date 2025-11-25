'use client';

import { Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import CustomAppBar from '@/app/components/CustomAppBar';
import { useGrindStore } from '@/lib/stores/grind.store';
import { useUserStore } from '@/lib/stores/auth.store';
import { User } from '@/types/user.types';
import { createGrind } from '@/lib/service/grind.service';
import { ERROR_CODE_USER_NOT_FOUND } from '@/config/error_code';
import { UserStoreState } from '@/lib/stores/auth.store';

type DurationOption = '1 week' | '2 weeks' | '3 weeks' | '1 month';

const DURATION_OPTIONS: { value: DurationOption; days: number }[] = [
  { value: '1 week', days: 7 },
  { value: '2 weeks', days: 14 },
  { value: '3 weeks', days: 21 },
  { value: '1 month', days: 28 },
];

export default function NewGrindPage() {
  const router = useRouter();
  const setCurrentGrind = useGrindStore((state) => state.setCurrentGrind);
  const user: User | null = useUserStore((state: UserStoreState) => state.user);
  
  // Current user email - static value, not affected by useState
  const currentUserEmail = user?.email || '';
  
  // Form state
  const [durationOption, setDurationOption] = useState<DurationOption>('1 month');
  const [taskType, setTaskType] = useState<'LeetCode'>('LeetCode');
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [budget, setBudget] = useState(300);
  // Only store additional participants (excluding current user)
  const [additionalParticipants, setAdditionalParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const getDurationDays = () => {
    return DURATION_OPTIONS.find(opt => opt.value === durationOption)?.days || 28;
  };

  const handleAddParticipant = () => {
    const trimmedParticipant = newParticipant.trim();
    
    if (!trimmedParticipant) {
      return;
    }
    
    // Check for conflicts including current user
    if (additionalParticipants.includes(trimmedParticipant)) {
      setError('This participant is already in the group');
      return;
    }
    
    setAdditionalParticipants([...additionalParticipants, trimmedParticipant]);
    setNewParticipant('');
    setError(null);
  };

  const handleRemoveParticipant = (participant: string) => {
    // Current user cannot be removed
    if (participant === currentUserEmail) {
      return;
    }

    setAdditionalParticipants(additionalParticipants.filter(p => p !== participant));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (budget < 0) {
      setError('Weekly budget must be non-negative');
      setIsSubmitting(false);
      return;
    }

    try {
      const duration = getDurationDays();
      const startDateObj = new Date(startDate);
      // Submit with all participants (current user + additional)
      const grind = await createGrind(duration, startDateObj, budget, additionalParticipants);
      setCurrentGrind(grind);
      router.push(`/grind`);
    } catch (err: unknown) {
      switch ((err as Error).message) {
        case ERROR_CODE_USER_NOT_FOUND:
          setError('Participant not found');
          break;
        default:
          setError('Failed to create grind. Please try again.');
      }
      setError('Failed to create grind. Please try again.');
      setIsSubmitting(false);
    }
  };

  const calculateTotalPrice = () => {
    const weeks = getDurationDays() / 7;
    return weeks * budget;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <CustomAppBar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          backgroundColor: 'white',
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 4, sm: 6 },
          pt: '120px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1400px',
            mx: 'auto',
            display: 'flex',
            gap: 6,
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          {/* Left Column - Invite Participants */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              py: 6,
            }}
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'rgb(0, 0, 0)',
                  mb: 2,
                  lineHeight: 1.1,
                }}
              >
                Create
              </Typography>
            </motion.div>

            {/* Invite Participants Section */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                mt: 4,
              }}
            >
              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  onClose={() => setError(null)}
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Task Type */}
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#FFC15E' } }}>
                  Task Type
                </InputLabel>
                <Select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as 'LeetCode')}
                  label="Task Type"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFC15E',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFC15E',
                    },
                  }}
                >
                  <MenuItem value="LeetCode">LeetCode</MenuItem>
                </Select>
              </FormControl>

              {/* Start Date */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    mb: 1.5,
                  }}
                >
                  Start Date
                </Typography>
                <TextField
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
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
              </Box>

              {/* Add Participants */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    mb: 1.5,
                  }}
                >
                  Invite Participants
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    placeholder="Invite a participant by email"
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddParticipant();
                      }
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
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
                    }}
                  />
                  <Button
                    onClick={handleAddParticipant}
                    variant="outlined"
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#FFC15E',
                      color: '#FFC15E',
                      px: 3,
                      '&:hover': {
                        borderColor: '#FFC15E',
                        backgroundColor: 'rgba(255, 193, 94, 0.1)',
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
                
                {/* Participants List */}
                {additionalParticipants.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {additionalParticipants.map((participant: string) => {
                      const isCurrentUser = participant === currentUserEmail;
                      return (
                        <Chip
                          key={participant}
                          label={participant}
                          onDelete={isCurrentUser ? undefined : () => handleRemoveParticipant(participant)}
                          deleteIcon={isCurrentUser ? undefined : <X size={16} />}
                          sx={{
                            backgroundColor: isCurrentUser 
                              ? 'rgba(79, 79, 79, 0.2)' 
                              : 'rgba(255, 193, 94, 0.1)',
                            color: isCurrentUser 
                              ? 'rgb(0, 0, 0)' 
                              : 'rgb(59, 37, 0)',
                            fontWeight: isCurrentUser ? 600 : 400,
                            '& .MuiChip-deleteIcon': {
                              color: 'rgb(59, 37, 0)',
                              '&:hover': {
                                color: 'rgb(0, 0, 0)',
                              },
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <motion.div
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: 'rgba(79, 79, 79, 0.86)',
                    color: 'white',
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    fontWeight: 700,
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
                      bgcolor: 'rgba(79, 79, 79, 0.5)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    transition: 'all 0.3s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Plus size={20} />
                  {isSubmitting ? 'Creating...' : 'Create Grind'}
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Right Column - Punishment Rule Introduction */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              pt: { xs: 0, lg: '100px' },
            }}
          >
            <Box
              sx={{
                borderRadius: '16px',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                height: 'fit-content',
                position: 'sticky',
                top: '120px',
              }}
            >
              {/* Punishment Rule Introduction */}
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'rgb(0, 0, 0)',
                    mb: 2,
                  }}
                >
                  Punishment Rule
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    color: 'rgb(116, 116, 116)',
                    lineHeight: 1.6,
                    mb: 2,
                  }}
                >
                  Set a weekly budget that will be charged if you miss your daily tasks. 
                  The budget is distributed across all participants, creating accountability 
                  and motivation to stay consistent with your grind.
                </Typography>
              </Box>

              {/* Weekly Budget */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    mb: 1.5,
                  }}
                >
                  Weekly Budget / Person (USD)
                </Typography>
                <TextField
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
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
              </Box>

              {/* Duration Selection */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    mb: 1.5,
                  }}
                >
                  Duration
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={durationOption}
                    onChange={(e) => setDurationOption(e.target.value as DurationOption)}
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC15E',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC15E',
                      },
                    }}
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Total Price Display */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255, 193, 94, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 193, 94, 0.3)',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgb(59, 37, 0)',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 1,
                  }}
                >
                  Total Budget: USD {calculateTotalPrice().toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgb(116, 116, 116)',
                    fontSize: '0.9rem',
                  }}
                >
                  {getDurationDays() / 7} weeks × USD {budget.toLocaleString()} = USD {calculateTotalPrice().toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
