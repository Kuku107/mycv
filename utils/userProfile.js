/**
 * Utility functions for user profile management across pages
 */

// Tạo namespace cho UserProfile để tránh xung đột global
var UserProfile = {};

/**
 * Update user menu/dropdown with profile data from localStorage
 * Works across all pages that include this script
 */
UserProfile.updateUserMenuFromStorage = function() {
    const profileDataStr = localStorage.getItem('userProfile');
    if (!profileDataStr) return;
    
    try {
        const profileData = JSON.parse(profileDataStr);
        console.log('Loading user profile from storage:', profileData);
        
        // Cập nhật tên người dùng
        const userName = document.querySelector('.user-name');
        if (userName && profileData.name) {
            userName.textContent = profileData.name;
        }
        
        // Cập nhật email
        const userEmail = document.querySelector('.user-email');
        if (userEmail && profileData.email) {
            userEmail.textContent = profileData.email;
        }
        
        // Cập nhật avatar trong dropdown
        const dropdownAvatar = document.querySelector('.user-avatar img');
        if (dropdownAvatar && profileData.profileUrl) {
            dropdownAvatar.src = profileData.profileUrl;
        }
        
        // Cập nhật avatar trong header (projects.html và profile.html sử dụng id="avatar-btn")
        const headerAvatar = document.querySelector('#avatar-btn img');
        if (headerAvatar && profileData.profileUrl) {
            headerAvatar.src = profileData.profileUrl;
        }
        
        // Cập nhật avatar trong header của home.html (sử dụng class="avatar")
        const homeHeaderAvatar = document.querySelector('.avatar > img');
        if (homeHeaderAvatar && profileData.profileUrl) {
            homeHeaderAvatar.src = profileData.profileUrl;
        }
        
        // Cập nhật tất cả các portfolio links với userId
        const portfolioLinks = document.querySelectorAll('.portfolio-link');
        if (portfolioLinks.length > 0 && profileData.userId) {
            portfolioLinks.forEach(link => {
                link.href = `../../About/about.html?userId=${profileData.userId}`;
            });
            console.log('Updated portfolio links with userId:', profileData.userId);
        }
    } catch (error) {
        console.error('Error parsing user profile data:', error);
    }
};

/**
 * Save updated profile data to localStorage
 * Call this function after profile is updated
 * @param {Object} profileData - User profile data
 */
UserProfile.saveUserProfileToStorage = function(profileData) {
    if (!profileData) return;
    
    // Lấy dữ liệu hiện tại trong localStorage
    const currentProfileDataStr = localStorage.getItem('userProfile');
    let currentEmail = '';
    let currentUserId = '';
    
    // Nếu đã có profile data, lấy các thông tin hiện tại
    if (currentProfileDataStr) {
        try {
            const currentProfileData = JSON.parse(currentProfileDataStr);
            currentEmail = currentProfileData.email || '';
            currentUserId = currentProfileData.userId || '';
        } catch (e) {
            console.error('Error parsing current profile data:', e);
        }
    }
    
    const profileToSave = {
        userId: profileData.userId || currentUserId || '',
        name: profileData.name || '',
        // Sử dụng email mới nếu có, nếu không dùng email hiện tại
        email: profileData.email || currentEmail || '',
        profileUrl: profileData.profileUrl || '',
        jobTitle: profileData.jobTitle || ''
    };
    
    console.log('Saving profile to localStorage:', profileToSave);
    localStorage.setItem('userProfile', JSON.stringify(profileToSave));
};
