const express = require('express');
const axios = require('axios'); // Axios for API calls
const router = express.Router();
const db = require('./db');

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