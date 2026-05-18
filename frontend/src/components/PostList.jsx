import { useState, useEffect } from "react";
import PostItem from "./PostItem";

function PostList({ refresh }) {
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("new");

  const fetchPosts = async () => {
    const res = await fetch(`http://localhost:5000/api/posts?sort=${sort}`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, [sort, refresh]);

  const handleVote = async (post_id, value) => {
    await fetch(`http://localhost:5000/api/posts/${post_id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 99, value }),
    });
    fetchPosts();
  };

  const handleDelete = async (post_id) => {
    await fetch(`http://localhost:5000/api/posts/${post_id}`, {
      method: "DELETE",
    });
    fetchPosts();
  };

  return (
    <div>
      <div className="sort-buttons">
        <button onClick={() => setSort("new")}>🕐 New</button>
        <button onClick={() => setSort("top")}>🔥 Top</button>
      </div>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onVote={handleVote}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default PostList;
