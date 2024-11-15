import apiService from "./api.js";
import { token } from "./api.js";
import { getOrderList } from "./order.js";

export const vnpayPayment = async (orderId, amount, urlReturn) => {
  const endpoint = "/api/order/vnpay_payment";
  const body = {
    order_id: orderId,
    amount: amount,
    url_return: urlReturn,
  };

  try {
    const response = await apiService.post(
      endpoint,
      body,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("VNPay Payment URL:", response.data);
    return response.data;
  } catch (error) {
    console.error("VNPay Payment failed:", error);
    toastr.error("Thanh toán VNPay thất bại.", "Lỗi:", error);
    throw error;
  }
};

export const processOrderPayment = async (urlReturn) => {
  const orderList = await getOrderList(token);

  if (orderList && orderList.length > 0) {
    const latestOrder = orderList[0];
    const { code, total_price } = latestOrder;
    try {
      const paymentResponse = await vnpayPayment(code, total_price, urlReturn);

      if (paymentResponse) {
        console.log(
          `Đang chuyển hướng đến trang thanh toán cho đơn hàng ${code}...`
        );
        toastr.info(
          `Đang chuyển hướng đến trang thanh toán cho đơn hàng ${code}...`
        );
        setTimeout(() => {
          window.location.href = paymentResponse;
        }, 1500);
      } else {
        console.log("Không nhận được URL thanh toán từ VNPay.");
        toastr.error("Không nhận được URL thanh toán từ VNPay.", "Lỗi");
      }
    } catch (error) {
      toastr.error(
        `Lỗi khi khởi tạo thanh toán cho đơn hàng ${code}: ${error.message}`,
        "Lỗi"
      );
    }
  } else {
    toastr.info("Không có đơn hàng để thanh toán.");
  }
};
