import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const API = 'http://localhost:5001/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [token, setToken] = useState(() => {
    localStorage.removeItem('token'); // Force login each time
    return '';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setTasks(res.data));
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.task')) setSelectedTaskId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert('Login failed. Please check your credentials.');
    }
  };

  if (!token) {
    return (
      <div className="login-screen">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br />
          <button type="submit">Login</button>
        </form>
        <p style={{ fontSize: '0.9rem' }}>
          Try <strong>taskuser</strong> / <strong>taskpass123</strong> if you're just testing.
        </p>
      </div>
    );
  }

  const renderTaskButtons = (task) => {
    const isComplete = task.status === 'complete';
    return (
      <>
        <button onClick={() => handleDelete(task._id)}>Delete</button>
        <button onClick={() => toggleStatus(task._id)}>
          {isComplete ? 'Incomplete' : 'Complete'}
        </button>
      </>
    );
  };

  const renderTaskList = () => (
    <Droppable droppableId="tasks">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided) => (
                <div
                  className={`task ${task.status === 'complete' ? 'completed' : ''}`}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  onClick={() => setSelectedTaskId(task._id)}
                >
                  <h4>{task.title}</h4>
                  {renderTaskButtons(task)}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="App">
      <h1>Task Manager</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New Task"
      />
      <button onClick={handleCreate}>Add Task</button>
      <DragDropContext onDragEnd={handleDragEnd}>{renderTaskList()}</DragDropContext>
    </div>
  );

  function handleCreate() {
    if (!title.trim()) return;
    axios
      .post(
        `${API}/tasks`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setTasks((prev) => [...prev, res.data]));
    setTitle('');
  }

  function handleDelete(taskId) {
    axios
      .delete(`${API}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setTasks((prev) => prev.filter((t) => t._id !== taskId)));
  }

  function toggleStatus(taskId) {
    const task = tasks.find((t) => t._id === taskId);
    const newStatus = task.status === 'complete' ? 'pending' : 'complete';
    axios
      .patch(
        `${API}/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) =>
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)))
      );
  }

  function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = [...tasks];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  }
}

export default App;
