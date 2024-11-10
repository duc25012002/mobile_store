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
    window.location.href = "index.html";
    return;
  }

  const protectedPages = ["/profile.html"];
  if (!token && protectedPages.some((page) => currentPage.includes(page))) {
    window.location.href = "login.html";
    return;
  }
}

async function logout() {
  try {
    if (!token) {
      console.warn("No token found, user already logged out");
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
      console.log("Logout successful");
    } else {
      const data = await response.json();
      console.error("Logout failed:", data.error);
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
      }
    }
  } catch (error) {
    console.error("Error during logout:", error);
    localStorage.removeItem("token");
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
    console.log("Token changed in another tab");
    checkLoginStatus();
    checkAuthRoutes();
  }
});
