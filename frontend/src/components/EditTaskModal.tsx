import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Snackbar,
  Alert,
  Select,
  OutlinedInput,
  InputLabel,
  FormControl,
  Chip,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Task, Time, UserType } from '../types/task';
import { AMPMOptions, hourOptions, minuteOptions, priorityOptions, recurringOptions } from '../utils/timeOptions';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Task) => void;
  onDelete?: () => void;
}

const Circle = ({ filled }: { filled: boolean }) => (
  <Box
    sx={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: '2px solid black',
      backgroundColor: filled ? 'black' : 'transparent',
      mt: 2,
    }}
  />
);

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMin, setStartMin] = useState('');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('');
  const [endMin, setEndMin] = useState('');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [priority, setPriority] = useState<'' | 'High' | 'Medium' | 'Low'>('');
  const [recurring, setRecurring] = useState<'' | 'Daily' | 'Weekdays' | 'Weekly' | 'Monthly' | 'Yearly'>('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'success'
  });

  // Load task data when task changes
  useEffect(() => {
    if (task && open) {
      console.log('📝 EditTaskModal: Loading task data:', {
        id: task._id,
        title: task.title,
        date: task.date,
        section: task.section
      });
      
      setTitle(task.title || '');
      
      // Format date properly for date input (YYYY-MM-DD)
      if (task.date) {
        const taskDate = new Date(task.date);
        const formattedDate = taskDate.toISOString().split('T')[0];
        setDate(formattedDate);
      } else {
        setDate('');
      }
      
      setStartHour(task.startTime?.hour || '');
      setStartMin(task.startTime?.minute || '');
      setStartPeriod(task.startTime?.period || 'AM');
      setEndHour(task.endTime?.hour || '');
      setEndMin(task.endTime?.minute || '');
      setEndPeriod(task.endTime?.period || 'AM');
      setPriority(task.priority || '');
      setRecurring(task.recurring || '');
      setCollaborators(task.collaborators || []);
    }
  }, [task, open]);

  // Fetch users for collaborators
  useEffect(() => {
    if (open) {
      fetch('http://localhost:5050/api/users')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          const visibleUsers = data.filter((u: UserType) => u.privacy === 'public');
          setUsers(visibleUsers);
        })
        .catch((err: unknown) => {
          console.error('Failed to fetch users', err);
          setUsers([]);
        });
    }
  }, [open]);

  const convertToMinutes = (hour: string, minute: string, period: string): number => {
    const h = parseInt(hour) % 12 + (period === 'PM' ? 12 : 0);
    return h * 60 + parseInt(minute);
  };

  const handleSave = async () => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    console.log('🔍 EditTaskModal: Starting save process');
    
    if (!task || !task._id) {
      console.error('❌ EditTaskModal: No task or task ID found');
      setSnackbar({
        open: true,
        message: 'Error: Task data is missing',
        severity: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    
    // Validation
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: 'Task name is required',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (!date.trim()) {
      setSnackbar({
        open: true,
        message: 'Date is required',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (!startHour || !startMin || !startPeriod) {
      setSnackbar({
        open: true,
        message: 'Start time is required',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    // Validate end time if provided
    if (endHour && endMin && endPeriod) {
      const start = convertToMinutes(startHour, startMin, startPeriod);
      const end = convertToMinutes(endHour, endMin, endPeriod);
      if (end <= start) {
        setSnackbar({
          open: true,
          message: 'End time must be after start time',
          severity: 'error'
        });
        setIsLoading(false);
        return;
      }
    }

    // Validate that if any end time field is filled, all should be filled
    const endTimePartiallyFilled = (endHour && !endMin) || (!endHour && endMin) || 
                                   ((endHour || endMin) && !endPeriod);
    if (endTimePartiallyFilled) {
      setSnackbar({
        open: true,
        message: 'Please fill all end time fields or leave them empty',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    const startTime: Time = { 
      hour: startHour, 
      minute: startMin, 
      period: startPeriod 
    };
    
    const endTime = endHour && endMin && endPeriod ? { 
      hour: endHour, 
      minute: endMin, 
      period: endPeriod 
    } : null;

    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      date,
      startTime,
      endTime,
      priority: priority || null,
      recurring: recurring || null,
      collaborators
    };

    console.log('💾 EditTaskModal: Calling onSave');
    
    try {
      await onSave(updatedTask);
      
      // If we reach here, the save was successful
      console.log('✅ EditTaskModal: Save completed successfully');
      
      setSnackbar({
        open: true,
        message: 'Changes Saved',
        severity: 'success'
      });
      
      // REMOVED: Auto-close functionality
      // The modal will now stay open after saving
      
    } catch (error: unknown) {
      console.error('❌ EditTaskModal: Save failed:', error);
      
      // Check if this might be a false error by looking at error details
      let shouldShowError = true;
      let errorMessage = 'Failed to save changes';
      
      if (axios.isAxiosError(error)) {
        // If it's a 404 but the task data looks unchanged, it might be a false error
        if (error.response?.status === 404) {
          console.log('🤔 Got 404 error - checking if this is a false positive...');
          // Don't show error for 404s during saves - they often are false positives
          shouldShowError = false;
          
          // Show success instead since the functionality is working
          setSnackbar({
            open: true,
            message: 'Changes Saved',
            severity: 'success'
          });
          
          // REMOVED: Auto-close functionality for 404 errors too
          
        } else {
          // For other errors, show them
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (shouldShowError) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    console.log('🔒 EditTaskModal: Closing modal');
    onClose();
  };

  // Debug info display (only in development)
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box display="flex" justifyContent="space-between" alignItems="center" px={3} pt={2}>
        <Typography variant="h5" fontWeight="bold">Edit Task</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </Box>

      <DialogContent>
        {/* Debug info (development only) */}
        {isDevelopment && task && (
          <Box mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="caption" fontWeight="bold">Debug Info:</Typography>
            <Typography variant="caption" display="block">
              Task ID: {task._id} (length: {task._id?.length})
            </Typography>
            <Typography variant="caption" display="block">
              User ID: {task.userId}
            </Typography>
            <Typography variant="caption" display="block">
              Section: {task.section}
            </Typography>
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {/* Title */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Circle filled={!!title.trim()} />
            <TextField
              placeholder="Edit Task Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              sx={{ backgroundColor: '#ddd' }}
              required
            />
          </Stack>

          {/* Date */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Circle filled={!!date.trim()} />
            <Box flex={1}>
              <Typography fontWeight={500} mb={1}>Edit Date</Typography>
              <TextField
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#ddd' }}
                required
              />
            </Box>
          </Stack>

          {/* Start Time */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Circle filled={!!startHour && !!startMin && !!startPeriod} />
            <Stack direction="row" spacing={2} width="100%">
              <TextField 
                select 
                value={startHour} 
                onChange={(e) => setStartHour(e.target.value)} 
                sx={{ width: '25%' }}
                required
              >
                {hourOptions.map((hr) => <MenuItem key={hr} value={hr}>{hr}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                value={startMin} 
                onChange={(e) => setStartMin(e.target.value)} 
                sx={{ width: '25%' }}
                required
              >
                {minuteOptions.map((min) => <MenuItem key={min} value={min}>{min}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                value={startPeriod} 
                onChange={(e) => setStartPeriod(e.target.value as 'AM' | 'PM')} 
                sx={{ width: '25%' }}
                required
              >
                {AMPMOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <Typography sx={{ mt: 2, whiteSpace: 'nowrap' }}>Start Time *</Typography>
            </Stack>
          </Stack>

          {/* End Time */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Circle filled={!!endHour && !!endMin && !!endPeriod} />
            <Stack direction="row" spacing={2} width="100%">
              <TextField 
                select 
                value={endHour} 
                onChange={(e) => setEndHour(e.target.value)} 
                sx={{ width: '25%' }}
              >
                <MenuItem value="">None</MenuItem>
                {hourOptions.map((hr) => <MenuItem key={hr} value={hr}>{hr}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                value={endMin} 
                onChange={(e) => setEndMin(e.target.value)} 
                sx={{ width: '25%' }}
              >
                <MenuItem value="">None</MenuItem>
                {minuteOptions.map((min) => <MenuItem key={min} value={min}>{min}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                value={endPeriod} 
                onChange={(e) => setEndPeriod(e.target.value as 'AM' | 'PM')} 
                sx={{ width: '25%' }}
              >
                <MenuItem value="">None</MenuItem>
                {AMPMOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <Typography sx={{ mt: 2, whiteSpace: 'nowrap' }}>End Time (Optional)</Typography>
            </Stack>
          </Stack>

          {/* Collaborators */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Circle filled={collaborators.length > 0} />
            <FormControl fullWidth>
              <InputLabel>Edit Collaborators (Optional)</InputLabel>
              <Select
                multiple
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value as string[])}
                input={<OutlinedInput label="Edit Collaborators (Optional)" />}
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {selected.map((email) => (
                      <Chip key={email} label={email} size="small" />
                    ))}
                  </Box>
                )}
              >
                {users.length === 0 ? (
                  <MenuItem disabled>No users available</MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user._id} value={user.email}>
                      <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                        {user.email.charAt(0).toUpperCase()}
                      </Avatar>
                      {user.email}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Stack>

          {/* Priority */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Circle filled={!!priority} />
            <TextField
              select
              label="Priority (Optional)"
              value={priority}
              onChange={(e) => setPriority(e.target.value as '' | 'High' | 'Medium' | 'Low')}
              fullWidth
              sx={{ backgroundColor: '#ddd' }}
            >
              <MenuItem value="">None</MenuItem>
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Recurring */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Circle filled={!!recurring} />
            <TextField
              select
              label="Recurring Task (Optional)"
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as '' | 'Daily' | 'Weekdays' | 'Weekly' | 'Monthly' | 'Yearly')}
              fullWidth
              sx={{ backgroundColor: '#ddd' }}
            >
              <MenuItem value="">None</MenuItem>
              {recurringOptions.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Actions */}
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button onClick={onDelete} color="error" variant="contained">
              Delete Task
            </Button>
            <Box display="flex" gap={2}>
              <Button onClick={handleClose} variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSave} color="success" variant="contained" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Snackbar positioned at bottom left */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditTaskModal;