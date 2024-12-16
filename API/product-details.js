import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { token } from "./api.js";
import { formatPrice } from "./products-all.js";
import { updateUserCart } from "./cart.js";
import { addToCart } from "./cart.js";
import { user_id } from "./login.js";
import { calculateAverageRating } from "./review.js";
import { loadAndRenderCart } from "./cart.js";
import { selectedProductId } from "./products-all.js";
import { fetchProductListALL } from "./products-all.js";
import { extractProductData } from "./products-all.js";
import { assignBtnAddToCartEvent } from "./products-all.js";
import { createArrayRatingById } from "./products-all.js";

let variant_Index = 0;

export async function getProductDetail(productId) {
  console.log("Lấy chi tiết sản phẩm với ID:", productId);
  try {
    const productData = await apiService.get(
      `/api/product-detail/${productId}`,
      {},
      { Authorization: `Bearer ${token}` }
    );

    if (productData) {
      console.log("Thông tin sản phẩm:", productData);
      await renderProductDetail(productData);
      return productData;
    } else {
      console.error("Không tìm thấy sản phẩm.");
    }
  } catch (error) {
    if (error.message.includes("404")) {
      console.error("Lỗi 404: Không tìm thấy sản phẩm.");
    } else {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    }
  }
}

export function renderStars(averageRating) {
  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating % 1 > 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const fullStarHTML = '<span class="yellow"><i class="fa fa-star"></i></span>';
  const halfStarHTML =
    '<span class="yellow-half-secondary"><i class="fa fa-star"></i></span>';
  const emptyStarHTML =
    '<span class="yellow"><i class="fa fa-star-o"></i></span>';

  const starsHTML =
    fullStarHTML.repeat(fullStars) +
    (halfStar ? halfStarHTML : "") +
    emptyStarHTML.repeat(emptyStars);

  return starsHTML;
}

async function renderProductDetail(productData) {
  const productDetailContainer = document.getElementById("product-detail");
  if (!productData) {
    toastr.error("Dữ liệu sản phẩm không hợp lệ.");
    productDetailContainer.innerHTML = `<h4 style="text-align: center;">Không thể lấy thông tin sản phẩm.</h4>`;
    return;
  } else if (!productDetailContainer) {
    // console.warn("Không tìm thấy phần tử có id là product-detail");
    return;
  }

  const { data } = productData;
  const {
    variants = [],
    title = "Sản phẩm không có tên",
    category_name = "Chưa phân loại",
    specifications = {},
    discount = 0,
    reviews = [],
  } = data || {};

  const variant = variants[variant_Index];
  const isInStock = variant && variant.availability !== 0;
  const availabilityStatus = isInStock ? "In Stock" : "Sold out";
  const averageRating = await calculateAverageRating(selectedProductId);
  const number_review = reviews.length;

  const imageHTML = `
    <img src="${API_CONFIG.baseURL}/${variant.images[0].image_url}" alt="${title}">
    <div class="img-view">
      <a class="img-popup" href="${API_CONFIG.baseURL}/${variant.images[0].image_url}">
        <i class="fa fa-search"></i>
      </a>
    </div>`;
  const ratingHTML = renderStars(averageRating);
  const priceHTML = `
  <span class="regular-price">
    <span class="special-price">${formatPrice(
      variant.price * (1 - discount / 100)
    )}</span>
  </span>
  <span class="old-price">
    <del>${formatPrice(variant.price)}</del>
  </span>
  `;
  const detailsHTML = `
    <li><span>Brands :</span><a href="#">${category_name}</a></li>
    <li><span>Screen size :</span>${specifications.screen_size}</li>
    <li><span>Screen type :</span>${specifications.screen_type}</li>
    <li><span>Availability :</span>${availabilityStatus}</li>`;
  const colorOptionsHTML = variants
    .map(
      (variant) =>
        `<li><a style="background-color: ${variant.color_code}" data-id="${variant.id}"></a></li>`
    )
    .join("");

  const decodeHTML = (html) =>
    html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  const infoHTML = data.info
    ? decodeHTML(data.info)
    : "Chưa có thông tin về sản phẩm.";

  productDetailContainer.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-5">
          <div class="product-large-slider">${imageHTML}</div>
        </div>
        <div class="col-lg-7">
          <div class="product-details-inner">
            <div class="pro-details-name mb-10">
              <h3>${title} - ${variant.rom.capacity} màu ${variant.color}</h3>
            </div>
            <div id="review-Card-Product" class="pro-details-review mb-20">
              <ul>
                <li><div class="ratings">${ratingHTML}</div></li>
                <li>
                    <a
                      href="#tab_review"
                      class="number_review" 
                      type="button"
                      data-bs-toggle="pill"
                      data-bs-target="#tab_review"
                      role="tab"
                      aria-controls="tab_review"
                      aria-selected="false"
                    >
                      ${number_review} Reviews
                    </a>
                </li>
              </ul>
            </div>
            <div class="price-box mb-15">${priceHTML}</div>
            <div class="product-detail-sort-des pb-20">
              ${infoHTML}
            </div>
            <div class="pro-details-list pt-20">
              <ul>${detailsHTML}</ul>
            </div>
            <div class="color-optionn">
              <h4><sup>*</sup>color</h4>
              <ul>${colorOptionsHTML}</ul>
            </div>
            <div class="pro-quantity-box mb-30">
              <div class="qty-boxx">
                <label>qty :</label>
                <input type="text" placeholder="1">
                <button class="btn-cart lg-btn">add to cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document
    .querySelector(".btn-cart")
    .addEventListener("click", () => handleAddToCart(variant.id));
  document.querySelectorAll(".color-optionn ul li a").forEach((el) => {
    el.addEventListener("click", (event) =>
      handleColorChange(event, el, productData)
    );
  });

  const descriptionElement = document.getElementById("desctiption_product");
  if (descriptionElement) {
    descriptionElement.innerHTML = data.description
      ? `${data.description}`
      : `<p style="text-align: center;">Không có mô tả gì về sản phẩm này</p>`;
  }
}

