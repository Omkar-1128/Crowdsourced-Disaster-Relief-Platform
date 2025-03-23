const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For authentication tokens
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});