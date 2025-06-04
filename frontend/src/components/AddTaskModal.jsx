import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  Button, Checkbox, FormControlLabel, Box, Stack, Typography, InputLabel, FormControl
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const CircleIndicator = ({ filled }) => (
  <Box width={20} height={20} borderRadius="50%" border="2px solid black" bgcolor={filled ? 'black' : 'transparent'} flexShrink={0} />
);

export default function AddTaskModal({ open, onClose, onAdd, section }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [startHour, setStartHour] = useState('');
  const [startMin, setStartMin] = useState('');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('');
  const [endMin, setEndMin] = useState('');
  const [endPeriod, setEndPeriod] = useState('AM');
  const [collaborators, setCollaborators] = useState([]);
  const [users, setUsers] = useState([]);
  const [priority, setPriority] = useState('');
  const [recurring, setRecurring] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get('http://localhost:5050/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    }
    fetchUsers();
  }, []);

  const resetFields = () => {
    setName('');
    setDate(new Date());
    setStartHour('');
    setStartMin('');
    setStartPeriod('AM');
    setEndHour('');
    setEndMin('');
    setEndPeriod('AM');
    setCollaborators([]);
    setPriority('');
    setRecurring(false);
  };

  const handleClose = () => {
    resetFields();
    if (typeof onClose === 'function') onClose();
  };

  const handleSubmit = () => {
    if (!name || startHour === '' || startMin === '') {
      console.warn('⚠️ Missing required fields:', { name, startHour, startMin });
      return;
    }

    const task = {
      name,
      date: date.toISOString(),
      startHour,
      startMin,
      startPeriod,
      endHour,
      endMin,
      endPeriod,
      collaborators,
      priority,
      recurring,
      section,
    };

    console.log('📤 Submitting task:', task);

    if (typeof onAdd === 'function') {
      onAdd(task);
      handleClose();
    } else {
      console.error('❌ `onAdd` is not a function:', onAdd);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} disableEnforceFocus>
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircleIndicator filled />
              <TextField
                fullWidth
                label="Enter Task Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <CircleIndicator filled />
              <DatePicker
                label="Enter Starting Date"
                value={date}
                onChange={(newVal) => setDate(newVal)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <CircleIndicator filled />
              <Box display="flex" flexDirection="column">
                <Typography fontSize={13} fontWeight={600} mb={0.5}>Start Time</Typography>
                <Box display="flex" gap={1}>
                  <Select value={startHour} onChange={(e) => setStartHour(e.target.value)} size="small" displayEmpty>
                    <MenuItem value="">Hr</MenuItem>
                    {[...Array(12)].map((_, i) => <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>)}
                  </Select>
                  :
                  <Select value={startMin} onChange={(e) => setStartMin(e.target.value)} size="small" displayEmpty>
                    <MenuItem value="">Min</MenuItem>
                    {[0, 15, 30, 45].map(m => <MenuItem key={m} value={m}>{m.toString().padStart(2, '0')}</MenuItem>)}
                  </Select>
                  <Select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)} size="small">
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <CircleIndicator filled={!!endHour || !!endMin} />
              <Box display="flex" flexDirection="column">
                <Typography fontSize={13} fontWeight={600} mb={0.5}>End Time (Optional)</Typography>
                <Box display="flex" gap={1}>
                  <Select value={endHour} onChange={(e) => setEndHour(e.target.value)} size="small" displayEmpty>
                    <MenuItem value="">Hr</MenuItem>
                    {[...Array(12)].map((_, i) => <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>)}
                  </Select>
                  :
                  <Select value={endMin} onChange={(e) => setEndMin(e.target.value)} size="small" displayEmpty>
                    <MenuItem value="">Min</MenuItem>
                    {[0, 15, 30, 45].map(m => <MenuItem key={m} value={m}>{m.toString().padStart(2, '0')}</MenuItem>)}
                  </Select>
                  <Select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)} size="small">
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <CircleIndicator filled={collaborators.length > 0} />
              <FormControl fullWidth>
                <InputLabel>Collaborators</InputLabel>
                <Select
                  multiple
                  value={collaborators}
                  onChange={(e) => setCollaborators(e.target.value)}
                  label="Collaborators"
                  size="small"
                >
                  {users.map(user => (
                    <MenuItem key={user._id} value={user.email}>{user.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <CircleIndicator filled={!!priority} />
              <FormControl fullWidth>
                <InputLabel>Priority (Optional)</InputLabel>
                <Select value={priority} onChange={(e) => setPriority(e.target.value)} label="Priority (Optional)">
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <CircleIndicator filled={recurring} />
              <FormControlLabel
                control={<Checkbox checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />}
                label="Recurring Task"
              />
            </Stack>
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="success" onClick={handleSubmit}>Add</Button>
        <Button variant="outlined" color="error" onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
