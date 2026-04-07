// --- CẤU HÌNH & TRẠNG THÁI ---
const URL_PRODUCT_API = 'https://api.escuelajs.co/api/v1/products';
const URL_USER_API = 'http://localhost:3000/users';

let roles = [
    { id: "1", name: "admin", description: "Toàn quyền hệ thống" },
    { id: "2", name: "mod", description: "Điều phối viên - Chỉ đọc và sửa nhẹ" }
];

let users = [];
let allProducts = [];
let filteredProducts = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// --- HÀM KHỞI TẠO (QUAN TRỌNG NHẤT) ---
async function initApp() {
    try {
        // 1. Load danh sách User từ json-server trước
        const userRes = await fetch(URL_USER_API);
        if (userRes.ok) {
            users = await userRes.json();
        }

        // 2. Kiểm tra trạng thái đăng nhập để cập nhật UI
        if (currentUser) {
            updateUIState(true);
        }

        // 3. Load sản phẩm
        await GetAllProducts();

        console.log("Hệ thống đã sẵn sàng!");
    } catch (error) {
        console.error("Lỗi khởi tạo hệ thống:", error);
    }
}

// --- LOGIC USER & AUTH ---
function generateId(collection) {
    if (!collection || collection.length === 0) return "1";
    const ids = collection.map(item => parseInt(item.id)).filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return (maxId + 1).toString();
}

async function createUser(userData) {
    const newUser = {
        ...userData,
        id: generateId(users),
        isDeleted: false,
        status: true,
        loginCount: 0,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(URL_USER_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (response.ok) {
            const savedUser = await response.json();
            users.push(savedUser); // Cập nhật mảng local ngay lập tức
            return savedUser;
        }
    } catch (error) {
        console.error("Lỗi lưu User:", error);
        return null;
    }
}

function login(username, password) {
    // Tìm trong mảng users đã được load từ server
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return { success: false, msg: "Sai tài khoản hoặc mật khẩu!" };
    if (!user.status) return { success: false, msg: "Tài khoản đang bị khóa!" };

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

// --- LOGIC SẢN PHẨM ---
async function GetAllProducts() {
    try {
        const res = await fetch(URL_PRODUCT_API);
        let data = await res.json();
        allProducts = data.map(item => ({ ...item, isDeleted: false }));
        filteredProducts = [...allProducts];
        renderTable();
    } catch (error) {
        console.error("Lỗi load sản phẩm:", error);
    }
}

// --- GIAO DIỆN (UI) ---
function updateUIState(isLoggedIn) {
    const guestZone = document.getElementById('auth-guest');
    const userZone = document.getElementById('auth-user');
    if (!guestZone || !userZone) return;

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

function getRoleName(roleId) {
    return roles.find(r => r.id === roleId)?.name || "guest";
}

// Chạy khởi tạo khi file JS này được load
initApp();