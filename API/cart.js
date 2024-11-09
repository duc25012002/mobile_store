import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { formatPrice } from "./products-all.js";
import { token } from "./api.js";
import { selectedProductId } from "./products-all.js";
import { user_id } from "./login.js";

async function getUserCart() {
  try {
    const cartData = await apiService.get(
      "/api/cart",
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("Giỏ hàng của người dùng:", cartData);
    const tbody = document.querySelector("tbody");

    tbody.innerHTML = "";

    if (Array.isArray(cartData.data) && cartData.data.length > 0) {
      cartData.data.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>
                        <a href="product-details.html" product-card-id="${
                          item.product_variant_id
                        }">
                            <img
                            src="${API_CONFIG.baseURL}/${item.variant_images}"
                            alt="Cart Product Image" title="${item.name}"
                            class="img-thumbnail"
                            >
                        </a>
                    </td>
                    <td>
                          <a href="product-details.html"  product-card-id="${
                            item.product_id
                          }">${item.product}</a>
                      </td>
                      <td>${item.quantity}</td>
                      <td>
                          <div class="input-group btn-block">
                              <div class="product-qty me-3">
                                  <input type="text" value="${item.quantity}">
                                  <span class="dec qtybtn"><i class="fa fa-minus"></i></span>
                                  <span class="inc qtybtn"><i class="fa fa-plus"></i></span>
                              </div>
                              <span class="input-group-btn">
                                  <button type="submit" class="btn btn-primary">
                                      <i class="fa fa-refresh"></i>
                                  </button>
                                  <button type="button" class="btn btn-danger pull-right">
                                      <i class="fa fa-times-circle"></i>
                                  </button>
                              </span>
                          </div>
                      </td>
                      <td>${formatPrice(item.price)}</td>
                      <td>${formatPrice(item.totalAmount)}</td>
                  `;
        tbody.appendChild(row);

        const removeButton = row.querySelector(".btn.btn-danger.pull-right");
        removeButton.addEventListener("click", async () => {
          console.log("Nút đã được nhấn để xóa sản phẩm!");
          await updateUserCart(user_id, item.product_variant_id, 0);
          getUserCart();
          console.log("Giao diện đã được cập nhật!");
        });
      });
    } else {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center">Giỏ hàng hiện trống.</td></tr>';
    }
  } catch (error) {
    if (error.message.includes("401")) {
      console.log("Người dùng chưa được xác thực.");
    }
  }
}

export async function updateUserCart(userId, productVariantId, quantity) {
  try {
    const body = {
      user_Id: userId,
      product_variant_id: productVariantId,
      quantity: quantity,
    };

    const updatedCart = await apiService.post(
      "/api/cart/update",
      body,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("Giỏ hàng sau khi cập nhật:", updatedCart);
    if (updatedCart.message) {
      alert("Thông báo: " + updatedCart.message);
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
  }
}

getUserCart();
