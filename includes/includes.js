document.addEventListener('DOMContentLoaded', function() {
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
                })
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
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

