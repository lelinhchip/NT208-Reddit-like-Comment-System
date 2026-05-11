# API DOCUMENTATION

## Base URL
```
http://localhost:5000/api
```

## User Endpoints

### Register User
**POST** `/users/register`
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Login User
**POST** `/users/login`
```json
{
  "username": "string",
  "password": "string"
}
```

### Get User by ID
**GET** `/users/:id`

### Get All Users
**GET** `/users`

---

## Post Endpoints

### Create Post
**POST** `/posts`
```json
{
  "user_id": "integer",
  "title": "string",
  "content": "string"
}
```

### Get All Posts
**GET** `/posts?limit=10&offset=0`

### Get Post by ID
**GET** `/posts/:id`

### Update Post
**PUT** `/posts/:id`
```json
{
  "title": "string",
  "content": "string"
}
```

### Delete Post
**DELETE** `/posts/:id`

### Vote on Post
**POST** `/posts/:id/vote`
```json
{
  "voteType": "upvote|downvote"
}
```

---

## Comment Endpoints

### Create Comment
**POST** `/comments`
```json
{
  "post_id": "integer",
  "user_id": "integer",
  "parent_comment_id": "integer (optional)",
  "content": "string"
}
```

### Get Comments by Post ID
**GET** `/comments/post/:postId`

### Get Comment by ID
**GET** `/comments/:id`

### Get Comment Replies
**GET** `/comments/:commentId/replies`

### Update Comment
**PUT** `/comments/:id`
```json
{
  "content": "string"
}
```

### Delete Comment
**DELETE** `/comments/:id`

### Vote on Comment
**POST** `/comments/:id/vote`
```json
{
  "voteType": "upvote|downvote"
}
```

---

## Database Schema

### Users Table
```sql
- id: PRIMARY KEY
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(100) UNIQUE
- password: VARCHAR(255)
- avatar_url: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Posts Table
```sql
- id: PRIMARY KEY
- user_id: FOREIGN KEY (users.id)
- title: VARCHAR(255)
- content: LONGTEXT
- upvotes: INT (default: 0)
- downvotes: INT (default: 0)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Comments Table
```sql
- id: PRIMARY KEY
- post_id: FOREIGN KEY (posts.id)
- user_id: FOREIGN KEY (users.id)
- parent_comment_id: FOREIGN KEY (comments.id) - for nested comments
- content: LONGTEXT
- upvotes: INT (default: 0)
- downvotes: INT (default: 0)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```
