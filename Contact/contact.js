document.addEventListener("DOMContentLoaded", function () {
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('userId');

    // Handle the form submission
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Create request payload
            // Get email from the userProfile JSON object stored in localStorage
            let authorEmail = '';
            const userProfileData = localStorage.getItem('userProfile');
            if (userProfileData) {
                const userProfile = JSON.parse(userProfileData);
                authorEmail = userProfile.email || '';
            }
            
            const requestData = {
                authorEmail: authorEmail,
                emailFrom: email,
                subject: subject,
                message: message
            };

            console.log(requestData);
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Send POST request to the authentication endpoint
            fetch('http://localhost:8080/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Extract the authentication URL from the response
                if (data && data.data && data.data.authUrl) {
                    const authUrl = data.data.authUrl;
                    console.log('Opening authentication URL:', authUrl);
                    
                    // Open the authentication URL in a new window/tab
                    window.open(authUrl, '_blank');
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Show success message
                    alert('Please complete authentication in the newly opened window');
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(error => {
                console.error('Error during form submission:', error);
                alert('An error occurred during form submission. Please try again.');
            })
            .finally(() => {
                // Restore button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }

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
    }
});