export function handleAddToCart(productId) {
  const quantity =
    parseInt(document.querySelector(".qty-boxx input").value) || 1;
  if (!selectedProductId) {
    toastr.error("Không có ID sản phẩm.");
  } else if (!token) {
    toastr.warning("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
    setTimeout(() => (window.location.href = "login.html"), 1500);
  } else if (isNaN(quantity) || quantity <= 0) {
    toastr.warning("Số lượng không hợp lệ. Vui lòng nhập số lượng lớn hơn 0.");
  } else {
    addToCart(user_id, productId, quantity).then(loadAndRenderCart);
  }
}

async function handleColorChange(event, element, productData) {
  event.preventDefault();
  const colorId = parseInt(element.getAttribute("data-id"));
  variant_Index = productData.data.variants.findIndex(
    (variant) => variant.id === colorId
  );
  await renderProductDetail(productData);
}

async function renderRelatedProduct(productData, id) {
  const currentProduct = productData.find(
    (product) => product.products_id === Number(id)
  );

  if (!currentProduct) {
    console.warn("Không tìm thấy sản phẩm với id này");
    return;
  }

  const relatedProducts = productData.filter(
    (product) => product.category === currentProduct.category
  );

  // console.log("sản phẩm lọc được", relatedProducts);

  const containers = document.querySelectorAll(
    ".related-product-area .product-item"
  );

  if (containers.length === 0) {
    // console.warn("Không tìm thấy phần tử .related-product-area .product-item");
    return;
  }

  containers.forEach((container, index) => {
    const product = relatedProducts[index % relatedProducts.length];

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
          ${renderStars(product.rating)}
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

  assignBtnAddToCartEvent();
}

async function loadAndRenderProductDetail() {
  try {
    if (!selectedProductId) {
      throw new Error("Không có ID sản phẩm được chọn.");
    }
    const productList = await fetchProductListALL();
    const ratings = await createArrayRatingById();
    const extractedProducts = await extractProductData(productList, ratings);
    await getProductDetail(selectedProductId);
    await renderRelatedProduct(extractedProducts, selectedProductId);
  } catch (error) {
    console.warn("ID sản phẩm chưa được chọn", error.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAndRenderProductDetail();
});
