import React, { useState, useEffect } from 'react';
import { 
  Layers, MessageSquare, Upload, Folder, LogOut, Check, Trash2, 
  Mail, Calendar, FileText, ChevronRight, BarChart3, Globe, Plus, AlertCircle 
} from 'lucide-react';

const Admin = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('video');
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLink, setUploadLink] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const projRes = await fetch('/api/portfolio');
      const msgRes = await fetch('/api/messages');
      
      if (projRes.ok && msgRes.ok) {
        const projData = await projRes.json();
        const msgData = await msgRes.json();
        setProjects(projData);
        setMessages(msgData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);

    if (uploadType === 'file' && !uploadFile) {
      setUploadError('Please select a media file to upload.');
      setUploading(false);
      return;
    }

    if (uploadType === 'link' && !uploadLink) {
      setUploadError('Please specify the external URL.');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('category', uploadCategory);
    formData.append('description', uploadDesc);
    formData.append('mediaType', uploadType === 'file' ? 'image' : 'embed');

    if (uploadType === 'file') {
      formData.append('media', uploadFile);
    } else {
      formData.append('externalUrl', uploadLink);
    }

    // Using XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/portfolio', true);
    
    // Auth header is handled via cookie, so credentials need to be sent
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentage);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 201) {
        setUploadSuccess(true);
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        setUploadLink('');
        // Clear file input manually
        const fileInput = document.getElementById('media-file');
        if (fileInput) fileInput.value = '';
        
        fetchDashboardData(); // Refresh listing
      } else {
        const errorData = JSON.parse(xhr.responseText || '{}');
        setUploadError(errorData.message || 'Error uploading file.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadError('Server connection error during upload.');
    };

    xhr.send(formData);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio project?')) return;

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProjects(projects.filter(p => p._id !== id));
      } else {
        alert('Failed to delete project.');
      }
    } catch (error) {
      alert('Network error deleting project.');
    }
  };

  const handleToggleRead = async (id) => {
    try {
      const response = await fetch(`/api/messages/${id}/read`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const updatedMsg = await response.json();
        setMessages(messages.map(m => m._id === id ? { ...m, read: updatedMsg.read } : m));
      }
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this client message permanently?')) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessages(messages.filter(m => m._id !== id));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getServiceLabel = (type) => {
    switch (type) {
      case 'video': return 'Video Editing';
      case 'graphic': return 'Graphic Design';
      case 'motion': return 'Motion Graphics';
      case 'branding': return 'Brand Identity';
      default: return 'General Inquiry';
    }
  };

  const totalProjects = projects.length;
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => !m.read).length;

  if (loading && activeTab === 'overview') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#06050a', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <p>Loading Dashboard Panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Layers size={24} />
          <span>ADMIN PANEL</span>
        </div>
        
        <ul className="admin-sidebar-menu">
          <li 
            className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={18} />
            <span>Upload Showcase</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Folder size={18} />
            <span>Manage Works</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} />
            <span>Client Inquiries {unreadMessages > 0 && <span style={{ marginLeft: '6px', background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50px' }}>{unreadMessages}</span>}</span>
          </li>
        </ul>

        <button className="admin-menu-item admin-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Welcome back, {username}</span>
            <h1 className="admin-title">Studio Console</h1>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box">
                  <Folder size={24} />
                </div>
                <div>
                  <div className="stat-number">{totalProjects}</div>
                  <div className="stat-label">Total Projects</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div className="stat-number">{totalMessages}</div>
                  <div className="stat-label">Total Inquiries</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">
                  <Mail size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="stat-number" style={{ color: unreadMessages > 0 ? 'var(--accent)' : 'inherit' }}>{unreadMessages}</div>
                  <div className="stat-label">Unread Messages</div>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="admin-card-title">Recent Activity Guidelines</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
                <p>Welcome to your administrator area. Use the left menu to coordinate operations:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChevronRight size={16} style={{ color: 'var(--secondary)' }} />
                  <span><strong>Upload Showcase</strong>: Publish standard images (PNG, JPG, WebP) or video files (MP4, MOV). Alternatively, link external YouTube or Vimeo media.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChevronRight size={16} style={{ color: 'var(--secondary)' }} />
                  <span><strong>Manage Works</strong>: Remove expired portfolio files to keep your grid visually appealing.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChevronRight size={16} style={{ color: 'var(--secondary)' }} />
                  <span><strong>Client Inquiries</strong>: Review messages from site visitors, mark items as read, or contact them directly.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Project Tab */}
        {activeTab === 'upload' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Publish Portfolio Work</h2>

            {uploadError && (
              <div className="toast error" style={{ position: 'static', marginBottom: '24px', animation: 'none', width: '100%', boxSizing: 'border-box' }}>
                <AlertCircle size={20} />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="toast success" style={{ position: 'static', marginBottom: '24px', animation: 'none', width: '100%', boxSizing: 'border-box' }}>
                <Check size={20} />
                <span>Project published successfully! It is now visible on your main portfolio site.</span>
              </div>
            )}

            <form className="admin-form" onSubmit={handleSubmitProject}>
              <div className="admin-form-left">
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Cinematic Motion Promo"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    disabled={uploading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    disabled={uploading}
                  >
                    <option value="video">Video Editing</option>
                    <option value="graphic">Graphic Design</option>
                    <option value="motion">Motion Graphics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    placeholder="Describe the scope, tools used, and creative concept..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    disabled={uploading}
                  ></textarea>
                </div>
              </div>

              <div className="admin-form-right">
                <div className="form-group">
                  <label className="form-label">Media Source Type</label>
                  <div style={{ display: 'flex', gap: '16px', margin: '8px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="uploadType" 
                        checked={uploadType === 'file'} 
                        onChange={() => { setUploadType('file'); setUploadError(''); }}
                        disabled={uploading}
                      />
                      <span>File Upload (Image/Video)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="uploadType" 
                        checked={uploadType === 'link'} 
                        onChange={() => { setUploadType('link'); setUploadError(''); }}
                        disabled={uploading}
                      />
                      <span>External URL (YouTube/Vimeo Embed)</span>
                    </label>
                  </div>
                </div>

                {uploadType === 'file' ? (
                  <div className="form-group">
                    <label className="form-label">Media Asset</label>
                    <div 
                      className="file-upload-area"
                      onClick={() => document.getElementById('media-file').click()}
                    >
                      <Upload className="file-upload-icon" />
                      <div className="file-upload-text">
                        <strong>Click to browse</strong> or drag file here
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WebP, MP4, MOV up to 50MB</span>
                      
                      {uploadFile && (
                        <div className="file-upload-filename">
                          Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="media-file" 
                      style={{ display: 'none' }} 
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Video Embed URL</label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="url" 
                        className="form-input" 
                        style={{ paddingLeft: '48px', width: '100%' }}
                        placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        value={uploadLink}
                        onChange={(e) => setUploadLink(e.target.value)}
                        disabled={uploading}
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Must be a valid embed URL (e.g. containing "/embed/" for YouTube videos).
                    </span>
                  </div>
                )}

                {uploading && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>Uploading media asset...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="upload-progress-bar-container">
                      <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }} disabled={uploading}>
                  {uploading ? `Uploading...` : 'Publish Project'} <Plus size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Portfolio Tab */}
        {activeTab === 'manage' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Manage Published Works</h2>
            
            <div className="admin-items-grid">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project._id} className="admin-item-card">
                    <button className="admin-item-delete" onClick={() => handleDeleteProject(project._id)}>
                      <Trash2 size={16} />
                    </button>

                    {project.mediaType === 'image' ? (
                      <img src={project.mediaUrl} alt={project.title} className="admin-item-media" />
                    ) : project.mediaType === 'video' ? (
                      <video src={project.mediaUrl} className="admin-item-media" muted />
                    ) : (
                      <div className="admin-item-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#181528' }}>
                        <Globe size={32} style={{ color: 'var(--primary)' }} />
                      </div>
                    )}

                    <div className="admin-item-info">
                      <h4 className="admin-item-title">{project.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {project.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No projects uploaded yet. Go to "Upload Showcase" to publish your first work!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client Messages Tab */}
        {activeTab === 'messages' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Client Inquiries</h2>
            
            <div className="messages-list">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message._id} className={`message-card ${!message.read ? 'unread' : ''}`}>
                    <div className="message-header">
                      <div className="message-client-info">
                        <h4>{message.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <a href={`mailto:${message.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                            <Mail size={14} /> {message.email}
                          </a>
                        </div>
                      </div>

                      <div className="message-meta">
                        <span className="message-tag">
                          {getServiceLabel(message.projectType)}
                        </span>
                        <span className="message-date" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="message-body">
                      {message.message}
                    </div>

                    <div className="message-actions">
                      <button 
                        className={`btn-secondary btn-sm`} 
                        style={{ padding: '8px 16px' }}
                        onClick={() => handleToggleRead(message._id)}
                      >
                        {message.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button 
                        className="btn-secondary btn-sm"
                        style={{ borderColor: 'rgba(255, 0, 127, 0.2)', color: 'var(--accent)', padding: '8px 16px' }}
                        onClick={() => handleDeleteMessage(message._id)}
                      >
                        <Trash2 size={13} style={{ marginRight: '6px', display: 'inline' }} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No messages from clients received yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
