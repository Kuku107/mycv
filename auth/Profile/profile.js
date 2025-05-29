document.addEventListener('DOMContentLoaded', function() {
    // Avatar dropdown functionality
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdown = document.querySelector('.dropdown-menu');
    
    // Toggle dropdown menu when avatar is clicked
    avatarBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.classList.remove('active');
    });
    
    // Handle logout functionality
    document.getElementById('logout').addEventListener('click', function() {
        alert('Logging out...');
        window.location.href = '../Login/login.html';
    });
    
    // Handle profile image upload
    const uploadBtn = document.getElementById('upload-profile-image');
    const deleteBtn = document.getElementById('delete-image');
    const imagePreview = document.getElementById('profile-image-preview');
    const fileInput = document.getElementById('file-input');
    
    // Show file dialog when upload button is clicked
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.style.backgroundImage = `url(${e.target.result})`;
                imagePreview.classList.add('has-image');
                imagePreview.innerHTML = '';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle delete image
    deleteBtn.addEventListener('click', function() {
        imagePreview.style.backgroundImage = 'none';
        imagePreview.classList.remove('has-image');
        imagePreview.innerHTML = '<i class="fas fa-user"></i>';
        fileInput.value = '';
    });
    
    // Handle form submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically send the form data to a server
        // For demonstration, we'll just show a success message
        alert('Profile updated successfully!');
        
        // Redirect back to home page or stay on profile page
        // window.location.href = '../Home/home.html';
    });
    
    // Navigate back to home
    document.getElementById('back-to-home').addEventListener('click', function() {
        window.location.href = '../Home/home.html';
    });
});
