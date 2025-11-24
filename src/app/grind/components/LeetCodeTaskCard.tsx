import { useState } from 'react';
import { Task } from '@/types/task.types';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import { Select } from '@mui/material';
import { MenuItem } from '@mui/material';
import { FormControl } from '@mui/material';
import { InputLabel } from '@mui/material';
import { Chip } from '@mui/material';
import { Upload } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { submitTask } from '@/lib/service/task.serivice';
import { useGrindStore } from '@/lib/stores/grind.store';

function UploadDialog({ task, open, onClose }: { task: Task, open: boolean, onClose: () => void }) {
  const currentGrind = useGrindStore((state: any) => state.currentGrind);
  const [code, setCode] = useState(task.code || '');
  const [language, setLanguage] = useState(task.language || 'javascript');
  
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' },
  ];
  
  const handleSubmit = () => {
    submitTask(code, language);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          width: '65vw',
          backgroundColor: 'rgb(61, 61, 61)',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600, mt: 2 }}>
        Submit Your Code
      </DialogTitle>
      <DialogContent>
        <FormControl 
          fullWidth 
          sx={{ 
            mb: 2, 
            mt: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: '#FFC15E',
              },
            }
          }}
        >
          <InputLabel id="language-select-label" sx={{ color: 'white' }}>Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
            sx={{
              textTransform: 'none',
              color: 'white',
              '& .MuiSelect-icon': {
                color: 'white',
              },
            }}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <Editor
            height="400px"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-white"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            bgcolor: 'rgba(79, 79, 79, 0.86)',
            color: 'text.white',
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            bgcolor: 'orange',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              bgcolor: '#FFC15E',
            }
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LeetCodeTaskCard({ task }: { task: Task }) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
  };

  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'rgb(137, 216, 51)';
      case 'Medium':
        return 'rgb(255, 217, 0)';
      case 'Hard':
        return 'rgb(255, 107, 99)';
      default:
        return 'rgb(255, 193, 94)';
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* TODAY Header */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, mb: 2, textAlign: 'center', letterSpacing: '0.05rem', fontSize: '4.5rem', color: 'rgb(0, 0, 0)' }}
      >
        TODAY
      </Typography>

      {/* Title with Difficulty Badge */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mb: 2,
        flexWrap: 'wrap'
      }}>
        {/* Difficulty Badge */}
        <Chip
          label={task.difficulty}
          sx={{
            bgcolor: getDifficultyColor(task.difficulty),
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            px: 1,
            height: '32px',
            '& .MuiChip-label': {
              px: 2,
            }
          }}
        />

        {/* LeetCode Problem Link */}
        <a
          href={task.url ?? ''}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 500,
            color: 'rgb(59, 37, 0)',
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            padding: 0,
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#FFC15E')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgb(59, 37, 0)')}
        >
          {task.title}
        </a>
      </Box>

      {/* Tags */}
      {task.topicTags && task.topicTags.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          justifyContent: 'center',
          mb: 3,
          px: 2,
          maxWidth: '800px'
        }}>
          {task.topicTags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              sx={{
                bgcolor: 'rgba(255, 193, 94, 0.15)',
                color: 'rgb(59, 37, 0)',
                border: '1px solid rgba(255, 193, 94, 0.3)',
                fontWeight: 500,
                fontSize: '0.85rem',
                height: '28px',
                '& .MuiChip-label': {
                  px: 1.5,
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 193, 94, 0.25)',
                  borderColor: 'rgba(255, 193, 94, 0.5)',
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* LeetCode Problem Description */}
      <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'rgb(116, 116, 116)', mb: 4, px: 6 }}>
        To complete today's LeetCode task, please copy and paste your solution code from your code editor or the LeetCode website into the dialog by clicking the button below.
      </Typography>

      
      {/* Upload Button */}
      <Box
        onClick={handleUpload}
        sx={{
          bgcolor: 'orange',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 600,
          px: 3,
          py: 2,
          borderRadius: '25px',
          textTransform: 'none',
          transition: 'background-color 0.5s, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            bgcolor: '#FFC15E',
            transform: 'scale(1.05)',
          },
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Upload size={20} style={{ marginRight: 10 }} />
        UPLOAD
      </Box>

      {/* Upload Dialog */}
      <UploadDialog task={task} open={uploadDialogOpen} onClose={handleCloseDialog} />
    </Box>
  );
}