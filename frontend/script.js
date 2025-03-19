document.addEventListener("DOMContentLoaded", function () {
    fetchHelpCount();
    fetchHelpRequests(); // Fetch and display help requests when the page loads

    // Handle Help Requests Submission
    document.getElementById("help-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const user_role = document.getElementById("user-role-select").value;
        const request_type = document.getElementById("request-type").value;
        const location = document.getElementById("help-location").value;

        console.log("📤 Sending Help Request:", { user_role, request_type, location });

        fetch("http://localhost:8080/request-help", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_role, request_type, location })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Response from Server:", data);
            alert(data.message);
            fetchHelpCount();
            fetchHelpRequests(); // Refresh the table after submitting a new request
        })
        .catch(error => console.error("❌ Error sending request:", error));
    });
});

// Fetch Help Request Count from Backend
function fetchHelpCount() {
    fetch("http://localhost:8080/help-count")
        .then(response => response.json())
        .then(data => {
            console.log("✅ Help Count Fetched:", data);
            document.getElementById("help-count").textContent = data.count;
        })
        .catch(error => {
            console.error("❌ Error fetching help count:", error);
            document.getElementById("help-count").textContent = "Error!";
        });
}

// Fetch Help Requests and Update Table
function fetchHelpRequests() {
    fetch("http://localhost:8080/all-help-requests")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("help-requests-table-body");
            tableBody.innerHTML = ""; // Clear existing rows

            if (data.length === 0) {
                // If no data, show a message
                tableBody.innerHTML = `<tr><td colspan="5">No help requests found.</td></tr>`;
            } else {
                // Populate the table with data
                data.forEach(request => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${request.id}</td>
                        <td>${request.user_role}</td>
                        <td>${request.request_type}</td>
                        <td>${request.location}</td>
                        <td>${new Date(request.created_at).toLocaleString()}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error("❌ Error fetching help requests:", error);
            const tableBody = document.getElementById("help-requests-table-body");
            tableBody.innerHTML = `<tr><td colspan="5">Error loading data. Please try again.</td></tr>`;
        });
}