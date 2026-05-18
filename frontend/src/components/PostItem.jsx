function PostItem({ post, onVote, onDelete }) {
  return (
    <div className="post">
      <div className="vote-section">
        <button onClick={() => onVote(post.id, 1)}>⬆️</button>
        <span className="score">{post.vote_count}</span>
        <button onClick={() => onVote(post.id, -1)}>⬇️</button>
      </div>
      <div className="post-content">
        <h3>{post.title}</h3>
        <p>{post.content}</p>
        <button className="delete-btn" onClick={() => onDelete(post.id)}>
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
}

export default PostItem;
