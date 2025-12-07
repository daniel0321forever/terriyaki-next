'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Mic, MicOff, Stop } from '@mui/icons-material';
import { getAgentToken, endInterview, AgentTokenResponse, saveAgentResponse } from '@/lib/service/interview.service';
import { getTaskDetail } from '@/lib/service/task.serivice';
import { Task } from '@/types/task.types';

interface ConversationMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

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
  const [showTranscript, setShowTranscript] = useState(false); // Hidden by default

  // ElevenLabs SDK hook
  const {
    startSession,
    endSession,
    status,
    isSpeaking,
    sendUserMessage,
  } = useConversation({
    // Optional: Add callbacks
    onMessage: (message) => {
      console.log('Received message:', message);

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
              console.log('Interview reached 3 messages, ending automatically...');
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

        // 2. Get agent token from backend
        const config = await getAgentToken(taskId);
        setAgentConfig(config);

        setIsLoading(false);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize interview');
        setIsLoading(false);
      }
    }

    initialize();
  }, [taskId]);

  const connectToAgent = async () => {
    if (!agentConfig) return;

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start conversation session
      // According to docs, you need either:
      // 1. agentId + connectionType (for public agents)
      // 2. signedUrl + connectionType (for authenticated WebSocket)
      // 3. conversationToken + connectionType (for authenticated WebRTC)

      const conversationId = await startSession({
        agentId: agentConfig.agent_id,
        connectionType: 'webrtc', // or 'websocket'
        userId: agentConfig.session_id, // optional: your user ID
      });

      console.log('Conversation started:', conversationId);
    } catch (err: any) {
      console.error('Connection error:', err);
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

      // 2. Call backend to end interview and get results
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

  const isConnected = status === 'connected';

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mock Interview</Typography>
        <Chip
          label={isConnected ? 'Connected' : 'Disconnected'}
          color={isConnected ? 'success' : 'default'}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Problem Display */}
      {task && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Difficulty: {task.difficulty}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {task.description}
          </Typography>
        </Paper>
      )}

      {/* Interview Results Section */}
      {showResults && interviewResults && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h5" gutterBottom>
            Interview Completed! 🎉
          </Typography>

          {/* Evaluation */}
          {interviewResults.evaluation && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evaluation
              </Typography>
              <Typography variant="body1">
                <strong>Score:</strong> {interviewResults.evaluation.score || 'N/A'}/100
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                <strong>Feedback:</strong> {interviewResults.evaluation.feedback || 'No feedback available'}
              </Typography>
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
            sx={{ mt: 2 }}
          >
            Back to Grind
          </Button>
        </Paper>
      )}

      {/* Conversation Transcript - Collapsible */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={showTranscript ? 2 : 0}>
          <Typography variant="h6">
            Real-time Transcript
          </Typography>
          <Button
            size="small"
            onClick={() => setShowTranscript(!showTranscript)}
            variant="outlined"
          >
            {showTranscript ? 'Hide' : 'Show'} Transcript
          </Button>
        </Box>
        {showTranscript && (
          <Box sx={{ minHeight: 200, maxHeight: 400, overflow: 'auto' }}>
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
                    p: 1,
                    bgcolor: msg.role === 'user' ? 'action.hover' : 'background.paper',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {msg.role === 'user' ? 'You' : 'Interviewer'} • {msg.timestamp.toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body1">{msg.text}</Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </Paper>

      {/* Audio Controls */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={2} alignItems="center" justifyContent="center">
          {!isConnected ? (
            <Button
              variant="contained"
              onClick={connectToAgent}
              disabled={!agentConfig}
            >
              Start Interview
            </Button>
          ) : (
            <>
              <Chip
                icon={isSpeaking ? <Mic /> : <MicOff />}
                label={isSpeaking ? 'Agent Speaking...' : 'Listening'}
                color={isSpeaking ? 'info' : 'default'}
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<Stop />}
                onClick={endInterviewSession}
                disabled={isEndingInterview || showResults}
              >
                {isEndingInterview ? 'Ending Interview...' : 'End Interview'}
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}