import { API_CONFIG } from "./api.js";
import { formatPrice } from "./products-all.js";
import { token } from "./api.js";
import { user_id } from "./login.js";
import { addToCart } from "./cart.js";
import { loadAndRenderCart } from "./cart.js";
import { fetchProductListALL } from "./products-all.js";

function filterByKeyword(
  products,
  keyword,
  searchFields = ["title", "info", "category_name"]
) {
  const lowerCaseKeyword = keyword.toLowerCase();

  return products.filter((product) => {
    const directFieldsMatch = searchFields.some(
      (field) =>
        product[field] &&
        product[field].toString().toLowerCase().includes(lowerCaseKeyword)
    );

    const specificationsMatch =
      product.specifications &&
      ["screen_type", "screen_resolution"].some(
        (field) =>
          product.specifications[field] &&
          product.specifications[field]
            .toString()
            .toLowerCase()
            .includes(lowerCaseKeyword)
      );

    const variantsMatch =
      product.variants &&
      product.variants.some(
        (variant) =>
          ["color", "price"].some(
            (field) =>
              variant[field] &&
              variant[field].toString().toLowerCase().includes(lowerCaseKeyword)
          ) ||
          (variant.rom &&
            variant.rom.capacity &&
            variant.rom.capacity
              .toString()
              .toLowerCase()
              .includes(lowerCaseKeyword))
      );

    return directFieldsMatch || specificationsMatch || variantsMatch;
  });
}

function filterByPrice(products, minPrice, maxPrice) {
  return products.filter((product) => {
    return (
      product.variants &&
      product.variants.some(
        (variant) =>
          variant.price &&
          parseFloat(variant.price) >= minPrice &&
          parseFloat(variant.price) <= maxPrice
      )
    );
  });
}

// async function searchProducts(
//   products,
//   keyword,
//   minPrice,
//   maxPrice,
//   searchFields = ["title", "info", "category_name"]
// ) {
//   try {
//     console.log("nhỏ", minPrice);
//     console.log("lớn", maxPrice);

//     const lowerCaseKeyword = keyword.toLowerCase();

//     const filteredProducts = products.filter((product) => {
//       const directFieldsMatch = searchFields.some(
//         (field) =>
//           product[field] &&
//           product[field].toString().toLowerCase().includes(lowerCaseKeyword)
//       );

//       const specificationsMatch =
//         product.specifications &&
//         ["screen_type", "screen_resolution"].some(
//           (field) =>
//             product.specifications[field] &&
//             product.specifications[field]
//               .toString()
//               .toLowerCase()
//               .includes(lowerCaseKeyword)
//         );

//       const variantsMatch =
//         product.variants &&
//         product.variants.some(
//           (variant) =>
//             ["color", "price"].some(
//               (field) =>
//                 variant[field] &&
//                 variant[field]
//                   .toString()
//                   .toLowerCase()
//                   .includes(lowerCaseKeyword)
//             ) ||
//             (variant.rom &&
//               variant.rom.capacity &&
//               variant.rom.capacity
//                 .toString()
//                 .toLowerCase()
//                 .includes(lowerCaseKeyword))
//         );

//       const priceInRange =
//         product.variants &&
//         product.variants.some(
//           (variant) =>
//             variant.price &&
//             parseFloat(variant.price) >= minPrice &&
//             parseFloat(variant.price) <= maxPrice
//         );

//       return (
//         (directFieldsMatch || specificationsMatch || variantsMatch) &&
//         priceInRange
//       );
//     });

//     return filteredProducts;
//   } catch (error) {
//     console.error("Lỗi trong quá trình tìm kiếm sản phẩm:", error);
//     return [];
//   }
// }

async function handleSearchEvent(
  event,
  productList,
  minPrice = 0,
  maxPrice = Infinity
) {
  if (
    event.key === "Enter" ||
    event.type === "click" ||
    event.type === "sliderValuesUpdated"
  ) {
    event.preventDefault();
    const searchInput = document.getElementById("searchInput");
    const keyword = searchInput.value.trim();

    if (keyword || event.type === "sliderValuesUpdated") {
      const searchFields = ["title", "info", "category_name"];

      const filteredByKeyword = filterByKeyword(
        productList,
        keyword,
        searchFields
      );

      const filteredByPrice = filterByPrice(
        filteredByKeyword,
        minPrice,
        maxPrice
      );

      console.log("Kết quả tìm kiếm sau khi lọc:", filteredByPrice);

      if (filteredByPrice.length > 0) {
        sessionStorage.setItem(
          "searchResults",
          JSON.stringify(filteredByPrice)
        );
        toastr.success(`Tìm thấy ${filteredByPrice.length} sản phẩm phù hợp.`);

        const checkSearchWindow = document.getElementById("price-slider");
        if (!checkSearchWindow) {
          setTimeout(() => {
            window.location.href = `shop-grid-left-sidebar.html`;
          }, 1000);
        } else {
          renderSearchResults(filteredByPrice);
        }
      } else {
        toastr.warning("Không tìm thấy sản phẩm phù hợp!!!");
        renderSearchResults(filteredByPrice);
      }
    } else {
      toastr.info("Vui lòng nhập từ khóa để tìm kiếm.");
    }
  }
}

