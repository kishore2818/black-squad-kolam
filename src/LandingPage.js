import React, { useState, useEffect, useRef } from 'react';
const LandingPage = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Grid size suggestions with descriptive labels
  const gridSuggestions = [
    { value: "3*3", label: "3x3 dots kolam" },
    { value: "5*5", label: "5x5 dots kolam" },
    { value: "6*6", label: "6x6 dots kolam" },
    { value: "7*7", label: "7x7 dots kolam" },
    { value: "9*9", label: "9x9 dots kolam" },
    { value: "11*11", label: "11x11 dots kolam" },
    { value: "fs", label: "Free style kolams" },
    { value: "rk", label: "Rangoli kolams" }
  ];

  // Function to fetch images from the API
  const fetchImages = async (gridSize) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://kolam-backend-1-s6v0.onrender.com/images/group/${gridSize}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the API response to match our expected format
      const newDesigns = data.map((img, index) => ({
        id: Date.now() + index,
        title: `${gridSize} Design ${index + 1}`,
        prompt: gridSize,
        image: img.url || img,
        isNew: true
      }));
      
      setGeneratedDesigns(newDesigns);
      setCurrentSlide(0);
    } catch (err) {
      setError(`Failed to fetch images: ${err.message}`);
      console.error('Error fetching images:', err);
      
      // Fallback to mock data for demonstration
      const mockImages = [
        { id: 1, title: `${gridSize} Design 1`, prompt: gridSize, image: `https://picsum.photos/300/200?seed=${gridSize}-1`, isNew: true },
        { id: 2, title: `${gridSize} Design 2`, prompt: gridSize, image: `https://picsum.photos/300/200?seed=${gridSize}-2`, isNew: true },
        { id: 3, title: `${gridSize} Design 3`, prompt: gridSize, image: `https://picsum.photos/300/200?seed=${gridSize}-3`, isNew: true },
        { id: 4, title: `${gridSize} Design 4`, prompt: gridSize, image: `https://picsum.photos/300/200?seed=${gridSize}-4`, isNew: true }
      ];
      setGeneratedDesigns(mockImages);
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion.value);
    fetchImages(suggestion.value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check if it's a grid size pattern
    const isGridPattern = gridSuggestions.some(s => s.value === prompt.trim());
    
    if (isGridPattern) {
      const selectedSuggestion = gridSuggestions.find(s => s.value === prompt.trim());
      handleSuggestionClick(selectedSuggestion);
    } else {
      // Handle text prompts (original functionality)
      setIsGenerating(true);
      
      // Simulate API call for text prompts
      setTimeout(() => {
        const newDesign = {
          id: Date.now(),
          title: prompt.split(' ').slice(0, 3).join(' '),
          prompt: prompt,
          image: `https://picsum.photos/300/200?seed=${Date.now()}`,
          isNew: true
        };

        setGeneratedDesigns(prev => [newDesign, ...prev]);
        setPrompt('');
        setIsGenerating(false);
        setShowSuggestions(false);
        
        // Navigate to external index.html page
        window.location.href = 'E:/SIH/Kolam/kolam/src/AI/index.html';
      }, 2000);
    }
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const filteredSuggestions = gridSuggestions.filter(s => 
      s.label.toLowerCase().includes(prompt.toLowerCase()) || 
      s.value.toLowerCase().includes(prompt.toLowerCase())
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(filteredSuggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Next/previous slide controls
  const nextSlide = () => {
    setCurrentSlide(prev => (prev === generatedDesigns.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? generatedDesigns.length - 1 : prev - 1));
  };

  // Auto-advance slides
  useEffect(() => {
    if (generatedDesigns.length > 1) {
      const timer = setTimeout(nextSlide, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, generatedDesigns.length]);

  // Reset active suggestion when suggestions change
  useEffect(() => {
    setActiveSuggestion(0);
  }, [prompt, showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current !== e.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="kolam-builder">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .kolam-builder {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        
        .builder-header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 1rem 0;
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
        }
        
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        
        .nav-links a {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }
        
        .cta-button {
          background: white;
          color: #6a11cb;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .hero-section {
          text-align: center;
          margin: 3rem auto;
          max-width: 1200px;
          padding: 0 20px;
        }
        
        .hero-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #2c3e50;
        }
        
        .hero-content p {
          font-size: 1.2rem;
          color: #7f8c8d;
          margin-bottom: 2rem;
        }
        
        .prompt-box {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }
        
        .input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 1rem;
        }
        
        .input-container input {
          flex: 1;
          padding: 12px 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        
        .generate-btn {
          background: #6a11cb;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .generate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
          z-index: 10;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          max-height: 200px;
          overflow-y: auto;
        }
        
        .suggestions-dropdown li {
          padding: 10px 15px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .suggestions-dropdown li:hover, 
        .suggestions-dropdown li.active {
          background: #f0f0f0;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
        }
        
        .slider-section {
          padding: 2rem;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 10px;
          margin: 2rem auto;
          max-width: 1200px;
        }
        
        .slider-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .slider {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }
        
        .slide {
          min-width: 100%;
          opacity: 0;
          transition: opacity 0.5s ease;
          position: relative;
        }
        
        .slide.active {
          opacity: 1;
        }
        
        .slide img {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
        }
        
        .slide-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        
        .slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 50%;
          font-size: 18px;
          z-index: 10;
        }
        
        .slider-prev {
          left: 10px;
        }
        
        .slider-next {
          right: 10px;
        }
        
        .slider-nav:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        
        .slider-dots {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        
        .dot {
          height: 12px;
          width: 12px;
          margin: 0 5px;
          background-color: #bbb;
          border-radius: 50%;
          display: inline-block;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .dot.active {
          background-color: #717171;
        }
        
        .tabs-section {
          margin: 3rem auto;
          max-width: 1200px;
          padding: 0 20px;
        }
        
        .tabs-header {
          display: flex;
          border-bottom: 2px solid #ddd;
          margin-bottom: 2rem;
        }
        
        .tabs-header button {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: #7f8c8d;
          position: relative;
        }
        
        .tabs-header button.tab-active {
          color: #6a11cb;
        }
        
        .tabs-header button.tab-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: #6a11cb;
        }
        
        .designs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .design-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .design-card:hover {
          transform: translateY(-5px);
        }
        
        .design-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .design-info {
          padding: 1rem;
        }
        
        .design-info h4 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }
        
        .design-info p {
          margin: 0;
          color: #7f8c8d;
        }
        
        .new-badge {
          display: inline-block;
          background: #ff4757;
          color: white;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        .features-section {
          background: #f9f9f9;
          padding: 3rem;
          border-radius: 10px;
          margin: 3rem auto;
          max-width: 1200px;
        }
        
        .features-section h3 {
          text-align: center;
          margin-bottom: 2rem;
          color: #2c3e50;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .feature {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .feature h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }
        
        .feature p {
          color: #7f8c8d;
          margin: 0;
        }
        
        .builder-footer {
          background: #2c3e50;
          color: white;
          padding: 2rem 0 0;
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          padding: 0 2rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .footer-brand h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }
        
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        
        .link-group h5 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }
        
        .link-group a {
          display: block;
          color: #ddd;
          text-decoration: none;
          margin-bottom: 0.5rem;
        }
        
        .link-group a:hover {
          color: white;
        }
        
        .footer-bottom {
          background: #1a252f;
          padding: 1rem 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav-links {
            gap: 1rem;
          }
          
          .input-container {
            flex-direction: column;
          }
          
          .slider-container {
            max-width: 100%;
          }
          
          .slide img {
            max-height: 300px;
          }
          
          .slider-nav {
            padding: 10px;
            font-size: 16px;
          }
          
          .footer-content {
            grid-template-columns: 1fr;
          }
          
          .footer-links {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .hero-content h2 {
            font-size: 2rem;
          }
          
          .slider-section {
            padding: 1rem;
          }
          
          .slide img {
            max-height: 250px;
          }
          
          .tabs-header {
            flex-direction: column;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <header className="builder-header">
        <div className="header-content">
          <h1 className="logo">KOLAM</h1>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
            <a href="#community">Community</a>
          </nav>
          <button className="cta-button">Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Create Beautiful Kolam Designs with AI</h2>
          <p>Transform your ideas into intricate kolam patterns with a single prompt.</p>

          <div className="prompt-box">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Enter grid size (e.g., 3x3, 5x5) or describe your design..."
                disabled={isGenerating || isLoading}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isLoading || !prompt.trim()}
                className="generate-btn"
              >
                {isGenerating || isLoading ? 'Loading...' : 'Generate'}
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <ul className="suggestions-dropdown" ref={suggestionsRef}>
                {gridSuggestions
                  .filter(s => 
                    s.label.toLowerCase().includes(prompt.toLowerCase()) || 
                    s.value.toLowerCase().includes(prompt.toLowerCase())
                  )
                  .map((s, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => handleSuggestionClick(s)}
                      className={idx === activeSuggestion ? 'active' : ''}
                    >
                      {s.label}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </section>

      {/* Image Slider Section */}
      {generatedDesigns.length > 0 && (
        <section className="slider-section">
          <h3>Generated Designs for {generatedDesigns[0]?.prompt}</h3>
          <div className="slider-container">
            <button className="slider-nav slider-prev" onClick={prevSlide}>&#10094;</button>
            
            <div className="slider">
              {generatedDesigns.map((design, index) => (
                <div 
                  key={design.id} 
                  className={`slide ${index === currentSlide ? 'active' : ''}`}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  <img src={design.image} alt={design.title} />
                  <div className="slide-info">
                    <h4>{design.title}</h4>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="slider-nav slider-next" onClick={nextSlide}>&#10095;</button>
          </div>
          
          <div className="slider-dots">
            {generatedDesigns.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <section className="tabs-section">
        <div className="tabs-header">
          <button 
            className={activeTab === 'create' ? 'tab-active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Create New
          </button>
          <button 
            className={activeTab === 'gallery' ? 'tab-active' : ''}
            onClick={() => setActiveTab('gallery')}
          >
            My Designs
          </button>
          <button 
            className={activeTab === 'community' ? 'tab-active' : ''}
            onClick={() => setActiveTab('community')}
          >
            Community
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'gallery' && (
            <div className="gallery-tab">
              <h3>Your Generated Designs</h3>
              {isLoading ? (
                <div className="loading-state">
                  <p>Loading designs...</p>
                </div>
              ) : generatedDesigns.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't created any designs yet. Start by entering a grid size above!</p>
                </div>
              ) : (
                <div className="designs-grid">
                  {generatedDesigns.map(design => (
                    <div key={design.id} className="design-card">
                      <img src={design.image} alt={design.title} />
                      <div className="design-info">
                        <h4>{design.title}</h4>
                        <p>Grid: {design.prompt}</p>
                        {design.isNew && <span className="new-badge">New</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h3>How It Works</h3>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">💬</div>
            <h4>Choose Grid Size</h4>
            <p>Select a grid pattern (3x3, 5x5, etc.) or describe your design</p>
          </div>
          <div className="feature">
            <div className="feature-icon">✨</div>
            <h4>AI Generates Designs</h4>
            <p>Our AI creates kolam patterns based on your selected grid size</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎨</div>
            <h4>Customize & Download</h4>
            <p>Refine colors, adjust complexity, and download your favorite designs</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="builder-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>KOLAM</h3>
            <p>Preserving tradition through technology</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#examples">Examples</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="link-group">
              <h5>Resources</h5>
              <a href="#learn">Learn Kolam</a>
              <a href="#blog">Blog</a>
              <a href="#tutorials">Tutorials</a>
            </div>
            <div className="link-group">
              <h5>Company</h5>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 Kolam AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

