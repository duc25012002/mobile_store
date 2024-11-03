import apiService from "./api.js";
import { API_CONFIG } from "./api.js";
import { token } from "./api.js";
import { selectedProductId } from "./products-all.js";
import { formatPrice } from "./products-all.js";

async function getProductDetail(productId) {
  console.log("Lấy chi tiết sản phẩm với ID:", productId);
  try {
    const productData = await apiService.get(
      `/api/product-detail/${productId}`,
      {},
      { Authorization: `Bearer ${token}` }
    );

    if (productData) {
      console.log("Thông tin sản phẩm:", productData);
      displayProductDetail(productData);
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

function displayProductDetail(productData) {
  const productDetailContainer = document.getElementById("product-detail");

  if (productData) {
    const isInStock = productData.data.variants.some(
      (variant) => variant.availability !== "0" && variant.stock !== "0"
    );
    const availabilityStatus = isInStock ? "In Stock" : "Out of Stock";
    console.log(availabilityStatus);
    
    productDetailContainer.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                <div class="col-lg-5">
                    <div class="product-large-slider mb-20 slick-initialized slick-slider">
                    <div class="slick-list draggable"><div class="slick-track" style="opacity: 1; width: 2760px;"><div class="pro-large-img slick-slide slick-current slick-active" data-slick-index="0" aria-hidden="false" style="width: 460px; position: relative; left: 0px; top: 0px; z-index: 999; opacity: 1;" tabindex="0">
                        <img src="${API_CONFIG.baseURL}/${
      productData.data.variants[0].images[0].image_url
    }" alt="${productData.data.title}">
                        <div class="img-view">
                        <a class="img-popup" href="${API_CONFIG.baseURL}/${
      productData.data.variants[0].images[0].image_url
    }" tabindex="0"><i class="fa fa-search"></i></a>
                        </div>
                    </div><div class="pro-large-img slick-slide" data-slick-index="1" aria-hidden="true" style="width: 460px; position: relative; left: -460px; top: 0px; z-index: 998; opacity: 0;" tabindex="-1">
                        <img src="assets/img/product/product-5.jpg" alt="">
                        <div class="img-view">
                        <a class="img-popup" href="assets/img/product/product-5.jpg" tabindex="-1"><i class="fa fa-search"></i></a>
                        </div>
                    </div><div class="pro-large-img slick-slide" data-slick-index="2" aria-hidden="true" style="width: 460px; position: relative; left: -920px; top: 0px; z-index: 998; opacity: 0;" tabindex="-1">
                        <img src="assets/img/product/product-6.jpg" alt="">
                        <div class="img-view">
                        <a class="img-popup" href="assets/img/product/product-6.jpg" tabindex="-1"><i class="fa fa-search"></i></a>
                        </div>
                    </div><div class="pro-large-img slick-slide" data-slick-index="3" aria-hidden="true" style="width: 460px; position: relative; left: -1380px; top: 0px; z-index: 998; opacity: 0;" tabindex="-1">
                        <img src="assets/img/product/product-7.jpg" alt="">
                        <div class="img-view">
                        <a class="img-popup" href="assets/img/product/product-7.jpg" tabindex="-1"><i class="fa fa-search"></i></a>
                        </div>
                    </div><div class="pro-large-img slick-slide" data-slick-index="4" aria-hidden="true" style="width: 460px; position: relative; left: -1840px; top: 0px; z-index: 998; opacity: 0;" tabindex="-1">
                        <img src="${API_CONFIG.baseURL}/${
      productData.data.variants[0].images[0].image_url
    }" alt="${productData.data.title}">
                        <div class="img-view">
                        <a class="img-popup" href="assets/img/product/product-8.jpg" tabindex="-1"><i class="fa fa-search"></i></a>
                        </div>
                    </div><div class="pro-large-img slick-slide" data-slick-index="5" aria-hidden="true" style="width: 460px; position: relative; left: -2300px; top: 0px; z-index: 998; opacity: 0;" tabindex="-1">
                        <img src="assets/img/product/product-9.jpg" alt="">
                        <div class="img-view">
                        <a class="img-popup" href="assets/img/product/product-9.jpg" tabindex="-1"><i class="fa fa-search"></i></a>
                        </div>
                    </div></div></div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="product-details-inner">
                    <div class="product-details-contentt">
                        <div class="pro-details-name mb-10">
                        <h3>${productData.data.title}</h3>
                        </div>
                        <div class="pro-details-review mb-20">
                        <ul>
                            <li>
                            <span><i class="fa fa-star"></i></span>
                            <span><i class="fa fa-star"></i></span>
                            <span><i class="fa fa-star"></i></span>
                            <span><i class="fa fa-star"></i></span>
                            <span><i class="fa fa-star"></i></span>
                            </li>
                            <li><a href="#">1 Reviews</a></li>
                        </ul>
                        </div>
                        <div class="price-box mb-15">
                        <span class="regular-price"><span class="special-price">${formatPrice(
                          productData.data.variants[0].price *
                            (1 - productData.data.discount / 100)
                        )}</span></span>
                        <span class="old-price"><del>${formatPrice(
                          productData.data.variants[0].price
                        )}
                        </del></span>
                        </div>
                        <div class="product-detail-sort-des pb-20">
                        <p>${productData.data.description}</p>
                        </div>
                        <div class="pro-details-list pt-20">
                        <ul>
                            <li><span>Brands :</span><a href="#">${
                              productData.data.category_name
                            }</a></li>
                            <li><span>Screen size :</span>${
                              productData.data.specifications.screen_size
                            }</li>
                            <li><span>Screen type :</span>${
                              productData.data.specifications.screen_type
                            }</li>
                            <li><span>Availability :</span>${availabilityStatus}</li>
                        </ul>
                        </div>
                        <div class="product-availabily-option mt-15 mb-15">
                        <h3>Available Options</h3>
                        <div class="color-optionn">
                            <h4><sup>*</sup>color</h4>
                            <ul>
                            <li>
                                <a class="c-black" href="#" title="Black"></a>
                            </li>
                            <li>
                                <a class="c-blue" href="#" title="Blue"></a>
                            </li>
                            <li>
                                <a class="c-brown" href="#" title="Brown"></a>
                            </li>
                            <li>
                                <a class="c-gray" href="#" title="Gray"></a>
                            </li>
                            <li>
                                <a class="c-red" href="#" title="Red"></a>
                            </li>
                            </ul>
                        </div>
                        </div>
                        <div class="pro-quantity-box mb-30">
                        <div class="qty-boxx">
                            <label>qty :</label>
                            <input type="text" placeholder="0">
                            <button class="btn-cart lg-btn">add to cart</button>
                        </div>
                        </div>
                        <div class="useful-links mb-20">
                        <ul>
                            <li>
                            <a href="#"><i class="fa fa-heart-o"></i>add to wish list</a>
                            </li>
                            <li>
                            <a href="#"><i class="fa fa-refresh"></i>compare this product</a>
                            </li>
                        </ul>
                        </div>
                        <div class="tag-line mb-20">
                        <label>tag :</label>
                        <a href="#">Movado</a>,
                        <a href="#">Omega</a>
                        </div>
                        <div class="pro-social-sharing">
                        <label>share :</label>
                        <ul>
                            <li class="list-inline-item">
                            <a href="#" class="bg-facebook" title="Facebook">
                                <i class="fa fa-facebook"></i>
                                <span>like 0</span>
                            </a>
                            </li>
                            <li class="list-inline-item">
                            <a href="#" class="bg-twitter" title="Twitter">
                                <i class="fa fa-twitter"></i>
                                <span>tweet</span>
                            </a>
                            </li>
                            <li class="list-inline-item">
                            <a href="#" class="bg-google" title="Google Plus">
                                <i class="fa fa-google-plus"></i>
                                <span>google +</span>
                            </a>
                            </li>
                        </ul>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        `;
  } else {
    console.error("Dữ liệu sản phẩm không hợp lệ.");
    productDetailContainer.innerHTML = `<p>Không thể lấy thông tin sản phẩm.</p>`;
  }
}

console.log(selectedProductId);

if (selectedProductId) {
  getProductDetail(selectedProductId);
} else {
  console.error("Không có ID sản phẩm được chọn.");
}
