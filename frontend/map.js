// Custom disaster icons
const disasterIcons = {
    Earthquake: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    Flood: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    Cyclone: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    Fire: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    Other: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
};

// Initialize map centered on India
let map = L.map('map').setView([20.5937, 78.9629], 5);
let markers = [];

// Add OpenStreetMap tiles with a more muted style for better marker visibility
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles' // For potential custom styling
}).addTo(map);

// Function to clear all markers
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Function to get appropriate icon based on disaster type
function getDisasterIcon(disasterType) {
    return disasterIcons[disasterType] || disasterIcons.Other;
}

// Function to fetch and display markers with animation
async function fetchAndDisplayMarkers() {
    try {
        const response = await fetch("http://localhost:8080/all-help-requests");
        if (!response.ok) {
            throw new Error("Failed to fetch help requests");
        }
        
        const data = await response.json();
        clearMarkers();
        
        const markerCluster = L.markerClusterGroup();
        
        data.forEach(request => {
            if (request.lat && request.lng) {
                const icon = getDisasterIcon(request.disaster_type);
                const marker = L.marker([request.lat, request.lng], {icon})
                    .bindPopup(`
                        <div class="map-popup">
                            <strong>${request.request_type} Needed</strong><br>
                            <em>${request.disaster_type}</em><br>
                            Location: ${request.location}<br>
                            <small>${new Date(request.created_at).toLocaleString()}</small>
                        </div>
                    `);
                
                markerCluster.addLayer(marker);
                markers.push(marker);
            }
        });
        
        map.addLayer(markerCluster);
    } catch (error) {
        console.error("Error fetching help requests:", error);
    }
}

// Initial load
map.whenReady(() => {
    setTimeout(() => {
        fetchAndDisplayMarkers();
    }, 500);
});

// Refresh markers every 30 seconds
setInterval(fetchAndDisplayMarkers, 30000);

// Global function to center map on a specific location
window.viewOnMap = function(lat, lng) {
    if (map) {
        map.flyTo([lat, lng], 15);
        
        const marker = markers.find(m => 
            m.getLatLng().lat === lat && m.getLatLng().lng === lng
        );
        
        if (marker) {
            marker.openPopup();
        }
    }
};
