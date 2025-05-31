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
    const profileForm = document.getElementById('profile-form');
    const errorMessageContainer = document.getElementById('profile-form-error');
    const nameInput = document.getElementById('name');
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error message
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
        
        // Validate required fields
        if (!nameInput.value.trim()) {
            errorMessageContainer.textContent = 'Please fill out all required fields.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Get form data
        const profileData = {
            name: nameInput.value,
            jobTitle: document.getElementById('job-title').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            bio: document.getElementById('bio').value,
            facebook: document.getElementById('facebook-url').value,
            twitter: document.getElementById('twitter-url').value,
            instagram: document.getElementById('instagram-url').value,
            profileImage: imagePreview.classList.contains('has-image') ? 
                imagePreview.style.backgroundImage.replace(/url\(['"](\S+)['"]\)/, '$1') : 
                null
        };
        
        try {
            // Here you would typically send the form data to a server
            // For demonstration, we'll just show a success message
            
            /*
            // Example of handling server errors:
            if (serverResponse.error) {
                errorMessageContainer.textContent = serverResponse.error;
                errorMessageContainer.style.display = 'block';
                return;
            }
            */
            
            console.log('Profile updated successfully:', profileData);
            alert('Profile updated successfully!');
            
            // Redirect back to home page or stay on profile page
            // window.location.href = '../Home/home.html';
        } catch (error) {
            // Display error message from server
            errorMessageContainer.textContent = error.message || 'An error occurred. Please try again.';
            errorMessageContainer.style.display = 'block';
        }
    });
    
    // Navigate back to home
    document.getElementById('back-to-home').addEventListener('click', function() {
        window.location.href = '../Home/home.html';
    });
});
