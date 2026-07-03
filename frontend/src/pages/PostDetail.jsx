import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, MessageSquare, Edit, Trash2, AlertCircle } from 'lucide-react';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [savingCommentId, setSavingCommentId] = useState(null);

  const API = "http://127.0.0.1:8000";

  useEffect(() => {
  const fetchPostAndComments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch post
      const postResponse = await fetch(`${API}/api/posts/${id}/`);
      if (!postResponse.ok) {
        if (postResponse.status === 404) {
          throw new Error("Post not found.");
        }
        throw new Error("Failed to load post.");
      }
      const postData = await postResponse.json();
      setPost(postData);

      // Fetch comments
      const commentsResponse = await fetch(`${API}/api/posts/${id}/comments/`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
    fetchPostAndComments();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${API}/api/posts/${id}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment.');
      }
      setComments([data, ...comments]);
      setCommentText("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`${API}/api/comments/${commentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment.');
      }
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return;

    setSavingCommentId(commentId);
    try {
      const response = await fetch(`${API}/api/comments/${commentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ content: editingText })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update comment.');
      }
      setComments(comments.map(c => c.id === commentId ? { ...c, content: data.content } : c));
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingCommentId(null);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this article? This cannot be undone.")) return;

    try {
      const response = await fetch(`${API}/api/posts/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete article.');
      }
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="state-container loading-state">
        <div className="spinner"></div>
        <p>Fetching article content...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="state-container error-state">
        <AlertCircle size={40} className="text-error" style={{ marginBottom: '16px' }} />
        <h3>Failed to load post</h3>
        <p>{error || "Post data not available."}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Feed</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} />
        <span>Back to Feed</span>
      </Link>

      <article style={{ marginBottom: '40px' }}>
        <h1 className="headline-xl" style={{ marginBottom: '16px', lineHeight: '1.3' }}>{post.title}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', borderBottom: '1px solid var(--color-border-soft)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="author-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {post.author_details?.username?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '14px' }}>{post.author_details?.username || 'Unknown Author'}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>
          
          {user && post.author === user.id && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/posts/${post.id}/edit`} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '13px' }}>
                <Edit size={14} />
                <span>Edit</span>
              </Link>
              <button onClick={handleDeletePost} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '13px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <div className="post-content-body" style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', minHeight: '200px' }}>
          {post.content}
        </div>
      </article>

      <div className="comments-section">
        <div className="comments-header">
          <MessageSquare size={20} />
          <span className="comments-title">Discussion ({comments.length})</span>
        </div>

        {token ? (
          <form onSubmit={handleAddComment} className="comment-form">
            <div className="comment-input-wrapper">
              <textarea
                className="comment-textarea"
                placeholder="Join the discussion..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submittingComment}
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-comment-submit"
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="comment-login-promo">
            <p>You must be signed in to contribute to the discussion.</p>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments-label">No comments yet. Start the conversation!</div>
          ) : (
            comments.map(comment => (
              <div className="comment-node" key={comment.id}>
                <div className="comment-node-header">
                  <div className="comment-author-badge">
                    <div className="author-avatar small">
                      {comment.author_details?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="comment-author-name">
                      {comment.author_details?.username || 'Unknown User'}
                      <span className="comment-timestamp">
                        • {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {user && comment.author === user.id && editingCommentId !== comment.id && (
                    <div className="comment-actions">
                      <button 
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingText(comment.content);
                        }} 
                        className="btn-comment-action"
                        title="Edit Comment"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)} 
                        className="btn-comment-action text-error"
                        title="Delete Comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="comment-node-body">
                  {editingCommentId === comment.id ? (
                    <div className="comment-edit-wrapper" style={{ marginTop: '8px' }}>
                      <textarea
                        className="comment-textarea"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        disabled={savingCommentId === comment.id}
                        style={{ minHeight: '80px', marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingText("");
                          }}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          disabled={savingCommentId === comment.id}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          disabled={savingCommentId === comment.id || !editingText.trim()}
                        >
                          {savingCommentId === comment.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-text">{comment.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
