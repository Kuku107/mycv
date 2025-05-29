document.addEventListener('DOMContentLoaded', function() {
    function handleSignUp(event) {
        event.preventDefault(); 

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        alert('Registration successful! Redirecting to login page...');
        window.location.href = '../Login/login.html';
    }
    
    const form = document.querySelector('.signup-form');
    form.addEventListener('submit', handleSignUp);
});
