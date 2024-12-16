import apiService from "./api.js";
import { selectedProductId } from "./products-all.js";
import { token, API_CONFIG } from "./api.js";

const handleApiError = (error, context = "") => {
  console.error(`Lỗi trong ${context}:`, error.message);
};

export const getProductReviewAll = async (productId) => {
  try {
    const response = await apiService.get(`/api/reviews`);
    if (response.status === "success") {
      return response || [];
    } else {
      throw new Error(response.message || "Không thể lấy danh sách đánh giá.");
    }
  } catch (error) {
    handleApiError(error, "lấy đánh giá sản phẩm");
    return [];
  }
};

export const getProductReviewsById = async (productId) => {
  try {
    const response = await apiService.get(`/api/review/${productId}`);
    if (response.status === "success") {
      console.log("danh sách đánh giá:", response);

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
    const reviewTabs = document.querySelectorAll(".number_review");

    if (reviewTabs.length > 0) {
      reviewTabs.forEach((tab) => {
        tab.textContent = `Reviews (${reviews.length})`;
      });
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
      (_, i) =>
        `<li><span class="yellow"><i class="fa fa-star${
          i < rating ? "" : "-o"
        }"></i></span></li>`
    )
    .join("");
};

export async function calculateAverageRating(productId) {
  try {
    const reviews = await getProductReviewsById(productId);

    const ratings = reviews.map((review) => review.rating);

    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length;
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return 0;
  }
}

const elementReview_form = document.querySelector(".review-form");
if (elementReview_form) {
  elementReview_form.addEventListener("submit", async function (event) {
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
}

document.addEventListener("DOMContentLoaded", () => {
  updateReviews(selectedProductId);
});
