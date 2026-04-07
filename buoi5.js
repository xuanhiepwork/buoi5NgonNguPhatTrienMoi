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
        alert("⛔ Lỗi: Chỉ ADMIN mới có quyền xóa sản phẩm!");
        return;
    }

    // Logic xóa mềm thực tế trên giao diện:
    const item = allProducts.find(p => p.id == productId);
    if (item) {
        item.isDeleted = true;
        renderTable();
        console.log(`Đã xóa mềm sản phẩm ${productId}`);
    }
}

// Ví dụ hàm Create/Update
async function saveProduct(data) {
    if (!checkPermission('product', 'create') && !checkPermission('product', 'update')) {
        alert("⛔ Bạn không có quyền thực hiện thao tác này!");
        return;
    }
    // Thực hiện logic lưu...
}

GetAll();