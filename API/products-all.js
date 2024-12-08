import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { token } from "./api.js";
import { user_id } from "./login.js";
import { updateUserCart } from "./cart.js";
import { addToCart } from "./cart.js";
import { fetchCategories } from "./brand.js";
import { loadAndRenderCart } from "./cart.js";
// import { handleAddToCart } from "./product-details.js";
// import { renderStars } from "./product-details.js";
// import { calculateAverageRating } from "./review.js";
// import { fetchCategories, renderCategoryProducts } from "./brand.js";

export let selectedProductId = localStorage.getItem("selectedProductId");

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

export async function fetchProductListALL() {
  try {
    const productAll = await apiService.get("/api/product-list");
    // toastr.success("Danh sách sản phẩm đã được tải thành công!");
    console.log("Danh sách tất cả sản phẩm:", productAll.data);
    return productAll.data;
  } catch (error) {
    // toastr.error("Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại sau.");
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return [];
  }
}

function renderOurProduct(products, categories) {
  const container = document.querySelector("#tab_content_our_product");

  if (!container) {
    console.error('Không tìm thấy phần tử với id "tab_content_our_product"');
    return;
  }

  container.innerHTML = ``;

  categories.forEach((category, index) => {
    const tabPane = document.createElement("div");
    tabPane.classList.add(
      "tab-pane",
      "fade",
      "show",
      ...(index === 0 ? ["active"] : [])
    );
    tabPane.id = `categoryId-${category.id}`;
    tabPane.setAttribute("role", "tabpanel");
    tabPane.setAttribute(
      "aria-labelledby",
      `tab-${category.name}-${category.id}`
    );

    const productGallaryWrapper = document.createElement("div");
    productGallaryWrapper.classList.add("product-gallary-wrapper");

    const productGallaryActive = document.createElement("div");
    productGallaryActive.classList.add(
      "product-gallary-active",
      "owl-arrow-style",
      "product-spacing",
      "row"
    );

    const categoryProducts = products.filter(
      (product) => product.category_id === category.id
    );
    console.log("categoryProducts", categoryProducts);

    categoryProducts.forEach((product) => {
      const discount = Number(product.discount).toFixed(0);
      const col = document.createElement("div");
      col.classList.add("col-md-4", "mb-4");
      const productItem = document.createElement("div");
      productItem.classList.add("product-item");
      productItem.innerHTML = `
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
                    <span>-${discount}%</span>
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
                ${"★".repeat(product.variants[0].rating || 0)}${"☆".repeat(
        5 - (product.variants[0].rating || 0)
      )}
            </div>
            <div class="price-box">
                <span class="regular-price">${formatPrice(
                  product.variants[0].price
                )}</span>
            </div>
            <button class="btn-cart" type="button" data-product-id="${
              product.variants[0].id
            }">
                Add to cart
            </button>
        </div>
      `;
      col.appendChild(productItem);
      productGallaryActive.appendChild(col);
    });

    productGallaryWrapper.appendChild(productGallaryActive);
    tabPane.appendChild(productGallaryWrapper);
    container.appendChild(tabPane);
  });
  document.querySelectorAll("[data-product-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const selectedProductId = element.getAttribute("data-product-id");
      if (selectedProductId) {
        localStorage.setItem("selectedProductId", selectedProductId);
      } else {
        console.error("Không có ID sản phẩm được chọn.");
      }
    });
  });

  document.querySelectorAll(".btn-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!token) {
        toastr.warning("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
        return;
      }
      const selectedProductId = button.getAttribute("data-product-id");
      if (selectedProductId) {
        addToCart(user_id, selectedProductId, 1);
        loadAndRenderCart();
      } else {
        toastr.error("Không có ID sản phẩm.");
        console.error("Không có ID sản phẩm.");
      }
    });
  });
}

// Hàm trích xuất dữ liệu sản phẩm
function extractProductData(jsonData) {
  const products = [];

  jsonData.forEach((product) => {
    product.variants.forEach((variant) => {
      if (variant.images.length > 0 && variant.stock >= 0) {
        products.push({
          id: variant.id || "Unknown",
          products_id: product.id || "Unknown",
          title: product.title,
          stock: variant.stock,
          image_url: variant.images[0].image_url,
          color: variant.color || "Unknown",
          capacity: variant.rom?.capacity || "Unknown",
          price: variant.price || "Unknown",
          discount: product.discount || "Unknown",
          category: product.category_name || "Unknown",
        });
      } else {
        products.push({
          id: variant.id || "Unknown",
          products_id: product.id || "Unknown",
          title: product.title,
          stock: variant.stock >= 0 ? variant.stock : 0,
          image_url: "assets/img/default-placeholder.png",
          color: variant.color || "Unknown",
          capacity: variant.rom?.capacity || "Unknown",
          price: variant.price || "Unknown",
          category: product.category_name || "Unknown",
          discount: product.discount || "Unknown",
        });
      }
    });
  });

  return products;
}

