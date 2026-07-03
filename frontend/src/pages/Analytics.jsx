import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, FileText, TrendingUp, RefreshCw } from 'lucide-react';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analytics/');
      if (!response.ok) {
        throw new Error('Could not retrieve analytics data.');
      }
      const resData = await response.json();
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="state-container loading-state">
        <div className="spinner"></div>
        <p>Crunching workspace analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error-state">
        <h3>Analytics Dashboard Unavailable</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchAnalytics}>Retry</button>
      </div>
    );
  }

  const maxAuthorPosts = data?.active_authors?.length > 0 
    ? Math.max(...data.active_authors.map(a => a.posts_count)) 
    : 1;

  const maxPostComments = data?.top_posts?.length > 0 
    ? Math.max(...data.top_posts.map(p => p.comments_count)) 
    : 1;

  return (
    <div className="analytics-container">
      <div className="dashboard-header">
        <div>
          <h1 className="headline-xl">Workspace Analytics</h1>
          <p className="dashboard-subtitle">Key metrics, user engagement levels, and distribution graphs</p>
        </div>
        <button className="btn btn-outline refresh-btn" onClick={fetchAnalytics}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Bento Box Grid Layout */}
      <div className="analytics-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper text-blue">
            <FileText size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Articles</span>
            <h3 className="stat-value">{data.total_posts}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper text-green">
            <MessageSquare size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Comments</span>
            <h3 className="stat-value">{data.total_comments}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper text-orange">
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Avg. Word Count</span>
            <h3 className="stat-value">{data.avg_word_count} words</h3>
          </div>
        </div>
      </div>

      {/* Visual Graphs Row */}
      <div className="analytics-graphs-row">
        {/* Top Contributors Chart */}
        <div className="graph-panel">
          <h3 className="headline-md graph-title">
            <Users size={18} />
            <span>Top Contributors</span>
          </h3>
          <p className="graph-subtitle">Total articles submitted by workspace authors</p>
          
          {data.active_authors.length === 0 ? (
            <div className="graph-empty-state">
              <p>No publishing data available.</p>
            </div>
          ) : (
            <div className="bar-chart-container">
              {data.active_authors.map((author, index) => {
                const percent = (author.posts_count / maxAuthorPosts) * 100;
                return (
                  <div key={index} className="bar-chart-row">
                    <div className="bar-row-header">
                      <span className="bar-row-label">{author.username}</span>
                      <span className="bar-row-value">
                        {author.posts_count} {author.posts_count === 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                    <div className="bar-row-track">
                      <div 
                        className="bar-row-fill" 
                        style={{ '--target-width': `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Most Engaged Posts Chart */}
        <div className="graph-panel">
          <h3 className="headline-md graph-title">
            <BarChart3 size={18} />
            <span>Most Discussed Articles</span>
          </h3>
          <p className="graph-subtitle">Blog posts sorted by count of associated comments</p>

          {data.top_posts.length === 0 ? (
            <div className="graph-empty-state">
              <p>No discussion/comment data available.</p>
            </div>
          ) : (
            <div className="bar-chart-container">
              {data.top_posts.map((post, index) => {
                const percent = (post.comments_count / maxPostComments) * 100;
                return (
                  <div key={index} className="bar-chart-row">
                    <div className="bar-row-header">
                      <span className="bar-row-label truncate">{post.title}</span>
                      <span className="bar-row-value">
                        {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
                      </span>
                    </div>
                    <div className="bar-row-track">
                      <div 
                        className="bar-row-fill" 
                        style={{ '--target-width': `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
