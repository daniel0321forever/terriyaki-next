'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { Box, Typography, Avatar, Divider, Card, CardContent, Tooltip, CircularProgress, Alert, Chip } from '@mui/material';
import Editor from '@monaco-editor/react';


import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';
import { getGrindById } from '@/lib/service/grind.service';

import { getTaskDetail } from '@/lib/service/task.serivice';
import { Participant, ProgressRecord, Grind } from '@/types/grind.types';
import { Task } from '@/types/task.types';

import ProgressGrid from '@/app/components/ProgressGrid';
import BackButton from '@/app/components/BackButton';
import CustomAppBar from '@/app/components/CustomAppBar';


export default function GrindProgress() {
  const grindId = useParams().id as string;


  const [grind, setGrind] = useState<Grind | null>(null);

  const currentUser = useUserStore((state: any) => state.user);
  const currentGrind = useGrindStore((state: any) => state.currentGrind);

  // Task detail state
  const [selectedProgressRecord, setSelectedProgressRecord] = useState<ProgressRecord | null>(null);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('current');
  const [currentUserParticipant, setCurrentUserParticipant] = useState<Participant | null>(null);
  
  // Cache for task details - using useRef to persist across re-renders
  const taskCacheRef = useRef<Map<number, Task>>(new Map());


  useEffect(() => {
    const fetchGrind = async () => {
      console.log("Fetching grind: ", grindId);
      const grind = await getGrindById(grindId);
      console.log("Grind fetched: ", grind);
      setGrind(grind);
      setCurrentUserParticipant(grind?.participants.find((participant: Participant) => participant.id === currentUser?.id) || null);
      setSelectedUserId(currentUser?.id || grind?.participants[0].id);
    };

    fetchGrind();
  }, [grindId]);


  if (grind === null) {
    return (
      <>
        <CustomAppBar />
      </>
    );
  }

  const allUsers = [
    ...grind.participants.map((p: Participant) => ({
      id: p.id.toString(),
      username: currentUser?.id === p.id ? 'You' : p.username,
      avatar: p.avatar,
      missedDays: p.missedDays,
      totalPenalty: p.totalPenalty,
      progress: grind.progress,
    }))
  ];

  const selectedUser =  allUsers.find(u => u.id === selectedUserId) || allUsers[0];
  const currentUserData = allUsers.find(u => u.id === currentUser?.id) || null;

  // Calculate grind status and end date
  const getGrindStatus = (): string => {
    if (grind.quit) {
      return 'Quit';
    }

    if (grind.id !== currentGrind?.id) {
      return 'Quit';
    }

    const startDate = new Date(grind.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + grind.duration);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (today > endDate) {
      return 'Completed';
    }
    return 'Active';
  };

  const getEndDate = (): string => {
    const startDate = new Date(grind.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + grind.duration);
    return endDate.toISOString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatStatus = (status: ProgressRecord['status']): string => {
    const statusMap = {
      completed: 'Completed',
      missed: 'Missed',
      upcoming: 'Upcoming'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleProgressClick = async (progressRecord: ProgressRecord) => {
    setSelectedProgressRecord(progressRecord);
    setError(null);
    
    // Check cache first
    const cachedTask = taskCacheRef.current.get(progressRecord.id);
    if (cachedTask) {
      setTaskDetail(cachedTask);
      return;
    }

    // If not in cache, fetch from API
    setLoading(true);
    setTaskDetail(null);

    try {
      const task = await getTaskDetail(progressRecord.id);
      // Store in cache
      taskCacheRef.current.set(progressRecord.id, task);
      setTaskDetail(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '50px' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', pt: '100px', pl: '16vw', gap: 4 }}>
        {/* Left Sidebar - Avatar Column */}
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
          {allUsers.map((user) => {
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
                  onClick={() => setSelectedUserId(user.id)}
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

        {/* Right Content - Selected User's Progress */}
        <Box sx={{ flex: 1, maxWidth: '800px' }}>
          <BackButton href={`/mygrinds`} />
          
          {/* Header */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 800,
              color: 'text.primary',
              mb: 2,
            }}
          >
            History Grind
          </Typography>

          {/* Status Display */}
          <Box sx={{ mb: 4 }}>
            <Chip
              label={getGrindStatus()}
              sx={{
                fontSize: '0.9rem',
                fontWeight: 600,
                height: '32px',
                bgcolor: (() => {
                  const status = getGrindStatus();
                  if (status === 'Quit') return 'rgba(211, 47, 47, 0.1)';
                  if (status === 'Completed') return 'rgba(46, 125, 50, 0.1)';
                  return 'rgba(25, 118, 210, 0.1)';
                })(),
                color: (() => {
                  const status = getGrindStatus();
                  if (status === 'Quit') return '#d32f2f';
                  if (status === 'Completed') return '#2e7d32';
                  return '#1976d2';
                })(),
                border: (() => {
                  const status = getGrindStatus();
                  if (status === 'Quit') return '1px solid rgba(211, 47, 47, 0.3)';
                  if (status === 'Completed') return '1px solid rgba(46, 125, 50, 0.3)';
                  return '1px solid rgba(25, 118, 210, 0.3)';
                })(),
              }}
            />
          </Box>

          {/* Grind Information Section - Two Column Layout */}
          <Box sx={{ mb: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {/* Left Column - Grind Details */}
            <Box sx={{ flex: 1, minWidth: '280px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1
                    }}
                  >
                    Date
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.primary', 
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      lineHeight: 1.5
                    }}
                  >
                    {formatDate(grind.startDate) + ' - ' + formatDate(getEndDate())}
                  </Typography>
                </Box>

                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1
                    }}
                  >
                    Duration
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.primary', 
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      lineHeight: 1.5
                    }}
                  >
                    {grind.duration} {grind.duration === 1 ? 'day' : 'days'}
                  </Typography>
                </Box>

              </Box>
            </Box>

            {/* Right Column - Current User Penalty */}
            {currentUserData && (
              <Box sx={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'error.main', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 1
                    }}
                  >
                    Your Total Penalty
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: 'error.main',
                      fontSize: '3rem',
                      lineHeight: 1.2,
                      mb: 2,
                    }}
                  >
                    -${currentUserData.totalPenalty.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary', 
                        fontSize: '0.9rem',
                        fontWeight: 400
                      }}
                    >
                      Missed
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1.25rem',
                      }}
                    >
                      {currentUserData.missedDays}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary', 
                        fontSize: '0.9rem',
                        fontWeight: 400
                      }}
                    >
                      {currentUserData.missedDays === 1 ? 'day' : 'days'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Selected User Card */}
          {selectedUser && <Card 
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  src={selectedUser.avatar}
                  sx={{ width: 64, height: 64 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.5rem', mb: 0.5 }}>
                    {selectedUser.username}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                    <Typography variant="body1" sx={{ color: 'grey.600', fontSize: '1rem' }}>
                      Missed {selectedUser.missedDays} Times
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'grey.600', fontSize: '1rem' }}>
                      Total Penalty: -${selectedUser.totalPenalty}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'grey.300' }} />
              <Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 400, color: 'grey.600', mb: 2 }}>
                  Progress
                </Typography>
                <Box sx={{ maxWidth: '500px' }}>
                  <ProgressGrid progress={selectedUser.progress} onProgressClick={handleProgressClick} />
                </Box>
              </Box>
            </CardContent>
          </Card>}

          {/* Task Detail Section */}
          {selectedProgressRecord && (
            <Card 
              sx={{ 
                bgcolor: 'background.paper', 
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                mt: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 600, mb: 3, color: 'text.primary' }}>
                  {formatDate(selectedProgressRecord.date)} - Task Details
                </Typography>

                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {!loading && !error && taskDetail && (
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      {taskDetail.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 3 }}>
                      {taskDetail.description}
                    </Typography>
                    
                    {selectedProgressRecord.status === 'completed' && taskDetail.code && taskDetail.language ? (
                      <Box>
                        <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500, mb: 1, color: 'text.primary' }}>
                          Submitted Code ({taskDetail.language})
                        </Typography>
                        <Box sx={{ 
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}>
                          <Editor
                            height="400px"
                            language={taskDetail.language}
                            value={taskDetail.code}
                            theme="vs-dark"
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              tabSize: 2,
                              wordWrap: 'on',
                              padding: { top: 16, bottom: 16 },
                            }}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500, mb: 2, color: 'text.primary' }}>
                          Task Status: {formatStatus(selectedProgressRecord.status)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                          {selectedProgressRecord.status === 'missed' 
                            ? 'This task was missed. No code submission is available.'
                            : 'This task is upcoming. Code submission will be available after completion.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}

