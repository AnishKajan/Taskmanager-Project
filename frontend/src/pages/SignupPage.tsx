import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const API = 'http://localhost:5050/api/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success';
  }>({ open: false, message: '', severity: 'error' });

  // Function to get username from email
  const getUsername = (email: string): string => {
    return email.split('@')[0] || '';
  };

  const handleSignup = async () => {
    try {
      await axios.post(`${API}/signup`, {
        email: email.toLowerCase(),
        password,
      });

      setSnackbar({
        open: true,
        message: 'User Created Successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message === 'Account already exists'
          ? 'Account Already Exists'
          : 'Signup Failed';

      setSnackbar({ open: true, message: msg, severity: 'error' });

      if (msg === 'Account Already Exists') {
        setTimeout(() => navigate('/login'), 1500);
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#fff"
      px={2}
    >
      <IconButton
        onClick={() => navigate('/login')}
        sx={{ position: 'absolute', top: 20, left: 20 }}
      >
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h3" fontWeight="bold" mb={4}>
        Sign Up
      </Typography>

      {/* Avatar Preview Section */}
      {email && (
        <Box mb={3} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="body2" color="text.secondary" mb={1}>
            Your default avatar will be:
          </Typography>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: '#607d8b', // Default grey color
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {getUsername(email).charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="caption" color="text.secondary" mt={1}>
            Username: {getUsername(email)}
          </Typography>
        </Box>
      )}

      <TextField
        placeholder="Enter Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ width: 300, mb: 2, backgroundColor: '#ddd' }}
      />

      <TextField
        placeholder="Enter Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ width: 300, mb: 2, backgroundColor: '#ddd' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        onClick={handleSignup}
        variant="outlined"
        fullWidth
        sx={{ width: 300, fontWeight: 600, backgroundColor: '#eee', boxShadow: 1 }}
      >
        Sign Up
      </Button>

      <Box mt={4} display="flex" gap={3} alignItems="center">
        <Typography sx={{ color: 'purple', fontWeight: 600 }}>Work</Typography>
        <Typography sx={{ fontSize: 20 }}>•</Typography>
        <Typography sx={{ color: 'dodgerblue', fontWeight: 600 }}>School</Typography>
        <Typography sx={{ fontSize: 20 }}>•</Typography>
        <Typography sx={{ color: 'orange', fontWeight: 600 }}>Personal</Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}