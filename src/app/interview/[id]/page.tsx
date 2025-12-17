'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConversation } from '@elevenlabs/react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import { Mic, MicOff, Stop } from '@mui/icons-material';
import { getAgentToken, endInterview, AgentTokenResponse, saveAgentResponse } from '@/lib/service/interview.service';
import { getTaskDetail, submitTask } from '@/lib/service/task.serivice';
import { Task } from '@/types/task.types';
import CustomAppBar from '@/app/components/CustomAppBar';

interface ConversationMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

// Map display language names to Monaco Editor language identifiers
const getMonacoLanguage = (displayLang: string): string => {
  const langMap: { [key: string]: string } = {
    'Javascript': 'javascript',
    'Typescript': 'typescript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'C': 'c',
    'C#': 'csharp',
    'Go': 'go',
    'Rust': 'rust',
    'Kotlin': 'kotlin',
    'Swift': 'swift',
  };
  return langMap[displayLang] || displayLang.toLowerCase();
};

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [interviewResults, setInterviewResults] = useState<{
    transcript: any[];
    evaluation: any;
  } | null>(null);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false); // Visible by default for split view
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [showHomeWarning, setShowHomeWarning] = useState(false);
  const [wasManuallyEnded, setWasManuallyEnded] = useState(false);

  // Build agent overrides from task data (memoized to avoid recalculation)
  const agentOverrides = useMemo(() => {
    if (!task) {
      return undefined;
    }

    const codeSection = code ? `

CANDIDATE'S SUBMITTED CODE (${language}):
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

You have access to the candidate's submitted code above. Use it as a reference when asking questions about their implementation, approach, and complexity analysis.` : '';

    const prompt = `You are a technical coding interview assistant helping a candidate practice explaining their LeetCode solution approach. Your role is to conduct a focused, efficient interview that evaluates problem-solving skills and communication.

PROBLEM CONTEXT:
- Title: ${task.title}
- Difficulty: ${task.difficulty}
- Topic tags that might be relevant: ${task.topicTags?.join(', ') || 'N/A'}

PROBLEM DESCRIPTION:
${task.description}

PROBLEM CONSTRAINTS:
${task.constraints && task.constraints.length > 0
  ? task.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')
  : 'N/A'}

PROBLEM EXAMPLES:
${task.examples && task.examples.length > 0
  ? task.examples.map((ex, i) =>
      `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}${ex.explanation ? `\n  Explanation: ${ex.explanation}` : ''}`
    ).join('\n\n')
  : 'N/A'}${codeSection}

YOUR TASKS:
1. Ask Crucial Questions: Focus on key technical aspects:
   - Time and space complexity analysis
   - Edge cases and boundary conditions
   - Algorithm choice and rationale
   - Data structure selection
   - Optimization opportunities

2. Guide Thought Process: Help candidates think through their approach step-by-step when they seem stuck or unclear.

3. Evaluate Communication: Assess how well the candidate explains their solution, not just correctness.

4. Provide Constructive Feedback: Offer helpful insights while maintaining a supportive interview environment.

Keep the interview focused and efficient. Ask 2-3 key questions that demonstrate the candidate's understanding of the problem and their solution approach.
Count the number of times the user responded. End the call after the user responded for the third time with short messages.
`;

    const firstMessage = `Hi! I'll be interviewing you about the LeetCode problem "${task.title}".

Can you start by explaining your thinking process and approach to solving this problem?`;

    return {
      agent: {
        prompt: {
          prompt: prompt,
        },
        firstMessage: firstMessage,
        language: 'en',
      },
    };
  }, [task, code, language]);

  // ElevenLabs SDK hook with dynamic overrides based on task
  const {
    startSession,
    endSession,
    status,
    isSpeaking,
    sendUserMessage,
    sendContextualUpdate,
  } = useConversation({
    overrides: agentOverrides,
    // Callbacks
    onMessage: (message) => {
      // Extract message text properly
      let messageText = '';
      let messageRole: 'user' | 'agent' = 'agent';

      if (typeof message === 'string') {
          messageText = message;
      } else if (message && typeof message === 'object') {
          // Try different possible properties
          messageText = (message as any).text
          || (message as any).content
          || (message as any).message
          || (message as any).transcript
          || '';

          // If still empty, try to extract from nested objects
          if (!messageText && (message as any).data) {
          messageText = (message as any).data.text || (message as any).data.content || '';
          }

          // If still empty, log the full object for debugging
          if (!messageText) {
          console.warn('Could not extract text from message:', message);
          messageText = JSON.stringify(message); // Fallback
          }

          messageRole = (message as any).role ||
          ((message as any).type === 'user_transcript' ? 'user' : 'agent');
      }

      // Add to conversation state
      const newMessage = {
          role: messageRole,
          text: messageText,
          timestamp: new Date(),
      };

      setConversation(prev => [...prev, newMessage]);

      // If it's an agent message, save it to backend
      if (messageRole === 'agent' && agentConfig) {
          saveAgentResponse(agentConfig.session_id, messageText).then(result => {
            // Check if we should end the interview
            if (result.shouldEndInterview) {
              console.log('Interview reached limit, ending automatically...');
              setWasManuallyEnded(false);
              endInterviewSession();
            }
          }).catch(err => {
          console.error('Failed to save agent response message:', err);
          });
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      // Error is a string, not an object
      setError(`Connection error: ${error}`);
    },
    onConnect: () => {
      console.log('Connected to ElevenLabs Agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs Agent');
    },
  });

  // Initialize: Get task and agent token
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);

        // 1. Get task details
        const taskData = await getTaskDetail(taskId);
        setTask(taskData);
        setCode(taskData.code || '');
        setLanguage(taskData.language || 'Python');
        // Mark code as submitted if it already exists
        setCodeSubmitted(!!taskData.code);

        // 2. Get agent token from backend
        const config = await getAgentToken(taskId);
        setAgentConfig(config);

        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize interview:', err);
        setError(err.message || 'Failed to initialize interview');
        setIsLoading(false);
      }
    }

    initialize();
  }, [taskId]);

  const connectToAgent = async () => {
    if (!agentConfig || !task || !agentOverrides) {
      setError('Interview setup is not ready. Please wait...');
      return;
    }

    // Require code submission before starting interview
    if (!codeSubmitted || !code) {
      setError('Please submit your code before starting the interview.');
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start conversation session
      const conversationId = await startSession({
        agentId: agentConfig.agent_id,
        connectionType: 'webrtc',
        userId: agentConfig.session_id,
      });

      console.log('Interview started:', conversationId);
    } catch (err: any) {
      console.error('Failed to start interview:', err);
      setError(`Failed to connect: ${err.message}`);
    }
  };

  /**
   * Ends the interview session and displays results
   * Can be called manually (End button) or automatically (3-message limit)
   */
  const endInterviewSession = async () => {
    if (!agentConfig) {
      // If no agent config, just end the session
      await endSession();
      return;
    }

    try {
      setIsEndingInterview(true);

      // 1. End ElevenLabs session first
      await endSession();

      // 2. Call backend to end interview and get results (backend will further call Gemini LLM to evaluate the conversation)
      const result = await endInterview(agentConfig.session_id);
      console.log('Interview ended with results:', result);

      // 3. Parse transcript
      let transcript: any[] = [];
      if (result.transcript) {
        try {
          transcript = Array.isArray(result.transcript)
            ? result.transcript
            : JSON.parse(result.transcript);
        } catch (e) {
          console.error('Error parsing transcript:', e);
          transcript = [];
        }
      }

      // 4. Store results and display them
      setInterviewResults({
        transcript,
        evaluation: result.evaluation || {},
      });
      setShowResults(true);
      // Note: We don't update conversation state here since real-time transcript is already displayed
    } catch (err: any) {
      console.error('Error ending interview:', err);
      setError(`Failed to end interview: ${err.message}`);
    } finally {
      setIsEndingInterview(false);
    }
  };

  const handleSubmitCode = async () => {
    try {
      setIsSubmittingCode(true);
      await submitTask(code, language);
      setCodeSubmitted(true);

      // Notify the agent with the actual code (if interview is active)
      if (status === 'connected' && code) {
        sendContextualUpdate(
          `The candidate has submitted their code solution in ${language}. Here is their code:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

You can now ask them to explain their implementation, discuss time/space complexity, edge cases, or review their approach. Reference specific parts of their code in your questions.`
        );
      }
    } catch (err: any) {
      console.error('Code submit error:', err);
      setError(err.message || 'Failed to submit code');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const isCheckInComplete = codeSubmitted && showResults;

  const handleBackToGrind = () => {
    router.push(`/grind/${taskId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing interview...</Typography>
      </Box>
    );
  }

  if (error && !task) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Ensure task is defined before rendering main content
  // This guarantees task is not null for the rest of the component
  if (!task) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading task details...</Typography>
      </Box>
    );
  }

  const isConnected = status === 'connected';

  const handleHomeClick = () => {
    if (isConnected && !showResults) {
      // Show warning if interview is active
      setShowHomeWarning(true);
    } else {
      // Navigate directly if no active interview
      router.push('/');
    }
  };

  const handleConfirmLeave = () => {
    // End the session if connected
    if (isConnected) {
      endSession();
    }
    setShowHomeWarning(false);
    router.push('/');
  };

  const handleCancelLeave = () => {
    setShowHomeWarning(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CustomAppBar onHomeClick={handleHomeClick} />
      <Box sx={{ pt: '100px', px: { xs: 2, sm: 3, md: 4, lg: 6 }, pb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Check-in Task</Typography>
        <Chip
            label={
              isCheckInComplete
                ? 'Check-in Complete'
                : isConnected
                  ? 'Connected'
                  : 'Disconnected'
            }
            color={isCheckInComplete ? 'success' : isConnected ? 'info' : 'default'}
        />
      </Box>

      {/* Warning Dialog */}
      <Dialog
        open={showHomeWarning}
        onClose={handleCancelLeave}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Leave Interview?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You have an active interview session. Leaving now will end the interview. Are you sure you want to leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLeave} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLeave}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: 'rgba(79, 79, 79, 0.86)',
              '&:hover': {
                bgcolor: 'rgba(60, 60, 60, 0.95)',
              },
            }}
          >
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Problem Display */}
      {task && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
            {task.title}
          </Typography>
            {task.url && (
              <Button
                variant="contained"
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  bgcolor: 'rgba(79, 79, 79, 0.86)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: '25px',
                  boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(60, 60, 60, 0.95)',
                    boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                View on LeetCode →
              </Button>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Difficulty: {task.difficulty}
          </Typography>
        </Paper>
      )}

      {/* Two-Column Layout: Code Submission (Left) and Verbal Interview (Right) */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Left Column - Code Submission */}
        <Paper sx={{ flex: 1, p: 3, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Code Submission
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                {[
                  'Javascript',
                  'Typescript',
                  'Python',
                  'Java',
                  'C++',
                  'C',
                  'C#',
                  'Go',
                  'Rust',
                  'Kotlin',
                  'Swift',
                ].map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSubmitCode}
              disabled={isSubmittingCode || !code || codeSubmitted}
              sx={{
                bgcolor: codeSubmitted ? '#84cc16' : 'rgba(79, 79, 79, 0.86)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: '25px',
                boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  bgcolor: codeSubmitted ? '#84cc16' : 'rgba(60, 60, 60, 0.95)',
                  boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  bgcolor: codeSubmitted ? '#84cc16' : 'rgba(79, 79, 79, 0.5)',
                  color: codeSubmitted ? 'white' : 'rgba(255, 255, 255, 0.7)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {isSubmittingCode ? 'Submitting...' : codeSubmitted ? '✓ Code Submitted' : 'Submit Code'}
            </Button>
          </Box>
          <Box sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            flex: 1,
            minHeight: 0,
          }}>
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-light"
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
                placeholder: 'Paste your solution code here...',
              }}
            />
          </Box>
        </Paper>

        {/* Right Column - Verbal Interview */}
        <Paper sx={{ flex: 1, p: 3, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Verbal Interview
          </Typography>

          {/* Conversation Transcript */}
          <Box sx={{ mb: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Real-time Transcript
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowTranscript(!showTranscript)}
                sx={{
                  textTransform: 'none',
                  bgcolor: 'rgba(79, 79, 79, 0.86)',
                  color: 'white',
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  borderRadius: '25px',
                  boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(60, 60, 60, 0.95)',
                    boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
            </Box>
            {showTranscript && (
              <Box sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                flex: 1,
                overflow: 'auto',
                bgcolor: 'grey.50',
                minHeight: 0,
              }}>
                {conversation.length === 0 ? (
                  <Typography color="text.secondary">
                    {showResults
                      ? 'No transcript available'
                      : 'Explain your solution after pressing the button below. The transcript will appear here as you speak.'}
                  </Typography>
                ) : (
                  conversation.map((msg, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {msg.role === 'user' ? 'You' : 'Interviewer'} • {msg.timestamp.toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body1">{msg.text}</Typography>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>

          {/* Audio Controls */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {!isConnected ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Tooltip
                  title={!codeSubmitted ? "Please submit your code first" : ""}
                  arrow
                  placement="top"
                >
                  <span>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={connectToAgent}
                      disabled={!agentConfig || !codeSubmitted}
                      sx={{
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        bgcolor: 'rgba(79, 79, 79, 0.86)',
                        color: 'white',
                        borderRadius: '25px',
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(60, 60, 60, 0.95)',
                          boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(79, 79, 79, 0.5)',
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      Start Interview
                    </Button>
                  </span>
                </Tooltip>
                {!codeSubmitted && (
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                    ⚠️ Submit your code first
                  </Typography>
                )}
              </Box>
            ) : (
              <>
                <Chip
                  icon={isSpeaking ? <Mic /> : <MicOff />}
                  label={isSpeaking ? 'Agent Speaking...' : 'Listening'}
                  color={isSpeaking ? 'info' : 'default'}
                  sx={{ fontSize: '1rem', py: 2.5 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Stop />}
                  onClick={() => {
                    setWasManuallyEnded(true);
                    endInterviewSession();
                  }}
                  disabled={isEndingInterview || showResults}
                  sx={{
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    bgcolor: 'rgba(79, 79, 79, 0.86)',
                    color: 'white',
                    borderRadius: '25px',
                    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(60, 60, 60, 0.95)',
                      boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(79, 79, 79, 0.5)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {isEndingInterview ? 'Ending Interview...' : 'End Interview'}
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Check-in Complete Section */}
      {isCheckInComplete && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h5" gutterBottom>
            Check-in Complete! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have successfully submitted your code and completed the interview. Great work!
          </Typography>
        </Paper>
      )}

      {/* Interview Results Section */}
      {showResults && interviewResults && (
        <Paper sx={{
          p: 3,
          mb: 3,
          bgcolor: wasManuallyEnded ? 'warning.light' : (codeSubmitted ? 'success.light' : 'info.light'),
          color: wasManuallyEnded ? 'warning.contrastText' : (codeSubmitted ? 'success.contrastText' : 'info.contrastText'),
        }}>
          <Typography variant="h5" gutterBottom>
            Interview Completed! 🎉
          </Typography>
          {wasManuallyEnded && (
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
              Interview was ended manually before completion.
            </Typography>
          )}
          {!codeSubmitted && (
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
              Don't forget to submit your code above to complete your check-in!
            </Typography>
          )}

          {/* Evaluation */}
          {interviewResults.evaluation && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evaluation
              </Typography>
              <Typography variant="body1">
                <strong>Score:</strong> {interviewResults.evaluation.score || 'N/A'}/100
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Feedback:</Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    '& p': { mb: 1, lineHeight: 1.6 },
                    '& strong': { fontWeight: 700 },
                    '& ul': { pl: 3, my: 1 },
                    '& li': { mb: 0.5 },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: (interviewResults.evaluation.feedback || 'No feedback available')
                      // Convert **bold** to <strong>
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      // Convert - list items to <li>
                      .replace(/^- (.+)$/gm, '<li>$1</li>')
                      // Wrap consecutive <li> in <ul>
                      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                      // Convert double newlines to paragraph breaks
                      .replace(/\n\n/g, '</p><p>')
                      // Wrap in paragraphs
                      .replace(/^(.)/,'<p>$1')
                      .replace(/(.)$/,'$1</p>')
                  }}
                />
              </Box>
              {interviewResults.evaluation.strengths && interviewResults.evaluation.strengths.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2"><strong>Strengths:</strong></Typography>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {interviewResults.evaluation.strengths.map((strength: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{strength}</li>
                    ))}
                  </ul>
                </Box>
              )}
              {interviewResults.evaluation.improvements && interviewResults.evaluation.improvements.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2"><strong>Areas for Improvement:</strong></Typography>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {interviewResults.evaluation.improvements.map((improvement: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{improvement}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleBackToGrind}
            sx={{
              mt: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              bgcolor: 'rgba(79, 79, 79, 0.86)',
              color: 'white',
              borderRadius: '25px',
              boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(60, 60, 60, 0.95)',
                boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.3)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Back to Grind
          </Button>
        </Paper>
          )}
        </Box>
    </Box>
  );
}