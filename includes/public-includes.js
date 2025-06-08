document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerPlaceholder = document.querySelector('header');
    if (headerPlaceholder) {
        fetch('../includes/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;

                const navToggleEl = document.querySelector(".navbar-toggle");
                const navMenuEl = document.querySelector(".nav-menu");
                navToggleEl.addEventListener("click", () => {
                    navToggleEl.classList.toggle("active");
                    navMenuEl.classList.toggle("active");
                });
            })
            .catch(error => console.error('Error loading header:', error));
    }

    // Load footer
    const footerPlaceholder = document.querySelector('footer');
    if (footerPlaceholder) {
        fetch('../includes/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Initialize back to top button if present
                const backToTopButton = document.getElementById('back-to-top');
                if (backToTopButton) {
                    window.onscroll = function() {
                        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                            backToTopButton.style.display = "block";
                        } else {
                            backToTopButton.style.display = "none";
                        }
                    };
                    
                    backToTopButton.addEventListener('click', function() {
                        document.body.scrollTop = 0;
                        document.documentElement.scrollTop = 0;
                    });
                }
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

// Helper function for loading scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Helper function for loading stylesheets dynamically
function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    document.head.appendChild(link);
}
