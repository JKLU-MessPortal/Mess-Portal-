const mongoose = require('mongoose');
const PollPost = require('../models/PollPost');
const User = require('../models/User');

// ── Sorting helper ──────────────────────────────────────────
function sortPosts(posts, sort) {
  if (sort === 'top') {
    return posts.sort((a, b) =>
      (b.upvotedBy.length - b.downvotedBy.length) - (a.upvotedBy.length - a.downvotedBy.length)
    );
  }
  if (sort === 'trending') {
    const score = (p) => {
      const net = p.upvotedBy.length - p.downvotedBy.length;
      const ageHours = (Date.now() - new Date(p.createdAt).getTime()) / 3_600_000;
      return net / Math.pow(ageHours + 2, 1.5);
    };
    return posts.sort((a, b) => score(b) - score(a));
  }
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // recent
}

// 1. GET posts (active OR resolved archive) with optional search
exports.getPosts = async (req, res) => {
  try {
    const { sort = 'recent', category, status = 'active', search } = req.query;

    const filter = { status };
    if (category && category !== 'All') filter.category = category;
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: re },
        { description: re },
        { createdByName: re },
      ];
    }

    const posts = await PollPost.find(filter).lean();

    // Archive: always sort by resolvedAt desc; Active: use sort param
    const sorted = status === 'resolved'
      ? posts.sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt))
      : sortPosts(posts, sort);

    res.json({ success: true, posts: sorted });
  } catch (e) {
    console.error('getPosts:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// 2. CREATE post (Hosteller only)
exports.createPost = async (req, res) => {
  try {
    const { studentId, title, description, category } = req.body;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.residencyStatus !== 'Hosteller') {
      return res.status(403).json({ success: false, message: 'Only Hosteliers can create poll posts.' });
    }
    const post = await PollPost.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      createdBy: studentId,
      createdByName: user.name,
    });
    res.status(201).json({ success: true, post });
  } catch (e) {
    console.error('createPost:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. VOTE on a post
exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, voteType } = req.body; // voteType: 'up' | 'down'
    const post = await PollPost.findById(id);
    if (!post || post.status === 'resolved') {
      return res.status(404).json({ success: false, message: 'Post not found or resolved.' });
    }
    const uid = new mongoose.Types.ObjectId(studentId);
    const hasUpvoted   = post.upvotedBy.some(x => x.equals(uid));
    const hasDownvoted = post.downvotedBy.some(x => x.equals(uid));

    let update;
    if (voteType === 'up') {
      update = hasUpvoted
        ? { $pull: { upvotedBy: uid } }
        : { $addToSet: { upvotedBy: uid }, $pull: { downvotedBy: uid } };
    } else {
      update = hasDownvoted
        ? { $pull: { downvotedBy: uid } }
        : { $addToSet: { downvotedBy: uid }, $pull: { upvotedBy: uid } };
    }
    const updated = await PollPost.findByIdAndUpdate(id, update, { new: true });
    res.json({
      success: true,
      upvotes:     updated.upvotedBy.length,
      downvotes:   updated.downvotedBy.length,
      upvotedBy:   updated.upvotedBy,
      downvotedBy: updated.downvotedBy,
    });
  } catch (e) {
    console.error('vote:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. ADMIN marks post as resolved
exports.adminResolve = async (req, res) => {
  try {
    const post = await PollPost.findByIdAndUpdate(
      req.params.id,
      { adminResolved: true, adminResolvedAt: new Date() },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Marked as resolved by admin.', post });
  } catch (e) {
    console.error('adminResolve:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. STUDENT confirms resolution (only original creator, only after admin resolves)
exports.studentResolve = async (req, res) => {
  try {
    const { studentId } = req.body;
    const post = await PollPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.createdBy.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Only the post creator can confirm resolution.' });
    }
    if (!post.adminResolved) {
      return res.status(400).json({ success: false, message: 'Admin has not resolved this yet.' });
    }
    post.status = 'resolved';
    post.resolvedAt = new Date();
    await post.save();
    res.json({ success: true, message: 'Issue confirmed resolved! Post archived.' });
  } catch (e) {
    console.error('studentResolve:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. DELETE own post (creator only, only if no votes yet)
exports.deletePost = async (req, res) => {
  try {
    const { studentId } = req.body;
    const post = await PollPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.createdBy.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted.' });
  } catch (e) {
    console.error('deletePost:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
