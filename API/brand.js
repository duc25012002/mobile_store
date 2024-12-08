import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { token } from "./api.js";

export const fetchCategories = async () => {
  try {
    const endpoint = "/api/category";

    const response = await apiService.get(endpoint, {});

    if (response.status === "success" && response.data) {
      console.log("Danh sách các hãng:", response.data);
      return response.data;
    } else {
      throw new Error(response.message || "Không lấy được danh sách các hãng.");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API fetchCategories:", error.message);
    throw error;
  }
};

const renderCategory = async (categories) => {
  try {
    const tabList = document.getElementById("nav_our_product");
    if (tabList) {
      tabList.innerHTML = "";

      categories.forEach((category, index) => {
        const tabItem = document.createElement("li");
        tabItem.setAttribute("role", "presentation");

        const button = document.createElement("button");
        button.id = `tab-${category.name}-${category.id}`;
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-toggle", "tab");
        button.setAttribute("data-bs-target", `#categoryId-${category.id}`);
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", `categoryId-${category.id}`);
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");

        if (index === 0) {
          button.classList.add("active");
        }
        button.textContent = category.name;

        tabItem.appendChild(button);
        tabList.appendChild(tabItem);
      });
    }
  } catch (error) {
    console.error("Lỗi khi render danh mục:", error.message);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const categories = await fetchCategories();
  if (categories) {
    renderCategory(categories);
  }
});
