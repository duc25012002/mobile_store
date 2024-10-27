import apiService from './api.js';

async function ProductList() {
    try {
        const data = await apiService.get('/api/product-list');
        console.log("Danh sách sản phẩm:", data.data);
        return data.data;
    } catch (error) {
        console.error("Error fetching product list:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const productList = await ProductList();
    if (productList) {

    } else {

    }
});
