const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Lưu vào thư mục uploads
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên hình ảnh!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
});

/**
 * Tải ảnh lên
 * POST /api/upload
 */
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
        }

        // Tạo URL có thể truy cập được từ bên ngoài
        const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
            message: 'Tải ảnh lên thành công'
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tải ảnh' });
    }
});

module.exports = router;
