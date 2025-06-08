// Import the API utility for token refresh
import { fetchWithTokenRefresh } from '../../utils/api.js';

// Hàm tạo UUID bằng tay - để sử dụng cho tất cả các trường hợp upload ảnh
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch user profile data - no need to check for token as the API will handle unauthorized requests
    
    // Fetch user profile data
    fetchUserProfile();
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
        // Xóa dữ liệu người dùng khỏi localStorage ngay lập tức
        localStorage.removeItem('userProfile');
        
        // Chuyển hướng người dùng đến trang đăng nhập ngay lập tức
        window.location.href = '../Login/login.html';
        
        // Gọi API logout ở background mà không cần đợi kết quả
        fetch('http://localhost:8080/auth/logout', {
            method: 'GET',
            credentials: 'include' // Đảm bảo gửi cookies để server xóa session
        }).catch(error => {
            // Chỉ log lỗi, không cần xử lý gì thêm vì người dùng đã được chuyển hướng
            console.error('Background logout request error:', error);
        });
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
            email: document.getElementById('email')?.value || localStorage.getItem('email') || '', // Thêm trường email
            jobTitle: document.getElementById('job-title').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            bio: document.getElementById('bio').value,
            facebookUrl: document.getElementById('facebook-url').value,
            twitterUrl: document.getElementById('twitter-url').value,
            instagramUrl: document.getElementById('instagram-url').value,
            profileUrl: "" // default to empty string
        };
        
        // Log for debugging
        console.log('Profile data before save:', profileData);
        
        // Kiểm tra xem có ảnh trong localStorage không
        const storedProfileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const storedProfileUrl = storedProfileData.profileUrl || '';
        
        // If there's an image in the preview, set profileUrl from it
        if (imagePreview.classList.contains('has-image') && imagePreview.style.backgroundImage) {
            const match = imagePreview.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            if (match && match[1]) {
                profileData.profileUrl = match[1];
            }
        } else if (storedProfileUrl && storedProfileUrl.includes('https://storage.googleapis.com/mycvs_live/')) {
            // Nếu không có ảnh trong preview nhưng có trong localStorage, cần xóa ảnh cũ
            const fileName = storedProfileUrl.replace('https://storage.googleapis.com/mycvs_live/', '');
            console.log('Detected image deletion, will delete file:', fileName);
            
            // Đánh dấu để xóa ảnh sau khi lưu profile
            profileData._deleteOldImage = fileName;
        }
        
        // Show loading state
        const submitButton = profileForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        // If there's a new file to upload, handle it first
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Tạo tên file duy nhất với UUID
            const uniqueFileName = `${generateUUID()}-${file.name}`;
            const contentType = file.type;
            
            // Step 1: Get upload URL với tên file đã có UUID
            fetchWithTokenRefresh(`http://localhost:8080/api/images/generate-upload-url?fileName=${encodeURIComponent(uniqueFileName)}&contentType=${encodeURIComponent(contentType)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(async data => {
                // Step 2: Upload to the provided URL
                const uploadUrl = data.uploadUrl;
                
                try {
                    const upload = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': file.type
                        },
                        body: file,
                        mode: "cors"
                    });
                    
                    if (upload.ok) {
                        // Set the image URL in profile data với tên file có UUID
                        profileData.profileUrl = `https://storage.googleapis.com/mycvs_live/${uniqueFileName}`;
                        
                        // Now save the profile
                        saveProfileData(profileData, submitButton, originalButtonText);
                    } else {
                        throw new Error('Failed to upload image to storage');
                    }
                } catch (uploadError) {
                    console.error('Error uploading to storage:', uploadError);
                    errorMessageContainer.textContent = 'Failed to upload image to storage. Please try again.';
                    errorMessageContainer.style.display = 'block';
                    
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            })
            .catch(error => {
                console.error('Error generating upload URL:', error);
                errorMessageContainer.textContent = 'Failed to prepare image upload. Please try again.';
                errorMessageContainer.style.display = 'block';
                
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
        } else {
            // No new image to upload, just save the profile data
            saveProfileData(profileData, submitButton, originalButtonText);
        }
    });
    
    // Function to save profile data to API
    function saveProfileData(profileData, submitButton, originalButtonText) {
        // In ra ngôn ngữ hiện tại trước khi gửi request
        console.log('Current language before request:', window.i18n.instance.getCurrentLanguage());
        console.log('Profile update request data:', profileData);
        
        // Custom fetch để debug headers
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        };
        
        // In ra tất cả headers trước khi gửi
        console.log('Request options:', JSON.stringify(requestOptions));
        
        // Gửi dữ liệu cập nhật profile với log chi tiết
        fetchWithTokenRefresh('http://localhost:8080/user/profile', requestOptions)
        .then(response => {
            // Log response info
            console.log('Response headers:', response.headers);
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            // Try to get Accept-Language header from request
            console.log('Request Accept-Language:', requestOptions.headers['Accept-Language'] || 'Not directly set in options');
            
            // Clone the response before consuming it
            const responseClone = response.clone();
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // Extra logging for response body regardless of OK status
            responseClone.json().then(data => {
                console.log('Full response body:', data);
                console.log('Response message:', data.message || 'No message in response');
                console.log('Response language info:', data.language || 'No language info in response');
            }).catch(err => console.error('Error parsing response JSON:', err));
            
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.log('Error data from server:', errorData);
                    throw new Error(errorData.message || 'Failed to update profile');
                });
            }
            return response.json();
        })
        .then(data => {
            // Show success message using data from backend
            errorMessageContainer.textContent = data.message || window.i18n.instance.translate('profile_update_success') || 'Profile updated successfully!';
            errorMessageContainer.style.display = 'block';
            errorMessageContainer.style.color = 'green';
            errorMessageContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
            
            // Nếu cần xóa ảnh cũ
            if (profileData._deleteOldImage) {
                const fileName = profileData._deleteOldImage;
                console.log('Deleting old image:', fileName);
                
                // Gọi API xóa ảnh
                fetchWithTokenRefresh(`http://localhost:8080/api/images/delete?fileName=${encodeURIComponent(fileName)}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Old image deleted successfully');
                    } else {
                        console.error('Failed to delete old image');
                    }
                })
                .catch(error => {
                    console.error('Error deleting old image:', error);
                });
                
                // Xóa trường tạm này trước khi lưu vào localStorage
                delete profileData._deleteOldImage;
            }
            
            // Save profile data to localStorage for use across pages
            UserProfile.saveUserProfileToStorage(profileData);
            
            // Update user info in dropdown menu
            updateUserInfo(profileData);
            
            // Thông báo thành công và reload trang sau 0.5 giây
            setTimeout(() => {
                // Reload trang để cập nhật tất cả dữ liệu
                window.location.reload();
            }, 500);
        })
        .catch(error => {
            // Display error message from backend or fallback to translation
            errorMessageContainer.textContent = error.message || window.i18n.instance.translate('profile_update_error') || 'Failed to update profile';
            errorMessageContainer.style.display = 'block';
            console.error('Profile update error:', error);
        });
    }
    
    // Navigate back to home
    document.getElementById('back-to-home').addEventListener('click', function() {
        window.location.href = '../Home/home.html';
    });
    
    // Function to fetch user profile data
    function fetchUserProfile() {
        const errorMessageContainer = document.getElementById('profile-form-error');
        
        // Show loading state
        document.body.classList.add('loading');
        
        fetchWithTokenRefresh('http://localhost:8080/user/profile', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Failed to fetch profile');
                });
            }
            return response.json();
        })
        .then(data => {
            // Remove loading state
            document.body.classList.remove('loading');
            
            if (data.data) {
                // Fill form with profile data
                fillProfileForm(data.data);
                
                // Update user info in dropdown menu
                updateUserInfo(data.data);
            }
        })
        .catch(error => {
            // Remove loading state
            document.body.classList.remove('loading');
            
            // Display error message
            errorMessageContainer.textContent = error.message || 'Failed to load profile data';
            errorMessageContainer.style.display = 'block';
            console.error('Profile fetch error:', error);
        });
    }
    
    // Function to fill form with profile data
    function fillProfileForm(profileData) {
        // Fill basic info
        document.getElementById('name').value = profileData.name || '';
        document.getElementById('job-title').value = profileData.jobTitle || '';
        document.getElementById('phone').value = profileData.phone || '';
        document.getElementById('address').value = profileData.address || '';
        document.getElementById('bio').value = profileData.bio || '';
        
        // Fill social media links
        document.getElementById('facebook-url').value = profileData.facebookUrl || '';
        document.getElementById('twitter-url').value = profileData.twitterUrl || '';
        document.getElementById('instagram-url').value = profileData.instagramUrl || '';
        
        // Set profile image if exists
        const imagePreview = document.getElementById('profile-image-preview');
        if (profileData.profileUrl) {
            imagePreview.style.backgroundImage = `url(${profileData.profileUrl})`;
            imagePreview.classList.add('has-image');
            imagePreview.innerHTML = '';
        }
    }
    
    // Function to update user info in dropdown menu
    function updateUserInfo(profileData) {
        console.log('updateUserInfo profileData:', profileData);
        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        
        // Cập nhật ảnh đại diện trong profile preview (là thẻ div với background-image)
        const profileImagePreview = document.getElementById('profile-image-preview');
        console.log('profileImagePreview element:', profileImagePreview);
        
        if (profileImagePreview) {
            if (profileData.profileUrl) {
                console.log('Setting profile image URL:', profileData.profileUrl);
                // Kiểm tra xem URL đã được encode chưa
                let urlToUse = profileData.profileUrl;
                // Nếu URL chưa chứa %20 hoặc các ký tự đã encode thì mới encode
                if (!urlToUse.includes('%')) {
                    urlToUse = encodeURI(urlToUse);
                }
                console.log('URL to use:', urlToUse);
                profileImagePreview.style.backgroundImage = `url("${urlToUse}")`;
                profileImagePreview.classList.add('has-image');
                profileImagePreview.innerHTML = '';
            } else {
                // Reset về trạng thái mặc định nếu không có profileUrl
                profileImagePreview.style.backgroundImage = '';
                profileImagePreview.classList.remove('has-image');
                profileImagePreview.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
        
        // Cập nhật ảnh đại diện trong menu dropdown
        const dropdownAvatar = document.querySelector('.user-avatar img');
        if (dropdownAvatar && profileData.profileUrl) {
            // Sử dụng URL gốc cho thẻ img
            dropdownAvatar.src = profileData.profileUrl;
        }
        
        // Cập nhật ảnh đại diện trong nút avatar chính
        const headerAvatar = document.querySelector('#avatar-btn img');
        if (headerAvatar && profileData.profileUrl) {
            // Sử dụng URL gốc cho thẻ img
            headerAvatar.src = profileData.profileUrl;
        }
        
        // Cập nhật tên người dùng
        if (userName && profileData.name) {
            userName.textContent = profileData.name;
        }
        
        // Cập nhật email người dùng nếu có
        if (userEmail && profileData.email) {
            userEmail.textContent = profileData.email;
        }
    }
});
