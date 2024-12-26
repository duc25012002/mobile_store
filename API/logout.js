import apiService from "./api.js";

const token = localStorage.getItem("token");
const dropdownElement = document.querySelector(
  "#__session .box-dropdown.ha-dropdown"
);

function checkLoginStatus() {
  const token = localStorage.getItem("token");
  const dropdownElement = document.querySelector(
    "#__session .box-dropdown.ha-dropdown"
  );

  if (token) {
    dropdownElement.innerHTML = `
        <li><a href="my-account.html">Profile</a></li>
        <li><a href="#" id="logout">Logout</a></li>
    `;

    const handleLogout = async (event) => {
      event.preventDefault();
      await logout();
    };

    const elementLogout = document.getElementById("logout");
    elementLogout.addEventListener("click", handleLogout);
    const elementLogout_my_account =
      document.getElementById("logout-my-account");
    if (elementLogout_my_account) {
      elementLogout_my_account.addEventListener("click", handleLogout);
    }
  } else {
    dropdownElement.innerHTML = `
        <li><a href="register.html">Register</a></li>
        <li><a href="login.html">Login</a></li>
    `;
  }
}

function checkAuthRoutes() {
  const token = localStorage.getItem("token");
  const currentPage = window.location.pathname;

  if (token && currentPage.includes("/login.html")) {
    toastr.info("Bạn đã đăng nhập rồi!");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  const protectedPages = ["my-account.html"];
  if (!token && protectedPages.some((page) => currentPage.includes(page))) {
    toastr.warning("Vui lòng đăng nhập để tiếp tục!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }
}

async function logout() {
  try {
    if (!token) {
      toastr.warning("Không tìm thấy token, có thể bạn đã đăng xuất!");
      return;
    }

    const response = await apiService.post(
      "/api/logout",
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response.status === 302) {
      toastr.warning("Phiên đăng nhập đã hết hạn, bạn sẽ được chuyển hướng.");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }

    if (response.ok) {
      localStorage.removeItem("token");
      toastr.success("Đăng xuất thành công!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      const data = await response.json();
      console.error("Lỗi đăng xuất:", data.error);
      toastr.error("Đăng xuất thất bại!");
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        toastr.info("Phiên đăng nhập đã hết hạn, token bị xóa!");
      }
    }
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    localStorage.removeItem("token");
    toastr.success("Đăng xuất thành công!", "Thành công");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("storage", function (e) {
    if (e.key === "token") {
      toastr.info("Token đã thay đổi trên một tab khác!");
      checkLoginStatus();
      checkAuthRoutes();
    }
  });

  checkLoginStatus();
  checkAuthRoutes();
});
