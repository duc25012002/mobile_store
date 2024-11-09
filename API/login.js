import apiService from "./api.js";
import { token } from "./api.js";

export let user_id;

const getUserId = async () => {
  const response = await apiService.get("/api/user-id", {}, {
    Authorization: `Bearer ${token}`,
    mode: "no-cors",
  });

  return response.data.id;
};

getUserId()
  .then(id => {
    user_id = id;
  })
  .catch(error => {
    console.error("Error fetching user_id:", error);
  });

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector(".btn.btn-secondary");

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
          alert('Login success');
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
  }
});
