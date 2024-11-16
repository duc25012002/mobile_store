document.getElementById("btn-exit").addEventListener("click", function () {
  document.querySelector(".chatbot-container").style.display = "none";
});

document.getElementById("support_user").addEventListener("click", function () {
  document.querySelector(".chatbot-container").style.display = "flex";
});
