const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/postController');
const voteCtrl = require('../controllers/voteController');

router.get('/',        ctrl.getAllPosts);
router.get('/:id',     ctrl.getPost);
router.post('/',       ctrl.createPost);
router.put('/:id',     ctrl.updatePost);
router.delete('/:id',  ctrl.deletePost);
router.post('/:post_id/vote',  voteCtrl.vote);

module.exports = router;