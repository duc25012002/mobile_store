import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { formatPrice } from "./products-all.js";
import { token } from "./api.js";
import { selectedProductId } from "./products-all.js";
import { user_id } from "./login.js";

export let product_card_Id = null;
export let totalAmount = 0;
export let subTotal = 0;
export let product_variant_id = null;

export async function getUserCart() {
  try {
    const cartData = await apiService.get(
      "/api/cart",
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // toastr.success("Giỏ hàng đã được tải thành công.");
    return cartData.data;
  } catch (error) {
    if (error.message.includes("401")) {
      toastr.warning("Người dùng chưa được xác thực.");
    } else if (error.message === "Failed to fetch") {
      // toastr.warning("Bạn chưa đăng nhập");
      console.log("Không thể tải lên giỏ hàng vì bạn chưa đăng nhập");
    } else {
      toastr.error(error.message);
    }

    return [];
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
      { Authorization: `Bearer ${token}` }
    );

    if (updatedCart.message === "Cập nhật thành công!") {
      console.log(updatedCart.message);
      toastr.success("Cập nhật giỏ hàng thành công!");
    } else {
      toastr.warning(updatedCart.message);
    }
  } catch (error) {
    toastr.error("Lỗi khi cập nhật giỏ hàng. Vui lòng thử lại.");
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
  }
}

export async function addToCart(userId, productVariantId, quantity) {
  try {
    const body = {
      user_Id: userId,
      product_variant_id: productVariantId,
      quantity: quantity,
    };
    const addToCart = await apiService.post(
      "/api/cart/add",
      body,
      {},
      { Authorization: `Bearer ${token}` }
    );

    if (addToCart.message === "Cập nhật thành công!") {
      console.log(addToCart.message);
      toastr.success("Thêm sản phẩm vào giỏ hàng thành công.");
    } else {
      console.log(addToCart.message);
      toastr.warning(addToCart.message);
    }
  } catch (error) {
    toastr.error("Lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
  }
}

function renderCartTable(cartItems) {
  const tbody = document.getElementById("card-body");
  if (tbody) {
    tbody.innerHTML = "";
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      cartItems.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
              <a href="product-details.html">
                  <img src="${API_CONFIG.baseURL}/${item.variant_images}"
                       alt="Cart Product Image" title="${item.product}"
                       class="img-thumbnail" product-card-id="${
                         item.product_id
                       }">
              </a>
          </td>
          <td>
              <a href="product-details.html" product-card-id="${
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
        attachEventListeners(row, item);
      });

      tbody.addEventListener("click", (event) => {
        const target = event.target.closest("[product-card-id]");
        // event.preventDefault();
        if (target) {
          const selectedProductId = target.getAttribute("product-card-id");
          console.log("Selected Product ID:", selectedProductId);
          if (selectedProductId) {
            localStorage.setItem("selectedProductId", selectedProductId);
            loadAndRenderCart();
          } else {
            console.error("Không có ID sản phẩm được chọn.");
          }
        }
      });
    } else {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center">Giỏ hàng hiện trống.</td></tr>';
    }
  }
}

function renderCartCheckout(cartItems) {
  const productListElement = document.querySelector(".product-container");

  if (productListElement) {
    productListElement.innerHTML = "";
    cartItems.forEach((item) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product-list");
      productElement.innerHTML = `
        <div class="product-inner d-flex align-items-center">
          <div class="product-image me-4 me-sm-5 me-md-4 me-lg-5">
            <a href="#">
              <img src="${API_CONFIG.baseURL}/${item.variant_images}" alt="${
        item.name
      }" title="${item.name}">
            </a>
          </div>
          <div class="media-body">
            <h5>${item.product}</h5>
            <p class="product-quantity">Số lượng: ${item.quantity}</p>
            <p class="product-final-price">${formatPrice(item.price)}</p>
          </div>
        </div>
      `;
      productListElement.appendChild(productElement);
    });
  }
}

function renderMiniCart(cartItems) {
  // console.log("cập nhật lại miniCard");

  totalAmount = cartItems.reduce((acc, item) => acc + item.totalAmount, 0);
  subTotal = cartItems.reduce(
    (acc, item) => acc + item.current_price * item.quantity,
    0
  );

  const totalElement = document.querySelectorAll(".totalAmount");
  if (totalElement && totalElement.length > 0) {
    totalElement[0].textContent = formatPrice(subTotal);
    totalElement[1].textContent = formatPrice(totalAmount);
  }

  // const discountElement = document.getElementById("discount");
  // if (discountElement) {
  //   discountElement.textContent = cartItems.discount;
  // }

  const subTotal_miniCart = document.querySelector(
    "#mini_cart .subtotal-text + .subtotal-price"
  );
  if (subTotal_miniCart) {
    subTotal_miniCart.textContent = formatPrice(subTotal);
  }

  const total_miniCart = document.querySelector(
    "#mini_cart .subtotal-text + .subtotal-price span"
  );
  if (total_miniCart) {
    total_miniCart.textContent = formatPrice(totalAmount);
  }

  const miniCartInfo = document.getElementById("mini_cart_info");
  if (miniCartInfo) {
    miniCartInfo.innerHTML = "";
    cartItems.forEach((product) => {
      const productHTML = `
        <li class="d-flex mb-3">
          <div class="cart-img">
            <a href="product-details.html">
              <img alt="${product.product}" src="${API_CONFIG.baseURL}/${
        product.variant_images
      }" />
            </a>
          </div>
          <div class="cart-info">
            <h4>
              <a href="product-details.html">${product.product}</a>
            </h4>
            <span><span>${product.quantity} x </span>${formatPrice(
        product.current_price
      )}</span>
          </div>
          <div class="del-icon">
            <i class="fa fa-times-circle"></i>
          </div>
        </li>
      `;
      miniCartInfo.insertAdjacentHTML("beforeend", productHTML);
    });
  }

  const count_quantityElement = document.querySelector(".my-cart .count");

  const count_quantity = cartItems.length;
  if (count_quantityElement) {
    count_quantityElement.textContent = count_quantity;
  }
}

function attachEventListeners(row, item) {
  const removeButton = row.querySelector(".btn.btn-danger.pull-right");
  removeButton.addEventListener("click", async () => {
    await updateUserCart(user_id, item.product_variant_id, 0);
    loadAndRenderCart();
  });

  const incButton = row.querySelector(".inc");
  const decButton = row.querySelector(".dec");
  const quantityInput = row.querySelector("input[type='text']");

  incButton.addEventListener("click", () => {
    quantityInput.value = parseInt(quantityInput.value, 10) + 1;
  });

  decButton.addEventListener("click", () => {
    quantityInput.value = Math.max(1, parseInt(quantityInput.value, 10) - 1);
  });

  const refreshButton = row.querySelector(".btn.btn-primary");

  refreshButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const newQuantity = parseInt(quantityInput.value, 10);

    if (isNaN(newQuantity) || newQuantity <= 0) {
      alert("Số lượng phải là một số hợp lệ và lớn hơn 0.");
      return;
    }

    await updateUserCart(user_id, item.product_variant_id, newQuantity);

    loadAndRenderCart();
  });
}

export async function loadAndRenderCart() {
  try {
    const cartItems = await getUserCart();
    renderCartTable(cartItems);
    renderCartCheckout(cartItems);
    renderMiniCart(cartItems);
  } catch (error) {
    toastr.error("Không thể tải giỏ hàng. Vui lòng thử lại.");
    console.error("Lỗi khi lấy giỏ hàng:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderCart();
});
