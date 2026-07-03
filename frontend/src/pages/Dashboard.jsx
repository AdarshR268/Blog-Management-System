import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, RefreshCw } from 'lucide-react';

export const Dashboard = ({ searchQuery }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/posts/');
      if (!response.ok) {
        throw new Error('Failed to fetch posts from backend.');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);


  // Excerpt generation
  const getExcerpt = (content) => {
    const textOnly = content.replace(/[#*`_]/g, ''); // strip basic markdown
    if (textOnly.length <= 130) return textOnly;
    return textOnly.slice(0, 130).trim() + '...';
  };

  // Date formatter
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter posts based on global search
  const filteredPosts = posts.filter(post => {
    const search = searchQuery?.toLowerCase() || "";
    return (
      post.title.toLowerCase().includes(search) ||
      post.content.toLowerCase().includes(search) ||
      (post.author_details?.username && post.author_details.username.toLowerCase().includes(search))
    );
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="headline-xl">Workspace Feed</h1>
          <p className="dashboard-subtitle">Explore, write, and analyze article contributions</p>
        </div>
        <button className="btn btn-outline refresh-btn" onClick={fetchPosts} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Fetching workspace posts...</p>
        </div>
      ) : error ? (
        <div className="state-container error-state">
          <h3>Failed to load Feed</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchPosts}>Try Again</button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="state-container empty-state">
          <h3>No posts found</h3>
          <p>
            {searchQuery 
              ? `No articles match your search "${searchQuery}".` 
              : "The blog is currently empty. Be the first to write a post!"}
          </p>
          {!searchQuery && (
            <Link to="/new-post" className="btn btn-primary">
              Create First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map(post => {
            return (
              <Link to={`/posts/${post.id}`} key={post.id} className="post-card">
                <div className="post-card-body">
                  <h2 className="headline-md post-card-title">{post.title}</h2>
                  <p className="post-card-excerpt">{getExcerpt(post.content)}</p>
                </div>

                <div className="post-card-footer">
                  <div className="post-card-author-section">
                    <div className="author-avatar">
                      {post.author_details?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="author-meta">
                      <span className="author-name">{post.author_details?.username || 'Unknown Author'}</span>
                      <span className="post-date">
                        <Calendar size={12} />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="post-card-counters">
                    <span className="counter-badge label-sm">
                      <MessageSquare size={13} />
                      {post.comments_count}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
