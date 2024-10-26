// 


document.querySelector('.btn.btn-secondary').addEventListener('click', function () {
    let email = document.querySelector('input[name="email"]').value;
    let password = document.querySelector('input[name="password"]').value;
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
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
    fetch('https://mobile-store.id.vn/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('token', data.access_token);
                alert('Login success');
                window.location.href = "index.html";
            } else {
                alert('Login failed');
                this.innerHTML = 'Submit';
                this.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
            this.innerHTML = 'Submit';
            this.disabled = false;
        })
        .finally(() => {
            this.innerHTML = 'Submit';
            this.disabled = false;
        });
});