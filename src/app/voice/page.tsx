'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  Container,
} from '@mui/material';
import { CloudUpload, PlayArrow, Pause, Download } from '@mui/icons-material';
import { convertVoice, VoiceConvertParams } from '@/lib/service/voice.service';
import CustomAppBar from '@/app/components/CustomAppBar';
import BackButton from '@/app/components/BackButton';

export default function VoiceChangerPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceId, setVoiceId] = useState('pNInz6obpgDQGcFmaJgB'); // Default voice ID (Adam)
  const [modelId, setModelId] = useState('eleven_multilingual_sts_v2');
  const [style, setStyle] = useState(0.0);
  const [stability, setStability] = useState(1.0);
  const [removeBackgroundNoise, setRemoveBackgroundNoise] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingConverted, setIsPlayingConverted] = useState(false);
  
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const convertedAudioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setError('Please select a valid audio file');
        return;
      }
      
      // Check file size (roughly 5 minutes at 128kbps = ~4.8MB, but we'll allow up to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please use files under 10MB (approximately 5 minutes)');
        return;
      }

      setAudioFile(file);
      setError(null);
      
      // Create URL for original audio preview
      const url = URL.createObjectURL(file);
      setOriginalAudioUrl(url);
      
      // Clean up previous converted audio
      if (convertedAudioUrl) {
        URL.revokeObjectURL(convertedAudioUrl);
        setConvertedAudioUrl(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!voiceId.trim()) {
      setError('Please enter a voice ID');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const params: VoiceConvertParams = {
        voiceId: voiceId.trim(),
        modelId,
        style,
        stability,
        removeBackgroundNoise,
      };

      const convertedBlob = await convertVoice(audioFile, params);
      
      // Create URL for converted audio
      const url = URL.createObjectURL(convertedBlob);
      setConvertedAudioUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to convert voice. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedAudioUrl) {
      const link = document.createElement('a');
      link.href = convertedAudioUrl;
      link.download = `converted_${audioFile?.name || 'audio.mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleOriginalPlayback = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
      } else {
        originalAudioRef.current.play();
      }
      setIsPlayingOriginal(!isPlayingOriginal);
    }
  };

  const toggleConvertedPlayback = () => {
    if (convertedAudioRef.current) {
      if (isPlayingConverted) {
        convertedAudioRef.current.pause();
      } else {
        convertedAudioRef.current.play();
      }
      setIsPlayingConverted(!isPlayingConverted);
    }
  };

  // Cleanup URLs on unmount
  const cleanup = () => {
    if (originalAudioUrl) {
      URL.revokeObjectURL(originalAudioUrl);
    }
    if (convertedAudioUrl) {
      URL.revokeObjectURL(convertedAudioUrl);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CustomAppBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <BackButton />
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2, mb: 4 }}>
          Voice Changer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Transform audio between voices while preserving emotion and delivery. Upload an audio file and convert it to a different voice.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Audio File
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2 }}
            >
              {audioFile ? audioFile.name : 'Select Audio File'}
            </Button>
            {audioFile && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2, display: 'inline' }}>
                ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Voice ID"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="pNInz6obpgDQGcFmaJgB"
            helperText="Enter the ElevenLabs voice ID you want to convert to"
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Model ID"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            helperText="Default: eleven_multilingual_sts_v2"
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Style: {style.toFixed(2)}
            </Typography>
            <Slider
              value={style}
              onChange={(_, value) => setStyle(value as number)}
              min={0}
              max={1}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Set to 0% when input audio is already expressive
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Stability: {stability.toFixed(2)}
            </Typography>
            <Slider
              value={stability}
              onChange={(_, value) => setStability(value as number)}
              min={0}
              max={1}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Use 100% for maximum voice consistency
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={removeBackgroundNoise}
                onChange={(e) => setRemoveBackgroundNoise(e.target.checked)}
              />
            }
            label="Remove Background Noise"
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleConvert}
            disabled={!audioFile || !voiceId.trim() || isConverting}
            sx={{ py: 1.5 }}
          >
            {isConverting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Converting...
              </>
            ) : (
              'Convert Voice'
            )}
          </Button>
        </Paper>

        {/* Audio Players */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Original Audio */}
          {originalAudioUrl && (
            <Paper elevation={2} sx={{ p: 3, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Original Audio
              </Typography>
              <audio
                ref={originalAudioRef}
                src={originalAudioUrl}
                onEnded={() => setIsPlayingOriginal(false)}
                style={{ width: '100%', marginBottom: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={isPlayingOriginal ? <Pause /> : <PlayArrow />}
                onClick={toggleOriginalPlayback}
                fullWidth
              >
                {isPlayingOriginal ? 'Pause' : 'Play'}
              </Button>
            </Paper>
          )}

          {/* Converted Audio */}
          {convertedAudioUrl && (
            <Paper elevation={2} sx={{ p: 3, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Converted Audio
              </Typography>
              <audio
                ref={convertedAudioRef}
                src={convertedAudioUrl}
                onEnded={() => setIsPlayingConverted(false)}
                style={{ width: '100%', marginBottom: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={isPlayingConverted ? <Pause /> : <PlayArrow />}
                  onClick={toggleConvertedPlayback}
                  sx={{ flex: 1 }}
                >
                  {isPlayingConverted ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  sx={{ flex: 1 }}
                >
                  Download
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
}

