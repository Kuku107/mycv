document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectFormContainer = document.getElementById('project-form-container');
    const projectForm = document.getElementById('project-form');
    const projectsList = document.getElementById('projects-list');
    const uploadBtn = document.getElementById('upload-project-image');
    const deleteBtn = document.getElementById('delete-project-image');
    const imagePreview = document.getElementById('project-image-preview');
    const fileInput = document.getElementById('project-file-input');
    const projectIdInput = document.getElementById('project-id');
    const projectNameInput = document.getElementById('project-name');
    const demoUrlInput = document.getElementById('demo-url');
    const repoUrlInput = document.getElementById('repository-url');
    const descriptionInput = document.getElementById('description');
    const removeProjectBtn = document.getElementById('remove-project');
    const submitBtnText = document.getElementById('submit-btn-text');
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdown = document.querySelector('.dropdown-menu');
    
    // Track active edit form
    let activeEditForm = null;
    
    // Sample projects data (in a real app, this would come from a database)
    const projects = [
        {
            id: 1,
            name: 'Music Player',
            demoUrl: 'https://example.com/music-player',
            repoUrl: 'https://github.com/user/music-player',
            description: 'I was Junior Front-End Developers who are responsible for implementing visual and interactive elements that users see and interact with in a web application.',
            image: 'https://via.placeholder.com/120x200/4361ee/ffffff'
        },
        {
            id: 2,
            name: 'Movie Search App',
            demoUrl: 'https://example.com/movie-search',
            repoUrl: 'https://github.com/user/movie-search',
            description: 'This challenge is a great to practice working with external API. The challenge is to create a simple movie search to speech application that requires you to work with advanced JavaScript functionalities.',
            image: 'https://via.placeholder.com/120x200/e63946/ffffff'
        }
    ];
    
    // Event Listeners
    addProjectBtn.addEventListener('click', showAddProjectForm);
    projectForm.addEventListener('submit', handleFormSubmit);
    uploadBtn.addEventListener('click', handleImageUpload);
    deleteBtn.addEventListener('click', handleImageDelete);
    fileInput.addEventListener('change', handleFileSelection);
    removeProjectBtn.addEventListener('click', handleProjectRemove);
    document.getElementById('cancel-add-project').addEventListener('click', function() {
        projectFormContainer.classList.remove('active');
    });
    
    // Avatar dropdown functionality
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
        alert('Logging out...');
        window.location.href = '../Login/login.html';
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            editProject(projectId);
        });
    });
    
    // Navigate back to home
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function() {
            window.location.href = '../Home/home.html';
        });
    }
    
    // Functions
    function showAddProjectForm() {
        // Reset form
        projectForm.reset();
        projectIdInput.value = '';
        imagePreview.style.backgroundImage = 'none';
        imagePreview.classList.remove('has-image');
        imagePreview.innerHTML = '<i class="fas fa-image"></i>';
        
        // Show form
        projectFormContainer.classList.add('active');
        submitBtnText.textContent = 'Add';
        
        // Hide remove button for new projects
        removeProjectBtn.style.display = 'none';
        
        // Scroll to form
        projectFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function editProject(projectId) {
        // Find project in our sample data
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            // Close any open edit forms first
            if (activeEditForm) {
                activeEditForm.classList.remove('active');
            }
            
            // Get the edit form container for this project
            const editFormContainer = document.getElementById(`edit-form-${projectId}`);
            
            // If the form is already open, just close it and return
            if (editFormContainer.classList.contains('active')) {
                editFormContainer.classList.remove('active');
                activeEditForm = null;
                return;
            }
            
            // Create the edit form HTML
            const formHTML = `
                <div class="project-edit-form">
                    <div class="project-image-section">
                        <div class="project-image-container">
                            <div class="project-image" id="edit-image-preview-${projectId}">
                                ${project.image ? '' : '<i class="fas fa-image"></i>'}
                            </div>
                            <p class="image-requirements">Image must be PNG or JPEG - max 2MB</p>
                            <div class="image-actions">
                                <button type="button" class="btn btn-upload" id="edit-upload-image-${projectId}">
                                    <i class="fas fa-upload"></i> Upload Image
                                </button>
                                <button type="button" class="btn btn-delete" id="edit-delete-image-${projectId}">
                                    <i class="fas fa-trash"></i> Delete Image
                                </button>
                                <input type="file" id="edit-file-input-${projectId}" accept="image/png, image/jpeg" hidden>
                            </div>
                        </div>
                    </div>
                    
                    <form id="edit-form-${projectId}" class="edit-project-form">
                        <input type="hidden" id="edit-project-id-${projectId}" value="${projectId}">
                        <div class="form-group">
                            <label for="edit-project-name-${projectId}">Project Name</label>
                            <input type="text" id="edit-project-name-${projectId}" name="project-name" value="${project.name}" placeholder="Enter your project name">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-demo-url-${projectId}">Demo URL</label>
                            <input type="url" id="edit-demo-url-${projectId}" name="demo-url" value="${project.demoUrl}" placeholder="Enter the demo URL">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-repository-url-${projectId}">Repository URL</label>
                            <input type="url" id="edit-repository-url-${projectId}" name="repository-url" value="${project.repoUrl}" placeholder="Enter the repository URL">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-description-${projectId}">Description</label>
                            <textarea id="edit-description-${projectId}" name="description" placeholder="Enter a short description...">${project.description}</textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-remove" id="edit-remove-project-${projectId}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            <div class="action-buttons">
                                <button type="button" class="btn btn-cancel" id="edit-cancel-${projectId}">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                                <button type="submit" class="btn btn-add">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            `;
            
            // Insert the form HTML
            editFormContainer.innerHTML = formHTML;
            
            // Set image if exists
            const editImagePreview = document.getElementById(`edit-image-preview-${projectId}`);
            if (project.image) {
                editImagePreview.style.backgroundImage = `url(${project.image})`;
                editImagePreview.classList.add('has-image');
            }
            
            // Show the form
            editFormContainer.classList.add('active');
            activeEditForm = editFormContainer;
            
            // Add event listeners for the new form
            setupEditFormEventListeners(projectId, project);
            
            // Scroll to form
            editFormContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const projectId = projectIdInput.value ? parseInt(projectIdInput.value) : null;
        const projectData = {
            name: projectNameInput.value,
            demoUrl: demoUrlInput.value,
            repoUrl: repoUrlInput.value,
            description: descriptionInput.value,
            image: imagePreview.classList.contains('has-image') ? 
                   imagePreview.style.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1') : 
                   null
        };
        
        // In a real app, you would send this data to a server
        // For this demo, we'll just show a success message
        if (projectId) {
            alert(`Project "${projectData.name}" updated successfully!`);
        } else {
            alert(`Project "${projectData.name}" added successfully!`);
        }
        
        // Hide form
        projectFormContainer.classList.remove('active');
        
        // In a real app, you would refresh the projects list here
    }
    
    function handleImageUpload() {
        fileInput.click();
    }
    
    function handleFileSelection() {
        const file = this.files[0];
        if (file) {
            // Check file type
            if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
                alert('Please select a PNG or JPEG image.');
                return;
            }
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.style.backgroundImage = `url(${e.target.result})`;
                imagePreview.classList.add('has-image');
                imagePreview.innerHTML = '';
            };
            reader.readAsDataURL(file);
        }
    }
    
    function handleImageDelete() {
        imagePreview.style.backgroundImage = 'none';
        imagePreview.classList.remove('has-image');
        imagePreview.innerHTML = '<i class="fas fa-image"></i>';
        fileInput.value = '';
    }
    
    function setupEditFormEventListeners(projectId, project) {
        // Get form elements
        const editForm = document.getElementById(`edit-form-${projectId}`);
        const uploadBtn = document.getElementById(`edit-upload-image-${projectId}`);
        const deleteBtn = document.getElementById(`edit-delete-image-${projectId}`);
        const imagePreview = document.getElementById(`edit-image-preview-${projectId}`);
        const fileInput = document.getElementById(`edit-file-input-${projectId}`);
        const removeBtn = document.getElementById(`edit-remove-project-${projectId}`);
        const cancelBtn = document.getElementById(`edit-cancel-${projectId}`);
        
        // Handle image upload
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Check file type
                if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
                    alert('Please select a PNG or JPEG image.');
                    return;
                }
                
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size exceeds 2MB limit.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.style.backgroundImage = `url(${e.target.result})`;
                    imagePreview.classList.add('has-image');
                    imagePreview.innerHTML = '';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Handle image delete
        deleteBtn.addEventListener('click', function() {
            imagePreview.style.backgroundImage = 'none';
            imagePreview.classList.remove('has-image');
            imagePreview.innerHTML = '<i class="fas fa-image"></i>';
            fileInput.value = '';
        });
        
        // Handle form submission
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const updatedProject = {
                id: projectId,
                name: document.getElementById(`edit-project-name-${projectId}`).value,
                demoUrl: document.getElementById(`edit-demo-url-${projectId}`).value,
                repoUrl: document.getElementById(`edit-repository-url-${projectId}`).value,
                description: document.getElementById(`edit-description-${projectId}`).value,
                image: imagePreview.classList.contains('has-image') ? 
                       imagePreview.style.backgroundImage.replace(/url\(['"](.*)['"]\)/, '$1') : 
                       null
            };
            
            // In a real app, you would send this data to a server
            // For this demo, we'll just show a success message
            alert(`Project "${updatedProject.name}" updated successfully!`);
            
            // Update the project in our sample data
            const index = projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                projects[index] = updatedProject;
            }
            
            // Close the form
            const editFormContainer = document.getElementById(`edit-form-${projectId}`);
            editFormContainer.classList.remove('active');
            activeEditForm = null;
            
            // In a real app, you would refresh the project display here
        });
        
        // Handle cancel button
        cancelBtn.addEventListener('click', function() {
            // Close the form
            const editFormContainer = document.getElementById(`edit-form-${projectId}`);
            editFormContainer.classList.remove('active');
            activeEditForm = null;
        });
        
        // Handle project removal
        removeBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to remove "${project.name}"?`)) {
                // In a real app, you would send a delete request to the server
                alert(`Project "${project.name}" removed successfully!`);
                
                // Close the form
                const editFormContainer = document.getElementById(`edit-form-${projectId}`);
                editFormContainer.classList.remove('active');
                activeEditForm = null;
                
                // In a real app, you would remove the project from the DOM
                // For this demo, we'll just hide it
                const projectItem = document.querySelector(`.project-item[data-id="${projectId}"]`);
                projectItem.style.display = 'none';
            }
        });
    }
    
    function handleProjectRemove() {
        const projectId = projectIdInput.value ? parseInt(projectIdInput.value) : null;
        
        if (projectId) {
            // Find project in our sample data
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                if (confirm(`Are you sure you want to remove "${project.name}"?`)) {
                    // In a real app, you would send a delete request to the server
                    alert(`Project "${project.name}" removed successfully!`);
                    
                    // Hide form
                    projectFormContainer.classList.remove('active');
                    
                    // In a real app, you would refresh the projects list here
                }
            }
        }
    }
});
