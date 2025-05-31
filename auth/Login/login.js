document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageContainer = document.getElementById('login-form-error');
    
    function handleLogin(event) {
        event.preventDefault();
        
        // Reset error message
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
        
        // Validate required fields
        if (!emailInput.value || !passwordInput.value) {
            errorMessageContainer.textContent = 'Please enter both email and password.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Get form data
        const loginData = {
            email: emailInput.value,
            password: passwordInput.value
        };
        
        try {
            // Here you would typically send the login data to a server
            // For demonstration, we'll just show a success message
            
            /*
            // Example of handling authentication errors:
            if (serverResponse.error) {
                errorMessageContainer.textContent = serverResponse.error;
                errorMessageContainer.style.display = 'block';
                return;
            }
            */
            
            console.log('Login attempt:', loginData.email);
            alert('Login successful! Redirecting to home page...');
            window.location.href = '../Home/home.html';
        } catch (error) {
            // Display error message
            errorMessageContainer.textContent = error.message || 'Login failed. Please check your credentials.';
            errorMessageContainer.style.display = 'block';
        }
    }
    
    form.addEventListener('submit', handleLogin);
});
