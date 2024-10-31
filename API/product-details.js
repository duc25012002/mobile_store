import apiService from './api.js';
import { cartData } from './products-all.js';

async function getProductDetail(productId) {
    console.log(productId);
    try {
        const productData = await apiService.get(`/api/product-detail/${productId}`, {}, { "Authorization": `Bearer ${token}` });

        if (productData) {
            console.log("Thông tin sản phẩm:", productData);
            displayProductDetail(productData);
        } else {
            console.error("Không tìm thấy sản phẩm.");
        }
    } catch (error) {
        if (error.message.includes('404')) {
            console.error("Lỗi 404: Không tìm thấy sản phẩm.");
        } else {
            console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        }
    }
}

function displayProductDetail(product) {
    const productDetailContainer = document.getElementById('product-detail');

    productDetailContainer.innerHTML = `
        <h2>${product.name}</h2>
        <img src="${product.image}" alt="${product.name}">
        <p>${product.description}</p>
        <p>Giá: $${product.price.toFixed(2)}</p>
        <p>Màu sắc: ${product.color}</p>
        <p>Điểm thưởng: ${product.rewardPoints}</p>
    `;
}

getProductDetail(cartData.product_variant_id);

