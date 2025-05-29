document.addEventListener('DOMContentLoaded', function() {
    function handleLogin(event) {
        event.preventDefault();
        
        alert('Login successful! Redirecting to home page...');
        
        window.location.href = '../Home/home.html';
    }
    
    const form = document.querySelector('.login-form');
    form.addEventListener('submit', handleLogin);
});
