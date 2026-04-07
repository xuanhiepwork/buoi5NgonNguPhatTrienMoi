import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Shield, UserPlus, Search, X, CheckCircle, AlertCircle } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // State cho Form (Thêm/Sửa)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        roleId: '2',
        status: true,
        password: '123' // Mặc định cho user mới
    });

    const API_URL = 'http://localhost:3001/users';

    // 1. Lấy dữ liệu từ json-server
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            const data = await response.json();
            // Lọc các user chưa bị xóa (nếu bạn dùng logic xóa mềm isDeleted)
            setUsers(data.filter(u => !u.isDeleted));
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Xử lý Thêm hoặc Cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL;

        const payload = {
            ...formData,
            id: editingUser ? editingUser.id : String(Date.now()), // Tạo ID duy nhất nếu thêm mới
            createdAt: editingUser ? editingUser.createdAt : new Object().toISOString?.() || new Date().toISOString()
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(editingUser ? "Cập nhật thành công!" : "Thêm mới thành công!");
                closeModal();
                fetchUsers();
            }
        } catch (error) {
            alert("Có lỗi xảy ra, kiểm tra lại json-server!");
        }
    };

    // 3. Xử lý Xóa (Xóa cứng khỏi db.json)
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                alert("Xóa thất bại!");
            }
        }
    };

    // 4. Các hàm bổ trợ UI
    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ ...user });
        } else {
            setEditingUser(null);
            setFormData({ username: '', email: '', roleId: '2', status: true, password: '123' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Quản lý Tài khoản</h1>
                    <p className="text-gray-500 text-sm mt-1">Hệ thống quản lý nội bộ Bach Khoa University</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={18} className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm tên hoặc email..."
                            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold"
                    >
                        <UserPlus size={20} /> <span className="hidden sm:inline">Thêm User</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400">Đang tải dữ liệu...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded-full border border-gray-200" src={`https://i.pravatar.cc/150?u=${user.id}`} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{user.username}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.roleId === '1' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {user.roleId === '1' ? <Shield size={12} /> : null}
                                            {user.roleId === '1' ? 'Admin' : 'Moderator'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {user.status ? 'Đang hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-900 mx-2 p-2 hover:bg-blue-100 rounded-lg transition-all"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 mx-2 p-2 hover:bg-red-100 rounded-lg transition-all"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">{editingUser ? 'Sửa thông tin' : 'Thêm User mới'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                                <input
                                    type="text" required className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email" required className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vai trò</label>
                                    <select
                                        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    >
                                        <option value="1">Admin</option>
                                        <option value="2">Moderator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                    >
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Khóa</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all">Hủy</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;