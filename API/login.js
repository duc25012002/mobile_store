import apiService from "./api.js";
import { token } from "./api.js";
import { API_CONFIG } from "./api.js";

export let user_id = localStorage.getItem("user_id");

const getUserId = async () => {
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện hành động này.");
    window.location.href = "login.html";
    return null;
  }

  try {
    const response = await apiService.get(
      "/api/user-id",
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("Response từ API:", response);
    console.log("Dữ liệu trong response:", response.data);
    console.log("User ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Error fetching user_id:", error);
    alert("Có lỗi xảy ra khi lấy thông tin người dùng. Vui lòng thử lại.");
    return null;
  }
};

const handleUserId = async () => {
  const currentPath = window.location.pathname;

  if (currentPath.includes("cart") || currentPath.includes("checkout")) {
    const id = await getUserId();
    if (id) {
      localStorage.setItem("user_id", id);
    } else {
      console.log("Không lấy được user_id");
    }
  }
};

handleUserId();

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
          alert("Login success");
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



