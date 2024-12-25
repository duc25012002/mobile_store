import { API_CONFIG } from "./api.js";
import { formatPrice } from "./products-all.js";
import { token } from "./api.js";
import { user_id } from "./login.js";
import { addToCart } from "./cart.js";
import { loadAndRenderCart } from "./cart.js";
import { fetchProductListALL } from "./products-all.js";
import { renderStars } from "./product-details.js";
import { extractProductData } from "./products-all.js";
import { createArrayRatingId } from "./products-all.js";
import { productList } from "./products-all.js";

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

function filterSort(sortValue, searchProductList) {
  switch (sortValue) {
    case "Relevance":
      return searchProductList;

    case "NameAZ":
      return searchProductList.sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });

    case "NameZA":
      return searchProductList.sort((a, b) => {
        if (a.title > b.title) return -1;
        if (a.title < b.title) return 1;
        return 0;
      });

    case "Price":
      return searchProductList.sort((a, b) => {
        return parseFloat(a.price) - parseFloat(b.price);
      });

    case "Rating":
      return searchProductList.sort((a, b) => {
        return parseFloat(b.rating) - parseFloat(a.rating);
      });

    default:
      return searchProductList;
  }
}

async function handleSearchEvent(
  event,
  productList,
  minPrice = 0,
  maxPrice = 100000000
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

      // console.log("Bắt đầu lọc theo từ khóa...");
      const filteredByKeyword = filterByKeyword(
        productList,
        keyword,
        searchFields
      );
      // console.log("Kết quả sau khi lọc từ khóa:", keyword, filteredByKeyword);

      // console.log("Bắt đầu lọc theo giá...");
      const filteredByPrice = filterByPrice(
        filteredByKeyword,
        minPrice,
        maxPrice
      );

      // console.log(
      //   "Kết quả sau khi lọc theo giá:",
      //   minPrice,
      //   maxPrice,
      //   filteredByPrice
      // );

      if (filteredByPrice.length > 0) {
        sessionStorage.setItem(
          "searchResults",
          JSON.stringify(filteredByPrice)
        );

        const checkSearchWindow = document.getElementById("price-slider");
        if (!checkSearchWindow) {
          sessionStorage.setItem("searchKeyword", searchInput.value);
          setTimeout(() => {
            window.location.href = `shop-grid-left-sidebar.html`;
          }, 2000);
        }
        return filterByPrice;
      } else {
        sessionStorage.removeItem("searchResults");
        return [];
      }
    } else {
      toastr.info("Vui lòng nhập từ khóa để tìm kiếm.");
    }
  }
}

