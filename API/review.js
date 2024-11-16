import apiService from "./api.js";
import { selectedProductId } from "./products-all.js";
import { token, API_CONFIG } from "./api.js";

const handleApiError = (error, context = "") => {
  console.error(`Lỗi trong ${context}:`, error.message);
};

const getProductReviewsById = async (productId) => {
  try {
    const response = await apiService.get(`/api/review/${productId}`);
    if (response.status === "success") {
      return response.data || [];
    } else {
      throw new Error(response.message || "Không thể lấy danh sách đánh giá.");
    }
  } catch (error) {
    handleApiError(error, "lấy đánh giá sản phẩm");
    return [];
  }
};

const saveReview = async (productId, rating, comment) => {
  if (!productId || !rating || !comment) {
    console.error("Dữ liệu đánh giá không hợp lệ.");
    toastr.error("Dữ liệu đánh giá không hợp lệ.", "Lỗi");
    return;
  }

  const body = { product_id: productId, rating, comment };
  try {
    const response = await apiService.post(
      "/api/product-detail/review",
      body,
      {},
      { Authorization: `Bearer ${token}` }
    );
    if (response.status === "success") {
      toastr.success("Đánh giá của bạn đã được gửi thành công!", "Thành công");
      return response;
    } else {
      throw new Error(response.message || "Không thể lưu đánh giá.");
    }
  } catch (error) {
    handleApiError(error, "lưu đánh giá");
    throw error;
  }
};

const updateReviews = async (productId) => {
  try {
    const reviews = await getProductReviewsById(productId);
    const reviewsContainer = document.querySelector("#reviews-table-body");
    const reviewTab = document.getElementById("nav_review");
    const reviewCardProduct = document.querySelector("#review-Card-Product");

    if (reviewTab) {
      reviewTab.textContent = `Reviews (${reviews.length})`;
    }

    reviewsContainer.innerHTML = reviews
      .map(
        ({ user, created_at, comment, rating }) => `
        <tr>
          <td><strong>${user.name}</strong></td>
          <td class="text-end">${formatDate(created_at)}</td>
        </tr>
        <tr>
          <td colspan="2">
            <p>${comment}</p>
            <div class="product-ratings">
              <ul class="ratting d-flex mt-2">
                ${renderStars(rating)}
              </ul>
            </div>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    handleApiError(error, "cập nhật đánh giá");
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const renderStars = (rating) => {
  return Array.from({ length: 5 })
    .map(
      (_, i) => `<li><i class="fa fa-star${i < rating ? "" : "-o"}"></i></li>`
    )
    .join("");
};

document
  .querySelector(".review-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!token) {
      toastr.warning("Vui lòng đăng nhập trước khi gửi đánh giá!");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return;
    }

    const comment = document.getElementById("comment").value.trim();
    const rating = parseInt(
      document.querySelector('input[name="rating"]:checked')?.value
    );

    if (!comment || !rating) {
      toastr.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await saveReview(selectedProductId, rating, comment);
      // alert("Đánh giá của bạn đã được gửi thành công!");
      document.querySelector(".review-form").reset();
      updateReviews(selectedProductId);
    } catch (error) {
      toastr.error(`Lỗi khi gửi đánh giá: ${error.message}`, "Lỗi");
      console.error("Lỗi khi gửi đánh giá:", error.message);
    }
  });

// Gọi cập nhật khi trang tải
updateReviews(selectedProductId);
