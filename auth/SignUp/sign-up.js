document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.signup-form');
    const nameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    const errorMessageContainer = document.getElementById('signup-form-error');
    
    function handleSignUp(event) {
        event.preventDefault();
        
        // Reset error message
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
        
        // Validate required fields
        if (!nameInput.value || !emailInput.value || !passwordInput.value || !confirmPasswordInput.value) {
            errorMessageContainer.textContent = 'Please fill out all required fields.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            errorMessageContainer.textContent = 'Please enter a valid email address.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Validate password match
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessageContainer.textContent = 'Passwords do not match.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Validate terms acceptance
        if (!termsCheckbox.checked) {
            errorMessageContainer.textContent = 'You must accept the Terms of Service.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Get form data
        const signupData = {
            fullName: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        };
        
        try {
            // Here you would typically send the signup data to a server
            // For demonstration, we'll just show a success message
            
            /*
            // Example of handling server errors:
            if (serverResponse.error) {
                errorMessageContainer.textContent = serverResponse.error;
                errorMessageContainer.style.display = 'block';
                return;
            }
            */
            
            console.log('Registration attempt:', signupData.email);
            alert('Registration successful! Redirecting to login page...');
            window.location.href = '../Login/login.html';
        } catch (error) {
            // Display error message
            errorMessageContainer.textContent = error.message || 'Registration failed. Please try again.';
            errorMessageContainer.style.display = 'block';
        }
    }
    
    form.addEventListener('submit', handleSignUp);
});
