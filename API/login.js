import apiService from './api.js';

document.querySelector('.btn.btn-secondary').addEventListener('click', async function () {
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    if (!email) {
        alert('Username is required');
        return;
    }
    if (!password) {
        alert('Password is required');
        return;
    }

    this.innerHTML = 'Vui lòng chờ...';
    this.disabled = true;

    const data = {
        email: email,
        password: password,
    };


    try {
        const result = await apiService.post('/api/user/login', data);

        if (result.status === 'success') {
            localStorage.setItem('token', result.access_token);
            // alert('Login success');
            window.location.href = "index.html";
        } else {
            alert('Login failed');
            this.innerHTML = 'Submit';
            this.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed');
    } finally {
        this.innerHTML = 'Submit';
        this.disabled = false;
    }
});



