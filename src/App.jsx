import React, { useState } from 'react';
import Login from './Login';
import UserDashboard from "./pages/Admin/UserManagement";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <div className="App">
            {!isLoggedIn ? (
                <Login onLogin={setIsLoggedIn} />
            ) : (
                <div>
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={handleLogout}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm font-medium"
                        >
                            Đăng xuất
                        </button>
                    </div>
                    <UserDashboard />
                </div>
            )}
        </div>
    );
}

export default App;