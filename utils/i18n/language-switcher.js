/**
 * language-switcher.js
 * This file handles the creation and functionality of the language switcher component
 */

// Thực thi ngay khi script được tải
(function() {
    // Kiểm tra xem DOM đã sẵn sàng chưa
    if (document.readyState === 'loading') {
        // Nếu DOM đang tải, đặt sự kiện DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            createLanguageSwitcher();
        });
    } else {
        // Nếu DOM đã sẵn sàng, tạo language switcher ngay lập tức
        createLanguageSwitcher();
    }
})();

/**
 * Creates and adds the language switcher to the header
 */
function createLanguageSwitcher() {
    console.log('Creating language switcher...');
    
    // Check if language switcher already exists
    if (document.querySelector('.language-switcher')) {
        console.log('Language switcher already exists, not creating again.');
        return;
    }
    
    // Find the right place to add the language switcher
    // Strategy 1: For auth pages (Home, Project, Profile)
    const authHeader = document.querySelector('.main-header');
    if (authHeader) {
        // For auth pages, create a special header language switcher
        createAuthHeaderLanguageSwitcher(authHeader);
        return;
    }
    
    // Strategy 2: For main site pages with regular nav structure
    const mainNav = document.querySelector('.nav-menu .nav ul');
    if (mainNav) {
        targetElement = mainNav;
    } else {
        // Strategy 3: Any header as fallback
        const header = document.querySelector('header');
        if (header) {
            targetElement = header;
        } else {
            // Last resort: Create a floating language switcher
            console.log('No suitable target found. Creating floating language switcher');
            createFloatingLanguageSwitcher();
            return;
        }
    }
    
    console.log('Target element found, adding language switcher');
    
    // Get current language from localStorage or use default
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Create language switcher container
    const switcher = document.createElement('li');
    switcher.className = 'language-switcher';
    
    // Create English button
    const enButton = document.createElement('button');
    enButton.textContent = 'EN';
    enButton.setAttribute('data-lang', 'en');
    if (currentLang === 'en') {
        enButton.classList.add('active');
    }
    enButton.addEventListener('click', () => changeLanguage('en'));
    
    // Create separator
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.className = 'language-separator';
    
    // Create Vietnamese button
    const viButton = document.createElement('button');
    viButton.textContent = 'VI';
    viButton.setAttribute('data-lang', 'vi');
    if (currentLang === 'vi') {
        viButton.classList.add('active');
    }
    viButton.addEventListener('click', () => changeLanguage('vi'));
    
    // Append buttons to switcher
    switcher.appendChild(enButton);
    switcher.appendChild(separator);
    switcher.appendChild(viButton);
    
    // Add switcher to the target element
    if (targetElement.tagName === 'UL') {
        // For ul elements, add as a list item
        targetElement.appendChild(switcher);
    } else {
        // For other elements, just append to them
        targetElement.appendChild(switcher);
    }
    
    console.log('Language switcher added to page');
}

/**
 * Changes the current language
 * @param {string} lang - Language code ('en' or 'vi')
 */
function changeLanguage(lang) {
    console.log(`Changing language to ${lang}`);
    
    // Store language preference
    localStorage.setItem('language', lang);
    
    // Update UI
    const enButton = document.querySelector('.language-switcher button[data-lang="en"]');
    const viButton = document.querySelector('.language-switcher button[data-lang="vi"]');
    
    if (enButton && viButton) {
        if (lang === 'en') {
            enButton.classList.add('active');
            viButton.classList.remove('active');
        } else {
            viButton.classList.add('active');
            enButton.classList.remove('active');
        }
    }
    
    // If i18n instance exists, use it to change language
    if (window.i18n && window.i18n.instance) {
        window.i18n.instance.changeLanguage(lang);
    } else {
        // Otherwise, reload the page to apply new language
        location.reload();
    }
}

/**
 * Creates a language switcher specifically for auth header pages
 * @param {HTMLElement} header - The header element to add the language switcher to
 */
function createAuthHeaderLanguageSwitcher(header) {
    // Get current language from localStorage or use default
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Create a container for the language switcher that will go in the header
    const switcherContainer = document.createElement('div');
    switcherContainer.className = 'language-switcher auth-language-switcher';
    
    // Create English button
    const enButton = document.createElement('button');
    enButton.textContent = 'EN';
    enButton.setAttribute('data-lang', 'en');
    if (currentLang === 'en') {
        enButton.classList.add('active');
    }
    enButton.addEventListener('click', () => changeLanguage('en'));
    
    // Create separator
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.className = 'language-separator';
    
    // Create Vietnamese button
    const viButton = document.createElement('button');
    viButton.textContent = 'VI';
    viButton.setAttribute('data-lang', 'vi');
    if (currentLang === 'vi') {
        viButton.classList.add('active');
    }
    viButton.addEventListener('click', () => changeLanguage('vi'));
    
    // Append buttons to container
    switcherContainer.appendChild(enButton);
    switcherContainer.appendChild(separator);
    switcherContainer.appendChild(viButton);
    
    // Try to find a suitable position in the header
    // First try to place it after the logo but before user menu
    const logo = header.querySelector('.logo');
    const userMenu = header.querySelector('.user-menu');
    
    if (logo && userMenu) {
        // Insert between logo and user-menu
        header.insertBefore(switcherContainer, userMenu);
    } else {
        // Just append to the header
        header.appendChild(switcherContainer);
    }
    
    console.log('Language switcher added to auth header');
}

/**
 * Creates a floating language switcher that appears in the top-right corner
 * This is used as a fallback when no suitable target element is found
 */
function createFloatingLanguageSwitcher() {
    // Get current language from localStorage or use default
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Create floating container
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'language-switcher floating-language-switcher';
    
    // Create English button
    const enButton = document.createElement('button');
    enButton.textContent = 'EN';
    enButton.setAttribute('data-lang', 'en');
    if (currentLang === 'en') {
        enButton.classList.add('active');
    }
    enButton.addEventListener('click', () => changeLanguage('en'));
    
    // Create separator
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.className = 'language-separator';
    
    // Create Vietnamese button
    const viButton = document.createElement('button');
    viButton.textContent = 'VI';
    viButton.setAttribute('data-lang', 'vi');
    if (currentLang === 'vi') {
        viButton.classList.add('active');
    }
    viButton.addEventListener('click', () => changeLanguage('vi'));
    
    // Append buttons to container
    floatingContainer.appendChild(enButton);
    floatingContainer.appendChild(separator);
    floatingContainer.appendChild(viButton);
    
    // Add styles for positioning
    Object.assign(floatingContainer.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999'
    });
    
    // Add to body
    document.body.appendChild(floatingContainer);
    
    console.log('Floating language switcher added to page');
}
