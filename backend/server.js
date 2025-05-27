const express = require('express'); //imports express library
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 5000; //Sets which port the backend server should listen on
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); //start server
