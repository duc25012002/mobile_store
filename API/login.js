// import { loginAPI } from './api.js';

// function togglePassword() {
//     const passwordField = document.getElementById('password');
//     const showBtn = document.querySelector('.pass-show-btn');

//     if (passwordField.type === 'password') {
//         passwordField.type = 'text';
//         showBtn.innerText = 'Hide';
//     } else {
//         passwordField.type = 'password';
//         showBtn.innerText = 'Show';
//     }
// }



document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('c-password').value;

        try {
            const result = await loginAPI(email, password);

            if (result.token) {
                alert('Đăng nhập thành công!');
                localStorage.setItem('token', result.token);
                window.location.href = 'my-account.html';
            } else {
                alert('Đăng nhập thất bại! Kiểm tra lại thông tin.');
            }
        } catch (error) {
            alert('Có lỗi xảy ra trong quá trình đăng nhập.');
        }
    });
});
