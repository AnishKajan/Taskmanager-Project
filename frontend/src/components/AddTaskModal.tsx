import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, MenuItem, Avatar, Chip, Select,
  OutlinedInput, InputLabel, FormControl, Stack, Snackbar, Alert, Portal
} from '@mui/material';
import {
  AMPMOptions, hourOptions, minuteOptions, priorityOptions, recurringOptions,
} from '../utils/timeOptions';
import { UserType } from '../types/task';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: any) => void;
  section: string;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 4,
  p: 4,
};

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

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, onAdd, section }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('8');
  const [startMin, setStartMin] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('');
  const [endMin, setEndMin] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [priority, setPriority] = useState('');
  const [recurring, setRecurring] = useState<'' | 'Daily' | 'Weekdays' | 'Weekly' | 'Monthly' | 'Yearly'>('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Reset form when modal opens with default values for required fields
  useEffect(() => {
    if (open) {
      setTitle('');
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setStartHour('8');
      setStartMin('00');
      setStartPeriod('AM');
      setEndHour('');
      setEndMin('');
      setEndPeriod('');
      setPriority('');
      setRecurring('');
      setCollaborators([]);
    }
  }, [open]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (open && token) {
      fetch('http://localhost:5050/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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
        .catch(err => {
          console.error('Failed to fetch users', err);
          setUsers([]);
        });
    }
  }, [open]);

  const convertToMinutes = (hour: string, minute: string, period: string): number => {
    const h = parseInt(hour) % 12 + (period === 'PM' ? 12 : 0);
    return h * 60 + parseInt(minute);
  };

  const handleAdd = () => {
    console.log('🔍 Form validation started');
    console.log('Title:', title);
    console.log('Date:', date);
    console.log('Start time:', startHour, startMin, startPeriod);
    console.log('Section:', section);

    // Validation for required fields
    if (!title.trim()) {
      setSnackbarMessage('Task name is required');
      setSnackbarOpen(true);
      return;
    }

    if (!date.trim()) {
      setSnackbarMessage('Date is required');
      setSnackbarOpen(true);
      return;
    }

    if (!startHour || !startMin || !startPeriod) {
      setSnackbarMessage('Start time is required');
      setSnackbarOpen(true);
      return;
    }

    // Validate end time if any end time field is provided
    const hasEndTime = endHour || endMin || endPeriod;
    const hasCompleteEndTime = endHour && endMin && endPeriod;
    
    if (hasEndTime && !hasCompleteEndTime) {
      setSnackbarMessage('Please complete all end time fields or leave them empty');
      setSnackbarOpen(true);
      return;
    }

    // Validate end time is after start time
    if (hasCompleteEndTime) {
      const start = convertToMinutes(startHour, startMin, startPeriod);
      const end = convertToMinutes(endHour, endMin, endPeriod);
      if (end <= start) {
        setSnackbarMessage('End time cannot be earlier than or equal to start time');
        setSnackbarOpen(true);
        return;
      }
    }

    // Ensure consistent date format (YYYY-MM-DD)
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    const taskData = {
      title: title.trim(),
      date: normalizedDate,
      section: section,
      startTime: {
        hour: startHour,
        minute: startMin,
        period: startPeriod,
      },
      endTime: hasCompleteEndTime ? {
        hour: endHour,
        minute: endMin,
        period: endPeriod,
      } : null,
      priority: priority || null,
      recurring: recurring || null,
      collaborators,
      status: 'Pending'
    };

    console.log('📤 Sending task data:', taskData);
    onAdd(taskData);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>Add Task</Typography>

          {/* Task Name */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Circle filled={true} />
            <TextField
              placeholder="Enter Task Name"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ backgroundColor: '#ddd' }}
              required
              error={!title.trim()}
              helperText={!title.trim() ? 'Task name is required' : ''}
            />
          </Stack>

          {/* Date */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Circle filled={true} />
            <Box flex={1}>
              <Typography fontWeight={500} mb={1}>Enter Starting Date *</Typography>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{ backgroundColor: '#ddd' }}
                required
                error={!date.trim()}
                helperText={!date.trim() ? 'Date is required' : ''}
              />
            </Box>
          </Stack>

          {/* Start Time */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Circle filled={true} />
            <Stack direction="row" spacing={2} width="100%">
              <TextField 
                select 
                value={startHour} 
                onChange={(e) => setStartHour(e.target.value)} 
                sx={{ width: '25%' }}
                required
                error={!startHour}
              >
                {hourOptions.map((hr) => <MenuItem key={hr} value={hr}>{hr}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                value={startMin} 
                onChange={(e) => setStartMin(e.target.value)} 
                sx={{ width: '25%' }}
                required
                error={!startMin}
              >
                {minuteOptions.map((min) => <MenuItem key={min} value={min}>{min}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                value={startPeriod} 
                onChange={(e) => setStartPeriod(e.target.value)} 
                sx={{ width: '25%' }}
                required
                error={!startPeriod}
              >
                {AMPMOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <Typography sx={{ mt: 2 }}>Add Start Time *</Typography>
            </Stack>
          </Stack>

          {/* End Time */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
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
                onChange={(e) => setEndPeriod(e.target.value)} 
                sx={{ width: '25%' }}
              >
                <MenuItem value="">None</MenuItem>
                {AMPMOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <Typography sx={{ mt: 2 }}>Add End Time (Optional)</Typography>
            </Stack>
          </Stack>

          {/* Collaborators */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Circle filled={collaborators.length > 0} />
            <FormControl fullWidth>
              <InputLabel>Add Collaborators (Optional)</InputLabel>
              <Select
                multiple
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value as string[])}
                input={<OutlinedInput label="Add Collaborators (Optional)" />}
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
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Circle filled={!!priority} />
            <TextField
              select
              label="Priority (Optional)"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Recurring */}
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <Circle filled={!!recurring} />
            <TextField
              select
              label="Recurring Task"
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as '' | 'Daily' | 'Weekdays' | 'Weekly' | 'Monthly' | 'Yearly')}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {recurringOptions.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose} variant="contained" color="error">Cancel</Button>
            <Button onClick={handleAdd} variant="contained" color="success">Add</Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar positioned relative to the entire screen using Portal */}
      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ zIndex: 9999 }} // Ensure it appears above everything including modals
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
};

export default AddTaskModal;