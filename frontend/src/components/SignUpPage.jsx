import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await axios.post('http://localhost:5050/api/auth/register', { 
        email, 
        password 
    });


      setSnack({ open: true, message: 'Account Created Successfully' });

      setTimeout(() => navigate('/tasks'), 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setSnack({ open: true, message: 'Account Already Exists' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        setSnack({ open: true, message: 'Signup failed' });
      }
    }
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      {/* Back Arrow */}
      <IconButton
        onClick={() => navigate('/')}
        sx={{ position: 'absolute', top: 20, left: 20 }}
      >
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      {/* Title and Form */}
      <Typography variant="h3" fontWeight={800} mb={4}>
        Sign Up
      </Typography>

      <Stack spacing={2} width="300px">
        <TextField
          label="Enter Email"
          variant="filled"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Enter Password"
          type={showPassword ? 'text' : 'password'}
          variant="filled"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={handleSignUp}>
          Sign Up
        </Button>
      </Stack>

      {/* Footer label section */}
      <Box mt={4} fontWeight={500} fontSize="1.1rem" display="flex" gap={3} justifyContent="center">
        <span style={{ color: 'purple' }}>Work</span>
        <span>•</span>
        <span style={{ color: 'dodgerblue' }}>School</span>
        <span>•</span>
        <span style={{ color: 'orange' }}>Personal</span>
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message={snack.message}
      />
    </Box>
  );
};

export default SignUpPage;
