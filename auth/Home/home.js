document.addEventListener('DOMContentLoaded', function() {
    // Load user profile data from localStorage
    UserProfile.updateUserMenuFromStorage();
    // Toggle dropdown menu when avatar is clicked
    const avatar = document.querySelector('.avatar');
    const dropdown = document.querySelector('.dropdown-menu');
    
    avatar.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.classList.remove('active');
    });
    
    // Handle logout functionality
    document.getElementById('logout').addEventListener('click', function() {
        // Call logout API to clear cookies - sử dụng GET /auth/logout
        fetch('http://localhost:8080/auth/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then(() => {
            // Xóa dữ liệu người dùng khỏi localStorage
            localStorage.removeItem('userProfile');
            
            // Redirect to login page regardless of response
            window.location.href = '../Login/login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Xóa dữ liệu người dùng khỏi localStorage ngay cả khi có lỗi
            localStorage.removeItem('userProfile');
            
            // Still redirect to login page even if there's an error
            window.location.href = '../Login/login.html';
        });
    });
});
