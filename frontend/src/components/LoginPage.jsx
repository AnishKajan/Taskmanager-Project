import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Snackbar,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5050/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      const message =
        msg === 'Incorrect Password'
          ? 'Incorrect Password'
          : msg === 'Account not found'
          ? 'Account not found'
          : 'Login failed';
      setSnack({ open: true, message });
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ bgcolor: '#fff' }}
    >
      <Typography variant="h3" fontWeight={800} mb={4}>
        Task Manager
      </Typography>

      <Stack spacing={2} width="300px">
        <TextField
          label="Username or Email"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="filled"
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
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </Stack>
      </Stack>

      <Box mt={4} fontWeight={500} fontSize="1.1rem" display="flex" gap={3}>
        <span style={{ color: 'purple' }}>Work</span>
        <span>•</span>
        <span style={{ color: 'dodgerblue' }}>School</span>
        <span>•</span>
        <span style={{ color: 'orange' }}>Personal</span>
      </Box>

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

export default LoginPage;
