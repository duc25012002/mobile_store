import apiService from "./api.js";
import { token } from "./api.js";

const getUserId = async () => {
  try {
    const response = await apiService.get(
      "/api/user-id",
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    const userId = response.data.id.original.user_id;
    if (userId) {
      return userId;
    } else {
      throw new Error("user_id not found in the response");
    }
  } catch (error) {
    console.error("Failed to fetch user_id:", error);
    throw error;
  }
};

export const user_id = getUserId();

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById(".btn.btn-secondary");

  if (loginButton) {
    loginButton.addEventListener("click", async function () {
      const email = document.querySelector('input[name="email"]').value;
      const password = document.querySelector('input[name="password"]').value;

      if (!email) {
        alert("Username is required");
        return;
      }
      if (!password) {
        alert("Password is required");
        return;
      }

      this.innerHTML = "Vui lòng chờ...";
      this.disabled = true;

      const data = {
        email: email,
        password: password,
      };

      try {
        const result = await apiService.post("/api/user/login", data);

        if (result.status === "success") {
          localStorage.setItem("token", result.access_token);
          // alert('Login success');
          window.location.href = "index.html";
        } else {
          alert("Login failed");
          this.innerHTML = "Submit";
          this.disabled = false;
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Login failed");
      } finally {
        this.innerHTML = "Submit";
        this.disabled = false;
      }
    });
  } else {
    console.log("Login button not found or already logged in");
  }
});
