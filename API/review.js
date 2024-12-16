import apiService from "./api.js";
import { selectedProductId } from "./products-all.js";
import { token, API_CONFIG } from "./api.js";
import { checkPurchasedProduct } from "./order.js";
import { getOrderList } from "./order.js";
import { renderStars } from "./product-details.js";

const handleApiError = (error, context = "") => {
  console.error(`Lỗi trong ${context}:`, error.message);
};

export async function getProductReviewAll() {
  try {
    const response = await apiService.get(`/api/reviews`);
    if (response.status === "success") {
      console.log("danh sách tất cả đánh giá:", response);

      return response.data || [];
    } else {
      throw new Error(
        response.message || "Không thể lấy danh sách tất cả đánh giá."
      );
    }
  } catch (error) {
    handleApiError(error, "lấy đánh giá sản phẩm");
    return [];
  }
}

const getProductReviewsById = async (productId) => {
  try {
    const response = await apiService.get(`/api/review/${productId}`);
    if (response.status === "success") {
      // console.log("danh sách đánh giá:", response);

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

const renderReviews = async (productId) => {
  try {
    const reviews = await getProductReviewsById(productId);
    const reviewsContainer = document.querySelector("#reviews-table-body");
    const reviewTabs = document.querySelectorAll(".number_review");
    const reviewFilter = document.querySelector("#review-filter-select");
    const reviewFilterWrapper = document.querySelector(
      ".review-filter .nice-select"
    );

    if (!reviewsContainer) {
      return;
    }

    if (reviewTabs.length > 0) {
      reviewTabs.forEach((tab) => {
        tab.textContent = `Reviews (${reviews.length})`;
      });
    }

    const displayFilteredReviews = (ratingFilter) => {
      const filteredReviews =
        ratingFilter === "all"
          ? reviews
          : reviews.filter((review) => review.rating == ratingFilter);

      reviewsContainer.innerHTML = filteredReviews
        .map(
          ({ user, created_at, comment, rating }) => `
          <tr>
            <td><strong>${user.name}</strong></td>
            <td class="text-end">${formatDateTimeReview(created_at)}</td>
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
    };

    displayFilteredReviews("all");

    if (reviewFilterWrapper) {
      const observer = new MutationObserver(() => {
        const selectedOption =
          reviewFilterWrapper.querySelector(".option.selected");
        if (selectedOption) {
          const selectedValue = selectedOption.getAttribute("data-value");
          displayFilteredReviews(selectedValue);
        }
      });

      observer.observe(reviewFilterWrapper, {
        childList: true,
        subtree: true,
      });
    }
  } catch (error) {
    handleApiError(error, "cập nhật đánh giá");
  }
};

function formatDateTimeReview(dateString) {
  const date = new Date(dateString);

  if (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0
  ) {
    return date.toLocaleDateString();
  } else {
    return date.toLocaleString();
  }
}

// const renderStars = (rating) => {
//   return Array.from({ length: 5 })
//     .map(
//       (_, i) =>
//         `<li><span class="yellow"><i class="fa fa-star${
//           i < rating ? "" : "-o"
//         }"></i></span></li>`
//     )
//     .join("");
// };

export async function calculateAverageRating(productId) {
  try {
    const reviews = await getProductReviewsById(productId);

    const ratings = reviews.map((review) => review.rating);

    if (ratings.length === 0) return 5;
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length;
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return 0;
  }
}

async function handleReviewSubmission(event) {
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
    const orderList = await getOrderList();

    console.log("kiểu dữ liệu", orderList);

    const hasPurchased = await checkPurchasedProduct(
      orderList,
      selectedProductId
    );
    console.log("Sản phẩm đã mua:", hasPurchased);

    if (!hasPurchased) {
      toastr.warning("Bạn cần mua sản phẩm trước khi gửi đánh giá!");
      return;
    }

    await saveReview(selectedProductId, rating, comment);
    document.querySelector(".review-form").reset();
    console.log("Đánh giá của bạn đã được gửi thành công!");
    renderReviews(selectedProductId);
  } catch (error) {
    toastr.error(`Lỗi khi gửi đánh giá: ${error.message}`, "Lỗi");
    console.error("Lỗi khi gửi đánh giá:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const elementReview_form = document.querySelector(".review-form");
  if (elementReview_form) {
    elementReview_form.addEventListener("submit", handleReviewSubmission);
  }
  await renderReviews(selectedProductId);

  console.log("all chi tiết đánh giá:");

  await getProductReviewAll();
});
