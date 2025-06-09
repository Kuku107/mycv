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
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Signing up...';
        
        // Call the API to register the user
        fetch('https://mycv-backend.onrender.com/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        })
        .then(response => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (!response.ok) {
                // If response is not 2xx, parse the error message
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Registration successful
            console.log('Registration successful:', data);
            // Use message from backend if available, otherwise use translation or default
            const successMessage = data.message || 
                (window.i18n?.instance?.translate ? window.i18n.instance.translate('signup_success') : 'Registration successful! Redirecting to login page...');
            alert(successMessage);
            window.location.href = '../Login/login.html';
        })
        .catch(error => {
            // Display error message
            errorMessageContainer.textContent = error.message || 'Registration failed. Please try again.';
            errorMessageContainer.style.display = 'block';
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            console.error('Registration error:', error);
        });
    }
    
    form.addEventListener('submit', handleSignUp);
});
