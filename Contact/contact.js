document.addEventListener("DOMContentLoaded", function () {
    // Apply i18n to Contact page elements
    function applyContactPageTranslations() {
        if (!window.i18n || !window.i18n.instance) {
            // If i18n is not yet available, try again after a short delay
            setTimeout(applyContactPageTranslations, 100);
            return;
        }
        
        // Add i18n attributes to page elements
        // Hero section
        document.querySelector('#hero h1')?.setAttribute('data-i18n', 'contact_title');
        const heroDescription = document.querySelector('#hero p.txt');
        if (heroDescription) {
            heroDescription.setAttribute('data-i18n', 'contact_description');
        }
        
        // Get in touch form
        document.querySelector('#git form h4')?.setAttribute('data-i18n', 'contact_get_in_touch');
        document.querySelector('#email')?.setAttribute('data-i18n', 'contact_email_placeholder');
        
        // Form elements - special handling for select options
        const subjectSelect = document.querySelector('#subject');
        if (subjectSelect) {
            subjectSelect.options[0].setAttribute('data-i18n', 'contact_select_subject');
            subjectSelect.options[1].setAttribute('data-i18n', 'contact_general');
            subjectSelect.options[2].setAttribute('data-i18n', 'contact_project');
            subjectSelect.options[3].setAttribute('data-i18n', 'contact_feedback');
            subjectSelect.options[4].setAttribute('data-i18n', 'contact_freelance');
            subjectSelect.options[5].setAttribute('data-i18n', 'contact_other');
        }
        
        document.querySelector('#message')?.setAttribute('data-i18n', 'contact_message_placeholder');
        document.querySelector('#git form button')?.setAttribute('data-i18n', 'contact_submit_now');
        
        // Contact info cards
        const phoneTitle = document.querySelector('.card_item:nth-child(1) .card_title h5');
        if (phoneTitle) phoneTitle.setAttribute('data-i18n', 'contact_phone');
        
        const emailTitle = document.querySelector('.card_item:nth-child(2) .card_title h5');
        if (emailTitle) emailTitle.setAttribute('data-i18n', 'contact_email');
        
        const addressTitle = document.querySelector('.card_item:nth-child(3) .card_title h5');
        if (addressTitle) addressTitle.setAttribute('data-i18n', 'contact_address');
        
        const addressValue = document.querySelector('.card_item:nth-child(3) .txt_big');
        if (addressValue) addressValue.setAttribute('data-i18n', 'contact_address_value');
        
        // FAQ section
        document.querySelector('#faq h5')?.setAttribute('data-i18n', 'faq_title');
        document.querySelector('#faq h3')?.setAttribute('data-i18n', 'faq_subtitle');
        
        const faqDescription = document.querySelector('#faq .content p.txt:first-of-type');
        if (faqDescription) faqDescription.setAttribute('data-i18n', 'faq_description');
        
        const faqAskUs = document.querySelector('#faq .content p.txt:last-of-type');
        if (faqAskUs) faqAskUs.setAttribute('data-i18n', 'faq_ask_us');
        
        // FAQ questions and answers
        const q1 = document.querySelector('label[for="question1"] span');
        if (q1) q1.setAttribute('data-i18n', 'faq_q1');
        const a1 = document.querySelector('#question1 + label + .question_content p');
        if (a1) a1.setAttribute('data-i18n', 'faq_a1');
        
        const q2 = document.querySelector('label[for="question2"] span');
        if (q2) q2.setAttribute('data-i18n', 'faq_q2');
        const a2 = document.querySelector('#question2 + label + .question_content p');
        if (a2) a2.setAttribute('data-i18n', 'faq_a2');
        
        const q3 = document.querySelector('label[for="question3"] span');
        if (q3) q3.setAttribute('data-i18n', 'faq_q3');
        const a3 = document.querySelector('#question3 + label + .question_content p');
        if (a3) a3.setAttribute('data-i18n', 'faq_a3');
        
        const q4 = document.querySelector('label[for="question4"] span');
        if (q4) q4.setAttribute('data-i18n', 'faq_q4');
        const a4 = document.querySelector('#question4 + label + .question_content p');
        if (a4) a4.setAttribute('data-i18n', 'faq_a4');
        
        // Apply translations
        window.i18n.instance.applyTranslations();
    }
    
    // Call after a delay to ensure the DOM is fully loaded
    setTimeout(applyContactPageTranslations, 500);
    
    // Setup event listener for language changes to reapply translations
    document.addEventListener('languageChanged', function() {
        applyContactPageTranslations();
    });

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
            fetch('https://mycv-backend.onrender.com/auth/google', {
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