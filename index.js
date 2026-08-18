// Main server entry (CommonJS)
const express = require('express');
require('dotenv').config();
require('./config/db');
const app = express();
const port = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => res.send('Server is running!'));

// Start server
app.listen(port, () => console.log('Server started on port ' + port));
