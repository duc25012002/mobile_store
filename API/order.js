import { token } from "./api.js";
import apiService from "./api.js";
import { getUserCart } from "./cart.js";
import { processOrderPayment } from "./VNpay.js";

export const getOrderList = async () => {
  if (!token) {
    console.log("Token không tồn tại. Vui lòng đăng nhập.");
    toastr.error("Token không tồn tại. Vui lòng đăng nhập.");
    return null;
  }

  try {
    const response = await apiService.get(
      "/api/order",
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response && Array.isArray(response.data) && response.data.length > 0) {
      console.log("Danh sách đơn hàng:", response.data);
      return response.data;
    } else {
      console.log("Không có đơn hàng.");
      toastr.info("Không có đơn hàng.");
      return [];
    }
  } catch (error) {
    if (error.message.includes("401")) {
      console.log("Lỗi xác thực, vui lòng đăng nhập lại.");
      toastr.error("Lỗi xác thực, vui lòng đăng nhập lại.");
    } else {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toastr.error("Lỗi khi lấy dữ liệu.", error.message);
    }
    return null;
  }
};

getOrderList();

export const createOrder = async (orderData) => {
  if (!token) {
    console.log("Token không tồn tại. Vui lòng đăng nhập.");
    toastr.error("Vui lòng đăng nhập trước khi tạo đơn hàng.");
    return;
  }

  try {
    const response = await apiService.post(
      "/api/order/store",
      orderData,
      {},
      { Authorization: `Bearer ${token}` }
    );
    // Kiểm tra trạng thái phản hồi trực tiếp từ đối tượng JSON
    console.log("Response object:", response);

    if (response.status === "success") {
      console.log("Đơn hàng đã được tạo thành công:", response.data);
      toastr.success("Đơn hàng đã được tạo thành công.");
      return response.data;
    } else {
      console.error(
        "Lỗi từ API:",
        response.message || "Lỗi không xác định từ API."
      );
      toastr.error(
        response.message || "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại!"
      );
      return null;
    }
  } catch (error) {
    console.error("Không thể tạo đơn hàng:", error.message);
    toastr.error("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại!");
    return null;
  }
};

document
  .getElementById("continueToPayment")
  .addEventListener("click", async function (event) {
    event.preventDefault();

    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    )
      ? document.querySelector('input[name="payment"]:checked').value
      : "cash";

    console.log(paymentMethod);

    let orderDetails = [];

    try {
      const cartItems = await getUserCart();

      if (Array.isArray(cartItems) && cartItems.length > 0) {
        orderDetails = cartItems.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity, 10),
        }));
        console.log("orderDetails:", orderDetails);
      } else {
        toastr.info("Giỏ hàng rỗng.");
      }
    } catch (error) {
      toastr.error("Có lỗi xảy ra khi xử lý giỏ hàng.", error.message);
    }

    const totalPrice = parseInt(
      document
        .querySelectorAll(".totalAmount")[1]
        .textContent.replace(/[^\d]/g, "")
    );

    const orderData = {
      first_name: document.getElementById("first_name").value,
      last_name: document.getElementById("last_name").value,
      phone: document.getElementById("tel_number").value,
      address: document.getElementById("p_address").value,
      payment_method: paymentMethod,
      order_details: orderDetails,
      total_price: totalPrice,
    };
    console.log("dữ liệu truyền vào", orderData);
    console.log("dữ liệu sản phẩm", orderDetails);

    const createdOrder = await createOrder(orderData);
    console.log("chuyển hướng", createdOrder);

    if (createdOrder && paymentMethod === "1") {
      console.log("Đang tiến hành thanh toán cho đơn hàng...");
      toastr.info("Đang tiến hành thanh toán cho đơn hàng...");
      await processOrderPayment("https://mobile-store.id.vn");
    } else if (createdOrder) {
      console.log(
        "Đơn hàng đã được tạo thành công với hình thức thanh toán bằng tiền mặt."
      );
      toastr.success(
        "Đơn hàng đã được tạo thành công với hình thức thanh toán bằng tiền mặt."
      );
    } else {
      console.log("Không thể tiến hành thanh toán vì tạo đơn hàng thất bại.");
      toastr.error("Không thể tiến hành thanh toán vì tạo đơn hàng thất bại.");
    }
  });
