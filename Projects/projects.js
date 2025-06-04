// Biến toàn cục để quản lý phân trang và lọc
let currentPage = 0; // Trang bắt đầu từ 0 khi gọi API
let totalPages = 0;
let pageSize = 5; // Số lượng projects trên mỗi trang
let currentUserId = null;
let selectedTags = ['SHOW_ALL']; // Mặc định chọn Show All

document.addEventListener('DOMContentLoaded', function() {
    // Lấy chuỗi query parameters từ URL
    const queryString = window.location.search;
    
    // Tạo đối tượng URLSearchParams từ chuỗi query
    const urlParams = new URLSearchParams(queryString);
    
    // Lấy giá trị của tham số userId
    const userId = urlParams.get('userId');
    currentUserId = userId;
    
    console.log('User ID:', userId);
    
    // Kiểm tra nếu userId tồn tại
    if (userId) {
        // Thiết lập sự kiện cho các tag
        setupTagEvents();
        
        // Tải dữ liệu portfolio của user với phân trang
        loadUserProjects(userId, currentPage);
        
        // Thiết lập sự kiện cho các nút phân trang
        setupPaginationEvents();
    } else {
        // Xử lý trường hợp không có userId
        console.log('Không tìm thấy userId trong URL');
    }
});

// Hàm để thiết lập sự kiện cho các tag
function setupTagEvents() {
    // Lấy tất cả các checkbox tag
    const tagCheckboxes = document.querySelectorAll('input[name="project_tags"]');
    
    // Thêm sự kiện change cho mỗi checkbox
    tagCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Lấy tag từ data-tag của label tương ứng
            const label = document.querySelector(`label[for="${this.id}"]`);
            const tag = label.getAttribute('data-tag').toUpperCase();
            
            // Xử lý lựa chọn tag
            if (this.checked) {
                // Nếu chọn Show All, bỏ chọn tất cả các tag khác
                if (tag === 'SHOW_ALL') {
                    selectedTags = ['SHOW_ALL'];
                    
                    // Bỏ chọn các checkbox khác
                    tagCheckboxes.forEach(cb => {
                        if (cb.id !== 'tag_show_all') {
                            cb.checked = false;
                        }
                    });
                } else {
                    // Nếu chọn tag khác, bỏ Show All khỏi danh sách
                    const showAllIndex = selectedTags.indexOf('SHOW_ALL');
                    if (showAllIndex !== -1) {
                        selectedTags.splice(showAllIndex, 1);
                        document.getElementById('tag_show_all').checked = false;
                    }
                    
                    // Thêm tag vào danh sách
                    if (!selectedTags.includes(tag)) {
                        selectedTags.push(tag);
                    }
                }
            } else {
                // Xóa tag khỏi danh sách
                const tagIndex = selectedTags.indexOf(tag);
                if (tagIndex !== -1) {
                    selectedTags.splice(tagIndex, 1);
                }
                
                // Nếu không còn tag nào được chọn, chọn lại Show All
                if (selectedTags.length === 0) {
                    selectedTags = ['SHOW_ALL'];
                    document.getElementById('tag_show_all').checked = true;
                }
            }
            
            console.log('Selected tags:', selectedTags);
            
            // Reset trang về 0 và tải lại dữ liệu
            currentPage = 0;
            loadUserProjects(currentUserId, currentPage);
        });
    });
}

// Hàm để thiết lập sự kiện cho các nút phân trang
function setupPaginationEvents() {
    // Lấy tất cả các input radio phân trang
    const pageInputs = document.querySelectorAll('input[name="page"]');
    
    // Lấy tất cả các label phân trang
    const pageLabels = document.querySelectorAll('.pagination-container label.page');
    
    // Thêm sự kiện click cho các label để ngăn màn hình bị kéo xuống
    pageLabels.forEach(label => {
        label.addEventListener('click', function(e) {
            // Ngăn chặn hành vi mặc định của label (focus vào input)
            e.preventDefault();
            
            // Lấy id của input tương ứng
            const inputId = this.getAttribute('for');
            const input = document.getElementById(inputId);
            
            // Đánh dấu input là checked
            input.checked = true;
            
            // Kích hoạt sự kiện change trên input
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        });
    });
    
    // Thêm sự kiện change cho mỗi input
    pageInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                // Lấy số trang từ id của input (ví dụ: page_1 -> trang 1)
                const pageNumber = parseInt(this.id.split('_')[1]) - 1; // Trừ 1 vì API bắt đầu từ 0
                
                // Chỉ tải dữ liệu nếu trang khác với trang hiện tại
                if (pageNumber !== currentPage) {
                    currentPage = pageNumber;
                    loadUserProjects(currentUserId, currentPage);
                }
            }
        });
    });
}

