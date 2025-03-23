const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Registration
router.post('/register', async (req, res) => {
    const { username, email, password, user_role } = req.body;

    if (!username || !email || !password || !user_role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert into database
    const query = "INSERT INTO users (username, email, password_hash, user_role) VALUES (?, ?, ?, ?)";
    db.query(query, [username, email, passwordHash, user_role], (err, result) => {
        if (err) {
            console.error("❌ Error registering user:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }
        console.log("✅ User registered successfully, ID:", result.insertId);
        res.json({ message: "User registered successfully!" });
    });
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // Fetch user from database
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, result) => {
        if (err) {
            console.error("❌ Error fetching user:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = result[0];

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, user_role: user.user_role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful!", token, user_role: user.user_role, username: user.username });
    });
});

// Fetch user details
router.get('/user-details', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const query = "SELECT username FROM users WHERE id = ?";
        db.query(query, [userId], (err, result) => {
            if (err) {
                console.error("❌ Error fetching user details:", err);
                return res.status(500).json({ message: "Server error", error: err });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ username: result[0].username });
        });
    } catch (error) {
        console.error("❌ Error verifying token:", error);
        res.status(401).json({ message: "Invalid token" });
    }
});

// Route to handle disaster reporting
router.post('/report-disaster', async (req, res) => {
    const { disasterType, requestType, location, description } = req.body;

    if (!disasterType || !requestType || !location || !description) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Insert into disaster_reports table
    const reportQuery = "INSERT INTO disaster_reports (disasterType, location, description) VALUES (?, ?, ?)";
    db.query(reportQuery, [disasterType, location, description], (err, result) => {
        if (err) {
            console.error("❌ Error reporting disaster:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }
        console.log("✅ Disaster reported successfully, ID:", result.insertId);

        // Insert into help_requests table
        const helpQuery = "INSERT INTO help_requests (user_role, request_type, disaster_type, location) VALUES (?, ?, ?, ?)";
        db.query(helpQuery, ['Victim', requestType, disasterType, location], (err, result) => {
            if (err) {
                console.error("❌ Error inserting help request:", err);
                return res.status(500).json({ message: "Server error", error: err });
            }
            console.log("✅ Help request stored in database, ID:", result.insertId);
            res.json({ message: "Disaster reported successfully!" });
        });
    });
});

// Route to fetch reported disasters
router.get('/reported-disasters', (req, res) => {
    const query = "SELECT disasterType, location, description, reportedAt FROM disaster_reports ORDER BY reportedAt DESC";
    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error fetching reported disasters:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }
        res.json(result);
    });
});

// Function to get lat/lng from OpenStreetMap Nominatim API
async function getCoordinates(location) {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { q: location, format: "json" }
        });

        if (response.data.length > 0) {
            const { lat, lon } = response.data[0]; // lon = longitude
            return { lat: parseFloat(lat), lng: parseFloat(lon) };
        } else {
            console.warn(`⚠️ No coordinates found for ${location}`);
            return { lat: null, lng: null };
        }
    } catch (error) {
        console.error("❌ Error fetching coordinates:", error);
        return { lat: null, lng: null };
    }
}

// Handle new help requests
router.post('/request-help', async (req, res) => {
    console.log("📩 Help Request Received:", req.body);
    const { user_role, request_type, disaster_type, location } = req.body;

    if (!user_role || !request_type || !disaster_type || !location) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Get lat/lng from Nominatim API
    const { lat, lng } = await getCoordinates(location);

    // Insert into database
    const query = "INSERT INTO help_requests (user_role, request_type, disaster_type, location, lat, lng) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [user_role, request_type, disaster_type, location, lat, lng], (err, result) => {
        if (err) {
            console.error("❌ Error inserting request:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }
        console.log("✅ Help request stored in database, ID:", result.insertId);
        res.json({ message: "Help request submitted successfully!" });
    });
});

// Get All Help Requests for Map and Table
router.get('/all-help-requests', (req, res) => {
    console.log("📊 Fetching all help requests...");

    db.query("SELECT id, user_role, request_type, disaster_type, location, lat, lng, created_at FROM help_requests ORDER BY created_at DESC", 
    (err, result) => {
        if (err) {
            console.error("❌ Error fetching help requests:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }
        console.log(`✅ Total requests fetched: ${result.length}`);
        res.json(result);
    });
});

// Get Help Request Count
router.get('/help-count', (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM help_requests", (err, result) => {
        if (err) {
            console.error("❌ Error fetching help count:", err);
            return res.status(500).json({ message: "Server error", error: err });
        }
        res.json({ count: result[0].count });
    });
});

module.exports = router;