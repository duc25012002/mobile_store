import apiService from './api.js';

document.querySelector('.btn.btn-secondary').addEventListener('click', async function (event) {
    event.preventDefault();

    const email = document.querySelector('#email').value;
    const name = document.querySelector('#inputname').value;
    const phone = document.querySelector('#inputphone').value;
    const address = document.querySelector('#inputaddress').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#c-password').value;
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    if (!email || !name || !phone || !address || !password || !confirmPassword) {
        alert('All fields are required');
        return;
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    this.innerHTML = 'Registering...';
    this.disabled = true;

    const data = {
        email: email,
        name: name,
        phone: phone,
        address: address,
        password: password,
        repassword: confirmPassword,
    };

    try {
        const result = await apiService.post('/api/user/register', data);

        if (result.status === 'success') {
            alert('Registration successful');
            window.location.href = "index.html";
        } else {
            alert(result.message || 'Registration failed');
            this.innerHTML = 'Register';
            this.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed');
    } finally {
        this.innerHTML = 'Register';
        this.disabled = false;
    }
});
