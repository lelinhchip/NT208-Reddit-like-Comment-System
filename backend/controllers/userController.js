const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// 1. Đăng ký user mới
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email và password không được để trống' });
    }

    // Kiểm tra username đã tồn tại
    const [existingUser] = await User.findByUsername(username);
    if (existingUser.length) {
      return res.status(409).json({ message: 'Username này đã được sử dụng' });
    }

    // Kiểm tra email đã tồn tại
    const [existingEmail] = await User.findByEmail(email);
    if (existingEmail.length) {
      return res.status(409).json({ message: 'Email này đã được đăng ký' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Tạo user mới
    const [result] = await User.create(username, email, password_hash);
    
    const token = generateToken(result.insertId, username);
    
    res.status(201).json({ 
      message: 'Đăng ký thành công',
      token,
      user: {
        id: result.insertId, 
        username, 
        email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// 2. Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username và password không được để trống' });
    }

    // Tìm user
    const [users] = await User.findByUsername(username);
    if (!users.length) {
      return res.status(401).json({ message: 'Username hoặc password không chính xác' });
    }

    const user = users[0];

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username hoặc password không chính xác' });
    }

    const token = generateToken(user.id, user.username);

    res.json({ 
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username, 
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// 3. Lấy thông tin user theo ID
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await User.findById(req.params.id);
    
    if (!rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('GetUserById error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// 4. Lấy danh sách tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await User.getAll();
    
    const users = rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    }));
    
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};
