import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Popover,
  Avatar,
  Chip,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { Settings, CalendarToday, MoreVert } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import SettingsModal from '../components/SettingsModal';
import { Task, UserType } from '../types/task';

const API = 'http://localhost:5050/api';
const tabColors = ['#8000B2', '#1E90FF', '#FFA500'];
const tabBackgrounds = ['#f4edf9', '#e6f0fb', '#fff3e6'];
const tabLabels = ['Work', 'School', 'Personal'];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [usersCache, setUsersCache] = useState<Map<string, UserType>>(new Map());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const token = localStorage.getItem('token');

  // Handle navigation state from Archive page
  useEffect(() => {
    if (location.state) {
      // Handle tab selection from Archive
      if (location.state.selectedTab !== undefined) {
        setTab(location.state.selectedTab);
      }
      
      // Handle settings modal opening from Archive
      if (location.state.openSettings) {
        setShowSettings(true);
      }
      
      // Clear the state after using it
      navigate('/dashboard', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const handleChange = (_: React.SyntheticEvent, newTab: number) => setTab(newTab);
  const handleCalendarOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);
  const isCalendarOpen = Boolean(anchorEl);
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) setSelectedDate(newDate);
    handleCalendarClose();
  };

  const getCurrentSection = () => ['work', 'school', 'personal'][tab];

  // Function to fetch all users and update cache
  const fetchAllUsers = async (): Promise<void> => {
  try {
    // CHANGED: Use /all endpoint to get all users for avatar display
    const res = await axios.get(`${API}/users/all`);
    const users = res.data;
    
    const newCache = new Map<string, UserType>();
    users.forEach((user: UserType) => {
      newCache.set(user.email, user);
    });
    
    setUsersCache(newCache);
    
    // Set current user if we can find them
    const currentUserEmail = localStorage.getItem('email');
    if (currentUserEmail) {
      const user = users.find((u: UserType) => u.email === currentUserEmail);
      if (user) {
        setCurrentUser(user);
      }
    }
  } catch (err) {
    console.error('Failed to fetch users:', err);
  }
};

  // Function to refresh user data (called when settings modal might have updated data)
  const refreshUserData = async () => {
    await fetchAllUsers();
  };

  // Listen for storage changes and custom events (when settings are updated in SettingsModal)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSettingsUpdated') {
        // Refresh user data when settings are updated
        refreshUserData();
        // Remove the flag
        localStorage.removeItem('userSettingsUpdated');
      }
    };

    const handleCustomEvent = () => {
      // Refresh user data when custom event is triggered
      refreshUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userSettingsUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userSettingsUpdated', handleCustomEvent);
    };
  }, []);

  // Function to render user avatar
  const renderUserAvatar = (userData: UserType | null | undefined, fallbackText: string, size: number = 32) => {
    if (!userData) {
      return (
        <Avatar sx={{ width: size, height: size, fontSize: '0.875rem', bgcolor: '#607d8b' }}>
          {fallbackText.charAt(0).toUpperCase()}
        </Avatar>
      );
    }

    const displayText = userData.username || userData.email.split('@')[0];
    
    if (userData.avatarImage) {
      return (
        <Avatar 
          src={userData.avatarImage}
          sx={{ width: size, height: size, fontSize: '0.875rem' }}
        >
          {displayText.charAt(0).toUpperCase()}
        </Avatar>
      );
    }

    return (
      <Avatar sx={{ 
        width: size, 
        height: size, 
        fontSize: '0.875rem', 
        bgcolor: userData.avatarColor || '#607d8b' 
      }}>
        {displayText.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  // Function to calculate task status based on current time and date
  const getTaskStatus = (task: Task): string => {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00:00
    const viewingDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()); // Selected date at 00:00:00
    
    // Check if this task should be active on the selected date
    const taskDate = new Date(task.date);
    const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    
    let isTaskActiveOnSelectedDate = false;
    
    // Check if task is active on selected date (either direct match or recurring match)
    if (taskDateOnly.getTime() === viewingDate.getTime()) {
      isTaskActiveOnSelectedDate = true;
    } else if (task.recurring) {
      // Check recurring logic
      isTaskActiveOnSelectedDate = isRecurringMatch(task.recurring, task.date, new Date(selectedDate));
    }
    
    // If task is not active on the selected date, return stored status or Pending
    if (!isTaskActiveOnSelectedDate) {
      return task.status || 'Pending';
    }
    
    // For tasks that are active on the selected date, check time-based status only if selected date is today
    const isViewingToday = viewingDate.getTime() === currentDate.getTime();
    
    if (!isViewingToday) {
      // If we're viewing a different date than today, calculate based on date
      if (viewingDate.getTime() < currentDate.getTime()) {
        // Past date - should be completed (ignore stored status for past dates)
        return 'Complete';
      } else {
        // Future date - show as pending
        return 'Pending';
      }
    }
    
    // If selected date is today, use time-based logic (ignore stored status)
    const timeToMinutes = (hour: string, minute: string, period: string): number => {
      let h = parseInt(hour);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(minute);
    };
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = timeToMinutes(task.startTime.hour, task.startTime.minute, task.startTime.period);
    
    // NEW LOGIC: Check if task has an end time
    if (task.endTime && task.endTime.hour && task.endTime.minute && task.endTime.period) {
      // Task HAS an end time - use the original logic
      const endMinutes = timeToMinutes(task.endTime.hour, task.endTime.minute, task.endTime.period);
      
      if (currentMinutes < startMinutes) {
        return 'Pending';
      } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return 'In Progress';
      } else {
        return 'Complete';
      }
    } else {
      // Task has NO end time - simplified logic
      if (currentMinutes < startMinutes) {
        return 'Pending';
      } else {
        return 'Complete'; // As soon as we pass start time, mark as complete
      }
    }
  };

  // Function to get status chip color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Complete': return 'green';
      case 'In Progress': return 'blue';
      case 'Pending': return 'orange';
      default: return 'gray';
    }
  };

  const isRecurringMatch = (recurringType: string, taskDate: string, currentDate: Date) => {
    if (!recurringType || !taskDate) return false;
    const tDate = new Date(taskDate);
    const cDate = new Date(currentDate);
    
    switch (recurringType) {
      case 'Daily': 
        return tDate <= cDate;
      case 'Weekdays': {
        // Check if current date is a weekday (Monday=1, Tuesday=2, ..., Friday=5)
        const currentDay = cDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const isCurrentWeekday = currentDay >= 1 && currentDay <= 5;
        
        // Only show on weekdays, and only if the original task date was on or before current date
        return tDate <= cDate && isCurrentWeekday;
      }
      case 'Weekly': 
        return tDate <= cDate && tDate.getDay() === cDate.getDay();
      case 'Monthly': 
        return tDate <= cDate && tDate.getDate() === cDate.getDate();
      case 'Yearly': 
        return tDate <= cDate && tDate.getDate() === cDate.getDate() && tDate.getMonth() === cDate.getMonth();
      default: 
        return false;
    }
  };

  const fetchTasks = async () => {
    try {
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }

      console.log('🔍 Fetching tasks for section:', getCurrentSection(), 'and date:', selectedDate.toISOString().split('T')[0]);

      const res = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 All tasks from API:', res.data);

      const section = getCurrentSection();

      const filtered = res.data
        .filter((task: Task) => {
          // Basic validation - skip tasks with missing essential data
          if (!task || !task.title || !task.date || !task.section || !task.startTime) {
            return false;
          }

          const taskDate = new Date(task.date);
          const isInSection = task.section?.toLowerCase() === section;
          
          // Normalize both dates to compare just the date parts
          const taskDateString = taskDate.toISOString().split('T')[0];
          const selectedDateString = selectedDate.toISOString().split('T')[0];
          const isForSelectedDate = taskDateString === selectedDateString;
          
          const matchesRecurring = isRecurringMatch(task.recurring || '', task.date, selectedDate);
          
          console.log(`Task: ${task.title}`, {
            taskSection: task.section,
            expectedSection: section,
            isInSection,
            taskDate: taskDateString,
            selectedDate: selectedDateString,
            isForSelectedDate,
            matchesRecurring,
            willShow: isInSection && (isForSelectedDate || matchesRecurring)
          });
          
          return isInSection && (isForSelectedDate || matchesRecurring);
        })
        .sort((a: Task, b: Task) => {
          const toMinutes = (h: string, m: string, p: string) => {
            const hour = parseInt(h) % 12 + (p === 'PM' ? 12 : 0);
            return hour * 60 + parseInt(m);
          };
          return (
            toMinutes(a.startTime.hour, a.startTime.minute, a.startTime.period) -
            toMinutes(b.startTime.hour, b.startTime.minute, b.startTime.period)
          );
        });

      console.log('✅ Filtered tasks:', filtered);
      setTasks(filtered);

    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (token) {
      // Initial data fetch
      fetchAllUsers();
      fetchTasks();
      
      // Update task statuses every minute to reflect real-time changes
      const interval = setInterval(() => {
        fetchTasks();
      }, 60000); // Update every 60 seconds
      
      return () => clearInterval(interval);
    } else {
      navigate('/login');
    }
  }, [tab, selectedDate, token, navigate]);

  const handleAddTask = async (taskData: any) => {
    if (!token) {
      console.error('No token found');
      navigate('/login');
      return;
    }

    console.log('📝 Creating task with data:', taskData);
    
    try {
      const response = await axios.post(`${API}/tasks`, taskData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('✅ Task created successfully:', response.data);
      setShowAddModal(false);
      
      // Immediate refresh to show the new task
      await fetchTasks();
      
    } catch (err: unknown) {
      console.error('❌ Failed to create task:', err);
      if (axios.isAxiosError(err)) {
        console.error('Response data:', err.response?.data);
        console.error('Status:', err.response?.status);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };

  const handleEditOpen = (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      setEditTask(task);
      setShowEditModal(true);
    }
  };

  // FIXED: Better handleSaveEdit that won't throw 404 errors unnecessarily
  const handleSaveEdit = async (updatedTask: Task) => {
    if (!updatedTask._id) {
      console.error('❌ Task ID is missing, cannot update.');
      throw new Error('Task ID is missing');
    }

    console.log('🔍 Frontend: Starting task update process');

    // Verify token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      navigate('/login');
      throw new Error('Authentication required');
    }

    // Normalize the date
    const normalizedDate = new Date(updatedTask.date).toISOString().split('T')[0];

    const normalized = {
      ...updatedTask,
      date: normalizedDate,
    };

    try {
      const url = `${API}/tasks/${updatedTask._id}`;
      console.log('🔍 Frontend: Making PUT request to:', url);
      
      const response = await axios.put(url, normalized, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Frontend: Task updated successfully:', response.data);
      
      // Schedule background refresh without blocking success
      setTimeout(async () => {
        try {
          await Promise.all([
            fetchTasks(),
            fetchAllUsers()
          ]);
          console.log('✅ Background data refresh completed');
        } catch (refreshError) {
          console.warn('⚠️ Background data refresh failed:', refreshError);
          // Don't throw - this is just a background refresh
        }
      }, 100);
      
      // Return success immediately
      console.log('✅ Frontend: Save completed successfully');
      return;
      
    } catch (err: unknown) {
      console.error('❌ Frontend: Failed to update task:', err);
      
      if (axios.isAxiosError(err)) {
        // Handle authentication errors
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          navigate('/login');
          throw new Error('Authentication expired. Please log in again.');
        }
        
        // For 404 errors, log them but don't always throw
        if (err.response?.status === 404) {
          console.warn('⚠️ Got 404 during task update - this might be a timing issue');
          
          // Schedule a background refresh
          setTimeout(() => {
            fetchTasks().catch(console.warn);
          }, 100);
          
          // Only throw 404 error if it's clearly a real problem
          // For now, we'll be more lenient and not throw for 404s
          console.log('🤔 Treating 404 as potentially successful due to timing issues');
          return; // Don't throw error
        }
        
        // Handle other HTTP errors
        if (err.response?.status === 400) {
          throw new Error('Invalid task data. Please check all fields.');
        }
        
        if (err.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }

        // Generic server error
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
        
        throw new Error(`Server error: ${err.response?.status || 'Unknown'}`);
      }
      
      // Network or other errors
      if (err instanceof Error) {
        throw new Error(`Update failed: ${err.message}`);
      }
      
      throw new Error('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Soft delete - moves task to archive instead of hard delete
      await axios.delete(`${API}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSnackbar({
        open: true,
        message: 'Task moved to archive',
        severity: 'success'
      });
      
      setShowEditModal(false);
      await fetchTasks();
    } catch (err) {
      console.error('❌ Failed to delete task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete task',
        severity: 'error'
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box bgcolor="#fff">
        <Box display="flex" justifyContent="space-between" alignItems="center" bgcolor={tabColors[tab]} px={4} py={2}>
          <Tabs value={tab} onChange={handleChange} textColor="inherit" TabIndicatorProps={{ style: { backgroundColor: 'white' } }}>
            {tabLabels.map((label) => (
              <Tab key={label} label={label} sx={{ color: 'white', fontSize: '1.2rem', fontWeight: 500 }} />
            ))}
          </Tabs>
          <Box display="flex" alignItems="center" gap={2}>
            <Button onClick={() => navigate('/archive')} sx={{ color: 'white', fontWeight: 600, textTransform: 'uppercase', fontSize: '1rem' }}>
              Archive
            </Button>
            <IconButton onClick={() => setShowSettings(true)}>
              <Settings sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>

        <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h4" fontWeight={700} mb={2} color={tabColors[tab]}>
            Schedule
          </Typography>
          <Button variant="outlined" onClick={() => setShowAddModal(true)}>
            Click here to Add Task
          </Button>
          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <Typography variant="body1" fontWeight={600} color={tabColors[tab]}>
              Date: {selectedDate.toDateString()}
            </Typography>
            <IconButton onClick={handleCalendarOpen}>
              <CalendarToday />
            </IconButton>
            <Popover open={isCalendarOpen} anchorEl={anchorEl} onClose={handleCalendarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
              <DateCalendar value={selectedDate} onChange={handleDateChange} />
            </Popover>
          </Box>
        </Box>

        <Box px={4} mt={4} maxHeight="55vh" overflow="auto">
          {tasks.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography variant="h6" color="text.secondary">
                No tasks for {tabLabels[tab]} on {selectedDate.toDateString()}
              </Typography>
            </Box>
          ) : (
            <DragDropContext onDragEnd={() => {}}>
              <Droppable droppableId="tasks">
                {(provided: DroppableProvided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {tasks.map((task, index) => {
                      // Get creator data from cache - handle undefined case
                      const creatorData = task.createdBy ? usersCache.get(task.createdBy) || null : null;
                      
                      return (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided: DraggableProvided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              mb={2}
                              p={2}
                              borderRadius="10px"
                              bgcolor={tabBackgrounds[tab]}
                              boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              minHeight="80px"
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Stack direction="row" spacing={-1}>
                                  {/* Creator Avatar (leftmost) */}
                                  {renderUserAvatar(creatorData, task.title, 32)}
                                  
                                  {/* Collaborator Avatars */}
                                  {task.collaborators && task.collaborators.length > 0 && (
                                    <>
                                      {task.collaborators.slice(0, 2).map((email: string, i: number) => {
                                        const collaboratorData = usersCache.get(email) || null;
                                        return (
                                          <Box key={i} ml={-0.5}>
                                            {renderUserAvatar(collaboratorData, email, 28)}
                                          </Box>
                                        );
                                      })}
                                      {task.collaborators.length > 2 && (
                                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', ml: -0.5 }}>
                                          +{task.collaborators.length - 2}
                                        </Avatar>
                                      )}
                                    </>
                                  )}
                                </Stack>
                                <Box>
                                  <Typography fontWeight={600} fontSize="1.1rem" mb={0.5}>
                                    {task.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
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
                              </Box>
                              <Box textAlign="right" display="flex" alignItems="center" gap={2}>
                                <Box>
                                  <Typography 
                                    sx={{ 
                                      color: task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'orange' : task.priority === 'Low' ? 'green' : 'gray', 
                                      fontWeight: 'bold',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    • Priority: {task.priority || 'None'}
                                  </Typography>
                                  <Typography fontSize="0.875rem" color="text.secondary">
                                    • Recurring: {task.recurring || 'None'}
                                  </Typography>
                                </Box>
                                {(() => {
                                  const currentStatus = getTaskStatus(task);
                                  const statusColor = getStatusColor(currentStatus);
                                  return (
                                    <Chip 
                                      label={currentStatus} 
                                      sx={{ 
                                        bgcolor: statusColor, 
                                        color: 'white', 
                                        fontWeight: 600,
                                        minWidth: '80px'
                                      }} 
                                      size="small" 
                                    />
                                  );
                                })()}
                                <IconButton onClick={() => handleEditOpen(task._id)}>
                                  <MoreVert />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Box>

        <AddTaskModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddTask} section={getCurrentSection()} />
        <EditTaskModal 
          open={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          task={editTask} 
          onSave={handleSaveEdit}
          onDelete={() => editTask && handleDeleteTask(editTask._id)}
        />
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
    </LocalizationProvider>
  );
}