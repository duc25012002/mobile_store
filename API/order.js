import { token } from "./api.js";
import apiService from "./api.js";
import { getUserCart } from "./cart.js";
import { processOrderPayment } from "./VNpay.js";
import { formatPrice } from "./products-all.js";
import { getProductDetail } from "./product-details.js";

export const getOrderList = async () => {
  if (!token) {
    console.log("Token không tồn tại. Vui lòng đăng nhập.");
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
      // console.log("!!!!!!!!Danh sách đơn hàng:", response.data);
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

export const getOrderById = async (orderId) => {
  if (!token) {
    console.log("Token không tồn tại. Vui lòng đăng nhập.");
    return null;
  }

  if (!orderId) {
    console.log("ID đơn hàng không hợp lệ.");
    toastr.error("ID đơn hàng không hợp lệ.");
    return null;
  }

  try {
    const response = await apiService.get(
      `/api/order/detail/${orderId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response && response.data) {
      console.log("Chi tiết đơn hàng:", response.data);
      return response.data;
    } else {
      // console.log("Không có chi tiết đơn hàng.");
      toastr.info("Không có chi tiết đơn hàng.");
      return null;
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

export function formatDateTime(dateString) {
  const [time, date] = dateString.includes(" ")
    ? dateString.split(" ")
    : [null, dateString];
  const [day, month, year] = date.split("/");

  if (time) {
    const [hours, minutes] = time.split(":");
    const formattedDate = new Date(year, month - 1, day, hours, minutes);
    return formattedDate.toLocaleString();
  } else {
    const formattedDate = new Date(year, month - 1, day);
    return formattedDate.toLocaleDateString();
  }
}

function renderOrderDetail(orderDetail) {
  const orderInfoHtml = `
      <p><strong>Mã đơn hàng:</strong> ${orderDetail.code}</p>
      <p><strong>Họ tên:</strong> ${orderDetail.name}</p>
      <p><strong>Địa chỉ:</strong> ${orderDetail.address}</p>
      <p><strong>Điện thoại:</strong> ${orderDetail.phone}</p>
      <p><strong>Ngày tạo:</strong> ${orderDetail.created_at}</p>
      <p><strong>Phương thức thanh toán:</strong> ${
        orderDetail.payment_method
      }</p>
      <p><strong>Trạng thái:</strong> ${orderDetail.status_label}</p>
      <p><strong>Ghi chú:</strong> ${orderDetail.note || "Không có ghi chú"}</p>
  `;

  const orderDetailsHtml = orderDetail.order_details
    .map(
      (item) => `
      <tr>
          <td>${item.product_name}</td>
          <td>${item.price.toLocaleString("vi-VN")} VND</td>
          <td>${item.quantity}</td>
          <td>${(item.price * item.quantity).toLocaleString("vi-VN")} VND</td>
      </tr>
  `
    )
    .join("");

  const orderSummaryHtml = `
      <p><strong>Tổng giá trị đơn hàng: <span style= "color: red;"">${orderDetail.total_price.toLocaleString(
        "vi-VN"
      )} VND</span></strong></p>
  `;

  const modalBody = document.querySelector("#order-detail");
  if (modalBody) {
    modalBody.querySelector(".order-info").innerHTML = orderInfoHtml;
    modalBody.querySelector("tbody").innerHTML = orderDetailsHtml;
    modalBody.querySelector(".order-summary").innerHTML = orderSummaryHtml;
  }
}

function renderOrderList(orders) {
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const ordersTableBody = document.querySelector("#orders tbody");
  if (!ordersTableBody) {
    return;
  }
  ordersTableBody.innerHTML = "";

  orders.forEach((order, index) => {
    const row = document.createElement("tr");

    const orderIndex = document.createElement("td");
    orderIndex.textContent = index + 1;

    const orderDate = document.createElement("td");
    orderDate.textContent = formatDateTime(order.created_at);

    const orderStatus = document.createElement("td");
    orderStatus.textContent = order.status;

    const orderTotal = document.createElement("td");
    orderTotal.textContent = `${formatPrice(order.total_price)}`;

    const actions = document.createElement("td");
    const viewButton = document.createElement("a");
    viewButton.classList.add("btn", "btn-secondary");
    viewButton.href = "#";
    viewButton.title = "Order detail view";
    viewButton.setAttribute("data-bs-target", "#order_detail_view");
    viewButton.setAttribute("data-bs-toggle", "modal");
    viewButton.textContent = "view";

    viewButton.addEventListener("click", async function (event) {
      event.preventDefault();
      const oderDetail = await getOrderById(order.id);
      // console.log("chi tiết sẽ được render", oderDetail);

      renderOrderDetail(oderDetail);
    });

    actions.appendChild(viewButton);

    row.appendChild(orderIndex);
    row.appendChild(orderDate);
    row.appendChild(orderStatus);
    row.appendChild(orderTotal);
    row.appendChild(actions);

    ordersTableBody.appendChild(row);
  });
}

export async function checkPurchasedProduct(orderList, productId) {
  const productDetail = await getProductDetail(productId);
  console.log("kiểm tra tên sản phẩm", productDetail.data.title);

  if (!productDetail) {
    return false;
  }

  const successfulOrders = Object.values(orderList).filter(
    (order) => order.status === "Thành công"
  );

  if (successfulOrders.length === 0) {
    console.log("Chưa có đơn hàng thành công.");
    return false;
  }

  for (let order of successfulOrders) {
    const orderDetails = await getOrderById(order.id);

    if (!orderDetails) {
      console.log(`Không thể lấy chi tiết đơn hàng cho ID: ${order.id}`);
      continue;
    }

    const isProductPurchased = orderDetails.order_details.some((detail) =>
      detail.product_name.includes(productDetail.data.title)
    );

    if (isProductPurchased) {
      return true;
    }
  }

  console.log("Sản phẩm chưa được mua.");
  return false;
}

let continueToPayment = document.getElementById("continueToPayment");

if (continueToPayment) {
  continueToPayment.addEventListener("click", async function (event) {
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
}

document.addEventListener("DOMContentLoaded", async () => {
  const oderList = await getOrderList();

  renderOrderList(oderList);
});
