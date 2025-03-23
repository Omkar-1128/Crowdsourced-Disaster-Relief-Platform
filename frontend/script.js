document.addEventListener("DOMContentLoaded", function () {
    const loginSection = document.getElementById("login");
    const registerSection = document.getElementById("register");
    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");

    // Toggle between login and registration forms
    showRegisterLink.addEventListener("click", function (e) {
        e.preventDefault();
        loginSection.style.display = "none";
        registerSection.style.display = "block";
    });

    showLoginLink.addEventListener("click", function (e) {
        e.preventDefault();
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // Handle Login
    document.getElementById("login-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        fetch("http://localhost:8080/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Login successful!") {
                alert("Login successful!");
                // Store token, user role, and username in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_role", data.user_role);
                localStorage.setItem("user_name", data.username);
                window.location.href = "dashboard.html"; // Redirect to dashboard
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("❌ Error logging in:", error);
            alert("An error occurred while logging in.");
        });
    });

    // Handle Registration
    document.getElementById("register-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("register-username").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const user_role = document.getElementById("register-role").value;

        fetch("http://localhost:8080/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, user_role })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === "User registered successfully!") {
                // Switch to login form
                registerSection.style.display = "none";
                loginSection.style.display = "block";
            }
        })
        .catch(error => {
            console.error("❌ Error registering user:", error);
            alert("An error occurred while registering the user.");
        });
    });
});