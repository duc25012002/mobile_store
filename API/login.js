import apiService from "./api.js";
import { token } from "./api.js";
import { API_CONFIG } from "./api.js";

export let user_id = localStorage.getItem("user_id");

const getUserId = async () => {
  if (!token) {
    toastr.warning("Bạn cần đăng nhập để thực hiện hành động này.");
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
    console.log("thông tin người dùng", response);

    return response.data.id;
  } catch (error) {
    console.error("Error fetching user_id:", error);
    toastr.error(
      "Có lỗi xảy ra khi lấy thông tin người dùng. Vui lòng thử lại."
    );
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
      toastr.warning("Không thể lấy thông tin người dùng.");
    }
  }
};

export async function handleLogin(data, button) {
  try {
    const result = await apiService.post("/api/user/login", data);

    if (result && result.status === "success") {
      localStorage.setItem("token", result.access_token);
      toastr.success("Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      toastr.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại."
      );
    }
  } catch (error) {
    console.error("Error:", error);
    toastr.error("Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.");
  } finally {
    button.innerHTML = "Sign In";
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector(".btn.btn-secondary");

  if (loginButton) {
    loginButton.addEventListener("click", async function () {
      const email = document.querySelector('input[name="email"]').value;
      const password = document.querySelector('input[name="password"]').value;

      if (!email) {
        toastr.warning("Vui lòng nhập email người dùng.");
        return;
      }
      if (!password) {
        toastr.warning("Vui lòng nhập mật khẩu.");
        return;
      }

      this.innerHTML = "Vui lòng chờ...";
      this.disabled = true;

      const data = {
        email: email,
        password: password,
      };

      // try {
      //   const result = await apiService.post("/api/user/login", data);

      //   if (result && result.status === "success") {
      //     localStorage.setItem("token", result.access_token);
      //     toastr.success("Đăng nhập thành công!");
      //     setTimeout(() => {
      //       window.location.href = "index.html";
      //     }, 1000);
      //   } else {
      //     toastr.error(
      //       "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại."
      //     );
      //   }
      // } catch (error) {
      //   console.error("Error:", error);
      //   toastr.error(
      //     "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại."
      //   );
      // } finally {
      //   this.innerHTML = "Sign In";
      //   this.disabled = false;
      // }

      await handleLogin(data, this);
    });
  }

  handleUserId();
});
