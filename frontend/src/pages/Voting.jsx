import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Voting.css";

const API = "http://localhost:5000/api/polls";
const CATEGORIES = ["All", "Food Quality", "Hygiene", "Service", "Timing", "Cleanliness", "Other"];
const CATEGORY_COLORS = {
  "Food Quality": "#f59e0b", Hygiene: "#10b981", Service: "#3b82f6",
  Timing: "#8b5cf6", Cleanliness: "#06b6d4", Other: "#64748b",
};

// ── Donut Chart ────────────────────────────────────────────
function DonutChart({ upvotes, downvotes }) {
  const total = upvotes + downvotes;
  if (total === 0) {
    return (
      <div className="donut-empty">
        <span>No votes yet</span>
      </div>
    );
  }
  const r = 56, cx = 70, cy = 70, sw = 22;
  const circ = 2 * Math.PI * r;
  const upDash = (upvotes / total) * circ;
  const downDash = (downvotes / total) * circ;
  const upOffset = 0;
  const downOffset = -upDash;
  return (
    <div className="donut-wrapper">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {downvotes > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={sw}
            strokeDasharray={`${downDash} ${circ}`}
            strokeDashoffset={downOffset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        )}
        {upvotes > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={sw}
            strokeDasharray={`${upDash} ${circ}`}
            strokeDashoffset={upOffset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">VOTES</text>
      </svg>
      <div className="donut-legend">
        <span className="legend-up">▲ {upvotes} Upvotes</span>
        <span className="legend-down">▼ {downvotes} Downvotes</span>
      </div>
    </div>
  );
}

// ── Time-ago helper ───────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Create Post Modal ─────────────────────────────────────
function CreateModal({ onClose, onCreated, studentId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food Quality");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const res = await axios.post(API, { studentId, title, description, category });
      if (res.data.success) { onCreated(res.data.post); onClose(); }
    } catch (ex) {
      setErr(ex.response?.data?.message || "Failed to create post.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ New Poll Post</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Title <span className="req">*</span></label>
            <input required maxLength={150} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What issue do you want to raise?" className="modal-input" />
            <span className="char-count">{title.length}/150</span>
          </div>
          <div className="modal-field">
            <label>Category <span className="req">*</span></label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="modal-select">
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Description <span className="req">*</span></label>
            <textarea required maxLength={1000} rows={5} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..." className="modal-textarea" />
            <span className="char-count">{description.length}/1000</span>
          </div>
          {err && <div className="modal-err">{err}</div>}
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              {loading ? "Posting..." : "🚀 Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Panel (right side) ─────────────────────────────
function DetailPanel({ post, currentUser, isAdmin, onVote, onAdminResolve, onStudentResolve, onDelete, onClose }) {
  if (!post) return <div className="detail-empty"><span>👈 Select a post to see details</span></div>;

  const uid = currentUser.id || currentUser._id;
  const isCreator = post.createdBy === uid || (post.createdBy?._id ?? post.createdBy)?.toString() === uid;
  const hasUpvoted   = post.upvotedBy?.some(x => x.toString() === uid);
  const hasDownvoted = post.downvotedBy?.some(x => x.toString() === uid);
  const net = (post.upvotedBy?.length ?? 0) - (post.downvotedBy?.length ?? 0);

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <button className="detail-close" onClick={onClose}>✕ Close</button>
      </div>

      {/* Category + Status */}
      <div className="detail-badges">
        <span className="cat-badge" style={{ background: CATEGORY_COLORS[post.category] + "22", color: CATEGORY_COLORS[post.category], border: `1px solid ${CATEGORY_COLORS[post.category]}55` }}>
          {post.category}
        </span>
        {post.adminResolved && post.status === "active" && (
          <span className="badge-admin-resolved">✅ Admin Fixed — Awaiting Confirmation</span>
        )}
        {post.status === "resolved" && <span className="badge-resolved">🏁 Resolved</span>}
      </div>

      <h2 className="detail-title">{post.title}</h2>
      <p className="detail-meta">by <strong>{post.createdByName}</strong> · {timeAgo(post.createdAt)}</p>
      <p className="detail-desc">{post.description}</p>

      {/* Donut Chart */}
      <DonutChart upvotes={post.upvotedBy?.length ?? 0} downvotes={post.downvotedBy?.length ?? 0} />

      {/* Vote Buttons — only non-admin, active post */}
      {!isAdmin && post.status === "active" && (
        <div className="detail-vote-row">
          <button onClick={() => onVote(post._id, "up")} className={`vote-btn vote-up ${hasUpvoted ? "voted" : ""}`}>
            ▲ {post.upvotedBy?.length ?? 0}
          </button>
          <span className={`net-score ${net > 0 ? "pos" : net < 0 ? "neg" : ""}`}>{net > 0 ? "+" : ""}{net}</span>
          <button onClick={() => onVote(post._id, "down")} className={`vote-btn vote-down ${hasDownvoted ? "voted" : ""}`}>
            ▼ {post.downvotedBy?.length ?? 0}
          </button>
        </div>
      )}

      {/* Admin resolve button */}
      {isAdmin && post.status === "active" && !post.adminResolved && (
        <button className="btn-admin-resolve" onClick={() => onAdminResolve(post._id)}>
          🔧 Mark as Fixed (Admin)
        </button>
      )}

      {/* Student confirm resolve */}
      {!isAdmin && isCreator && post.adminResolved && post.status === "active" && (
        <div className="resolve-confirm-box">
          <p>🔔 The mess admin has marked this as fixed!</p>
          <button className="btn-student-resolve" onClick={() => onStudentResolve(post._id)}>
            ✅ Confirm — Issue is Resolved
          </button>
        </div>
      )}

      {/* Delete (creator only, active only) */}
      {!isAdmin && isCreator && post.status === "active" && (
        <button className="btn-delete" onClick={() => onDelete(post._id)}>🗑️ Delete My Post</button>
      )}
    </div>
  );
}

// ── Main Voting Page ──────────────────────────────────────
export default function Voting() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHosteller, setIsHosteller] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");
  const [catFilter, setCatFilter] = useState("All");
  const [showMine, setShowMine] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/"); return; }
    const u = JSON.parse(stored);
    const admin = ["admin", "contractor", "accountant"].includes(u.role);
    const hosteller = u.residencyStatus === "Hosteller";
    if (!admin && !hosteller) { navigate("/dashboard"); return; } // Day-scholars blocked
    setCurrentUser(u);
    setIsAdmin(admin);
    setIsHosteller(hosteller);
  }, [navigate]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (catFilter !== "All") params.append("category", catFilter);
      const res = await axios.get(`${API}?${params}`);
      if (res.data.success) setPosts(res.data.posts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [sort, catFilter]);

  useEffect(() => { if (currentUser) fetchPosts(); }, [currentUser, fetchPosts]);

  // Sync selected post when posts refresh
  useEffect(() => {
    if (selectedPost) {
      const fresh = posts.find(p => p._id === selectedPost._id);
      setSelectedPost(fresh || null);
    }
  }, [posts]);

  const handleVote = async (postId, voteType) => {
    const uid = currentUser.id || currentUser._id;
    try {
      const res = await axios.post(`${API}/${postId}/vote`, { studentId: uid, voteType });
      if (res.data.success) {
        setPosts(prev => prev.map(p =>
          p._id === postId ? { ...p, upvotedBy: res.data.upvotedBy, downvotedBy: res.data.downvotedBy } : p
        ));
      }
    } catch (e) { alert(e.response?.data?.message || "Vote failed."); }
  };

  const handleAdminResolve = async (postId) => {
    try {
      await axios.put(`${API}/${postId}/admin-resolve`);
      fetchPosts();
    } catch (e) { alert("Failed to mark as resolved."); }
  };

  const handleStudentResolve = async (postId) => {
    const uid = currentUser.id || currentUser._id;
    if (!window.confirm("Confirm that the issue has been fixed?")) return;
    try {
      await axios.put(`${API}/${postId}/student-resolve`, { studentId: uid });
      setPosts(prev => prev.filter(p => p._id !== postId));
      setSelectedPost(null);
    } catch (e) { alert(e.response?.data?.message || "Failed."); }
  };

  const handleDelete = async (postId) => {
    const uid = currentUser.id || currentUser._id;
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await axios.delete(`${API}/${postId}`, { data: { studentId: uid } });
      setPosts(prev => prev.filter(p => p._id !== postId));
      setSelectedPost(null);
    } catch (e) { alert(e.response?.data?.message || "Delete failed."); }
  };

  const displayedPosts = showMine
    ? posts.filter(p => {
        const uid = currentUser?.id || currentUser?._id;
        return (p.createdBy?._id ?? p.createdBy)?.toString() === uid || p.createdBy === uid;
      })
    : posts;

  if (!currentUser) return null;

  return (
    <div className="voting-page">
      <div className="voting-container">
        <Navbar />

        {/* Header */}
        <div className="voting-header">
          <div className="voting-header-left">
            <div className="voting-header-icon">🗳️</div>
            <div>
              <h1 className="voting-title">Mess Issues & Polls</h1>
              <p className="voting-subtitle">
                {isAdmin ? "Review and resolve student-raised issues." : "Raise issues, vote on problems, and track resolutions."}
              </p>
            </div>
          </div>
          {isHosteller && !isAdmin && (
            <button className="btn-create-post" onClick={() => setShowCreate(true)}>
              + New Post
            </button>
          )}
        </div>

        {/* Sort + Filter Bar */}
        <div className="filter-bar">
          <div className="sort-tabs">
            {[["recent", "🕒 Recent"], ["trending", "🔥 Trending"], ["top", "⬆️ Top"]].map(([val, label]) => (
              <button key={val} className={`sort-tab ${sort === val ? "sort-tab--active" : ""}`}
                onClick={() => setSort(val)}>{label}</button>
            ))}
          </div>
          <div className="filter-right">
            {isHosteller && !isAdmin && (
              <button className={`mine-toggle ${showMine ? "mine-toggle--active" : ""}`}
                onClick={() => setShowMine(m => !m)}>
                {showMine ? "All Posts" : "My Posts"}
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="cat-chips">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`cat-chip ${catFilter === c ? "cat-chip--active" : ""}`}
              style={catFilter === c && c !== "All" ? { background: CATEGORY_COLORS[c] + "22", color: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] } : {}}>
              {c}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`voting-content ${selectedPost ? "with-panel" : ""}`}>

          {/* Post List */}
          <div className="post-list">
            {loading ? (
              <div className="posts-loading"><span className="spin" />Loading posts...</div>
            ) : displayedPosts.length === 0 ? (
              <div className="posts-empty">
                <span>{showMine ? "You haven't posted anything yet." : "No posts found."}</span>
                {isHosteller && !isAdmin && <button className="btn-create-post" style={{ marginTop: 12 }} onClick={() => setShowCreate(true)}>Be the first to post</button>}
              </div>
            ) : (
              displayedPosts.map(post => {
                const uid = currentUser.id || currentUser._id;
                const hasUp   = post.upvotedBy?.some(x => x.toString() === uid);
                const hasDown = post.downvotedBy?.some(x => x.toString() === uid);
                const net = (post.upvotedBy?.length ?? 0) - (post.downvotedBy?.length ?? 0);
                const isSelected = selectedPost?._id === post._id;
                return (
                  <div key={post._id}
                    className={`post-card ${isSelected ? "post-card--selected" : ""} ${post.adminResolved ? "post-card--admin-resolved" : ""}`}
                    onClick={() => setSelectedPost(isSelected ? null : post)}>
                    {/* Left vote column */}
                    <div className="post-vote-col" onClick={e => e.stopPropagation()}>
                      {!isAdmin ? (
                        <>
                          <button onClick={() => handleVote(post._id, "up")} className={`vote-sm up ${hasUp ? "voted" : ""}`}>▲</button>
                          <span className={`net-sm ${net > 0 ? "pos" : net < 0 ? "neg" : ""}`}>{net}</span>
                          <button onClick={() => handleVote(post._id, "down")} className={`vote-sm down ${hasDown ? "voted" : ""}`}>▼</button>
                        </>
                      ) : (
                        <span className={`net-sm ${net > 0 ? "pos" : net < 0 ? "neg" : ""}`}>{net > 0 ? "+" : ""}{net}</span>
                      )}
                    </div>
                    {/* Post body */}
                    <div className="post-body">
                      <div className="post-body-top">
                        <span className="cat-badge-sm" style={{ background: CATEGORY_COLORS[post.category] + "22", color: CATEGORY_COLORS[post.category] }}>
                          {post.category}
                        </span>
                        {post.adminResolved && <span className="badge-sm-resolved">🔧 Admin Fixed</span>}
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-excerpt">{post.description.slice(0, 120)}{post.description.length > 120 ? "…" : ""}</p>
                      <div className="post-footer">
                        <span>👤 {post.createdByName}</span>
                        <span>🕒 {timeAgo(post.createdAt)}</span>
                        <span>▲ {post.upvotedBy?.length ?? 0} · ▼ {post.downvotedBy?.length ?? 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detail Panel */}
          {selectedPost && (
            <DetailPanel
              post={selectedPost}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onVote={handleVote}
              onAdminResolve={handleAdminResolve}
              onStudentResolve={handleStudentResolve}
              onDelete={handleDelete}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </div>
      </div>

      {showCreate && (
        <CreateModal
          studentId={currentUser.id || currentUser._id}
          onClose={() => setShowCreate(false)}
          onCreated={(post) => { setPosts(prev => [post, ...prev]); }}
        />
      )}
    </div>
  );
}
