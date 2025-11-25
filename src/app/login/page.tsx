'use client';

import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

import { login } from '@/lib/service/auth.service';
import { useUserStore } from '@/lib/stores/auth.store';
import { useGrindStore } from '@/lib/stores/grind.store';
import { ERROR_CODE_INVALID_EMAIL, ERROR_CODE_INVALID_PASSWORD } from '@/config/error_code';


export default function LoginPage() {
  const router = useRouter();
  const setUser = useUserStore((state: any) => state.setUser);
  const setGrind = useGrindStore((state: any) => state.setCurrentGrind);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    login(email, password).then(({ user, currentGrind }) => {
      setUser(user);
      setGrind(currentGrind);
      router.push('/grind/new');
    }).catch((error) => {
      switch (error.message) {
        case ERROR_CODE_INVALID_EMAIL:
          alert("Invalid email");
          break;
        case ERROR_CODE_INVALID_PASSWORD:
          alert("Invalid password");
          break;
      }
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f5e6d3',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, sm: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '500px', md: '600px' },
        }}
      >
        {/* Back to Home Link */}
        <Box sx={{ mb: 4 }}>
          <Link
            href="/"
            sx={{
              color: 'rgb(116, 116, 116)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                color: 'rgb(0, 0, 0)',
              },
              transition: 'color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            ← Back to Home
          </Link>
        </Box>

        {/* Title */}
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
          Welcome Back
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', sm: '1.2rem' },
            color: 'rgb(116, 116, 116)',
            mb: 5,
            fontWeight: 400,
          }}
        >
          Sign in to continue your grind
        </Typography>

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
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

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
            <Link
              href="#"
              sx={{
                color: 'rgb(116, 116, 116)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': {
                  color: '#FFC15E',
                },
                transition: 'color 0.2s',
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
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
              transition: 'all 0.3s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <LogIn size={20} />
            Sign In
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgb(116, 116, 116)',
                fontSize: '0.95rem',
              }}
            >
              Don't have an account?{' '}
              <Typography
                component="span"
                onClick={() => router.push('/register')}
                style={{ cursor: 'pointer' }}
                sx={{
                  color: '#FFC15E',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