function renderSearchResults(searchResults) {
  const shopProductWrap = document.querySelector(".shop-product-wrap");
  // console.log("kiểm tra trước khi render:", searchResults);
  if (!shopProductWrap) {
    return;
  }
  shopProductWrap.innerHTML = "";

  if (!searchResults || searchResults.length === 0) {
    shopProductWrap.innerHTML = `
      <div class="col-12">
        <p class="text-center mb-5">Không tìm thấy sản phẩm nào phù hợp.</p>
      </div>
    `;
    return;
  }

  searchResults.forEach((product) => {
    const categoryName = product.category || "Chưa có danh mục";
    const title = product.title || "Không có tên sản phẩm";
    const description = product.info || "Không có mô tả gì về sản phẩm";
    const price = parseFloat(product.price).toFixed(2);
    const discount = Number(product.discount).toFixed(0);
    let discountHTML = "";
    if (discount > 0) {
      discountHTML = `
        <div class="label-product label_sale">
          <span>-${discount}%</span>
        </div>
      `;
    }
    const detailsUrl = "product-details.html";

    const primaryImageUrl =
      product.image_url && product.image_url
        ? `${API_CONFIG.baseURL}/${product.image_url}`
        : "";

    const productHTML = `
    <div class="col-lg-3 col-md-4 col-sm-6">
      <div class="product-item mb-30">
        <div class="product-thumb">
          <a href="${detailsUrl}" data-product-id="${product.products_id}">
            <img src="${primaryImageUrl}" class="pri-img" alt="${title}" />
            <img src="${primaryImageUrl}" class="sec-img" alt="${title}" />
          </a>
          <div class="box-label">
            ${discountHTML}
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
      product.products_id
    }">${title}</a>
            </h4>
          </div>
          <div class="ratings">
            ${renderStars(product.rating)}
            <!-- Sử dụng hàm để tạo sao -->
          </div>
          <div class="price-box">
            <span class="regular-price">${formatPrice(price)}</span>
          </div>
            <button class="btn-cart" type="button" data-product-id="${
              product.id
            }">
              Add to cart
            </button>
        </div>
      </div>
          <div class="sinrato-list-item mb-30">
      <div class="d-flex">
        <div class="sinrato-thumb">
          <a href="product-details.html" data-product-id="${
            product.products_id
          }">
            <img src="${primaryImageUrl}" class="pri-img" alt="" />
            <img src="${primaryImageUrl}" class="sec-img" alt="" />
          </a>
          <div class="box-label">
            ${discountHTML}
          </div>
        </div>
        <div class="sinrato-list-item-content">
          <div class="manufacture-product">
            <span><a href="#">${categoryName}</a></span>
          </div>
          <div class="sinrato-product-name">
            <h4>
              <a href="product-details.html" data-product-id="${
                product.products_id
              }">${title}</a>
            </h4>
          </div>
          <div class="sinrato-ratings mb-15">${renderStars(
            product.rating
          )}</div>
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
              product.id
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

async function standardize_searchResults(event) {
  const savedSearchResults = sessionStorage.getItem("searchResults");
  const searchResults = JSON.parse(savedSearchResults);
  const ratings = await createArrayRatingId();
  const newSearchResults = await extractProductData(searchResults, ratings);

  if (!savedSearchResults) {
    console.log("chưa có dữ liệu tìm kiếm!!!");
    toastr.warning("Không tìm thấy sản phẩm phù hợp!!!");
    // console.log(searchResults);
    renderSearchResults(searchResults);
    return;
  }
  if (newSearchResults.length > 0 && event) {
    toastr.success(`Tìm thấy ${newSearchResults.length} sản phẩm phù hợp.`);
    // console.log("sản phẩm phù hợp", newSearchResults);
    renderSearchResults(newSearchResults);
  }

  return newSearchResults;
}

document.addEventListener("DOMContentLoaded", async () => {
  const savedSearchResults = sessionStorage.getItem("searchResults");
  const searchResults = JSON.parse(savedSearchResults);
  const ratings = await createArrayRatingId();
  const extractedProducts = await extractProductData(searchResults, ratings);

  if (extractedProducts) {
    const searchKeyword = sessionStorage.getItem("searchKeyword");
    if (searchKeyword) {
      const searchInput = document.querySelector("#searchInput");
      if (searchInput) {
        searchInput.value = searchKeyword;
      }
    }
    renderSearchResults(extractedProducts);
  } else {
    console.log("không thể loading các sản phẩm tìm kiếm được");
  }

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const sortWrapper = document.querySelector(".product-short .nice-select");

  searchButton.addEventListener("click", async (event) => {
    await handleSearchEvent(event, productList);
    await standardize_searchResults(event);
  });
  searchInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      await handleSearchEvent(event, productList);
      await standardize_searchResults(event);
    }
  });
  // Lắng nghe sự kiện thay đổi sắp xếp
  if (sortWrapper) {
    const observer = new MutationObserver(() => {
      const processMutation = async () => {
        const selectedOption = sortWrapper.querySelector(".option.selected");
        if (selectedOption) {
          const selectedValue = selectedOption.getAttribute("data-value");
          try {
            const productList = await standardize_searchResults();
            const sortResults = filterSort(selectedValue, productList);
            // console.log("Lắng nghe sự kiện thành công", sortResults);
            renderSearchResults(sortResults);
          } catch (error) {
            console.error("Có lỗi xảy ra khi xử lý kết quả:", error);
          }
        }
      };
      processMutation();
    });

    observer.observe(sortWrapper, {
      childList: true,
      subtree: true,
    });
  }
  // Lắng nghe sự kiện từ slider
  window.addEventListener("sliderValuesUpdated", (event) => {
    const values = event.detail;
    // console.log("Khoảng giá đã được cập nhật:", values);

    const minPrice = parseFloat(values[0]);
    const maxPrice = parseFloat(values[1]);

    handleSearchEvent(event, productList, minPrice, maxPrice);
    standardize_searchResults(event);
  });
});
