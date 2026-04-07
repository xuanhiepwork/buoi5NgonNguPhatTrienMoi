let users = [];
let roles = [];
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