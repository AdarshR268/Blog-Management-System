import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bold, Italic, Heading, Link as LinkIcon, Code, List, Eye, Edit2, 
  Settings, ChevronRight, ChevronLeft, ArrowLeft, Save, AlertCircle 
} from 'lucide-react';

export const EditorPage = () => {
  const { token, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("Technology, Writing");
  const [statusOptions, setStatusOptions] = useState("published");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Zen mode state: opacity fades on typing, restores on mouse movement
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  // Protect route
  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: id ? `/posts/${id}/edit` : '/new-post' } } });
    }
  }, [token, navigate, id]);

  // Load existing post details
  useEffect(() => {
    if (id && token) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/posts/${id}/`);
          if (!response.ok) {
            throw new Error("Failed to retrieve post details.");
          }
          const data = await response.json();
          if (data.author !== user.id) {
            navigate('/', { replace: true });
            return;
          }
          setTitle(data.title);
          setContent(data.content);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, token, user, navigate]);

  const handleKeyDown = () => {
    setIsTyping(true);
    // Clear existing timer
    if (typingTimer.current) clearTimeout(typingTimer.current);
    // Automatically restore if they stop typing for 3 seconds
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    if (isTyping) {
      setIsTyping(false);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById("editor-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let replacement = "";
    
    switch (syntax) {
      case 'bold':
        replacement = `**${selectedText || "bold text"}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || "italic text"}*`;
        break;
      case 'heading':
        replacement = `\n## ${selectedText || "Heading"}\n`;
        break;
      case 'code':
        replacement = `\`${selectedText || "code"}\``;
        break;
      case 'list':
        replacement = `\n- ${selectedText || "list item"}`;
        break;
      case 'link':
        replacement = `[${selectedText || "Link text"}](https://example.com)`;
        break;
      default:
        break;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Article content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const url = id 
        ? `http://127.0.0.1:8000/api/posts/${id}/` 
        : 'http://127.0.0.1:8000/api/posts/';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post.');
      }
      
      navigate(`/posts/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderSimpleMarkdown = (mdText) => {
    if (!mdText) return "<p style='color: #6B7280; font-style: italic;'>Start typing to see live preview...</p>";
    
    let html = mdText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>');
    
    html = html.replace(/\n/g, '<br/>');

    return html;
  };

  if (loading) {
    return (
      <div className="state-container loading-state">
        <div className="spinner"></div>
        <p>Loading editor canvas...</p>
      </div>
    );
  }

  return (
    <div 
      className={`editor-page-container ${isTyping ? 'zen-typing' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Editor Top Bar */}
      <div className="editor-header">
        <div className="editor-header-left">
          <Link to="/" className="btn-back">
            <ArrowLeft size={16} />
            <span>Feed</span>
          </Link>
          <span className="editor-status">
            {id ? `Editing: ${title || 'Post'}` : 'New Article Draft'}
          </span>
        </div>

        <div className="editor-header-right">
          <button 
            type="button" 
            className={`btn btn-outline ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit2 size={16} /> : <Eye size={16} />}
            <span>{previewMode ? "Edit Mode" : "Preview"}</span>
          </button>

          <button 
            type="button" 
            onClick={handleSave} 
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Publish"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error editor-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Split Canvas */}
      <div className="editor-workspace">
        <div className="editor-canvas-pane">
          {previewMode ? (
            <div className="editor-preview-canvas">
              <h1 className="preview-title">{title || "Untitled Article"}</h1>
              <div 
                className="preview-body body-lg"
                dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(content) }}
              />
            </div>
          ) : (
            <div className="editor-write-canvas">
              <input 
                type="text" 
                placeholder="Title your article..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="editor-title-input"
                onKeyDown={handleKeyDown}
              />

              {/* Floating Toolbar */}
              <div className="editor-toolbar">
                <button type="button" onClick={() => insertMarkdown('bold')} title="Bold (**text**)"><Bold size={15} /></button>
                <button type="button" onClick={() => insertMarkdown('italic')} title="Italic (*text*)"><Italic size={15} /></button>
                <button type="button" onClick={() => insertMarkdown('heading')} title="Heading (## text)"><Heading size={15} /></button>
                <button type="button" onClick={() => insertMarkdown('code')} title="Code (`code`)"><Code size={15} /></button>
                <button type="button" onClick={() => insertMarkdown('list')} title="Bullet List (- item)"><List size={15} /></button>
                <button type="button" onClick={() => insertMarkdown('link')} title="Insert Link [text](url)"><LinkIcon size={15} /></button>
              </div>

              <textarea 
                id="editor-textarea"
                placeholder="Write your content here in Markdown format..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="editor-body-textarea body-lg"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>

        {/* Collapsible Meta Sidebar */}
        <div className={`editor-meta-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <button 
            type="button" 
            className="sidebar-collapse-trigger"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {isSidebarOpen && (
            <div className="sidebar-meta-content">
              <div className="sidebar-meta-section">
                <h4 className="meta-section-title">
                  <Settings size={14} />
                  <span>Metadata settings</span>
                </h4>
                
                <div className="meta-group">
                  <label className="meta-label">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)} 
                    className="meta-input"
                  />
                </div>

                <div className="meta-group">
                  <label className="meta-label">Publish Visibility</label>
                  <select 
                    value={statusOptions} 
                    onChange={(e) => setStatusOptions(e.target.value)}
                    className="meta-select"
                  >
                    <option value="published">Public (Published)</option>
                    <option value="draft">Draft (Work in progress)</option>
                  </select>
                </div>
              </div>

              <div className="sidebar-meta-help">
                <h5>Markdown Tips</h5>
                <ul>
                  <li>Use <code># Header 1</code> for page title</li>
                  <li>Use <code>## Header 2</code> for sub sections</li>
                  <li>Use <code>**text**</code> for bolding</li>
                  <li>Use <code>*text*</code> for italics</li>
                  <li>Use <code>`code`</code> for monospace code blocks</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
