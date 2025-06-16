import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, IconButton, TextField, Avatar, Stack, Button, Snackbar, Alert
} from '@mui/material';
import { CalendarToday, Settings } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types/task';
import SettingsModal from '../components/SettingsModal'; // ADD THIS IMPORT

const API = 'http://localhost:5050/api';

const sectionColors: Record<string, string> = {
  work: '#8000B2',
  school: '#1E90FF',
  personal: '#FFA500'
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    case 'low': return 'green';
    default: return 'gray';
  }
};

const Archive: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false); // ADD THIS STATE
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`${API}/tasks/archive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Archive tasks:', res.data);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching archive tasks:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch archived tasks',
        severity: 'error'
      });
    }
  };

  const daysLeftToDelete = (deletedAt: string) => {
    const deletionDate = new Date(deletedAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - deletionDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 5 - diffInDays);
  };

  const handleRecover = async (taskId: string) => {
    try {
      await axios.patch(`${API}/tasks/restore/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({
        open: true,
        message: 'Task restored successfully',
        severity: 'success'
      });
      
      fetchTasks();
    } catch (err) {
      console.error('Failed to recover task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to restore task',
        severity: 'error'
      });
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      try {
        await axios.delete(`${API}/tasks/permanent/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSnackbar({
          open: true,
          message: 'Task permanently deleted',
          severity: 'success'
        });
        
        fetchTasks();
      } catch (err) {
        console.error('Failed to permanently delete task:', err);
        setSnackbar({
          open: true,
          message: 'Failed to permanently delete task',
          severity: 'error'
        });
      }
    }
  };

  // FIXED NAVIGATION HANDLERS
  const handleTabNavigation = (tabIndex: number) => {
    // Navigate to dashboard with specific tab
    navigate('/dashboard', { state: { selectedTab: tabIndex } });
  };

  // CHANGED: Open settings modal locally instead of navigating
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  useEffect(() => { 
    fetchTasks(); 
  }, []);

  const filtered = tasks.filter(task =>
    task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce((acc: Record<string, Task[]>, task) => {
    const date = new Date(task.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <Box height="100vh" bgcolor="#fff">
      {/* Top Navbar */}
      <Box display="flex" alignItems="center" bgcolor="red" px={4} py={2}>
        <Box display="flex" gap={4}>
          {['Work', 'School', 'Personal'].map((tab, index) => (
            <Typography
              key={tab}
              color="white"
              fontSize="1.5rem"
              fontWeight={400}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleTabNavigation(index)}
            >
              {tab}
            </Typography>
          ))}
        </Box>

        <Box ml="auto" display="flex" alignItems="center" gap={3}>
          {/* Archive tab aligned right */}
          <Box bgcolor="white" px={3} py={1} borderRadius={1}>
            <Typography color="red" fontWeight={700} fontSize="1.2rem">
              Archive
            </Typography>
          </Box>

          {/* Settings icon - CHANGED: Use local handler */}
          <IconButton onClick={handleSettingsClick}>
            <Settings sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Date Below Navbar */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" px={4} mt={1} gap={1}>
        <Typography fontWeight={600} fontSize="1.1rem" color="black">
          Date:
        </Typography>
        <Typography fontWeight={600} fontSize="1.1rem" color="black">
          {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </Typography>
        <CalendarToday sx={{ color: 'black' }} />
      </Box>

      {/* Header */}
      <Box textAlign="center" mt={3}>
        <Typography variant="h5" color="red" fontWeight="bold">
          Completed & Deleted Tasks
        </Typography>
        <Box display="flex" justifyContent="center" mt={1} gap={2}>
          <TextField 
            size="small" 
            placeholder="Search Tasks" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Button variant="outlined">Search</Button>
        </Box>
        <Typography mt={1} color="red" fontSize="0.85rem">
          Note: Deleted tasks will be permanently removed after 5 days
        </Typography>
      </Box>

      {/* Task Cards */}
      <Box px={6} mt={3} maxHeight="60vh" overflow="auto">
        {filtered.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography variant="h6" color="text.secondary">
              No archived tasks found
            </Typography>
          </Box>
        ) : (
          Object.entries(grouped).map(([date, tasksOnDate]) => (
            <React.Fragment key={date}>
              {tasksOnDate.map((task) => {
                const isDeleted = task.status === 'Deleted';
                const statusColor = isDeleted ? 'red' : 'green';
                const statusLabel = isDeleted ? 'Deleted' : 'Complete';
                const daysLeft = isDeleted && task.deletedAt ? daysLeftToDelete(task.deletedAt) : null;

                return (
                  <Box
                    key={task._id}
                    display="flex"
                    alignItems="center"
                    bgcolor="#f2ecf4"
                    borderRadius="10px"
                    p={2}
                    mb={2}
                  >
                    {/* Section color + date */}
                    <Box mr={2} display="flex" flexDirection="column" alignItems="center">
                      <Box 
                        width={14} 
                        height={14} 
                        borderRadius="50%" 
                        bgcolor={sectionColors[task.section] || 'gray'} 
                        mb={1} 
                      />
                      <Typography fontSize="0.7rem" fontWeight={600}>
                        {new Date(task.date).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Main content */}
                    <Box flexGrow={1}>
                      <Stack direction="row" spacing={-1} mb={0.5}>
                        {task.collaborators && task.collaborators.length > 0 ? (
                          <>
                            {task.collaborators.slice(0, 3).map((email: string, idx: number) => (
                              <Avatar key={idx} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {email.charAt(0).toUpperCase()}
                              </Avatar>
                            ))}
                            {task.collaborators.length > 3 && (
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                +{task.collaborators.length - 3}
                              </Avatar>
                            )}
                          </>
                        ) : (
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: sectionColors[task.section] }}>
                            {task.title.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                      </Stack>
                      <Typography fontWeight="bold">{task.title}</Typography>
                      <Typography fontSize="0.9rem" mb={1}>
                        {task.startTime && task.startTime.hour && task.startTime.minute && task.startTime.period ? 
                          `${task.startTime.hour}:${String(task.startTime.minute).padStart(2, '0')} ${task.startTime.period}` : 
                          'No time set'
                        }
                        {task.endTime && task.endTime.hour && task.endTime.minute && task.endTime.period ? 
                          ` - ${task.endTime.hour}:${String(task.endTime.minute).padStart(2, '0')} ${task.endTime.period}` : 
                          ''
                        }
                      </Typography>
                    </Box>

                    {/* Right side */}
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                      <Box>
                        <Typography fontWeight="bold" sx={{ color: getPriorityColor(task.priority || '') }}>
                          • Priority: {task.priority || 'None'}
                        </Typography>
                        <Typography>• Recurring: {task.recurring || 'None'}</Typography>
                      </Box>
                      <Chip 
                        label={statusLabel} 
                        sx={{ bgcolor: statusColor, color: 'white', fontWeight: 'bold' }} 
                      />
                      {isDeleted && daysLeft !== null && (
                        <Typography fontSize="0.75rem" color="red">
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                        </Typography>
                      )}
                      <Box display="flex" gap={1}>
                        <Button 
                          onClick={() => handleRecover(task._id)} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        >
                          Restore
                        </Button>
                        {isDeleted && (
                          <Button 
                            onClick={() => handlePermanentDelete(task._id)} 
                            size="small" 
                            variant="outlined"
                            color="error"
                          >
                            Delete
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ))
        )}
      </Box>

      {/* ADD SETTINGS MODAL */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Archive;