// Hàm để tải dữ liệu projects của user với phân trang và lọc theo tag
async function loadUserProjects(userId, pageNo = 0) {
    console.log(`Đang tải portfolio cho user có ID: ${userId}, trang: ${pageNo}, tags: ${selectedTags.join(',')}`);
    
    try {
        // Hiển thị trạng thái loading
        const projectCards = document.querySelector('.project_cards');
        projectCards.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';
        
        // Tạo chuỗi tags từ danh sách các tag được chọn
        const tagsParam = selectedTags.join(',');
        
        // Gọi API với tham số phân trang và tags
        const response = await fetch(`http://localhost:8080/user/project?userId=${userId}&pageNo=${pageNo}&pageSize=${pageSize}&tags=${tagsParam}`);
        const data = await response.json();
        console.log('Portfolio data:', data);
        
        if (data.status === 200 && data.data) {
            // Cập nhật thông tin phân trang
            totalPages = data.data.totalPages || 1;
            
            // Hiển thị dữ liệu
            renderProjects(data.data.projects);
            
            // Cập nhật UI phân trang
            updatePaginationUI();
        } else {
            throw new Error('Không thể tải dữ liệu projects');
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        const projectCards = document.querySelector('.project_cards');
        projectCards.innerHTML = '<div class="error">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</div>';
    }
}

// Hàm để cập nhật UI phân trang
function updatePaginationUI() {
    const paginationContainer = document.querySelector('.pagination-container');
    
    // Nếu không có dữ liệu phân trang hoặc chỉ có 1 trang, ẩn phân trang
    if (totalPages <= 1) {
        document.querySelector('.pages').style.display = 'none';
        return;
    }
    
    // Hiển thị phân trang
    document.querySelector('.pages').style.display = 'block';
    
    // Xóa tất cả các phần tử phân trang hiện tại
    paginationContainer.innerHTML = '';
    
    // Tạo các phần tử phân trang mới
    for (let i = 0; i < Math.min(totalPages, 5); i++) {
        // Tạo input radio
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'page';
        input.id = `page_${i + 1}`; // Trang hiển thị bắt đầu từ 1
        input.checked = i === currentPage;
        
        // Tạo label
        const label = document.createElement('label');
        label.htmlFor = `page_${i + 1}`;
        label.className = 'page';
        label.textContent = i + 1;
        
        // Thêm sự kiện click trực tiếp cho label để ngăn màn hình bị kéo xuống
        label.addEventListener('click', function(e) {
            // Ngăn chặn hành vi mặc định của label (focus vào input)
            e.preventDefault();
            
            // Lấy id của input tương ứng
            const inputId = this.getAttribute('for');
            const input = document.getElementById(inputId);
            
            // Đánh dấu input là checked
            input.checked = true;
            
            // Kích hoạt sự kiện change trên input
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        });
        
        // Thêm vào container
        paginationContainer.appendChild(input);
        paginationContainer.appendChild(label);
    }
    
    // Thiết lập lại sự kiện cho các nút phân trang
    setupPaginationEvents();
}

// Hàm để hiển thị danh sách projects
function renderProjects(data) {
    const projectCards = document.querySelector('.project_cards');
    projectCards.innerHTML = ''; // Xóa nội dung cũ
    
    // Kiểm tra nếu không có dữ liệu
    if (!data || data.length === 0) {
        projectCards.innerHTML = '<div class="no-data">Không có dự án nào để hiển thị.</div>';
        return;
    }
    
    // Hiển thị danh sách projects
    data.forEach(project => {
        const projectCard = document.createElement('a');
        projectCard.target = '_blank';
        projectCard.href = project.projectDemoUrl;
        
        const projectElement = document.createElement('div');
        projectElement.classList.add('project_card');
        projectElement.id = `project_${project.id}`;
        projectElement.style.backgroundImage = `url(${project.projectImageUrl})`
        
        const projectTag = document.createElement('p');
        projectTag.classList.add('project_tag', 'txt');
        projectTag.textContent = project.tag;
        
        const projectTitle = document.createElement('h3');
        projectTitle.classList.add('project_title');
        projectTitle.textContent = project.projectName;
        
        projectElement.appendChild(projectTag);
        projectElement.appendChild(projectTitle);
        projectCard.appendChild(projectElement);
        
        projectCards.appendChild(projectCard);
    });
}