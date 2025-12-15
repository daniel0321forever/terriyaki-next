import { useRouter } from 'next/navigation';
import { Task } from '@/types/task.types';
import { Typography, Box, Chip } from '@mui/material';
import { Check } from 'lucide-react';

export default function LeetCodeTaskCard({ task }: { task: Task }) {
  const router = useRouter();

  const handleStartInterview = () => {
    if (typeof task.id !== 'string') {
      console.error('Invalid task ID type:', {
        id: task.id,
        type: typeof task.id,
        expected: 'string (UUID)',
        actual: typeof task.id,
        task: task
      });
      alert(`Task ID must be a string (UUID), but got ${typeof task.id}.`);
      return;
    }
    router.push(`/interview/${task.id}`);
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
        To complete today&apos;s LeetCode task, please copy and paste your solution code from your code editor or the LeetCode website into the dialog by clicking the button below.
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
        <Box
          onClick={handleStartInterview}
          sx={{
            bgcolor: 'rgb(79, 79, 79)',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 600,
            px: 3,
            py: 2,
            borderRadius: '25px',
            textTransform: 'none',
            transition: 'background-color 0.5s, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
            '&:hover': {
              bgcolor: 'rgb(60, 60, 60)',
              transform: 'scale(1.05)',
            },
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={20} style={{ marginRight: 10 }} />
          CHECK IN
        </Box>
      </Box>
    </Box>
  );
}