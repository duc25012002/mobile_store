const btn_exit = document.getElementById("btn-exit");
const support_user = document.getElementById("support_user");
const chatbotContainer = document.querySelector(".chatbot-container");

if (btn_exit) {
  btn_exit.addEventListener("click", function () {
    if (chatbotContainer) {
      chatbotContainer.style.display = "none";
    }
  });
}

if (support_user) {
  support_user.addEventListener("click", function () {
    if (chatbotContainer) {
      if (
        chatbotContainer.style.display === "none" ||
        chatbotContainer.style.display === ""
      ) {
        chatbotContainer.style.display = "flex";
      } else {
        chatbotContainer.style.display = "none";
      }
    }
  });
}

const btn_showPassword = document.querySelector(".pass-show-btn");
if (btn_showPassword) {
  btn_showPassword.addEventListener("click", function () {
    const passwordInput = document.getElementById("c-password");
    const isPassword = passwordInput.getAttribute("type") === "password";

    passwordInput.setAttribute("type", isPassword ? "text" : "password");

    this.textContent = isPassword ? "X" : "show";
  });
}
