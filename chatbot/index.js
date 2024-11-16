import { process } from "./env.js";

const apiKey = process.env.OPENAI_API_KEY;
const conversationContainer = document.getElementById("chatbot-conversation");
const userInputField = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const userInput = userInputField.value.trim();
  if (userInput) {
    appendMessage(userInput, "user");

    // appendMessage("Đang xử lý...", "bot");
    userInputField.value = "";
    fetchBotReply(userInput);
  }
});

function appendMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "speech",
    sender === "user" ? "speech-user" : "speech-ai"
  );
  messageElement.innerText = message;
  conversationContainer.appendChild(messageElement);
  conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

async function fetchBotReply(userInput) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Chỉ trả lời bằng tiếng Việt về điện thoại. Bạn là nhân viên của cửa hàng Sinrato, nhiệm vụ của bạn là tư vấn và hỗ trợ các thắc mắc của khách hàng",
          },
          { role: "user", content: userInput },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content.trim();

    appendMessage(botResponse, "bot");
  } catch (error) {
    appendMessage("Đã xảy ra lỗi. Vui lòng thử lại.", "bot");
    console.error(error);
  }
}
