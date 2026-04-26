const express = require('express');
const router = express.Router();
const {
  getPosts, createPost, vote,
  adminResolve, studentResolve, deletePost,
} = require('../controllers/pollController');

router.get('/',                    getPosts);
router.post('/',                   createPost);
router.post('/:id/vote',           vote);
router.put('/:id/admin-resolve',   adminResolve);
router.put('/:id/student-resolve', studentResolve);
router.delete('/:id',              deletePost);

module.exports = router;
