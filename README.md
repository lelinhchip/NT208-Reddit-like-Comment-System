# NT208 - Reddit-like Comment System

## Thành viên nhóm:
- Lê Hồ Khánh Linh 
- Bùi Nguyễn Minh Anh
- Lê Lâm Bảo Tư
- Thân Thị Khánh Linh

## Công nghệ sử dụng:
- **Frontend**: ReactJS + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Container**: Docker

## Cấu trúc dự án:

```
NT208-Reddit-like-Comment-System/
├── backend/
│   ├── config/
│   │   └── db.js                # TODO: Setup MySQL connection
│   ├── controllers/
│   │   ├── userController.js    # TODO: User logic
│   │   ├── postController.js    # TODO: Post logic
│   │   └── commentController.js # TODO: Comment logic
│   ├── models/
│   │   ├── User.js              # TODO: User model
│   │   ├── Post.js              # TODO: Post model
│   │   └── Comment.js           # TODO: Comment model
│   ├── routes/
│   │   ├── userRoutes.js        # TODO: User routes
│   │   ├── postRoutes.js        # TODO: Post routes
│   │   └── commentRoutes.js     # TODO: Comment routes
│   ├── index.js                 # TODO: Setup routes
│   ├── package.json             # Dependencies (ready)
│   ├── .env                     # Config (ready)
│   └── Dockerfile               # Docker config (ready)
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js        # Axios config (ready)
│   │   │   ├── postApi.js       # TODO: Post API functions
│   │   │   ├── commentApi.js    # TODO: Comment API functions
│   │   │   └── userApi.js       # TODO: User API functions
│   │   ├── components/
│   │   │   ├── PostForm.jsx     # TODO: Create post form
│   │   │   ├── PostItem.jsx     # TODO: Post item display
│   │   │   ├── PostList.jsx     # TODO: List posts
│   │   │   ├── CommentForm.jsx  # TODO: Create comment form
│   │   │   ├── CommentItem.jsx  # TODO: Comment item display
│   │   │   └── CommentList.jsx  # TODO: List comments
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # TODO: Home page
│   │   │   └── PostDetailPage.jsx # TODO: Post detail page
│   │   ├── App.jsx              # TODO: Setup routes
│   │   └── main.jsx             # Entry point (ready)
│   ├── package.json             # Dependencies (ready)
│   ├── .env                     # Config (ready)
│   └── Dockerfile               # Docker config (ready)
├── database/
│   └── reddit_db.sql                 # Schema (ready)
├── docker-compose.yml           # Docker compose (ready)
├── .gitignore                   # Git config (ready)
├── .env.example                 # Config template (ready)
└── API_DOCUMENTATION.md         # API docs reference
```

## Hướng dẫn phát triển:

### File sườn (TODO)
Các file code có chứa `// TODO:` là chỗ nhóm cần điền code. Mỗi file có ghi chú về những gì cần implement.

### Thứ tự phát triển khuyến nghị:
1. **Backend - Config & Models** (models/User.js, models/Post.js, models/Comment.js, config/db.js)
2. **Backend - Controllers** (controllers/userController.js, etc.)
3. **Backend - Routes** (routes/userRoutes.js, etc.)
4. **Backend - Main** (index.js - import routes)
5. **Frontend - API** (src/api/postApi.js, etc.)
6. **Frontend - Components** (Các component files)
7. **Frontend - Pages** (HomePage.jsx, PostDetailPage.jsx)
8. **Frontend - App** (App.jsx - setup router)

## Hướng dẫn chạy dự án:

### 1. Clone Repository
```bash
git clone https://github.com/lelinhchip/NT208-Reddit-like-Comment-System
cd NT208-Reddit-like-Comment-System
```

### 2. Sử dụng Docker (Recommended)

**Yêu cầu**: Docker và Docker Compose đã cài đặt

```bash
# Build và chạy tất cả services
docker-compose up --build

# Khi chạy lần tiếp theo (không cần build lại)
docker-compose up

# Dừng services
docker-compose down
```

**URLs**:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: localhost:3306

### 3. Chạy Locally (Không dùng Docker)

#### Backend Setup:
```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo .env file
cp .env.example .env
# Chỉnh sửa .env với cấu hình MySQL của bạn

# Chạy server
npm start
```

#### Frontend Setup:
```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo .env file
cp .env.example .env

# Chạy development server
npm run dev

# Build production
npm run build
```

#### Database Setup:
```bash
# Tạo database và tables
mysql -u root -p < database/init.sql
```

## Tính năng chính:

✅ **Posts**
- Tạo bài viết mới
- Xem danh sách bài viết
- Xem chi tiết bài viết
- Chỉnh sửa bài viết (của chính mình)
- Xóa bài viết (của chính mình)
- Upvote/Downvote bài viết

✅ **Comments**
- Bình luận trên bài viết
- Trả lời bình luận (nested comments)
- Chỉnh sửa bình luận (của chính mình)
- Xóa bình luận (của chính mình)
- Upvote/Downvote bình luận

✅ **Users**
- Đăng ký người dùng
- Đăng nhập
- Xem hồ sơ người dùng

## API Documentation

Xem file [API_DOCUMENTATION.md](API_DOCUMENTATION.md) để có chi tiết các API endpoints.

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reddit_db
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Phát triển thêm:

**Tính năng có thể bổ sung:**
- Authentication/Authorization (JWT)
- User profile pages
- Search functionality
- Categories/Tags
- Notifications
- User follows/followers
- Post edit history
- Comment reactions (emojis)
- Real-time updates (WebSocket)
- Image upload
- Email notifications

## Troubleshooting:

**Database connection error:**
- Kiểm tra MySQL service đang chạy
- Kiểm tra .env file có đúng credentials

**Port already in use:**
```bash
# Kill process on port
Windows: netstat -ano | findstr :5173
         taskkill /PID <PID> /F

macOS/Linux: lsof -i :5173
             kill -9 <PID>
```

**Docker issues:**
```bash
# Remove all containers and images
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```


