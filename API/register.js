import { registerAPI } from './api.js';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = await registerAPI(email, password);
        console.log("Registration success:", result);
        alert("Registration successful! Please log in.");
        window.location.href = "my-account.html";
    } catch (error) {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
    }
});