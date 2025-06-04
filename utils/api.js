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
    // Ensure credentials are included to send cookies
    const fetchOptions = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

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
