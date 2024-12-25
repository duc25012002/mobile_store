import apiService from "./api.js";
import { selectedProductId } from "./products-all.js";
import { token, API_CONFIG } from "./api.js";
import { checkPurchasedProduct } from "./order.js";
import { getOrderList } from "./order.js";
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
    // console.error(error, "lấy đánh giá sản phẩm");
    handleApiError(error, "lấy đánh giá sản phẩm");
    return [];
  }
};

export const getProductReviewsById = async (productId) => {
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const renderReviews = async (productId, reviews) => {
  try {
    const reviews = await getProductReviewsById(productId);
    const reviewsContainer = document.querySelector("#reviews-table-body");
    const reviewTabs = document.querySelectorAll(".number_review");
    const reviewFilter = document.querySelector(".review-filter");
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
    };

    displayFilteredReviews("all");

    // Lắng nghe sự kiện thay đổi từ gốc `select`
    // if (reviewFilter) {
    //   reviewFilter.addEventListener("change", (e) => {
    //     const selectedValue = e.target.value;
    //     displayFilteredReviews(selectedValue);
    //   });
    // }

    // Đồng bộ sự kiện thay đổi giao diện với `nice-select`
    if (reviewFilterWrapper) {
      const observer = new MutationObserver(() => {
        const selectedOption =
          reviewFilterWrapper.querySelector(".option.selected");
        if (selectedOption) {
          const selectedValue = selectedOption.getAttribute("data-value");
          // Đồng bộ với phần tử select ẩn và gọi hàm lọc
          reviewFilter.value = selectedValue;
          displayFilteredReviews(selectedValue);
        }
      });

      // Cấu hình observer để theo dõi sự thay đổi lớp `selected`
      observer.observe(reviewFilterWrapper, {
        childList: true, // Lắng nghe sự thay đổi trong các phần tử con
        subtree: true, // Lắng nghe trong toàn bộ cây DOM con
      });
    }
  } catch (error) {
    handleApiError(error, "cập nhật đánh giá");
  }
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

export async function calculateAverageRating(productId, reviews) {
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

    const orderList = await getOrderList();
    const hasPurchased = await checkPurchasedProduct(
      orderList,
      selectedProductId
    );
    if (!hasPurchased) {
      toastr.warning(
        `Bạn cần mua sản phẩm này để có thể đánh giá đúng về sản phẩm!`,
        "Comment chưa được lưu"
      );
      return;
    }

    try {
      await saveReview(selectedProductId, rating, comment);
      // alert("Đánh giá của bạn đã được gửi thành công!");
      document.querySelector(".review-form").reset();
      renderReviews(selectedProductId);
    } catch (error) {
      toastr.error(`Lỗi khi gửi đánh giá: ${error.message}`, "Lỗi");
      console.error("Lỗi khi gửi đánh giá:", error.message);
    }
  });
}

// const reviews = await getProductReviewsById(selectedProductId);

document.addEventListener("DOMContentLoaded", () => {
  renderReviews(selectedProductId);
});
