let map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India
let markers = [];

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to clear all markers
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Function to fetch and display markers
async function fetchAndDisplayMarkers() {
    try {
        const response = await fetch("http://localhost:8080/all-help-requests");
        if (!response.ok) {
            throw new Error("Failed to fetch help requests");
        }
        
        const data = await response.json();
        clearMarkers();
        
        data.forEach(request => {
            if (request.lat && request.lng) {
                const marker = L.marker([request.lat, request.lng]).addTo(map);
                marker.bindPopup(`
                    <strong>${request.request_type}</strong><br>
                    <em>${request.disaster_type}</em><br>
                    Location: ${request.location}<br>
                    <small>${new Date(request.created_at).toLocaleString()}</small>
                `);
                markers.push(marker);
            }
        });
    } catch (error) {
        console.error("❌ Error fetching help requests:", error);
    }
}

// Initial load
fetchAndDisplayMarkers();

// Refresh markers every 30 seconds
setInterval(fetchAndDisplayMarkers, 30000);