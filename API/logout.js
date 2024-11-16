import apiService from "./api.js";

const token = localStorage.getItem("token");
const dropdownElement = document.querySelector(
  "#__session .box-dropdown.ha-dropdown"
);

if (token) {
  dropdownElement.innerHTML = `
      <li><a href="/profile.html">Profile</a></li>
      <li><a href="#" id="logout">Logout</a></li>
      `;
  document
    .getElementById("logout")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      await logout();
    });
} else {
  dropdownElement.innerHTML = `
      <li><a href="register.html">Register</a></li>
      <li><a href="login.html">Login</a></li>
      `;
}

function checkLoginStatus() {
  const token = localStorage.getItem("token");
  const dropdownElement = document.querySelector(
    "#__session .box-dropdown.ha-dropdown"
  );

  if (token) {
    dropdownElement.innerHTML = `
        <li><a href="/profile.html">Profile</a></li>
        <li><a href="#" id="logout">Logout</a></li>
    `;
    document
      .getElementById("logout")
      .addEventListener("click", async function (event) {
        event.preventDefault();
        await logout();
        toastr.success("Bạn đã đăng xuất thành công!");
        window.location.href = "index.html";
      });
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

  const protectedPages = ["/profile.html"];
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

    if (response.ok) {
      localStorage.removeItem("token");
      toastr.success("Đăng xuất thành công!");
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
    toastr.error("Có lỗi xảy ra khi đăng xuất!");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();
  checkAuthRoutes();
});

setInterval(() => {
  checkLoginStatus();
  checkAuthRoutes();
}, 5000);

window.addEventListener("storage", function (e) {
  if (e.key === "token") {
    toastr.info("Token đã thay đổi trên một tab khác!");
    checkLoginStatus();
    checkAuthRoutes();
  }
});