function renderSearchResults(searchResults) {
  const shopProductWrap = document.querySelector(".shop-product-wrap");
  console.log("kiểm tra trước khi render:", searchResults);
  if (!shopProductWrap) {
    return;
  }
  shopProductWrap.innerHTML = "";

  if (searchResults.length === 0) {
    shopProductWrap.innerHTML = `
      <div class="col-12">
        <p class="text-center mb-5">Không tìm thấy sản phẩm nào phù hợp.</p>
      </div>
    `;
    return;
  }

  searchResults.forEach((product) => {
    const categoryName = product.category_name || "Chưa có danh mục";
    const title = product.title || "Không có tên sản phẩm";
    const description = product.description || "Không có mô tả gì về sản phẩm";
    const price = parseFloat(
      product.variants && product.variants[0] ? product.variants[0].price : 0
    ).toFixed(2);
    const discount = product.discount
      ? `-${Number(product.discount).toFixed(0)}%`
      : "";
    const detailsUrl = "product-details.html";

    const primaryImageUrl =
      product.variants &&
      product.variants[0] &&
      product.variants[0].images &&
      product.variants[0].images[0]
        ? `${API_CONFIG.baseURL}/${product.variants[0].images[0].image_url}`
        : "";

    const productHTML = `
    <div class="col-lg-3 col-md-4 col-sm-6">
      <div class="product-item mb-30">
        <div class="product-thumb">
          <a href="${detailsUrl}" data-product-id="${product.id}">
            <img src="${primaryImageUrl}" class="pri-img" alt="${title}" />
            <img src="${primaryImageUrl}" class="sec-img" alt="${title}" />
          </a>
          <div class="box-label">
            ${
              discount
                ? `
            <div class="label-product label_sale"><span>${discount}</span></div>
            `
                : ""
            }
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
            <p><a href="#">${categoryName}</a></p>
          </div>
          <div class="product-name">
            <h4>
              <a href="${detailsUrl}" data-product-id="${
      product.id
    }">${title}</a>
            </h4>
          </div>
          <div class="ratings">
            ${generateStarRatings(5)}
            <!-- Sử dụng hàm để tạo sao -->
          </div>
          <div class="price-box">
            <span class="regular-price">${formatPrice(price)}</span>
          </div>
            <button class="btn-cart" type="button" data-product-id="${
              product.variants[0].id
            }">
              Add to cart
            </button>
        </div>
      </div>
          <div class="sinrato-list-item mb-30">
      <div class="d-flex">
        <div class="sinrato-thumb">
          <a href="product-details.html">
            <img src="${primaryImageUrl}" class="pri-img" alt="" />
            <img src="${primaryImageUrl}" class="sec-img" alt="" />
          </a>
          <div class="box-label">
            ${
              discount
                ? `
            <div class="label-product label_sale"><span>${discount}</span></div>
            `
                : ""
            }
          </div>
        </div>
        <div class="sinrato-list-item-content">
          <div class="manufacture-product">
            <span><a href="#">${categoryName}</a></span>
          </div>
          <div class="sinrato-product-name">
            <h4>
              <a href="product-details.html">${title}</a>
            </h4>
          </div>
          <div class="sinrato-ratings mb-15">${generateStarRatings(5)}</div>
          <div class="sinrato-product-des">
            <p>${description}</p>
          </div>
        </div>
      </div>
      <div class="sinrato-box-action">
        <div class="price-box">
          <span class="regular-price">
            <span class="special-price">${formatPrice(price)}</span>
          </span>
        </div>
            <button class="btn-cart" type="button" data-product-id="${
              product.variants[0].id
            }">
                Add to cart
            </button>
        <div class="action-links sinrat-list-icon">
          <a href="#" title="Wishlist"><i class="lnr lnr-heart"></i></a>
          <a href="#" title="Compare"><i class="lnr lnr-sync"></i></a>
          <a
            href="#"
            title="Quick view"
            data-bs-target="#quickk_view"
            data-bs-toggle="modal"
            ><i class="lnr lnr-magnifier"></i
          ></a>
        </div>
      </div>
    </div>
    </div>
    `;

    shopProductWrap.insertAdjacentHTML("beforeend", productHTML);
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

function generateStarRatings(rating) {
  const fullStar = '<span class="yellow"><i class="lnr lnr-star"></i></span>';
  const emptyStar = '<span><i class="lnr lnr-star"></i></span>';
  const stars = fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
  return stars;
}
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");

document.addEventListener("DOMContentLoaded", async () => {
  const productList = await fetchProductListALL();
  const savedSearchResults = sessionStorage.getItem("searchResults");

  searchButton.addEventListener("click", (event) => {
    handleSearchEvent(event, productList);
  });
  searchInput.addEventListener("keypress", (event) => {
    handleSearchEvent(event, productList);
  });
  // Lắng nghe sự kiện từ slider
  window.addEventListener("sliderValuesUpdated", (event) => {
    const values = event.detail;
    console.log("Khoảng giá đã được cập nhật:", values);

    const minPrice = parseFloat(values[0]);
    const maxPrice = parseFloat(values[1]);

    handleSearchEvent(event, productList, minPrice, maxPrice);
    updateUI(minPrice, maxPrice);
  });

  // Hàm giả lập xử lý cập nhật UI
  function updateUI(min, max) {
    console.log(`Cập nhật giao diện với khoảng giá từ ${min} đến ${max}`);
  }

  if (savedSearchResults) {
    const searchResults = JSON.parse(savedSearchResults);
    renderSearchResults(searchResults);
  }
});