function renderFeaturedProduct(products) {
  const containerItems = document.querySelectorAll(
    ".featured-cat-active.owl-carousel.owl-arrow-style.owl-theme.owl-loaded .owl-item"
  );

  if (containerItems.length === 0) {
    console.warn("Không tìm thấy thẻ .owl-item bên trong .featured-cat-active");
    return;
  }

  containerItems.forEach((container, index) => {
    const product = products[index % products.length];

    container.innerHTML = "";

    const productItem = document.createElement("div");
    productItem.className = "pro-layout-two-single-item";

    productItem.innerHTML = `
      <div class="product-layout-two mb-30">
        <div class="product-layout-info">
          <h4 class="pro-name">
            <a href="product-details.html" data-product-id="${product.products_id}">${product.title} - ${product.capacity} màu ${product.color}</a>
          </h4>
          <p class="total-items">${product.stock} sản phẩm</p>
          <a href="product-details.html" class="shop-btn" data-product-id="${product.products_id}">+ Mua ngay</a>
        </div>
        <div class="product-layout-thumb">
          <a href="product-details.html" data-product-id="${product.products_id}">
            <img src="${API_CONFIG.baseURL}/${product.image_url}" alt="${product.title}" />
          </a>
        </div>
      </div>
    `;

    container.appendChild(productItem);
  });

  document.querySelectorAll("[data-product-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const selectedProductId = element.getAttribute("data-product-id");
      if (selectedProductId) {
        localStorage.setItem("selectedProductId", selectedProductId);
      } else {
        console.error("Không có ID sản phẩm được chọn.");
      }
    });
  });
}

function renderBrandSale(products) {
  const saleProducts = products.filter(
    (product) => product.discount && parseFloat(product.discount) > 0
  );

  const containers = document.querySelectorAll(
    "#tab-content-brand-sale .product-item"
  );

  if (containers.length === 0) {
    console.error(
      "Không tìm thấy phần tử #tab-content-brand-sale .product-item"
    );
    return;
  }

  if (saleProducts.length === 0) {
    containers.forEach((container) => {
      container.innerHTML = "<p>Không có sản phẩm giảm giá.</p>";
    });
    return;
  }

  containers.forEach((container, index) => {
    const product = saleProducts[index % saleProducts.length];
    // console.log("id", product.id);

    const discountedPrice =
      parseFloat(product.price) *
      (1 - parseFloat(product.discount).toFixed(0) / 100);

    const productHTML = `
      <div class="product-thumb">
        <a href="product-details.html" data-product-id="${
          product.products_id
        }" >
          <img src="${API_CONFIG.baseURL}/${
      product.image_url
    }" class="pri-img" alt="${product.title}" />
          <img src="${API_CONFIG.baseURL}/${
      product.image_url
    }" class="sec-img" alt="${product.title}" />
        </a>
        <div class="box-label">
          <div class="label-product label_sale">
            <span>-${Number(product.discount).toFixed(0)}%</span>
          </div>
        </div>
        <div class="action-links">
          <a href="#" title="Wishlist"><i class="lnr lnr-heart"></i></a>
          <a href="#" title="Compare"><i class="lnr lnr-sync"></i></a>
          <a
            href="#"
            title="Quick view"
            data-bs-target="#quickk_view"
            data-bs-toggle="modal"
          >
            <i class="lnr lnr-magnifier"></i>
          </a>
        </div>
      </div>
      <div class="product-caption">
        <div class="manufacture-product">
          <p>
            <a href="shop-grid-left-sidebar.html">${product.category}</a>
          </p>
        </div>
        <div class="product-name">
          <h4>
            <a href="product-details.html" class="product-link" data-product-id="${
              product.products_id
            }">${product.title}</a>
          </h4>
        </div>
        <div class="ratings">
          <span class="yellow"><i class="lnr lnr-star"></i></span>
          <span class="yellow"><i class="lnr lnr-star"></i></span>
          <span class="yellow"><i class="lnr lnr-star"></i></span>
          <span class="yellow"><i class="lnr lnr-star"></i></span>
          <span class="yellow"><i class="lnr lnr-star"></i></span>
        </div>
        <div class="price-box">
          <span class="regular-price">
            <span class="special-price">${formatPrice(discountedPrice)}</span>
          </span>
          <span class="old-price"><del>${formatPrice(
            product.price
          )}</del></span>
        </div>
        <button class="btn-cart" type="button" data-product-id="${product.id}">
            Add to cart
        </button>
      </div>
    `;

    container.innerHTML = productHTML;
  });
  document.querySelectorAll("[data-product-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const selectedProductId = element.getAttribute("data-product-id");
      if (selectedProductId) {
        localStorage.setItem("selectedProductId", selectedProductId);
      } else {
        console.error("Không có ID sản phẩm được chọn.");
      }
    });
  });

  document.querySelectorAll(".btn-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!token) {
        toastr.warning("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
        return;
      }
      const selectedProductId = button.getAttribute("data-product-id");
      if (selectedProductId) {
        addToCart(user_id, selectedProductId, 1);
        loadAndRenderCart();
      } else {
        toastr.error("Không có ID sản phẩm.");
        console.error("Không có ID sản phẩm.");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = await fetchProductListALL();
  const categorieList = await fetchCategories();
  if (productList && productList.length > 0 && categorieList) {
    const extractedProducts = extractProductData(productList);
    renderOurProduct(productList, categorieList);
    // renderFeaturedProduct(productList);

    console.log("dữ liệu danh sách sp trích xuất được", extractedProducts);

    renderFeaturedProduct(extractedProducts);
    renderBrandSale(extractedProducts);
  }
});
