const express = require('express'); // imports express library
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount auth routes directly at /api
app.use('/api', require('./routes/auth'));

// Keep tasks route as-is
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 5000; // Sets which port the backend server should listen on
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // start server

