# Frontend API Client Documentation

Tất cả các API client đều sử dụng axios và tự động thêm JWT token vào header của request.

## 📝 User API (`userApi.js`)

### Đăng ký
```javascript
import { registerUser } from '@/api/userApi';

const result = await registerUser({
  username: 'john',
  email: 'john@example.com',
  password: 'password123'
});
// Response: { message, token, user: { id, username, email } }
```

### Đăng nhập
```javascript
import { loginUser } from '@/api/userApi';

const result = await loginUser({
  username: 'john',
  password: 'password123'
});
// Response: { message, token, user: { id, username, email, avatar_url } }
// Token được tự động lưu vào localStorage
```

### Lấy thông tin user (cần token)
```javascript
import { getUserById } from '@/api/userApi';

const user = await getUserById(1);
// Response: { id, username, email, avatar_url, created_at }
```

### Lấy danh sách tất cả users (cần token)
```javascript
import { getAllUsers } from '@/api/userApi';

const result = await getAllUsers();
// Response: { count, users: [...] }
```

### Logout
```javascript
import { logoutUser } from '@/api/userApi';

logoutUser(); // Xóa token từ localStorage
```

### Kiểm tra xác thực
```javascript
import { isAuthenticated, getCurrentUser, getAuthToken } from '@/api/userApi';

if (isAuthenticated()) {
  const user = getCurrentUser(); // Lấy user object
  const token = getAuthToken();  // Lấy JWT token
}
```

---

## 📮 Post API (`postApi.js`)

### Lấy tất cả posts
```javascript
import { getAllPosts } from '@/api/postApi';

const result = await getAllPosts(limit = 20, offset = 0);
// Response: { posts: [...], total, hasMore }
```

### Lấy chi tiết post
```javascript
import { getPostById } from '@/api/postApi';

const post = await getPostById(1);
// Response: { id, title, content, author, score, commentCount, createdAt }
```

### Tạo post mới (cần token)
```javascript
import { createPost } from '@/api/postApi';

const newPost = await createPost({
  title: 'Tiêu đề bài viết',
  content: 'Nội dung bài viết'
});
// Response: { id, title, content, author, score, commentCount, createdAt }
```

### Cập nhật post (cần token)
```javascript
import { updatePost } from '@/api/postApi';

const updated = await updatePost(1, {
  title: 'Tiêu đề mới',
  content: 'Nội dung mới'
});
```

### Xóa post (cần token)
```javascript
import { deletePost } from '@/api/postApi';

await deletePost(1);
// Response: { message: 'Post deleted successfully' }
```

### Vote post (cần token)
```javascript
import { votePost } from '@/api/postApi';

await votePost(1, 1);  // 1 = upvote, -1 = downvote
// Response: { score, userVote }
```

---

## 💬 Comment API (`commentApi.js`)

### Lấy tất cả bình luận của post
```javascript
import { getCommentsByPostId } from '@/api/commentApi';

const comments = await getCommentsByPostId(1);
// Response: { comments: [...], total }
```

### Lấy chi tiết bình luận
```javascript
import { getCommentById } from '@/api/commentApi';

const comment = await getCommentById(1);
// Response: { id, postId, content, author, score, createdAt }
```

### Lấy replies của bình luận
```javascript
import { getCommentReplies } from '@/api/commentApi';

const replies = await getCommentReplies(1);
// Response: { replies: [...] }
```

### Tạo bình luận (cần token)
```javascript
import { createComment } from '@/api/commentApi';

const newComment = await createComment({
  post_id: 1,
  content: 'Nội dung bình luận',
  parent_id: null  // null nếu là bình luận gốc, parentId nếu là reply
});
// Response: { id, postId, content, author, score, createdAt }
```

### Cập nhật bình luận (cần token)
```javascript
import { updateComment } from '@/api/commentApi';

const updated = await updateComment(1, {
  content: 'Nội dung bình luận mới'
});
```

### Xóa bình luận (cần token)
```javascript
import { deleteComment } from '@/api/commentApi';

await deleteComment(1);
// Response: { message: 'Comment deleted successfully' }
```

### Vote bình luận (cần token)
```javascript
import { voteComment } from '@/api/commentApi';

await voteComment(1, 1);  // 1 = upvote, -1 = downvote
// Response: { score, userVote }
```

---

## 🔐 Authentication Flow

### Middleware & Interceptor
- Axios tự động thêm token vào header: `Authorization: Bearer <token>`
- Nếu nhận 401, token sẽ bị xóa và redirect về login

### Lưu trữ
- Token lưu vào: `localStorage.authToken`
- User info lưu vào: `localStorage.user`

### Sử dụng trong Components
```javascript
import { isAuthenticated, getCurrentUser } from '@/api/userApi';

if (!isAuthenticated()) {
  // Redirect to login
  navigate('/login');
} else {
  const user = getCurrentUser();
  console.log(user.username);
}
```

---

## ⚠️ Error Handling

Tất cả các functions trả về Promise và có thể ném error:

```javascript
try {
  const result = await loginUser({ username, password });
} catch (error) {
  console.error(error.message); // "Username hoặc password không chính xác"
}
```

---

## 🌐 API Base URL

Mặc định: `http://localhost:5000/api`

Có thể thay đổi qua `.env`:
```
VITE_API_URL=http://your-api-url/api
```
