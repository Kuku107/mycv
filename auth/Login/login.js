// Import the API utility for token refresh
import { fetchWithTokenRefresh } from '../../utils/api.js';

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
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        
        // Call the API to login the user
        fetch('https://mycv-backend.onrender.com/auth/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // This ensures cookies are received from the request
            body: JSON.stringify(loginData)
        })
        .then(response => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (!response.ok) {
                // If response is not 2xx, parse the error message
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Login successful
            console.log('Login successful:', data);
            
            // No need to store tokens as they're in cookies now
            
            // Fetch user profile after successful login
            return fetchWithTokenRefresh('https://mycv-backend.onrender.com/user/profile', {
                method: 'GET',
                credentials: 'include'
            });
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Failed to fetch profile');
                });
            }
            return response.json();
        })
        .then(profileData => {
            // Log to debug the API response
            console.log('Raw profile data from API:', profileData);
            console.log('Profile data email:', profileData.data?.email);
            
            // Store profile data in localStorage for use across all pages
            if (profileData && profileData.data) {
                // Lưu profile data vào localStorage cho các trang sử dụng
                const profileToSave = {
                    userId: profileData.data.userId || '',
                    name: profileData.data.name || '',
                    email: profileData.data.email || '',
                    profileUrl: profileData.data.profileUrl || '',
                    jobTitle: profileData.data.jobTitle || ''
                };
                console.log('Profile data being saved to localStorage:', profileToSave);
                localStorage.setItem('userProfile', JSON.stringify(profileToSave));
            }
            
            // Use message from backend if available, otherwise use translation or default
            const successMessage = profileData.message || 
                (window.i18n?.instance?.translate ? window.i18n.instance.translate('login_success') : 'Login successful! Redirecting to home page...');
            alert(successMessage);
            window.location.href = '../Home/home.html';
        })
        .catch(error => {
            // Display error message
            errorMessageContainer.textContent = error.message || 'Login failed. Please check your credentials.';
            errorMessageContainer.style.display = 'block';
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            console.error('Login error:', error);
        });
    }
    
    form.addEventListener('submit', handleLogin);
});
