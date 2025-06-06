document.addEventListener("DOMContentLoaded", function() {    
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('userId');

    if (userId) {
        // Function to update navigation URLs with userId parameter
        function updateNavigationUrls() {
            console.log('Updating navigation URLs in About page');
            
            try {
                // Update header links
                const headerLogo = document.querySelector("header .logo a");
                if (headerLogo) headerLogo.href = "../About/about.html?userId=" + userId;
                
                const headerAbout = document.getElementById("header_about_page");
                if (headerAbout) headerAbout.href = "../About/about.html?userId=" + userId;
                
                const headerProject = document.getElementById("header_project_page");
                if (headerProject) headerProject.href = "../Projects/projects.html?userId=" + userId;
                
                const headerContact = document.getElementById("header_contact_page");
                if (headerContact) headerContact.href = "../Contact/contact.html?userId=" + userId;
                
                // Update footer links
                const footerLogo = document.querySelector("footer .logo a");
                if (footerLogo) footerLogo.href = "../About/about.html?userId=" + userId;
                
                const footerAbout = document.getElementById("footer_about_page");
                if (footerAbout) footerAbout.href = "../About/about.html?userId=" + userId;
                
                const footerProject = document.getElementById("footer_project_page");
                if (footerProject) footerProject.href = "../Projects/projects.html?userId=" + userId;
                
                const footerContact = document.getElementById("footer_contact_page");
                if (footerContact) footerContact.href = "../Contact/contact.html?userId=" + userId;
                
                // Update social media links if they have specific IDs
                const footerFacebook = document.getElementById("footer_facebook");
                if (footerFacebook) footerFacebook.href = "#?userId=" + userId;
                
                const footerTwitter = document.getElementById("footer_twitter");
                if (footerTwitter) footerTwitter.href = "#?userId=" + userId;
                
                const footerInstagram = document.getElementById("footer_instagram");
                if (footerInstagram) footerInstagram.href = "#?userId=" + userId;
                
                console.log('Navigation URLs updated successfully in About page');
            } catch (error) {
                console.error('Error updating navigation URLs in About page:', error);
            }
        }
        
        // Call the function immediately
        updateNavigationUrls();
        
        // Also call it again after a short delay to ensure all elements are loaded
        setTimeout(updateNavigationUrls, 500);
        
        // And one more time after a longer delay just to be extra sure
        setTimeout(updateNavigationUrls, 1000);

        // load user profile
        loadUserProfile(userId);
    }
});

async function loadUserProfile(userId) {
    try {
        const response = await fetch(`http://localhost:8080/user/profile?userId=${userId}`);
        const data = await response.json();
        
        // Get user data from response
        const userData = data.data;
        
        if (userData) {
            // Update profile information in HTML
            document.getElementById('user-name').textContent = userData.name || 'Name not available';
            document.getElementById('user-job').textContent = userData.jobTitle || 'Position not available';
            document.getElementById('user-phone').textContent = userData.phone || 'Phone not available';
            document.getElementById('user-phone').href = `tel:${userData.phone}`;
            document.getElementById('user-address').textContent = userData.address || 'Address not available';
            document.getElementById('user-bio').textContent = userData.bio || 'Bio not available';
            
            // Update profile image if available
            const profileImageElement = document.getElementById('user-profile-image');
            if (userData.profileUrl && userData.profileUrl.trim() !== '') {
                profileImageElement.src = userData.profileUrl;
                console.log('Profile image updated with URL:', userData.profileUrl);
            } else {
                // Keep the default image
                console.log('Using default profile image (no URL provided)');
            }
            
            // Update social media links in footer if they exist
            updateSocialLinks(userData);
            
            // Show the profile section after data is loaded
            document.getElementById('profile-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        document.getElementById('profile-error').textContent = 'Failed to load profile data';
        document.getElementById('profile-error').style.display = 'block';
    }
}

// Function to update social media links if available
function updateSocialLinks(userData) {
    try {
        const footerFacebook = document.getElementById('footer_facebook');
        if (footerFacebook && userData.facebookUrl && userData.facebookUrl.trim() !== '') {
            footerFacebook.href = userData.facebookUrl;
        }
        
        const footerTwitter = document.getElementById('footer_twitter');
        if (footerTwitter && userData.twitterUrl && userData.twitterUrl.trim() !== '') {
            footerTwitter.href = userData.twitterUrl;
        }
        
        const footerInstagram = document.getElementById('footer_instagram');
        if (footerInstagram && userData.instagramUrl && userData.instagramUrl.trim() !== '') {
            footerInstagram.href = userData.instagramUrl;
        }
        
        console.log('Social media links updated');
    } catch (error) {
        console.error('Error updating social links:', error);
    }
}

