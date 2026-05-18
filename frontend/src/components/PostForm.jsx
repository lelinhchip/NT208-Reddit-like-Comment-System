import { useState } from "react";

function PostForm({ onPostCreated }) 
{
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => 
    {
    if (!title.trim()) return;

    await fetch("http://localhost:5000/api/posts",{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    onPostCreated();
  };

  return (
    <div className="post-form">
      <h2>Tạo Post mới</h2>
      <input
        type="text"
        placeholder="Tiêu đề"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Nội dung"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleSubmit}>Đăng</button>
    </div>
  );
}

export default PostForm;
