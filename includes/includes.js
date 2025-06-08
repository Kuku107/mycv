document.addEventListener('DOMContentLoaded', function() {
    // Load i18n resources
    loadScript('../../utils/i18n/translations.js')
        .then(() => loadScript('../../utils/i18n/i18n.js'))
        .then(() => loadScript('../../utils/i18n/language-switcher.js'))
        .then(() => {
            // Load CSS for i18n components
            loadStylesheet('../../utils/i18n/i18n.css');
        })
        .catch(error => console.error('Error loading i18n resources:', error));

    // Load header
    const headerPlaceholder = document.querySelector('header');
    if (headerPlaceholder) {
        fetch('../../includes/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;

                const navToggleEl = document.querySelector(".navbar-toggle");
                const navMenuEl = document.querySelector(".nav-menu");
                navToggleEl.addEventListener("click", () => {
                    navToggleEl.classList.toggle("active");
                    navMenuEl.classList.toggle("active");
                });

                // Apply i18n translations to header elements
                addI18nAttributes('.nav-menu .nav ul li a', {
                    'About': 'header_about',
                    'Projects': 'header_projects',
                    'Pricing': 'header_pricing',
                    'Blog': 'header_blog'
                });
                
                addI18nAttributes('.nav-menu .contact a', {
                    'Contact': 'header_contact'
                });
                
                // Initialize i18n after header is loaded
                initializeI18nWhenAvailable();
            })
            .catch(error => console.error('Error loading header:', error));
    }

    // Load footer
    const footerPlaceholder = document.querySelector('footer');
    if (footerPlaceholder) {
        fetch('../../includes/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Apply i18n translations to footer elements
                addI18nAttributes('.footer-links .link-group:first-child h5', { 
                    'Menu': 'footer_menu' 
                });
                
                addI18nAttributes('.footer-links .link-group:first-child ul li a', {
                    'About': 'footer_about',
                    'Projects': 'footer_projects',
                    'Blog': 'footer_blog',
                    'Contact': 'footer_contact'
                });
                
                addI18nAttributes('.footer-links .link-group:last-child h5', { 
                    'Service': 'footer_service' 
                });
                
                addI18nAttributes('.footer-links .link-group:last-child ul li a', {
                    'Design': 'footer_design',
                    'Development': 'footer_development',
                    'Marketing': 'footer_marketing',
                    'See more': 'footer_see_more'
                });
                
                addI18nAttributes('.copyright p', { 
                    'Copyright 2022 Laaqiq. All Rights Reserved.': 'footer_copyright' 
                });
                
                addI18nAttributes('.terms p', {
                    'Terms of Use': 'footer_terms',
                    'Privacy Policy': 'footer_privacy'
                });
                
                // Apply translations if i18n is available
                applyI18nIfAvailable();
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

/**
 * Helper function to load a JavaScript file dynamically
 * @param {string} url - URL of the script to load
 * @returns {Promise} - Promise that resolves when the script is loaded
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

/**
 * Helper function to load a CSS file dynamically
 * @param {string} url - URL of the stylesheet to load
 * @returns {Promise} - Promise that resolves when the stylesheet is loaded
 */
function loadStylesheet(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
        document.head.appendChild(link);
    });
}

/**
 * Add data-i18n attributes to elements based on text content
 * @param {string} selector - CSS selector for elements to add attributes to
 * @param {Object} mappings - Object mapping text content to i18n keys
 */
function addI18nAttributes(selector, mappings) {
    // Wait for next tick to ensure DOM is updated
    setTimeout(() => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const content = element.textContent.trim();
            if (mappings[content]) {
                element.setAttribute('data-i18n', mappings[content]);
            }
        });
    }, 0);
}

/**
 * Initialize i18n when it becomes available
 */
function initializeI18nWhenAvailable() {
    if (window.i18n && window.i18n.instance) {
        window.i18n.instance.init();
    } else {
        // Retry after a short delay
        setTimeout(initializeI18nWhenAvailable, 100);
    }
}

/**
 * Apply i18n translations if available
 */
function applyI18nIfAvailable() {
    if (window.i18n && window.i18n.instance) {
        window.i18n.instance.applyTranslations();
    }
}

