/**
 * Utility functions for API calls with token refresh handling
 */

/**
 * Makes an API request with automatic token refresh if the token is expired
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body)
 * @returns {Promise} - Promise that resolves with the API response
 */
async function fetchWithTokenRefresh(url, options = {}) {
    // Explicitly add current language to ensure it's included
    const currentLang = window.i18n?.instance?.getCurrentLanguage ? window.i18n.instance.getCurrentLanguage() : 'en';
    console.log('fetchWithTokenRefresh - using language:', currentLang);
    
    // Ensure credentials are included to send cookies
    const fetchOptions = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLang, // Explicitly add Accept-Language
            ...options.headers
        }
    };
    
    console.log('fetchWithTokenRefresh - final headers:', fetchOptions.headers);

    try {
        // Make the initial request
        let response = await fetch(url, fetchOptions);

        // If the response is 401 Unauthorized, try to refresh the token
        if (response.status === 401 || response.status === 403) {
            console.log('Token expired, attempting to refresh...');
            
            // Try to refresh the token
            const refreshResponse = await fetch('http://localhost:8080/auth/refresh-token', {
                method: 'POST',
                credentials: 'include'
            });

            // If refresh was successful, retry the original request
            if (refreshResponse.ok) {
                console.log('Token refreshed successfully, retrying original request');
                response = await fetch(url, fetchOptions);
            } else {
                // If refresh failed, redirect to login
                console.error('Token refresh failed, redirecting to login');
                window.location.href = '/auth/Login/login.html';
                throw new Error('Authentication failed. Please login again.');
            }
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Export the utility function
export { fetchWithTokenRefresh };
