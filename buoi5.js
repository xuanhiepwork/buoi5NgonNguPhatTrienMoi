const URL_API = 'https://api.escuelajs.co/api/v1/products';
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let sortDir = { price: 1, title: 1 };

// 1. Hàm lấy dữ liệu Dashboard (getall)
async function GetAll() {
    try {
        const res = await fetch(URL_API);
        let data = await res.json();

        // Giả lập thêm trường isDeleted cho demo Soft Delete
        allProducts = data.map(item => ({ ...item, isDeleted: false }));
        filteredProducts = [...allProducts];
        renderTable();
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

// 2. Request Functions (Sản phẩm & Chi tiết)
async function getProductById(id) {
    const res = await fetch(`${URL_API}/${id}`);
    return await res.json();
}

// Hàm thực hiện query: title, maxPrice, minPrice
function queryProducts(params) {
    const { title, minPrice, maxPrice, slug } = params;
    return allProducts.filter(p => {
        let match = true;
        if (title) match = match && p.title.toLowerCase().includes(title.toLowerCase());
        if (minPrice) match = match && p.price >= minPrice;
        if (maxPrice) match = match && p.price <= maxPrice;
        // API mẫu không có slug thực tế, giả định slug = title dạng-shorthand
        if (slug) match = match && p.title.toLowerCase().replace(/ /g, '-') === slug;
        return match;
    });
}

// 3. Render Table & Soft Delete Display
function renderTable() {
    const tableBody = document.getElementById('table-body');
    const start = (currentPage - 1) * pageSize;
    const dataToShow = filteredProducts.slice(start, start + pageSize);

    tableBody.innerHTML = dataToShow.map(item => {
        // Nếu xóa mềm, thêm class deleted-post (hiển thị dấu gạch ngang)
        const rowClass = item.isDeleted ? 'deleted-post' : '';
        const imagesHtml = item.images.map(img => {
            let src = img.replace(/[\[\]"]/g, "");
            return `<img src="${src}" class="product-img" onerror="this.src='https://via.placeholder.com/50'">`;
        }).join('');

        return `
            <tr class="${rowClass}">
                <td>${item.id}</td>
                <td>${imagesHtml}</td>
                <td>${item.title}</td>
                <td>$${item.price}</td>
                <td class="desc-col">
                    Xem mô tả...
                    <div class="desc-text">${item.description}</div>
                </td>
            </tr>
        `;
    }).join('');
    renderPagination();
}

// 4. Tìm kiếm onChange
function handleSearch() {
    const val = document.getElementById('search_txt').value.toLowerCase();
    filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(val));
    currentPage = 1;
    renderTable();
}

// 5. Phân trang & Sắp xếp
function handlePageSize() {
    pageSize = parseInt(document.getElementById('page_size').value);
    currentPage = 1;
    renderTable();
}

function sortData(key) {
    sortDir[key] *= -1;
    filteredProducts.sort((a, b) => {
        if (a[key] < b[key]) return -1 * sortDir[key];
        if (a[key] > b[key]) return 1 * sortDir[key];
        return 0;
    });
    renderTable();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const pagDiv = document.getElementById('pagination');
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="currentPage=${i}; renderTable()" style="${currentPage === i ? 'background:#3498db;color:#fff' : ''}">${i}</button>`;
    }
    pagDiv.innerHTML = html;
}

GetAll();