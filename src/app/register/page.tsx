'use client';

import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { register } from '@/lib/service/auth.service';

import { useUserStore } from '@/lib/stores/auth.store';

export default function RegisterPage() {
  const router = useRouter();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const setUser = useUserStore((state: any) => state.setUser);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsRegistering(true);

    register(email, password, name).then((user) => {
      setUser(user);
      router.push('/grind/new');
    }).catch((error) => {
      switch (error.message) {
        case "DUPLICATE_ENTRY":
          alert("Email already in use");
          break;
        default:
          alert("Something went wrong");
      }
    }).finally(() => {
      setIsRegistering(false);
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
          Get Started
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
          Create your account and start your grind
        </Typography>

        {/* Register Form */}
        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

          <Button
            type="submit"
            disabled={isRegistering}
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
            <UserPlus size={20} />
            Sign Up
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgb(116, 116, 116)',
                fontSize: '0.95rem',
              }}
            >
              Already have an account?{' '}
              <Link
                href="/login"
                sx={{
                  color: '#FFC15E',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

