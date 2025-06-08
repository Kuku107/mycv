/**
 * i18n.js - Internationalization module
 * Handles language switching and translations for the website
 */

// For browser environments, initialize the i18n namespace
window.i18n = window.i18n || {};

// Create a promise that resolves when translations are available
window.i18n.ready = new Promise(resolve => {
    const checkTranslations = () => {
        if (window.i18n.translations) {
            resolve(window.i18n.translations);
        } else {
            setTimeout(checkTranslations, 50);
        }
    };
    checkTranslations();
});

/**
 * i18n class for handling internationalization
 */
class I18n {
    constructor() {
        // Available languages
        this.languages = ['en', 'vi'];
        
        // Default language
        this.defaultLanguage = 'en';
        
        // First check URL parameter for language
        const urlLang = this._getLanguageFromUrl();
        
        // If URL has language parameter, use it, otherwise detect from storage/browser
        this.currentLanguage = urlLang || this._detectLanguage();
        
        // Save the current language to localStorage with consistent key name
        localStorage.setItem('i18n_language', this.currentLanguage);
        
        console.log(`I18n initialized with language: ${this.currentLanguage} (from URL: ${urlLang ? 'yes' : 'no'})`);
    }

    /**
     * Detect the preferred language
     * 1. Check localStorage
     * 2. Check navigator.language
     * 3. Fallback to default language
     * @returns {string} The detected language code
     */
    _detectLanguage() {
        // First check if we have a stored language preference
        // Try both new and old localStorage keys for backward compatibility
        const storedLang = localStorage.getItem('i18n_language') || localStorage.getItem('language');
        if (storedLang && this.languages.includes(storedLang)) {
            console.log(`Using stored language from localStorage: ${storedLang}`);
            return storedLang;
        }

        // Then check browser language
        if (navigator.language) {
            const browserLang = navigator.language.split('-')[0];
            if (this.languages.includes(browserLang)) {
                return browserLang;
            }
        }

        // Fallback to default
        return this.defaultLanguage;
    }

    /**
     * Get a translated string for a given key
     * @param {string} key - The translation key
     * @returns {string} Translated text or the key if translation not found
     */
    translate(key) {
        try {
            const translationsObj = window.i18n.translations;
            if (!translationsObj || !translationsObj[this.currentLanguage]) {
                console.warn(`No translations found for language: ${this.currentLanguage}`);
                return key;
            }
            
            if (!translationsObj[this.currentLanguage][key]) {
                console.warn(`Translation key not found: ${key} for language: ${this.currentLanguage}`);
            }
            
            return translationsObj[this.currentLanguage][key] || key;
        } catch (error) {
            console.error('Translation error:', error);
            return key;
        }
    }

    /**
     * Change the language
     * @param {string} lang - The language code to switch to
     */
    changeLanguage(lang) {
        if (!this.languages.includes(lang) || lang === this.currentLanguage) {
            return false;
        }
        
        console.log(`Language changed to: ${lang}`);
        
        // Store in localStorage with consistent key name
        localStorage.setItem('i18n_language', lang);
        // For backward compatibility, also set the old key
        localStorage.setItem('language', lang);
        
        // Force refresh API cache
        this._forceApiCacheRefresh();
        
        // Update current language
        this.currentLanguage = lang;
        
        // Update all translated elements
        this.applyTranslations();
        
        // Show notification
        const message = lang === 'en' ? 'Changed to English' : 'Đã chuyển sang Tiếng Việt';
        this._showLanguageChangeNotification(message);
        
        // Dispatch event for other components to know language changed
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        return true;
    }

    /**
     * Get the current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Update the language switcher UI to reflect current language
     * and ensure event listeners are still attached
     */
    _updateLanguageSwitcherUI() {
        const languageSwitcher = document.querySelector('.language-switcher');
        if (languageSwitcher) {
            console.log('Updating language switcher UI');
            
            // Remove active class from all buttons
            const buttons = languageSwitcher.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                
                // Re-attach event listeners to ensure they work
                const lang = btn.getAttribute('data-lang');
                if (lang) {
                    // Remove old listeners by cloning
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Add fresh event listener
                    const i18nInstance = this;
                    newBtn.addEventListener('click', function() {
                        console.log(`Language button clicked: ${lang}`);
                        i18nInstance.changeLanguage(lang);
                    });
                }
            });
            
