import apiService from './api.js';

const token = localStorage.getItem("token")

async function getUserCart() {
    try {
        const cartData = await apiService.get('/api/cart', {}, {
            "Authorization": `Bearer ${token}`
        });
        console.log("Giỏ hàng của người dùng:", cartData);
        console.log("Kiểu dữ liệu của cartData:", Array.isArray(cartData), cartData);
        const tbody = document.querySelector('tbody');

        tbody.innerHTML = '';

        if (Array.isArray(cartData) && cartData.length > 0) {
            cartData.forEach(item => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>
                        <a href="product-details.html"><img src="${item.image}" alt="Cart Product Image" title="${item.name}" class="img-thumbnail"></a>
                    </td>
                    <td>
                        <a href="product-details.html">${item.name}</a>
                        <span>Delivery Date: ${item.deliveryDate}</span>
                        <span>Color: ${item.color}</span>
                        <span>Reward Points: ${item.rewardPoints}</span>
                    </td>
                    <td>${item.quantity}</td>
                    <td>
                        <div class="input-group btn-block">
                            <div class="product-qty me-3">
                                <input type="text" value="${item.quantity}">
                                <span class="dec qtybtn"><i class="fa fa-minus"></i></span>
                                <span class="inc qtybtn"><i class="fa fa-plus"></i></span>
                            </div>
                            <span class="input-group-btn">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fa fa-refresh"></i>
                                </button>
                                <button type="button" class="btn btn-danger pull-right">
                                    <i class="fa fa-times-circle"></i>
                                </button>
                            </span>
                        </div>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                `;

                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Giỏ hàng hiện trống.</td></tr>';
        }
    } catch (error) {
        if (error.message.includes('401')) {
            console.log("Người dùng chưa được xác thực.");
        } else {
            console.error("Lỗi khi lấy giỏ hàng:", error);
        }
    }
}

async function updateUserCart(productVariantId, quantity) {
    try {
        const body = {
            "product_variant_id": productVariantId,
            "quantity": quantity
        };

        const updatedCart = await apiService.post('/api/cart/update', body, {}, {
            "Authorization": `Bearer ${token}`
        });

        console.log("Giỏ hàng sau khi cập nhật:", updatedCart);
    } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng:", error);
    }
}

getUserCart();

