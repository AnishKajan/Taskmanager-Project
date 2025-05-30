import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
import SettingsModal from './components/SettingsModal';
import { IconButton, Button, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const API = 'http://localhost:5050/api';

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setTasks(res.data));
  }, [token]);

  const handleCreate = (taskData) => {
    axios.post(`${API}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setTasks((prev) => [...prev, res.data]));
    setShowAddModal(false);
  };

  const handleEdit = (updatedTask) => {
    axios.put(`${API}/tasks/${updatedTask._id}`, updatedTask, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? res.data : t)));
      setShowEditModal(false);
    });
  };

  const handleDelete = (taskId) => {
    axios.delete(`${API}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setTasks((prev) => prev.filter((t) => t._id !== taskId)));
  };

  const toggleStatus = (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    const newStatus = task.status === 'complete' ? 'pending' : 'complete';
    axios.patch(`${API}/tasks/${taskId}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t))));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...tasks];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  };

  return (
    <Box className="dashboard" padding={4}>
      <Button
        variant="contained"
        onClick={() => setShowAddModal(true)}
        sx={{ mb: 2 }}
      >
        Click here to Add Task
      </Button>

      <IconButton
        onClick={() => setShowSettings(true)}
        sx={{ position: 'absolute', top: 10, right: 10 }}
      >
        <SettingsIcon fontSize="large" />
      </IconButton>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        mb: 2,
                        p: 2,
                        background: '#f5f5f5',
                        borderRadius: '8px',
                      }}
                    >
                      <strong>{task.title}</strong>
                      <Box mt={1}>
                        <Button size="small" onClick={() => handleDelete(task._id)}>Delete</Button>
                        <Button size="small" onClick={() => toggleStatus(task._id)}>
                          {task.status === 'complete' ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                        <Button size="small" onClick={() => {
                          setEditTask(task);
                          setShowEditModal(true);
                        }}>Edit</Button>
                      </Box>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <AddTaskModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleCreate} />
      <EditTaskModal open={showEditModal} onClose={() => setShowEditModal(false)} task={editTask} onSave={handleEdit} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </Box>
  );
}

export default TaskDashboard;
