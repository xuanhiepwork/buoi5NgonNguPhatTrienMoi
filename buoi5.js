const URL_API = 'https://api.escuelajs.co/api/v1/products';
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let sortDir = { price: 1, title: 1 };

async function GetAll() {
    try {
        const res = await fetch(URL_API);
        let data = await res.json();
        allProducts = data.map(item => ({ ...item, isDeleted: false }));
        filteredProducts = [...allProducts];
        renderTable();
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

async function getProductById(id) {
    const res = await fetch(`${URL_API}/${id}`);
    return await res.json();
}

// title, maxPrice, minPrice
function queryProducts(params) {
    const { title, minPrice, maxPrice, slug } = params;
    return allProducts.filter(p => {
        let match = true;
        if (title) match = match && p.title.toLowerCase().includes(title.toLowerCase());
        if (minPrice) match = match && p.price >= minPrice;
        if (maxPrice) match = match && p.price <= maxPrice;
        if (slug) match = match && p.title.toLowerCase().replace(/ /g, '-') === slug;
        return match;
    });
}

function renderTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    const start = (currentPage - 1) * pageSize;
    const dataToShow = filteredProducts.slice(start, start + pageSize);

    tableBody.innerHTML = dataToShow.map(item => {
        const isDeleted = item.isDeleted;
        const rowClass = isDeleted ? 'deleted-post' : '';

        const actionButtons = `
            <div style="display: flex; gap: 5px;">
                ${checkPermission('product', 'update') && !isDeleted ?
                `<button onclick="editProduct(${item.id})" style="background:#f1c40f; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Sửa</button>` : ''}
                
                ${checkPermission('product', 'delete') && !isDeleted ?
                `<button onclick="deleteProduct(${item.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Xóa</button>` : ''}
            </div>
        `;

        // Hiển thị dấu gạch ngang (-) cho ID và Title nếu bị xóa mềm
        const displayId = isDeleted ? `- ${item.id}` : item.id;
        const displayTitle = isDeleted ? `- ${item.title}` : item.title;

        // Xử lý hình ảnh rác từ API
        const imagesHtml = item.images.map(img => {
            let cleanUrl = img.replace(/[\[\]"]/g, "");
            if (!cleanUrl || cleanUrl.includes("placeimg.com") || cleanUrl.trim() === "") {
                cleanUrl = 'https://placehold.co/150';
            }
            return `<img src="${cleanUrl}" class="product-img" onerror="this.src='https://placehold.co/150'">`;
        }).join('');

        return `
            <tr class="${rowClass}">
                <td>${displayId}</td>
                <td><div class="image-grid">${imagesHtml}</div></td>
                <td>${displayTitle}</td>
                <td>$${item.price}</td>
                <td class="desc-col">
                    ${isDeleted ? '🚩 Đã xóa mềm' : '📋 Xem mô tả...'}
                    <div class="desc-text">${item.description}</div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination(); // Gọi hàm phân trang sau khi render xong bảng
}

function handleLoginUI() {
    const u = document.getElementById('user_in').value;
    const p = document.getElementById('pass_in').value;
    const res = login(u, p);

    if (res.success) {
        updateUIState(true);
        renderTable();
    } else {
        alert(res.msg);
    }
}

function handleLogoutUI() {
    logout();
    updateUIState(false);
    renderTable();
}

function updateUIState(isLoggedIn) {
    const guestZone = document.getElementById('auth-guest');
    const userZone = document.getElementById('auth-user');

    if (isLoggedIn && currentUser) {
        guestZone.style.display = 'none';
        userZone.style.display = 'block';
        document.getElementById('display-name').innerText = currentUser.username;
        document.getElementById('display-role').innerText = getRoleName(currentUser.roleId);
    } else {
        guestZone.style.display = 'block';
        userZone.style.display = 'none';
    }
}

function handleSearch() {
    const val = document.getElementById('search_txt').value.toLowerCase();
    filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(val));
    currentPage = 1;
    renderTable();
}

function handlePageSize() {
    pageSize = parseInt(document.getElementById('page_size').value);
    currentPage = 1;
    renderTable();
}

function sortData(key) {
    sortDir[key] *= -1;
    filteredProducts.sort((a, b) => {
        let valA = a[key], valB = b[key];
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        return valA > valB ? (1 * sortDir[key]) : (-1 * sortDir[key]);
    });
    renderTable();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const pagDiv = document.getElementById('pagination');
    if (!pagDiv) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="currentPage=${i}; renderTable()" 
                 style="${currentPage === i ? 'background:#3498db;color:#fff;font-weight:bold' : ''}">${i}</button>`;
    }
    pagDiv.innerHTML = html;
}

async function deleteProduct(productId) {
    if (typeof checkPermission !== 'function' || !checkPermission('product', 'delete')) {
        alert("Lỗi: Chỉ ADMIN mới có quyền xóa sản phẩm!");
        return;
    }

    const item = allProducts.find(p => p.id == productId);
    if (item) {
        item.isDeleted = true;
        renderTable();
        console.log(`Đã xóa mềm sản phẩm ${productId}`);
    }
}

async function saveProduct(data) {
    const isUpdate = !!data.id;
    const action = isUpdate ? 'update' : 'create';

    if (!checkPermission('product', action)) {
        alert(`Bạn không có quyền ${action === 'create' ? 'thêm mới' : 'chỉnh sửa'} sản phẩm!`);
        return;
    }

    try {
        let response;
        if (isUpdate) {
            // --- LOGIC UPDATE (PUT) ---
            response = await fetch(`${URL_API}/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // --- LOGIC CREATE (POST) ---
            // Yêu cầu: ID tự tăng = maxId + 1 (Lưu dạng String)
            const newId = generateId(allProducts);

            const newProduct = {
                ...data,
                id: newId,
                isDeleted: false,
                images: data.images || ["https://placehold.co/600x400"] // Ảnh mặc định nếu thiếu
            };

            response = await fetch(URL_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
        }

        if (response.ok) {
            const result = await response.json();
            alert(`${isUpdate ? 'Cập nhật' : 'Thêm mới'} thành công!`);
            if (isUpdate) {
                const index = allProducts.findIndex(p => p.id == data.id);
                allProducts[index] = { ...allProducts[index], ...result };
            } else {
                allProducts.unshift(result);
            }

            filteredProducts = [...allProducts];
            renderTable();
        } else {
            throw new Error("Lỗi phản hồi từ Server");
        }
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert("Thao tác thất bại. Vui lòng kiểm tra lại kết nối API.");
    }
}

GetAll();