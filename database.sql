CREATE DATABASE disaster_relief;

USE disaster_relief;

CREATE TABLE help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_role ENUM('Victim', 'Volunteer') NOT NULL,
    request_type ENUM('Food', 'Shelter', 'Medical') NOT NULL,
    location VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 6),
    lng DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);