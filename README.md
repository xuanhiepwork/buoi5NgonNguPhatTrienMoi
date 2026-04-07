# Đổi nhánh link github:
```bash
git remote set-url origin https://github.com/xuanhiepwork/buoi5NgonNguPhatTrienMoi.git
```

git branch -M main
git push -u origin main

# Ngừng theo dõi package-lock.json
git rm --cached package-lock.json

# Ngừng theo dõi toàn bộ thư mục node_modules (nếu lỡ dính vào)
git rm -r --cached node_modules/

# Lưu lại thay đổi (Git sẽ hiểu là bạn vừa xóa các file này khỏi Repo)
git commit -m "Dọn dẹp: Xóa package-lock và node_modules khỏi GitHub"

# Đẩy lên nhánh main
git push origin main


login("admin", "admin123");

# RUN
npm run server
npm run dev