            // Add active class to current language button
            const currentLangBtn = languageSwitcher.querySelector(`button[data-lang="${this.currentLanguage}"]`);
            if (currentLangBtn) {
                currentLangBtn.classList.add('active');
            }
        } else {
            console.warn('Language switcher not found in DOM');
        }
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        // Apply translations
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            // Special handling for input placeholders
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } 
            // Special handling for option values
            else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } 
            // Default handling for other elements
            else {
                element.textContent = translation;
            }
        });
    }

    /**
     * Initial setup of i18n functionality
     * - Creates language switcher
     * - Applies initial translations
     */
    init() {
        // Set Accept-Language header for future requests
        this._setupRequestInterceptor();
        
        // Create and add the language switcher
        this._createLanguageSwitcher();
        
        // Apply translations immediately when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyInitialTranslations();
            });
        } else {
            this.applyInitialTranslations();
        }
        
        // Also apply translations when includes are loaded
        this._setupMutationObserver();
    }
    
    /**
     * Force refresh of any API cache when language changes
     * This helps ensure new requests don't use cached responses from previous language
     */
    _forceApiCacheRefresh() {
        console.log('Forcing API cache refresh due to language change');
        // Add a timestamp to localStorage to invalidate any cached API responses
        localStorage.setItem('i18n_cache_timestamp', Date.now());
    }
    
    /**
     * Show a notification when language changes
     * @param {string} message - The message to display
     */
    _showLanguageChangeNotification(message) {
        // Create or reuse notification element
        let notification = document.getElementById('language-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'language-notification';
            notification.style.position = 'fixed';
            notification.style.top = '70px'; // Increased to avoid overlapping with header elements
            notification.style.right = '20px';
            notification.style.padding = '10px 15px';
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            notification.style.zIndex = '1000'; // Lower z-index to not interfere with controls
            notification.style.transition = 'opacity 0.5s';
            notification.style.pointerEvents = 'none'; // Important: allows clicks to pass through
            document.body.appendChild(notification);
        }
        
        // Set message and show notification
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // Hide after 2 seconds (reduced from 3)
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000);
    }

    /**
     * Apply initial translations and update UI
     */
    applyInitialTranslations() {
        // Log the current language being applied
        console.log(`Applying initial translations for language: ${this.currentLanguage}`);
        
        // Apply translations
        this.applyTranslations();
        
        // Update UI to show current language
        this._updateLanguageSwitcherUI();
        
        // Process page links to add language parameter
        this._addLanguageToPageLinks();
    }
    
    /**
     * Setup mutation observer to watch for DOM changes and apply translations
     * This handles cases when content is loaded dynamically after page load
     */
    _setupMutationObserver() {
        // Create a mutation observer to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Apply translations to newly added elements
                    this.applyTranslations();
                }
            }
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Create the language switcher UI
     */
    _createLanguageSwitcher() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._createLanguageSwitcherElement());
        } else {
            this._createLanguageSwitcherElement();
        }
    }

    /**
     * Create the actual language switcher element
     */
    _createLanguageSwitcherElement() {
        // Check if header exists in the document
        const headerNav = document.querySelector('.nav-menu .nav ul');
        if (!headerNav) {
            console.log('Header navigation not found, retrying in 300ms');
            // Wait for header to load from includes.js
            setTimeout(() => this._createLanguageSwitcherElement(), 300);
            return;
        }
        
        console.log('Header navigation found, adding language switcher');
        
        // Check if language switcher already exists
        if (document.querySelector('.language-switcher')) {
            console.log('Language switcher already exists, not adding again');
            return;
        }

        // Create language switcher container
        const switcher = document.createElement('li');
        switcher.className = 'language-switcher';
        
        // Create English button
        const enButton = document.createElement('button');
        enButton.textContent = 'EN';
        enButton.setAttribute('data-lang', 'en');
        if (this.currentLanguage === 'en') {
            enButton.classList.add('active');
        }
        enButton.addEventListener('click', () => this.changeLanguage('en'));
        
        // Create separator
        const separator = document.createElement('span');
        separator.textContent = '|';
        separator.className = 'language-separator';
        
        // Create Vietnamese button
        const viButton = document.createElement('button');
        viButton.textContent = 'VI';
        viButton.setAttribute('data-lang', 'vi');
        if (this.currentLanguage === 'vi') {
            viButton.classList.add('active');
        }
        viButton.addEventListener('click', () => this.changeLanguage('vi'));
        
        // Append buttons to switcher
        switcher.appendChild(enButton);
        switcher.appendChild(separator);
        switcher.appendChild(viButton);
        
        // Add switcher to header
        headerNav.appendChild(switcher);
        
        // Add some inline styles to make the language switcher look nice
        const style = document.createElement('style');
        style.textContent = `
            .language-switcher {
                display: flex;
                align-items: center;
                margin-left: 15px;
                padding: 0 5px;
            }
            .language-switcher button {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                padding: 5px 8px;
                color: #555;
                font-weight: 500;
                transition: color 0.3s;
            }
            .language-switcher button:hover {
                color: #000;
            }
            .language-switcher button.active {
                color: #2d2d2d;
                font-weight: 700;
            }
            .language-separator {
                color: #ccc;
                margin: 0 2px;
            }
            @media (max-width: 768px) {
                .language-switcher {
                    margin-left: 0;
                    margin-top: 15px;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup a request interceptor to add Accept-Language header
     * This is redesigned to ensure the language is always current
     */
    _setupRequestInterceptor() {
        // Only set up once to avoid multiple overrides
        if (window._i18nInterceptorsInitialized) {
            console.log('Request interceptors already initialized, skipping');
            return;
        }
        
        // Store original fetch function
        if (!window._originalFetch) {
            window._originalFetch = window.fetch;
        }
        
        // Store original XHR open
        if (!window._originalXHROpen) {
            window._originalXHROpen = XMLHttpRequest.prototype.open;
        }
        
        // Override fetch to add headers - using a direct reference to window.i18n to always get latest
        window.fetch = function(url, options = {}) {
            // Create headers if they don't exist
            options.headers = options.headers || {};
            
            // IMPORTANT: Always get current language directly from the i18n instance
            const currentLang = window.i18n.instance.getCurrentLanguage();
            
            // Log for debugging
            console.log(`Fetch request to ${url} with language: ${currentLang}`);
            
            if (typeof options.headers.append === 'function') {
                options.headers.append('Accept-Language', currentLang);
            } else {
                options.headers['Accept-Language'] = currentLang;
            }
            
            // Call original fetch with modified options
            return window._originalFetch(url, options);
        };
        
        // Also handle XMLHttpRequest for legacy code
        XMLHttpRequest.prototype.open = function() {
            const result = window._originalXHROpen.apply(this, arguments);
            
            // Add custom onreadystatechange to set header right before sending
            const originalSend = this.send;
            this.send = function() {
                // Get current language right at the moment of sending
                const currentLang = window.i18n.instance.getCurrentLanguage();
                console.log(`XHR request to ${arguments[1]} with language: ${currentLang}`);
                
                // Set header with the current language
                this.setRequestHeader('Accept-Language', currentLang);
                
                // Call original send
                return originalSend.apply(this, arguments);
            };
            
            return result;
        };
        
        // Mark as initialized
        window._i18nInterceptorsInitialized = true;
        console.log('Request interceptors initialized successfully');
    }
    
    /**
     * Get language from URL parameter
     * @returns {string|null} Language code or null if not found
     */
    _getLanguageFromUrl() {
        try {
            const url = new URL(window.location.href);
            const lang = url.searchParams.get('lang');
            
            // Only return if it's a valid language
            if (lang && this.languages.includes(lang)) {
                console.log(`Found language in URL: ${lang}`);
                return lang;
            }
        } catch (error) {
            console.error('Error parsing URL:', error);
        }
        
        return null;
    }
    
    /**
     * Add language parameter to all internal page links
     */
    _addLanguageToPageLinks() {
        // Process links when DOM is fully loaded
        const processLinks = () => {
            // Get all links in the document
            const links = document.querySelectorAll('a');
            console.log(`Processing ${links.length} links on page to add language parameter`);
            
            links.forEach(link => {
                // Only process internal links (same origin or relative paths)
                try {
                    const href = link.getAttribute('href');
                    if (!href) return;
                    
                    // Skip if it's an anchor link, a javascript: link, or an external link
                    if (href.startsWith('#') || 
                        href.startsWith('javascript:') || 
                        href.startsWith('tel:') || 
                        href.startsWith('mailto:') ||
                        (href.includes('://') && !href.includes(window.location.hostname))) {
                        return;
                    }
                    
                    // Remove existing click handlers for language parameter by adding data attribute
                    if (link.getAttribute('data-i18n-processed') === 'true') {
                        return;
                    }
                    
                    // Mark link as processed
                    link.setAttribute('data-i18n-processed', 'true');
                    
                    // Add click handler
                    link.addEventListener('click', (e) => {
                        // Don't interfere with ctrl/cmd click (open in new tab)
                        if (e.ctrlKey || e.metaKey) return;
                        
                        // Prevent default action to modify URL first
                        e.preventDefault();
                        
                        // Get current URL object
                        let url;
                        try {
                            // Handle both absolute and relative URLs
                            url = new URL(link.href, window.location.origin);
                        } catch (error) {
                            console.error('Error creating URL from href:', link.href);
                            window.location.href = link.href; // Fallback to original link
                            return;
                        }
                        
                        // Add current language as parameter
                        url.searchParams.set('lang', this.currentLanguage);
                        
                        // Navigate to modified URL
                        window.location.href = url.toString();
                    });
                } catch (error) {
                    console.error('Error processing link:', error);
                }
            });
        };
        
        // Process links now and also after a short delay to catch dynamically added links
        if (document.readyState === 'complete') {
            processLinks();
        } else {
            window.addEventListener('load', processLinks);
        }
        
        // Also setup MutationObserver to handle dynamically added links
        const linkObserver = new MutationObserver((mutations) => {
            let hasNewLinks = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'A' || 
                            (node.nodeType === Node.ELEMENT_NODE && node.querySelector('a'))) {
                            hasNewLinks = true;
                        }
                    });
                }
            });
            
            if (hasNewLinks) {
                console.log('New links detected, processing...');
                processLinks();
            }
        });
        
        linkObserver.observe(document.body, { childList: true, subtree: true });
        console.log('Link observer set up for language parameters');
    }
}

// Create and export i18n instance
const i18n = new I18n();

// Export for CommonJS / RequireJS / Browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { i18n };
} else {
    // For browser environments
    window.i18n = window.i18n || {};
    window.i18n.instance = i18n;
}
