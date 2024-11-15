import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { token } from "./api.js";
import { user_id } from "./login.js";
import { updateUserCart } from "./cart.js";
import { addToCart_homepage } from "./cart.js";

export let selectedProductId = localStorage.getItem("selectedProductId");

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

async function fetchProductListALL() {
  try {
    const productAll = await apiService.get("/api/product-list");
    // toastr.success("Danh sách sản phẩm đã được tải thành công!");
    console.log("Danh sách tất cả sản phẩm:", productAll.data);
    return productAll.data;
  } catch (error) {
    toastr.error("Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại sau.");
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return [];
  }
}

function renderProductsHomepage(products) {
  const appleProductsElement = document.getElementById("one_product_list");
  const samsungProductsElement = document.getElementById("two_product_list");
  const xiaomiProductsElement = document.getElementById("three_product_list");
  if (
    !appleProductsElement &&
    !samsungProductsElement &&
    !xiaomiProductsElement
  )
    return;

  const xiaomiProducts = products.filter(
    (product) => product.category_name === "Samsung"
  );

  console.log("xiaomi", xiaomiProducts);

  xiaomiProductsElement.innerHTML = "";

  if (xiaomiProducts.length === 0) {
    xiaomiProductsElement.innerHTML = `<h4 style ="text-align: center;">Không có sản phẩm nào của Xiaomi.</h4>`;
  }

  xiaomiProducts.forEach((product) => {
    const discount = Number(product.discount).toFixed(0);
    let productHTML = `
          <div class="owl-item active" style="width: 217px; height: 100%; margin-right: 30px;">
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
    appleProductsElement.innerHTML += productHTML;
  });

  const sansungProducts = products.filter(
    (product) => product.category_name === "Samsung"
  );

  console.log("Sansung", sansungProducts);

  samsungProductsElement.innerHTML = "";

  if (sansungProducts.length === 0) {
    samsungProductsElement.innerHTML = `<h4 style ="text-align: center;">Không có sản phẩm nào của Samsung.</h4>`;
  }

  sansungProducts.forEach((product) => {
    const discount = Number(product.discount).toFixed(0);
    let productHTML = `
        <div class="owl-item active" style="width: 217px; height: 100%; margin-right: 30px;">
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
    appleProductsElement.innerHTML += productHTML;
  });

  const appleProducts = products.filter(
    (product) => product.category_name === "Apple"
  );

  console.log("Apple", appleProducts);

  appleProductsElement.innerHTML = "";

  if (appleProducts.length === 0) {
    appleProductsElement.innerHTML = `<h4 style ="text-align: center;">Không có sản phẩm nào của Apple.</h4>`;
  }

  appleProducts.forEach((product) => {
    const discount = Number(product.discount).toFixed(0);
    let productHTML = `
        <div class="owl-item active" style="width: 217px; height: 100%; margin-right: 30px;">
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
    appleProductsElement.innerHTML += productHTML;
  });

  document.querySelectorAll("[data-product-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      selectedProductId = element.getAttribute("data-product-id");
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
      if (selectedProductId) {
        addToCart_homepage(user_id, selectedProductId, 1);
        // toastr.success("Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        toastr.error("Không có ID sản phẩm.");
        console.error("Không có ID sản phẩm.");
      }
    });
  });
}

async function searchProductsByTitle(products, keyword) {
  try {
    if (Array.isArray(products)) {
      const lowerCaseKeyword = keyword.toLowerCase();
      const filteredProducts = products.filter(
        (product) =>
          product.title &&
          product.title.toLowerCase().includes(lowerCaseKeyword)
      );

      return filteredProducts;
    } else {
      console.warn(
        "Không tìm thấy dữ liệu sản phẩm hoặc lỗi trong dữ liệu phản hồi."
      );
      return [];
    }
  } catch (error) {
    console.error("Lỗi trong quá trình tìm kiếm sản phẩm:", error);
    return [];
  }
}

async function handleSearchEvent(event, productList) {
  if (event.key === "Enter" || event.type === "click") {
    event.preventDefault();

    const searchInput = document.getElementById("searchInput");
    const keyword = searchInput.value.trim();

    if (keyword) {
      const searchResults = await searchProductsByTitle(productList, keyword);
      if (searchResults.length > 0) {
        toastr.success(`Tìm thấy ${searchResults.length} sản phẩm phù hợp.`);
        console.log("Kết quả tìm kiếm:", searchResults);
      } else {
        toastr.warning("Không tìm thấy sản phẩm nào phù hợp với từ khóa.");
      }
    } else {
      toastr.info("Vui lòng nhập từ khóa để tìm kiếm.");
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = await fetchProductListALL();
  if (productList && productList.length > 0) {
    renderProductsHomepage(productList);

    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");

    searchButton.addEventListener("click", (event) =>
      handleSearchEvent(event, productList)
    );
    searchInput.addEventListener("keypress", (event) =>
      handleSearchEvent(event, productList)
    );
  }
});
