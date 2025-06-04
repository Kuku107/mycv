import { fetchWithTokenRefresh } from '../../utils/api.js';

// Hàm tạo UUID bằng tay - được sử dụng cho tất cả các trường hợp upload ảnh
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Load user profile data from localStorage
    UserProfile.updateUserMenuFromStorage();
    
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
    const projectTagSelect = document.getElementById('project-tag');
    const demoUrlInput = document.getElementById('demo-url');
    const repoUrlInput = document.getElementById('repository-url');
    const descriptionInput = document.getElementById('description');
    const removeProjectBtn = document.getElementById('remove-project');
    const submitBtnText = document.getElementById('submit-btn-text');
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdown = document.querySelector('.dropdown-menu');
    const errorMessageContainer = document.getElementById('project-form-error');
    
    // Track active edit form
    let activeEditForm = null;
    
    // Projects data will be fetched from API
    let projects = [];
    let currentPage = 0;
    let totalPages = 0;
    let pageSize = 10;
    
    // Direct edit form handler for the onclick attribute
    window.showEditForm = function(projectId) {
        console.log('Direct showEditForm called for project ID:', projectId);
        
        // Close any open edit forms first
        if (activeEditForm) {
            activeEditForm.style.display = 'none';
        }
        
        // Find the project using the id field
        const project = projects.find(p => {
            return String(p.id) === String(projectId);
        });
        
        if (!project) {
            console.error('Project not found with ID:', projectId);
            return;
        }
        

        
        // Get the project ID from the id field
        const projectIdToUse = project.id;
        
        // Get the edit form container
        const editFormContainer = document.getElementById(`edit-form-${projectIdToUse}`);
        if (!editFormContainer) {
            console.error('Edit form container not found for project ID:', projectIdToUse);
            return;
        }
        
        // Generate the edit form HTML
        
        const tagOptions = generateTagOptions(project.tag);
        
        const editFormHTML = `
            <div class="form-card">
                <div class="project-image-section">
                    <div class="project-image-container">
                        <div class="project-image" id="edit-project-image-preview-${projectIdToUse}">
                            ${project.projectImageUrl 
                                ? `<img src="${encodeURI(project.projectImageUrl)}" alt="${project.projectName || 'Project image'}" />` 
                                : '<i class="fas fa-image"></i>'}
                        </div>
                        <p class="image-requirements">Image must be PNG or JPEG - max 2MB</p>
                        <div class="image-actions">
                            <button type="button" class="btn btn-outline" id="edit-upload-project-image-${projectIdToUse}">
                                <i class="fas fa-upload"></i> Upload Image
                            </button>
                            <button type="button" class="btn btn-outline btn-danger" id="edit-delete-project-image-${projectIdToUse}">
                                <i class="fas fa-trash"></i> Delete Image
                            </button>
                            <input type="file" id="edit-project-file-input-${projectIdToUse}" accept="image/png, image/jpeg" hidden>
                        </div>
                    </div>
                </div>
                
                <form id="edit-project-form-${projectIdToUse}" class="project-details-form">
                    <input type="hidden" id="edit-project-id-${projectIdToUse}" value="${projectIdToUse}">
                    
                    <div class="form-group">
                        <label for="edit-project-name-${projectIdToUse}">Project Name <span class="required">*</span></label>
                        <input type="text" id="edit-project-name-${projectIdToUse}" name="edit-project-name" 
                            placeholder="Enter your project name" value="${project.projectName || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-project-tag-${projectIdToUse}">Tag <span class="required">*</span></label>
                        <select id="edit-project-tag-${projectIdToUse}" name="edit-project-tag" required>
                            ${tagOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-demo-url-${projectIdToUse}">Demo URL</label>
                        <input type="text" id="edit-demo-url-${projectIdToUse}" name="edit-demo-url" 
                            placeholder="Enter the demo URL" value="${project.projectDemoUrl || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-repository-url-${projectIdToUse}">Repository URL</label>
                        <input type="text" id="edit-repository-url-${projectIdToUse}" name="edit-repository-url" 
                            placeholder="Enter the repository URL" value="${project.projectRepoUrl || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-description-${projectIdToUse}">Description</label>
                        <textarea id="edit-description-${projectIdToUse}" name="edit-description" 
                            placeholder="Enter a short description...">${project.description || ''}</textarea>
                    </div>
                    
                    <!-- Error message container -->
                    <div class="error-message" id="edit-project-form-error-${projectIdToUse}" style="display: none;"></div>
                    
                    <div class="form-actions">
                        <div class="action-buttons">
                            <button type="button" class="btn btn-outline btn-danger" id="edit-remove-project-${projectIdToUse}">
                                Remove
                            </button>
                            <div class="primary-actions">
                                <button type="button" class="btn btn-outline" id="edit-cancel-${projectIdToUse}">
                                    Cancel
                                </button>
                                <button type="button" class="btn btn-primary" id="edit-save-project-${projectIdToUse}">
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                </div>
            </div>
        `;
        
        // Insert the form HTML
        editFormContainer.innerHTML = editFormHTML;
        editFormContainer.style.display = 'block';
        
        // Set as active edit form
        activeEditForm = editFormContainer;
        
        // Setup event listeners for the edit form
        setupEditFormEventListeners(projectIdToUse, project);
        
        // Style the tag select
        styleTagSelect();
        
        // Scroll to the edit form
        editFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    
    // Function to close edit form
    function closeEditForm(projectId) {
        const editFormContainer = document.getElementById(`edit-form-${projectId}`);
        if (editFormContainer) {
            editFormContainer.style.display = 'none';
            activeEditForm = null;
        }
    }
    
    // Function to set up event listeners for the edit form
    function setupEditFormEventListeners(projectId, project) {
        // Use the id field from the project
        const projectIdToUse = project.id;
        
        const uploadBtn = document.getElementById(`edit-upload-project-image-${projectIdToUse}`);
        const deleteBtn = document.getElementById(`edit-delete-project-image-${projectIdToUse}`);
        const fileInput = document.getElementById(`edit-project-file-input-${projectIdToUse}`);
        const imagePreview = document.getElementById(`edit-project-image-preview-${projectIdToUse}`);
        const saveBtn = document.getElementById(`edit-save-project-${projectIdToUse}`);
        const cancelBtn = document.getElementById(`edit-cancel-${projectIdToUse}`);
        const removeBtn = document.getElementById(`edit-remove-project-${projectIdToUse}`);
        const errorMessageContainer = document.getElementById(`edit-project-form-error-${projectIdToUse}`);
        
        // Upload button click handler
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // File input change handler
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
        
        // Delete image button click handler
        deleteBtn.addEventListener('click', function() {
            imagePreview.style.backgroundImage = 'none';
            imagePreview.classList.remove('has-image');
            imagePreview.innerHTML = '<i class="fas fa-image"></i>';
            fileInput.value = '';
        });
        
        // Save button click handler
        saveBtn.addEventListener('click', function() {
            // Reset error message
            errorMessageContainer.style.display = 'none';
            errorMessageContainer.textContent = '';
            
            // Get form data
            const projectName = document.getElementById(`edit-project-name-${projectIdToUse}`).value;
            const tag = document.getElementById(`edit-project-tag-${projectIdToUse}`).value;
            const demoUrl = document.getElementById(`edit-demo-url-${projectIdToUse}`).value;
            const repoUrl = document.getElementById(`edit-repository-url-${projectIdToUse}`).value;
            const description = document.getElementById(`edit-description-${projectIdToUse}`).value;
            
            // Validate required fields
            if (!projectName || !tag) {
                errorMessageContainer.textContent = 'Please fill out all required fields.';
                errorMessageContainer.style.display = 'block';
                return;
            }
            
            // Prepare API data
            const apiData = {
                projectId: projectIdToUse,
                name: projectName,
                tag: tag,
                projectDemoUrl: demoUrl,
                projectRepoUrl: repoUrl,
                description: description
            };
            
            // Show loading state
            const submitBtn = document.getElementById(`edit-save-project-${projectIdToUse}`);
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // If there's a new image, upload it first
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                
                // Tạo tên file duy nhất với UUID ngay từ đầu
                const uniqueFileName = `${generateUUID()}-${file.name}`;
                
                // Step 1: Get upload URL với tên file đã có UUID
                fetchWithTokenRefresh(`http://localhost:8080/api/images/generate-upload-url?fileName=${encodeURIComponent(uniqueFileName)}&contentType=${encodeURIComponent(file.type)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(async data => {
                    // Step 2: Upload to the provided URL
                    const uploadUrl = data.uploadUrl;
                    
                    try {
                        
                        const upload = await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': file.type
                            },
                            body: file
                        });
                        
                        if (upload.ok) {
                            // Set the image URL with UUID in project data
                            apiData.projectImageUrl = `https://storage.googleapis.com/mycvs_live/${uniqueFileName}`;
                            
                            // Now update the project
                            updateProject(apiData, submitBtn, originalBtnText, errorMessageContainer, projectIdToUse);
                        } else {
                            throw new Error('Failed to upload image to storage');
                        }
                    } catch (uploadError) {
                        console.error('Error uploading to storage:', uploadError);
                        errorMessageContainer.textContent = 'Failed to upload image to storage. Please try again.';
                        errorMessageContainer.style.display = 'block';
                        
                        // Reset button state
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                    errorMessageContainer.textContent = 'Failed to upload image. Please try again.';
                    errorMessageContainer.style.display = 'block';
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            } else {
                // Kiểm tra xem ảnh đã bị xóa khỏi form hay không
                const imageContent = imagePreview.innerHTML.trim();
                const hasImage = imagePreview.classList.contains('has-image') || 
                                imageContent.includes('<img') || 
                                imagePreview.style.backgroundImage.includes('url');
                
                // Nếu ảnh đã bị xóa, set projectImageUrl thành rỗng
                if (!hasImage) {
                    apiData.projectImageUrl = "";
                } else {
                    // Giữ nguyên URL ảnh cũ nếu không thay đổi ảnh
                    apiData.projectImageUrl = project.projectImageUrl;
                }
                
                // Update project directly
                updateProject(apiData, submitBtn, originalBtnText, errorMessageContainer, projectIdToUse);
            }
        });
        
        // Cancel button click handler
        cancelBtn.addEventListener('click', function() {
            closeEditForm(projectIdToUse);
        });
        
        // Remove button click handler
        removeBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to remove "${project.projectName}"?`)) {
                // Show loading state
                removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
                removeBtn.disabled = true;
                
                // Call API to delete project
                fetchWithTokenRefresh(`http://localhost:8080/user/project/${projectIdToUse}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete project');
                    }
                    return response.json();
                })
                .then(data => {
                    // Reload projects to update the list
                    loadProjects();
                    
                    // Close the form
                    closeEditForm(projectIdToUse);
                })
                .catch(error => {
                    console.error('Error deleting project:', error);
                    errorMessageContainer.textContent = 'Failed to delete project. Please try again.';
                    errorMessageContainer.style.display = 'block';
                    
                    // Reset button state
                    removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove';
                    removeBtn.disabled = false;
                });
            }
        });
    }
    
    // Function to update a project
    function updateProject(apiData, submitBtn, originalBtnText, errorMessageContainer, projectId) {
        // Không xóa ảnh khi cập nhật project - chúng ta chỉ xóa ảnh khi xóa project
        
        // Call API to update project
        fetchWithTokenRefresh(`http://localhost:8080/user/project`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update project');
            }
            return response.json();
        })
        .then(data => {
            // Reload projects to show the updated list
            loadProjects();
            
            // Close the form
            closeEditForm(projectId);
        })
        .catch(error => {
            console.error('Error updating project:', error);
            if (errorMessageContainer) {
                errorMessageContainer.textContent = 'Failed to update project. Please try again.';
                errorMessageContainer.style.display = 'block';
            }
        })
        .finally(() => {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Function to show add project form
    function showAddProjectForm() {
        // Reset form
        projectForm.reset();
        projectIdInput.value = '';
        submitBtnText.textContent = 'Add';
        
        // Hide remove button for new projects
        removeProjectBtn.style.display = 'none';
        
        // Reset image preview
        imagePreview.style.backgroundImage = 'none';
        imagePreview.classList.remove('has-image');
        imagePreview.innerHTML = '<i class="fas fa-image"></i>';
        fileInput.value = '';
        
        // Show form
        projectFormContainer.style.display = 'block';
        
        // Scroll to form
        projectFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
        
    // Function to handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Reset error message
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
        
        // Validate required fields
        if (!projectNameInput.value || !projectTagSelect.value) {
            errorMessageContainer.textContent = 'Please fill out all required fields.';
            errorMessageContainer.style.display = 'block';
            return;
        }
        
        // Get form data
        const projectId = projectIdInput.value ? parseInt(projectIdInput.value) : null;
        const projectData = {
            name: projectNameInput.value,
            tag: projectTagSelect.value,
            projectDemoUrl: demoUrlInput.value,
            projectRepoUrl: repoUrlInput.value,
            description: descriptionInput.value,
            projectImageUrl: "" // default to empty string
        };
        
        // Lấy URL ảnh hiện tại nếu đang chỉnh sửa project có sẵn
        if (projectId && projects) {
            // Tìm project hiện tại trong danh sách
            const existingProject = projects.find(p => String(p.id) === String(projectId));
            if (existingProject && existingProject.projectImageUrl) {
                // Gán URL ảnh hiện tại vào projectData để giữ nguyên ảnh cũ
                projectData.projectImageUrl = existingProject.projectImageUrl;
            }
        }
        
        // Nếu có ảnh mới trong preview, sử dụng URL ảnh đó
        if (imagePreview && imagePreview.classList.contains('has-image') && imagePreview.style.backgroundImage) {
            // Kiểm tra xem có phải là ảnh mới được tải lên hay không
            const isNewImage = fileInput.files && fileInput.files.length > 0;
            
            // Nếu có ảnh mới được tải lên, lấy URL từ style
            if (isNewImage) {
                const match = imagePreview.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
                if (match && match[1]) {
                    projectData.projectImageUrl = match[1];
                }
            }
        }
        
        // Show loading state
        const submitBtn = projectForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        // If there's a new image, upload it first
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Luôn tạo UUID mới cho mỗi lần upload ảnh
            const uniqueFileName = `${generateUUID()}-${file.name}`;
            const contentType = file.type;
            
            // Step 1: Get upload URL
            fetchWithTokenRefresh(`http://localhost:8080/api/images/generate-upload-url?fileName=${encodeURIComponent(uniqueFileName)}&contentType=${encodeURIComponent(contentType)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(async data => {
                // Step 2: Upload to the provided URL
                const uploadUrl = data.uploadUrl;
                
                try {
                    const upload = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': file.type
                        },
                        body: file
                    });
                    
                    if (upload.ok) {
                        // Set the image URL in project data
                        projectData.projectImageUrl = `https://storage.googleapis.com/mycvs_live/${uniqueFileName}`;
                        
                        // Now save the project
                        saveProject(projectId, projectData, submitBtn, originalBtnText);
                    } else {
                        throw new Error('Failed to upload image to storage');
                    }
                } catch (uploadError) {
                    console.error('Error uploading to storage:', uploadError);
                    errorMessageContainer.textContent = 'Failed to upload image to storage. Please try again.';
                    errorMessageContainer.style.display = 'block';
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error generating upload URL:', error);
                errorMessageContainer.textContent = 'Failed to prepare image upload. Please try again.';
                errorMessageContainer.style.display = 'block';
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        } else {
            // Save project directly with current projectImageUrl value
            saveProject(projectId, projectData, submitBtn, originalBtnText);
        }
    }
    
    // Function to save project to API
    function saveProject(projectId, projectData, submitBtn, originalBtnText) {
        const url = 'http://localhost:8080/user/project';
        const method = projectId ? 'PUT' : 'POST';
        
        // Add projectId to request body if updating
        if (projectId) {
            projectData.projectId = projectId;
            
            // Không gửi request xóa ảnh khi cập nhật project
            // Ảnh sẽ chỉ bị xóa khi xóa project
        }
        
        fetchWithTokenRefresh(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save project');
            }
            return response.json();
        })
        .then(data => {
            // Reload projects
            loadProjects();
            
            // Hide form
            projectFormContainer.style.display = 'none';
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error saving project:', error);
            errorMessageContainer.textContent = 'Failed to save project. Please try again.';
            errorMessageContainer.style.display = 'block';
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }
    
    // Function to handle image upload
    function handleImageUpload() {
        fileInput.click();
    }
    
    // Function to handle file selection
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
            
            // Lưu thông tin file với UUID để sử dụng khi upload
            const uniqueFileName = `${generateUUID()}-${file.name}`;
            // Lưu tên file vào data attribute của file input để sử dụng sau này
            fileInput.setAttribute('data-unique-filename', uniqueFileName);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.classList.add('has-image');
                // Thay vì sử dụng background-image, chúng ta thay thế bằng thẻ img
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Project image" />`;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Function to handle image deletion
    function handleImageDelete() {
        // Xóa ảnh và thay bằng icon
        imagePreview.classList.remove('has-image');
        imagePreview.innerHTML = '<i class="fas fa-image"></i>';
        fileInput.value = '';
        
        // Xóa thuộc tính data-unique-filename khi người dùng xóa ảnh
        fileInput.removeAttribute('data-unique-filename');
    }
    
    // Function to handle project removal
    function handleProjectRemove() {
        const projectId = projectIdInput.value;
        if (!projectId) return;
        
        if (confirm('Are you sure you want to remove this project?')) {
            // Show loading state
            removeProjectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            removeProjectBtn.disabled = true;
            
            // Tìm project trong danh sách để lấy URL ảnh (nếu có)
            const existingProject = projects.find(p => String(p.id) === String(projectId));
            
            // Kiểm tra xem project có ảnh không và ảnh có được lưu trên Google Storage không
            if (existingProject && existingProject.projectImageUrl && 
                existingProject.projectImageUrl.includes('storage.googleapis.com/mycvs_live/')) {
                
                // Extract filename from URL
                const fileName = existingProject.projectImageUrl.split('/').pop();
                
                // Xóa ảnh trước khi xóa project
                fetchWithTokenRefresh(`http://localhost:8080/api/images/delete?fileName=${encodeURIComponent(fileName)}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Project image deleted successfully from storage');
                    } else {
                        console.error('Failed to delete project image from storage');
                    }
                    
                    // Tiếp tục xóa project sau khi đã xử lý xóa ảnh
                    deleteProject();
                })
                .catch(error => {
                    console.error('Error deleting project image:', error);
                    // Vẫn tiếp tục xóa project ngay cả khi xóa ảnh gặp lỗi
                    deleteProject();
                });
            } else {
                // Nếu không có ảnh, xóa project trực tiếp
                deleteProject();
            }
            
            // Hàm xóa project
            function deleteProject() {
                fetchWithTokenRefresh(`http://localhost:8080/api/projects/${projectId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete project');
                    }
                    return response.json();
                })
                .then(data => {
                    // Reload projects
                    loadProjects();
                    
                    // Hide form
                    projectFormContainer.style.display = 'none';
                    
                    // Reset button state
                    removeProjectBtn.innerHTML = 'Remove';
                    removeProjectBtn.disabled = false;
                })
                .catch(error => {
                    console.error('Error deleting project:', error);
                    errorMessageContainer.textContent = 'Failed to delete project. Please try again.';
                    errorMessageContainer.style.display = 'block';
                    
                    // Reset button state
                    removeProjectBtn.innerHTML = 'Remove';
                    removeProjectBtn.disabled = false;
                });
            }
        }
    }
    
    // Variables for retry mechanism
    let isRetrying = false;
    let retryTimeout = null;
    const RETRY_DELAY = 30000; // 30 seconds delay before retrying
    
    // Function to load projects from API
    function loadProjects() {
        // Clear any existing retry timeout
        if (retryTimeout) {
            clearTimeout(retryTimeout);
            retryTimeout = null;
        }
        
        // Show loading state
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = isRetrying ? 
            '<i class="fas fa-exclamation-circle"></i> Connection issue. Retrying...' : 
            '<i class="fas fa-spinner fa-spin"></i> Loading projects...';
        
        // Only add loading message if not retrying to avoid multiple messages
        if (!isRetrying) {
            projectsList.innerHTML = '';
            projectsList.appendChild(loadingMessage);
        }
        
        // Using the correct API endpoint with SHOW_ALL tag
        fetchWithTokenRefresh(`http://localhost:8080/user/project?pageNo=${currentPage}&pageSize=${pageSize}&tags=SHOW_ALL`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load projects');
                }
                return response.json();
            })
            .then(data => {
                // Handle the correct response structure
                if (data.status === 200 && data.data) {
                    // Reset retry flag since we succeeded
                    isRetrying = false;
                    
                    projects = data.data.projects || [];
                    totalPages = data.data.totalPages || 0;
                    currentPage = data.data.pageNo || 0;
                    
                    // Render projects
                    renderProjects();
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                
                // Set retry flag
                isRetrying = true;
                
                // Show error message
                projectsList.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Failed to load projects. Retrying in ${RETRY_DELAY/1000} seconds...
                    </div>
                `;
                
                // Schedule retry after delay
                retryTimeout = setTimeout(() => {
                    console.log('Retrying to load projects...');
                    loadProjects();
                }, RETRY_DELAY);
            });
    }
    
    // Function to render projects
    function renderProjects() {
        // Clear projects list
        projectsList.innerHTML = '';
        
        if (projects.length === 0) {
            projectsList.innerHTML = '<div class="no-projects">No projects found. Add your first project!</div>';
            return;
        }
        
        // Render each project
        projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.className = 'project-item';
            // Use the id field from ProjectDetailResponse
            const projectId = project.id;
            projectElement.setAttribute('data-project-id', projectId);
            
            // Updated HTML structure to match the UI in the image
            projectElement.innerHTML = `
                <div class="project-card">
                    <div class="project-image">
                        ${project.projectImageUrl 
                            ? `<img src="${encodeURI(project.projectImageUrl)}" alt="${project.projectName}">` 
                            : '<i class="fas fa-image"></i>'}
                    </div>
                    <div class="project-content">
                        <h3 class="project-name">${project.projectName}</h3>
                        <div class="project-tags">
                            <span class="project-tag">${project.tag || 'No tag'}</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="btn-edit" onclick="showEditForm(${projectId})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div id="edit-form-${projectId}" class="edit-form-container" style="display: none;"></div>
            `;
            
            projectsList.appendChild(projectElement);
        });
        
        // Render pagination
        renderPagination();
    }
    
    // Function to render pagination controls
    function renderPagination() {
        // Create pagination container if it doesn't exist
        let paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination-container';
            paginationContainer.className = 'pagination';
            projectsList.parentNode.appendChild(paginationContainer);
        } else {
            paginationContainer.innerHTML = '';
        }
        
        // Don't show pagination if there's only one page or no pages
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                goToPage(currentPage - 1);
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Page numbers
        const maxVisiblePages = 5;
        const startPage = Math.max(0, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
        const endPage = Math.min(startPage + maxVisiblePages, totalPages);
        
        // Add first page button if not visible
        if (startPage > 0) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'pagination-btn page-number';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => goToPage(0));
            paginationContainer.appendChild(firstPageBtn);
            
            // Add ellipsis if there's a gap
            if (startPage > 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Add page number buttons
        for (let i = startPage; i < endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn page-number';
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = (i + 1).toString();
            pageBtn.addEventListener('click', () => goToPage(i));
            paginationContainer.appendChild(pageBtn);
        }
        
        // Add last page button if not visible
        if (endPage < totalPages) {
            // Add ellipsis if there's a gap
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'pagination-btn page-number';
            lastPageBtn.textContent = totalPages.toString();
            lastPageBtn.addEventListener('click', () => goToPage(totalPages - 1));
            paginationContainer.appendChild(lastPageBtn);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = currentPage === totalPages - 1;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                goToPage(currentPage + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // Function to navigate to a specific page
    function goToPage(pageNumber) {
        if (pageNumber >= 0 && pageNumber < totalPages && pageNumber !== currentPage) {
            currentPage = pageNumber;
            loadProjects();
        }
    }
    
    // Helper function to generate tag options for select element
    function generateTagOptions(selectedTag) {
        const tags = ['DESIGN', 'BRANDING', 'ILLUSTRATION', 'MOTION'];
        return tags.map(tag => 
            `<option value="${tag}" ${selectedTag === tag ? 'selected' : ''}>${tag}</option>`
        ).join('');
    }
    
    // Function to style tag select elements
    function styleTagSelect() {
        // This function can be empty as we're using CSS for styling
    }
    
    // Load projects when page loads
    loadProjects();
    
    // Event Listeners
    addProjectBtn.addEventListener('click', showAddProjectForm);
    projectForm.addEventListener('submit', handleFormSubmit);
    uploadBtn.addEventListener('click', handleImageUpload);
    deleteBtn.addEventListener('click', handleImageDelete);
    fileInput.addEventListener('change', handleFileSelection);
    removeProjectBtn.addEventListener('click', handleProjectRemove);
    document.getElementById('cancel-add-project').addEventListener('click', function() {
        projectFormContainer.style.display = 'none';
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
        // Call logout API to clear cookies - sử dụng GET /auth/logout
        fetchWithTokenRefresh('http://localhost:8080/auth/logout', {
            method: 'GET'
        })
        .then(() => {
            // Xóa dữ liệu người dùng khỏi localStorage
            localStorage.removeItem('userProfile');
            
            // Redirect to login page regardless of response
            window.location.href = '../Login/login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Xóa dữ liệu người dùng khỏi localStorage ngay cả khi có lỗi
            localStorage.removeItem('userProfile');
            
            // Still redirect to login page even if there's an error
            window.location.href = '../Login/login.html';
        });
    });
});
