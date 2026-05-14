const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
  try {
    const { sort } = req.query;
    const [rows] = await Post.getAll(sort);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách posts: ' + error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const [rows] = await Post.getById(req.params.id);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy post' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy post: ' + error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user_id = req.user?.id; // Lấy từ token (auth middleware)

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
    }

    if (!user_id) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const [result] = await Post.create(user_id, title, content);
    res.status(201).json({ 
      id: result.insertId, 
      user_id, 
      title, 
      content,
      score: 0,
      created_at: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo post: ' + error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;
    const user_id = req.user?.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
    }

    // TODO: Kiểm tra user có sở hữu post không trước khi update
    await Post.update(postId, title, content);
    res.json({ message: 'Cập nhật post thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật post: ' + error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user_id = req.user?.id;

    // TODO: Kiểm tra user có sở hữu post không trước khi xóa
    await Post.delete(postId);
    res.json({ message: 'Xóa post thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa post: ' + error.message });
  }
};