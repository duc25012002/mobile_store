import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { token } from "./api.js";
import { user_id } from "./login.js";
import { updateUserCart } from "./cart.js";

export let selectedProductId = localStorage.getItem("selectedProductId");

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

async function fetchProductList() {
  try {
    const data = await apiService.get("/api/product-list");
    console.log("Danh sách sản phẩm:", data.data);
    return data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return [];
  }
}

function renderProducts(products) {
  const productListElement = document.getElementById("product-list");
  if (!productListElement) return;

  productListElement.innerHTML = "";

  products.forEach((product) => {
    const discount = Number(product.discount).toFixed(0);
    let productHTML = `
        <div class="owl-item active" style="width: 217px; margin-right: 30px;">
            <div class="product-item">
                <div class="product-thumb">
                    <a href="product-details.html" class="product-link" data-product-id="${
                      product.id
                    }">
                        <img src="${API_CONFIG.baseURL}/${
      product.variants[0].images[0].image_url
    }" class="pri-img" alt="${product.title}">
                        <img src="${API_CONFIG.baseURL}/${
      product.variants[0].images[0].image_url
    }" class="sec-img" alt="${product.title}">
                    </a>
                    <div class="box-label">
                        <div class="label-product label_sale">
                            <span>${discount}%</span>
                        </div>
                    </div>
                    <div class="action-links">
                        <a href="#" title="Wishlist"><i class="lnr lnr-heart"></i></a>
                        <a href="#" title="Compare"><i class="lnr lnr-sync"></i></a>
                        <a href="#" title="Quick view" data-bs-target="#quickk_view" data-bs-toggle="modal">
                            <i class="lnr lnr-magnifier"></i>
                        </a>
                    </div>
                </div>
                <div class="product-caption">
                    <div class="manufacture-product">
                        <p><a href="#" class="product-link" data-product-id="${
                          product.id
                        }">${product.category_name}</a></p>
                    </div>
                    <div class="product-name">
                        <h4>
                            <a href="product-details.html" class="product-link" data-product-id="${
                              product.id
                            }">${product.title}</a>
                        </h4>
                    </div>
                    <div class="ratings">
                        ${"★".repeat(
                          product.variants[0].rating || 0
                        )}${"☆".repeat(5 - (product.variants[0].rating || 0))}
                    </div>
                    <div class="price-box">
                        <span class="regular-price">${formatPrice(
                          product.variants[0].price
                        )}</span>
                    </div>
                    <button class="btn-cart" type="button" data-product-id="${
                      product.variants[0].id
                    }">Add to cart</button>
                </div>
            </div>
        </div>
    `;
    productListElement.innerHTML += productHTML;
  });

  document.querySelectorAll("[data-product-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      // event.preventDefault();
      selectedProductId = element.getAttribute("data-product-id");
      console.log("Selected Product ID:", selectedProductId);
      if (selectedProductId) {
        localStorage.setItem("selectedProductId", selectedProductId);
      } else {
        console.error("Không có ID sản phẩm được chọn.");
      }
    });
  });

  document.querySelectorAll(".btn-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
      console.log("user", user_id);

      if (selectedProductId && user_id) {
        updateUserCart(user_id, selectedProductId, 1);
      } else {
        console.error("Không có ID sản phẩm.");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = await fetchProductList();
  if (productList && productList.length > 0) {
    renderProducts(productList);
  }
});
