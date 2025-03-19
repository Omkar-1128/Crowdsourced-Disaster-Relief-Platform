let map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch help requests from the backend
fetch("http://localhost:8080/all-help-requests")
    .then(response => response.json())
    .then(data => {
        data.forEach(request => {
            addMarker(request);
        });
    })
    .catch(error => console.error("❌ Error fetching help requests:", error));

// Function to add markers to the map
function addMarker(request) {
    if (request.lat && request.lng) {
        const marker = L.marker([request.lat, request.lng]).addTo(map);
        marker.bindPopup(`<strong>${request.request_type}</strong><br>Location: ${request.location}`);
    }
}