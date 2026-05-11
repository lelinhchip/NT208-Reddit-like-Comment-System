const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const commentRoutes = require('./routes/commentRoutes');

app.get('/', (req, res) => {
    res.send('Server Reddit-Clone');
});

// Use routes
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


