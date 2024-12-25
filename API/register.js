import apiService from "./api.js";

async function registerUser(data) {
  try {
    const result = await apiService.post("/api/user/register", data);

    if (result.status === "success") {
      toastr.success("Đăng ký thành công");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      toastr.error(result.errors.message || "Đăng ký thất bại");
    }
    return result;
  } catch (error) {
    console.error("Error:", error);
    toastr.error(error.message, "Đăng ký thất bại do:");
    throw error;
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const name = document.querySelector("#inputname").value;
  const phone = document.querySelector("#inputphone").value;
  const address = document.querySelector("#inputaddress").value;
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#c-password").value;

  if (!email || !name || !phone || !address || !password || !confirmPassword) {
    toastr.warning("Tất cả các trường là bắt buộc");
    return;
  }
  if (password !== confirmPassword) {
    toastr.warning("Mật khẩu không khớp");
    return;
  }

  const button = event.currentTarget;
  button.innerHTML = "Đang đăng ký...";
  button.disabled = true;

  const data = {
    email,
    name,
    phone,
    address,
    password,
    repassword: confirmPassword,
  };

  try {
    await registerUser(data);
  } catch (error) {
    console.error("Xử lý lỗi tại đây nếu cần.");
  } finally {
    button.innerHTML = "Register";
    button.disabled = false;
  }
}

document
  .querySelector(".btn.btn-secondary")
  .addEventListener("click", handleRegister);
