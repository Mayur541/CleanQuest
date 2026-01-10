import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom
import './Home.css';

// SVG Icons components to keep the main code clean
const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00A846'}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);
const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00A846'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00A846'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00A846'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
// Stats Icons
const PinIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1e5c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><map name=""></map><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const UserIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1e5c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const RibbonIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1e5c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <h1 className="hero-title">
          Saving the world,<br />
          <span>One photo at a time.</span>
        </h1>
        <p className="hero-subtitle">Spot an issue ? Report right now</p>
        
        <div className="cta-group">
          <button className="btn btn-primary" onClick={() => navigate('/report')}>
            Submit Report
          </button>
          
          {/* New Requested Button */}
          <button className="btn btn-secondary" onClick={() => navigate('/information')}>
            How It Helps
          </button>
        </div>
      </header>

      {/* How We Work Section */}
      <section className="steps-wrapper">
        <h2 className="section-title">How we work ?</h2>

        <div className="steps-glass-container">
          <div className="timeline-line"></div>
          
          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="leaf-badge"><span>1</span></div>
              <div className="icon-box"><CameraIcon /></div>
              <h4>Click a Photo</h4>
              <p>Take a picture of the garbage</p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="leaf-badge"><span>2</span></div>
              <div className="icon-box"><MapIcon /></div>
              <h4>Get GPS Location</h4>
              <p>Share your current location</p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="leaf-badge"><span>3</span></div>
              <div className="icon-box"><FileIcon /></div>
              <h4>Fill Out Details</h4>
              <p>Provide additional information</p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="leaf-badge"><span>4</span></div>
              <div className="icon-box"><CheckIcon /></div>
              <h4>Submit Report</h4>
              <p>Send your report to us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-container">
        <div className="stat-card">
          <PinIcon />
          <h3 className="stat-number">12.5K</h3>
          <p>Issues Reported</p>
        </div>

        <div className="stat-card">
          <UserIcon />
          <h3 className="stat-number">8.2K</h3>
          <p>Active Champions</p>
        </div>

        <div className="stat-card">
          <RibbonIcon />
          <h3 className="stat-number">95%</h3>
          <p>Issues Resolved</p>
        </div>
      </section>
    </div>
  );
};

export default Home;