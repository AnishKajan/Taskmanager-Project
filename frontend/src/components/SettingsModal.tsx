import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Avatar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Snackbar,
  Alert,
} from '@mui/material';
import { createPortal } from 'react-dom'; // ADD THIS IMPORT
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'white',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const avatarColors = [
  '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', 
  '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#795548', '#607d8b', '#f44336'
];

export default function SettingsModal({ open, onClose }: Props) {
  const [privacy, setPrivacy] = useState<'private' | 'public'>('public');
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState('#9c27b0');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const email = localStorage.getItem('email') || '';

  useEffect(() => {
    const fetchUserData = async () => {
      if (!open) return;
      
      try {
        const res = await axios.get(`http://localhost:5050/api/users`);
        const user = res.data.find((u: any) => u.email === email);
        
        if (user) {
          setPrivacy(user.privacy || 'public');
          setUsername(user.username || email.split('@')[0]);
          setOriginalUsername(user.username || email.split('@')[0]);
          setAvatarColor(user.avatarColor || '#9c27b0');
          setAvatarImage(user.avatarImage || null);
        } else {
          // Default values if user not found
          const defaultUsername = email.split('@')[0];
          setUsername(defaultUsername);
          setOriginalUsername(defaultUsername);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        // Fallback to email-based username
        const defaultUsername = email.split('@')[0];
        setUsername(defaultUsername);
        setOriginalUsername(defaultUsername);
      }
    };

    fetchUserData();
  }, [email, open]);

  const handleSave = async () => {
    try {
      if (email) {
        await axios.patch(`http://localhost:5050/api/users/profile`, {
          email,
          privacy,
          username: username.trim(),
          avatarColor,
          avatarImage
        });

        setSnackbar({
          open: true,
          message: 'Settings saved successfully!',
          severity: 'success'
        });

        // Update localStorage if username changed
        if (username !== originalUsername) {
          localStorage.setItem('username', username);
        }

        // Signal to Dashboard that user settings have been updated
        // This will trigger a refresh of user data in Dashboard
        localStorage.setItem('userSettingsUpdated', Date.now().toString());
        
        // Dispatch a custom event to notify other components immediately
        window.dispatchEvent(new CustomEvent('userSettingsUpdated'));
        
        // Also trigger storage event manually for same-window communication
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userSettingsUpdated',
          newValue: Date.now().toString(),
          storageArea: localStorage
        }));
        
        // Do NOT close modal after save - let user close it manually
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    }
  };

  const handleAvatarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarImage(null);
  };

  const handleRevert = () => {
    // Reset to original values
    setUsername(originalUsername);
    setAvatarImage(null);
    setAvatarColor('#9c27b0');
    setPrivacy('public');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const getAvatarContent = () => {
    if (avatarImage) {
      return <Avatar src={avatarImage} sx={{ width: 80, height: 80 }} />;
    }
    
    return (
      <Avatar 
        sx={{ 
          width: 80, 
          height: 80, 
          bgcolor: avatarColor,
          fontSize: '2rem',
          fontWeight: 'bold'
        }}
      >
        {username.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  // Render snackbar using portal to position it relative to the full page
  const renderSnackbar = () => {
    if (typeof document === 'undefined') return null;
    
    return createPortal(
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ zIndex: 9999 }} // Ensure it appears above the modal
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>,
      document.body
    );
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">Settings</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Privacy Setting */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Privacy</InputLabel>
            <Select
              value={privacy}
              label="Privacy"
              onChange={(e: SelectChangeEvent<'private' | 'public'>) =>
                setPrivacy(e.target.value as 'private' | 'public')
              }
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>

          {/* Username Field */}
          <TextField
            fullWidth
            label="Edit Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Avatar Section */}
          <Box mb={3}>
            <Typography variant="h6" mb={2}>Avatar</Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {getAvatarContent()}
              <Box>
                <Button 
                  variant="outlined" 
                  component="label"
                  sx={{ mb: 1, display: 'block' }}
                >
                  Choose Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={handleAvatarImageChange} 
                  />
                </Button>
                {avatarImage && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleRemoveImage}
                    size="small"
                  >
                    Remove Image
                  </Button>
                )}
              </Box>
            </Box>

            {/* Color Picker */}
            {!avatarImage && (
              <Box>
                <Typography variant="body2" mb={1}>Background Color:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {avatarColors.map((color: string) => (
                    <Box
                      key={color}
                      component="div"
                      onClick={() => setAvatarColor(color)}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: avatarColor === color ? '3px solid #000' : '2px solid #ccc',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button 
              onClick={handleLogout} 
              color="error" 
              startIcon={<LogoutIcon />}
              variant="outlined"
            >
              Log Out
            </Button>
            <Box display="flex" gap={1}>
              <Button onClick={handleRevert} variant="outlined">
                Revert
              </Button>
              <Button onClick={handleSave} variant="contained" color="success">
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Render snackbar outside modal using portal */}
      {renderSnackbar()}
    </>
  );
}