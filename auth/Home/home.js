document.addEventListener('DOMContentLoaded', function() {
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
        // Here you would typically handle logout logic
        alert('Logging out...');
        window.location.href = '../Login/login.html';
    });
});
