'use client';

import { Box, Typography, Card, CardContent, Button, Alert, Avatar } from '@mui/material';
import { AlertTriangle, Upload, RefreshCcw } from 'lucide-react';
import { useState, useRef } from 'react';
import { MOCK_GRINDS } from '@/data/mockData';
import { Task } from '@/types/task.types';
import CustomAppBar from '@/app/components/appBar';

function TaskCard({ task, isActive, onClick, hasWarning }: { 
  task: Task; 
  isActive: boolean; 
  onClick: () => void;
  hasWarning?: boolean;
}) {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        bgcolor: isActive ? '#f5e6d3' : 'white',
        border: isActive ? '2px solid #FFC15E' : '1px solid #e0e0e0',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: isActive ? '#f5e6d3' : '#f5f5f5'
        },
        boxShadow: isActive ? '0 4px 12px rgba(255, 193, 94, 0.3)' : 'none'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 0.5 }}>
              {task.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {task.type} Grind
            </Typography>
          </Box>
          {hasWarning && (
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#ff6b6b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <AlertTriangle size={18} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function LeetCodeTaskDetail({ task }: { task: Task }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAgain = () => {
    setUploadedImage(null);
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 600, mb: 3, color: 'text.primary' }}>
        {task.title}
      </Typography>
      
      <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary', mb: 4 }}>
        Please submit a photo including submission windows and code window in leetcode website.
      </Typography>

      {!uploadedImage ? (
        <Button
          variant="contained"
          size="large"
          onClick={handleUpload}
          sx={{
            bgcolor: 'black',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 600,
            px: 4,
            py: 2,
            borderRadius: '25px',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#333',
            },
          }}
          startIcon={<Upload size={20} />}
        >
          Upload
        </Button>
      ) : (
        <Box>
          <Box
            sx={{
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              overflow: 'hidden',
              mb: 3,
              maxWidth: '600px',
            }}
          >
            <img
              src={uploadedImage}
              alt="Uploaded submission"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>
          
          <Button
            variant="outlined"
            size="large"
            onClick={handleUploadAgain}
            sx={{
              color: '#999',
              borderColor: '#999',
              fontSize: '1rem',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              borderRadius: '20px',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#666',
                color: '#666',
              },
            }}
            startIcon={<RefreshCcw size={18} />}
          >
            Upload Again
          </Button>
        </Box>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </Box>
  );
}

function GRETaskDetail({ task }: { task: Task }) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 600, mb: 3, color: 'text.primary' }}>
        {task.title}
      </Typography>
      
      <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary', mb: 4 }}>
        GRE task interface coming soon...
      </Typography>
      
      <Box sx={{ 
        bgcolor: '#f5f5f5', 
        p: 3, 
        borderRadius: '12px',
        border: '2px dashed #ddd'
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Temporary placeholder for GRE task interface
        </Typography>
      </Box>
    </Box>
  );
}

export default function TaskPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<number>(1);
  
  // Get all today's tasks from grinds
  const todayTasks = MOCK_GRINDS.map(grind => grind.taskToday);
  const selectedTask = todayTasks.find(task => task.id === selectedTaskId);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CustomAppBar />
      
      <Box sx={{ display: 'flex', pt: '80px', minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Sidebar */}
        <Box sx={{ 
          width: '40%', 
          bgcolor: 'background.default', 
          borderRight: '1px solid #e0e0e0',
          py: 3,
          pl: 6,
          pr: 4,
        }}>
          <Typography variant="h1" sx={{ fontSize: '2.8rem', fontWeight: 700, mb: 3, color: 'text.primary' }}>
            Today Tasks
          </Typography>
          
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={selectedTaskId === task.id}
              onClick={() => setSelectedTaskId(task.id)}
              hasWarning={true} // Show warning icon as in the images
            />
          ))}
        </Box>

        {/* Right Content Area */}
        <Box sx={{ flex: 1, bgcolor: 'background.default' }}>
          {selectedTask?.type === 'LeetCode' && <LeetCodeTaskDetail task={selectedTask} />}
          {selectedTask?.type === 'GRE' && <GRETaskDetail task={selectedTask} />}
          {!selectedTask && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Select a task to get started
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
} 