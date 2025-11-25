'use client';

import { Box, Typography, Avatar, Divider, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import ProgressGrid from '@/app/components/ProgressGrid';
import CustomAppBar from '@/app/components/CustomAppBar';
import BackButton from '@/app/components/BackButton';
import UserAvatarSelector from '@/app/grind/progress/components/UserAvatarSelector';
import { useState, useRef } from 'react';
import { useGrindStore } from '@/lib/stores/grind.store';
import { Grind, Participant, ProgressRecord } from '@/types/grind.types';
import { useUserStore } from '@/lib/stores/auth.store';
import { Task } from '@/types/task.types';
import { getTaskDetail } from '@/lib/service/task.serivice';
import Editor from '@monaco-editor/react';
import { User } from '@/types/user.types';
import { UserStoreState } from '@/lib/stores/auth.store';

export default function GrindProgress() {
  const grind: Grind | null = useGrindStore((state) => state.currentGrind);
  const [selectedUserId, setSelectedUserId] = useState<string>('current');
  const currentUser: User | null = useUserStore((state: UserStoreState) => state.user);
  
  // Task detail state
  const [selectedProgressRecord, setSelectedProgressRecord] = useState<ProgressRecord | null>(null);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for task details - using useRef to persist across re-renders
  const taskCacheRef = useRef<Map<number, Task>>(new Map());

  if (!grind) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomAppBar />
        <Typography variant="h5" sx={{ pt: '100px' }}>Grind not found</Typography>
      </Box>
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

  const selectedUser = allUsers.find(u => u.id === selectedUserId) || allUsers[0];

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
        <UserAvatarSelector
          users={allUsers}
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />

        {/* Right Content - Selected User's Progress */}
        <Box sx={{ flex: 1, maxWidth: '800px' }}>
          <BackButton href={`/grind`} />
          
          {/* Header */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 800,
              color: 'text.primary',
              mb: 4,
            }}
          >
            Progress & Punishment
          </Typography>

          {/* Selected User Card */}
          <Card 
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
          </Card>

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

