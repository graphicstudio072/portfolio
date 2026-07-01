import React, { useState, useEffect, useRef } from 'react';
import { Play, Image, Eye, MessageSquare, Send, X, ArrowUpRight, Film, Palette, Layers } from 'lucide-react';

const Portfolio = ({ onAdminClick, isAuthenticated, adminUsername }) => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [loading, setLoading] = useState(true);
  
  // Lightbox modal state
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Contact Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'video',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // References for scrolling
  const homeRef = useRef(null);
  const portfolioRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrollTo = (ref, sectionName) => {
    setMobileMenuOpen(false);
    setActiveNav(sectionName);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Message sent successfully! I will contact you soon.' });
        setFormData({ name: '', email: '', projectType: 'video', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Could not connect to the server. Please try again later.' });
    } finally {
      setSubmitting(false);
      // Auto dismiss toast
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 5000);
    }
  };

  // Helper to convert DB categories to readable text
  const getCategoryLabel = (category) => {
    switch(category) {
      case 'graphic': return 'Graphic Design';
      case 'video': return 'Video Editing';
      case 'motion': return 'Motion Graphics';
      default: return category;
    }
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="app-container" ref={homeRef}>
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">
          <Layers size={24} />
          <span>CREATIVE.STUDIO</span>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li className={`nav-link ${activeNav === 'home' ? 'active' : ''}`} onClick={() => handleScrollTo(homeRef, 'home')}>Home</li>
          <li className={`nav-link ${activeNav === 'portfolio' ? 'active' : ''}`} onClick={() => handleScrollTo(portfolioRef, 'portfolio')}>Work</li>
          <li className={`nav-link ${activeNav === 'contact' ? 'active' : ''}`} onClick={() => handleScrollTo(contactRef, 'contact')}>Contact</li>
          
          {/* Mobile view only button */}
          <li style={{ listStyle: 'none' }} className="mobile-only">
            <button className="nav-btn" onClick={onAdminClick}>
              {isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
            </button>
          </li>
        </ul>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className="nav-btn" onClick={onAdminClick} style={{ display: 'flex' }}>
            {isAuthenticated ? 'Dashboard' : 'Admin Area'} <ArrowUpRight size={16} />
          </button>
          <div className="mobile-nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <X size={28} style={{ display: mobileMenuOpen ? 'block' : 'none' }} />
            <svg style={{ display: mobileMenuOpen ? 'none' : 'block' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-tag">Available for Freelance & Contract</div>
        <h1 className="hero-title">
          Crafting Premium <span>Digital Experiences</span> & Cinematic Stories
        </h1>
        <p className="hero-subtitle">
          I am a Graphic Designer and Video Editor specializing in high-impact visuals, bold branding, motion graphics, and engaging edits that captivate audiences.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => handleScrollTo(portfolioRef, 'portfolio')}>
            Explore Portfolio <Film size={18} />
          </button>
          <button className="btn-secondary" onClick={() => handleScrollTo(contactRef, 'contact')}>
            Get In Touch <MessageSquare size={18} />
          </button>
        </div>
        <div className="hero-scroll" onClick={() => handleScrollTo(portfolioRef, 'portfolio')}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Scroll down</p>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
      </header>

      {/* Portfolio Showcase Section */}
      <section className="portfolio-section" id="portfolio" ref={portfolioRef}>
        <div className="section-header">
          <h2 className="section-title">Selected Works</h2>
          <p className="section-desc">A curated gallery showcasing recent graphic designs, cinematic video projects, and motion animations.</p>
        </div>

        <div className="portfolio-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Projects</button>
          <button className={`filter-btn ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>Video Editing</button>
          <button className={`filter-btn ${filter === 'graphic' ? 'active' : ''}`} onClick={() => setFilter('graphic')}>Graphic Design</button>
          <button className={`filter-btn ${filter === 'motion' ? 'active' : ''}`} onClick={() => setFilter('motion')}>Motion Graphics</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 20px' }}></div>
            <p>Loading projects...</p>
          </div>
        ) : (
          <div className="portfolio-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div 
                  key={project._id} 
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="project-category-badge">
                    {getCategoryLabel(project.category)}
                  </div>
                  
                  <div className="project-media-wrapper">
                    {project.mediaType === 'video' || project.mediaType === 'embed' ? (
                      <div className="play-button-overlay">
                        <Play size={26} fill="white" />
                      </div>
                    ) : (
                      <div className="play-button-overlay">
                        <Image size={26} />
                      </div>
                    )}
                    
                    {/* Render thumbnail */}
                    {project.mediaType === 'image' ? (
                      <img src={project.mediaUrl} alt={project.title} className="project-media" loading="lazy" />
                    ) : project.mediaType === 'video' ? (
                      <video src={project.mediaUrl} className="project-media" muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}} />
                    ) : (
                      <div className="project-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(45deg, #181528, #0a0914)' }}>
                        <Film size={40} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                      </div>
                    )}
                    <div className="media-overlay"></div>
                  </div>
                  
                  <div className="project-details">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No projects found</p>
                <p style={{ fontSize: '0.9rem' }}>Check back later or log in to upload new design assets!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Client Contact Form Section */}
      <section className="contact-section" id="contact" ref={contactRef}>
        <div className="contact-card">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Start a Project</h2>
            <p className="section-desc" style={{ maxWidth: '480px' }}>
              Have an idea or project in mind? Fill out the form below and let's collaborate on your next design or video.
            </p>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name"
                  className="form-input" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  className="form-input" 
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="projectType">Service Required</label>
              <select 
                id="projectType"
                className="form-select"
                value={formData.projectType}
                onChange={(e) => setFormData({...formData, projectType: e.target.value})}
              >
                <option value="video">Video Editing & Color Grading</option>
                <option value="graphic">Graphic Design & Art Direction</option>
                <option value="motion">Motion Graphics & VFX</option>
                <option value="branding">Full Brand Identity</option>
                <option value="other">Other Collaboration</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="message">Project Description</label>
              <textarea 
                id="message"
                className="form-textarea" 
                placeholder="Tell me a bit about your brand, timeline, and what you are looking to build..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-primary form-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'} <Send size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Lightbox / Video Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProject(null)}>
              <X size={20} />
            </button>
            
            <div className="modal-media-wrapper">
              {selectedProject.mediaType === 'image' && (
                <img src={selectedProject.mediaUrl} alt={selectedProject.title} />
              )}
              {selectedProject.mediaType === 'video' && (
                <video src={selectedProject.mediaUrl} controls autoPlay playsInline />
              )}
              {selectedProject.mediaType === 'embed' && (
                <iframe 
                  src={selectedProject.mediaUrl} 
                  title={selectedProject.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              )}
            </div>
            
            <div className="modal-info">
              <span className="project-category-badge" style={{ position: 'static', display: 'inline-block', marginBottom: '12px' }}>
                {getCategoryLabel(selectedProject.category)}
              </span>
              <h3>{selectedProject.title}</h3>
              <p>{selectedProject.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification */}
      {submitStatus.message && (
        <div className={`toast ${submitStatus.type}`}>
          <Send size={18} />
          <span>{submitStatus.message}</span>
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '40px 8%', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>© {new Date().getFullYear()} CREATIVE.STUDIO. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>Crafting visual solutions with passion.</p>
      </footer>

      {/* CSS Loader spinner injection */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
