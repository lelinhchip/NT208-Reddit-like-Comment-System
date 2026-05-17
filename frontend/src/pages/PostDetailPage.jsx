import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommentList from '../components/CommentList';
import { getPostById } from '../api/postApi';

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user')); // Lấy từ auth

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <hr />
      <CommentList postId={id} currentUser={currentUser} />
    </div>
  );
};

export default PostDetailPage;