
let roles = [
    { id: "1", name: "admin", description: "Toàn quyền hệ thống" },
    { id: "2", name: "mod", description: "Điều phối viên - Chỉ đọc và sửa nhẹ" }
];
let users = [
    { id: "1", username: "admin_hiep", password: "123", email: "hiep@bk.vn", roleId: "1", status: true },
    { id: "2", username: "mod_tester", password: "456", email: "mod@bk.vn", roleId: "2", status: true }
];
let currentUser = null; // lưu trữ User đang đăng nhập (Session)
let comments = [];

function generateId(collection) {
    if (collection.length === 0) return "1";
    const maxId = Math.max(...collection.map(item => parseInt(item.id)));
    return (maxId + 1).toString();
}

function createUser(userData) {
    const newUser = {
        ...userData,
        id: generateId(users),
        isDeleted: false,
        status: false,
        loginCount: 0,
        createdAt: new Date()
    };
    users.push(newUser);
    return newUser;
}

function softDelete(collection, id) {
    const index = collection.findIndex(item => item.id === id);
    if (index !== -1) {
        collection[index].isDeleted = true;
        return true;
    }
    return false;
}

function getAllActive(collection) {
    return collection.filter(item => !item.isDeleted);
}

function toggleUserStatus(email, username, action) {
    const user = users.find(u => u.email === email && u.username === username);
    if (!user) return { success: false, msg: "Sai thông tin email hoặc username" };

    user.status = (action === 'enable');
    return { success: true, msg: `User đã được ${action === 'enable' ? 'kích hoạt' : 'vô hiệu hóa'}` };
}
// toggleUserStatus("test@gmail.com", "admin", "enable");

function commentCRUD() {
    const addComment = (content) => comments.push({
        id: generateId(comments),
        content,
        isDeleted: false
    });
    const getComments = () => comments.filter(c => !c.isDeleted);
    const updateComment = (id, newContent) => {
        let c = comments.find(x => x.id === id);
        if (c) c.content = newContent;
    };
    const deleteComment = (id) => softDelete(comments, id);
}

const CommentService = {
    add: (content) => comments.push({ id: generateId(comments), content, isDeleted: false }),
    getAll: () => comments.filter(c => !c.isDeleted),
    update: (id, content) => {
        let c = comments.find(x => x.id === id);
        if (c) c.content = content;
    },
    delete: (id) => softDelete(comments, id)
};

function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, msg: "Sai tài khoản hoặc mật khẩu!" };
    if (!user.status) return { success: false, msg: "Tài khoản đang bị khóa!" };

    currentUser = user;
    console.log(`Đăng nhập thành công: ${user.username} (${getRoleName(user.roleId)})`);
    return { success: true, user };
}

function logout() { currentUser = null; }

function getRoleName(roleId) {
    return roles.find(r => r.id === roleId)?.name || "guest";
}

function checkPermission(resource, action) {
    if (!currentUser) {
        return resource === 'product' && action === 'get';
    }

    const role = getRoleName(currentUser.roleId);

    if (role === 'admin') return true;

    if (role === 'mod') {
        if (action === 'get') return true;
        if (resource === 'product' && (action === 'create' || action === 'update')) return true;
        return false;
    }

    return false;
}

function changePassword(oldPassword, newPassword) {
    if (!currentUser) return { success: false, msg: "Bạn chưa đăng nhập!" };

    if (currentUser.password !== oldPassword) {
        return { success: false, msg: "Mật khẩu cũ không chính xác!" };
    }

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex].password = newPassword;
    currentUser.password = newPassword; // Cập nhật session

    return { success: true, msg: "Đổi mật khẩu thành công!" };
}