import apiService from "./api.js";
import { selectedProductId } from "./products-all.js";
import { token } from "./api.js";
import { API_CONFIG } from "./api.js";

export const getProductReviews = async () => {
  try {
    const response = await apiService.get("/api/reviews");

    if (response.status === "success") {
      return response.data;
    } else {
      throw new Error("Không thể lấy danh sách đánh giá: " + response.message);
    }
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá sản phẩm:", error.message);
    throw error;
  }
};

export const getProductReviewsById = async (productId) => {
  if (!productId) {
    console.error("ID sản phẩm không hợp lệ.");
    return;
  }

  try {
    const response = await apiService.get(`/api/review/${productId}`);

    if (response.status === "success") {
      return response.data;
    } else {
      throw new Error("Không thể lấy danh sách đánh giá: " + response.message);
    }
  } catch (error) {
    console.error(
      `Lỗi khi lấy đánh giá cho sản phẩm ID ${productId}:`,
      error.message
    );
    throw error;
  }
};

export const saveReview = async (productId, rating, comment) => {
  if (!productId || typeof productId !== "string" || productId.trim() === "") {
    console.error("ID sản phẩm không hợp lệ.");
    return;
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    console.error("Đánh giá phải là một số nguyên từ 1 đến 5.");
    return;
  }

  if (!comment || comment.length > 255) {
    console.error("Bình luận không hợp lệ. Độ dài tối đa là 255 ký tự.");
    return;
  }

  const body = {
    product_id: productId,
    rating: rating,
    comment: comment,
  };

  try {
    const response = await apiService.post(
      "/api/product-detail/review",
      body,
      {},
      { Authorization: `Bearer ${token}` }
    );

    if (response.status === "success") {
      console.log("Đánh giá đã được lưu thành công:", response);
      return response;
    } else {
      throw new Error("Không thể lưu đánh giá: " + response.message);
    }
  } catch (error) {
    console.error("Lỗi khi lưu đánh giá:", error.message);
    throw error;
  }
};

getProductReviewsById(selectedProductId)
  .then((reviews) => {
    console.log("Đánh giá sản phẩm có ID:", selectedProductId, reviews);
  })
  .catch((error) => {
    console.error("Lỗi trong quá trình lấy đánh giá:", error);
  });

getProductReviews()
  .then((reviews) => {
    console.log("Danh sách đánh giá sản phẩm:", reviews);
  })
  .catch((error) => {
    console.error("Lỗi trong quá trình lấy đánh giá:", error);
  });

document
  .querySelector(".review-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!token) {
      alert("Vui lòng đăng nhập trước khi gửi đánh giá!");
      window.location.href = "login.html";
      return;
    }

    const comment = document.getElementById("comment").value.trim();
    const rating = document.querySelector(
      'input[name="rating"]:checked'
    )?.value;

    if (!comment || !rating) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await saveReview(
        selectedProductId,
        parseInt(rating),
        comment
      );
      console.log("Đánh giá đã được lưu thành công:", response);
      alert("Đánh giá của bạn đã được gửi thành công!");
      document.getElementById("review-form").reset();
    } catch (error) {}
  });

const displayReviews = async (productId) => {
  const reviews = await getProductReviewsById(productId);
  const reviewsContainer = document.querySelector("#reviews-table-body");

  reviewsContainer.innerHTML = "";

  reviews.forEach((review) => {
    const { user, created_at, comment, rating } = review;

    const reviewRow = document.createElement("tr");

    const nameDateRow = document.createElement("tr");
    nameDateRow.innerHTML = `
        <td><strong>${user.name}</strong></td>
        <td class="text-end">${formatDate(created_at)}</td>
      `;
    reviewsContainer.appendChild(nameDateRow);
    const commentRow = document.createElement("tr");
    commentRow.innerHTML = `
        <td colspan="2">
          <p>${comment}</p>
          <div class="product-ratings">
            <ul class="ratting d-flex mt-2">
              ${renderStars(rating)} <!-- Gọi hàm renderStars để tạo sao -->
            </ul>
          </div>
        </td>
      `;
    reviewsContainer.appendChild(commentRow);
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("vi-VN", options);
};

const renderStars = (rating) => {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += `<li><i class="fa fa-star${i < rating ? "" : "-o"}"></i></li>`;
  }
  return stars;
};

displayReviews(selectedProductId);
