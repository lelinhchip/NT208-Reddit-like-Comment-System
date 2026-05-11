const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
  const { sort } = req.query;
  const [rows] = await Post.getAll(sort);
  res.json(rows);
};

exports.getPost = async (req, res) => {
  const [rows] = await Post.getById(req.params.id);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
};

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const [result] = await Post.create(title, content);
  res.status(201).json({ id: result.insertId, title, content });
};

exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  await Post.update(req.params.id, title, content);
  res.json({ message: 'Updated' });
};

exports.deletePost = async (req, res) => {
  await Post.delete(req.params.id);
  res.json({ message: 'Deleted' });
};