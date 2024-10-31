import apiService from './api.js';

export const cartData = {
    product_variant_id: null,
    quantity: 1,
};

async function fetchProductList() {
    try {
        const data = await apiService.get('/api/product-list');
        console.log("Danh sách sản phẩm:", data.data);
        return data.data;
    } catch (error) {
        console.error("Error fetching product list:", error);
        return []
    }
}
const base_url = "https://mobile-store.id.vn/";

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};


function renderProducts(products) {
    const productListElement = document.getElementById('product-list', {}, { mode: 'no-cors' });
    if (!productListElement) {
        return;
    }
    productListElement.innerHTML = '';

    products.forEach(product => {
        const discount = Number(product.discount).toFixed(0);
        const productHTML = `
        <div class="owl-item active" style="width: 217px; margin-right: 30px;">
            <div class="product-item">
                <div class="product-thumb">
                    <a href="product-details.html">
                        <img src="${base_url}${product.variants[0].images[0].image_url}" class="pri-img" alt="${product.title}">
                        <img src="${base_url}${product.variants[0].images[0].image_url}" class="sec-img" alt="${product.title}">
                    </a>
                    <div class="box-label">
                        <div class="label-product label_sale">
                            <span>${discount}%</span>
                        </div>
                    </div>
                    <div class="action-links">
                        <a href="#" title="Wishlist"><i class="lnr lnr-heart"></i></a>
                        <a href="#" title="Compare"><i class="lnr lnr-sync"></i></a>
                        <a href="#" title="Quick view" data-bs-target="#quickk_view" data-bs-toggle="modal">
                            <i class="lnr lnr-magnifier"></i>
                        </a>
                    </div>
                </div>
                <div class="product-caption">
                    <div class="manufacture-product">
                        <p><a href="shop-grid-left-sidebar.html">${product.category_name}</a></p>
                    </div>
                    <div class="product-name">
                        <h4>
                            <a href="product-details.html">${product.title}</a>
                        </h4>
                    </div>
                    <div class="ratings">
                        ${'★'.repeat(product.variants[0].rating || 0)}${'☆'.repeat(5 - (product.variants[0].rating || 0))}
                    </div>
                    <div class="price-box">
                        <span class="regular-price">${formatPrice(product.variants[0].price)}</span>
                    </div>
                    <button class="btn-cart" type="button" data-product-variant-id="${product.variants[0].id}">Add to cart</button>
                </div>
            </div>
        </div>
    `;
        productListElement.innerHTML += productHTML;

    });

    document.querySelectorAll('.btn-cart').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productVariantId = event.currentTarget.getAttribute('data-product-variant-id');
            const quantity = 1;
            cartData.product_variant_id = Number(productVariantId);
            cartData.quantity = quantity;
            console.log('Giá trị trong cartData trước khi gửi:', cartData);

            try {
                const response = await apiService.post('/api/cart/update', {
                    product_variant_id: cartData.product_variant_id,
                    quantity: cartData.quantity,
                });

                console.log('Sản phẩm đã được thêm vào giỏ hàng:', response);
                alert('Sản phẩm đã được thêm vào giỏ hàng thành công!');
            } catch (error) {
                console.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng:', error);
                alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const productList = await fetchProductList();
    if (productList && productList.length > 0) {
        renderProducts(productList);
    }
});
