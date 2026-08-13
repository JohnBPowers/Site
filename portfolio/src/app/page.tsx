'use client';

import Image from 'next/image';
import { useState } from 'react';
import { profileData } from '../data/profile';
import styles from './page.module.css';
import ChatWidget from '../components/ChatWidget';
import Cursor from '../components/Cursor';
import ScrollReveal from '../components/ScrollReveal';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <main>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          JOHN<span>POWERS</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#about" className={styles.navLink}>About</a>
          <a href="#career" className={styles.navLink}>Career</a>
          <a href="#certifications" className={styles.navLink}>Certifications</a>
        </div>
        {/* Hamburger for mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav"
        >
          <span className={`${styles.hamburgerLine} ${mobileNavOpen ? styles.hamburgerLineOpen1 : ''}`} />
          <span className={`${styles.hamburgerLine} ${mobileNavOpen ? styles.hamburgerLineOpen2 : ''}`} />
          <span className={`${styles.hamburgerLine} ${mobileNavOpen ? styles.hamburgerLineOpen3 : ''}`} />
        </button>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div id="mobile-nav" className={styles.mobileNav} role="navigation" aria-label="Mobile Navigation">
          <a href="#about" className={styles.mobileNavLink} onClick={() => setMobileNavOpen(false)}>About</a>
          <a href="#career" className={styles.mobileNavLink} onClick={() => setMobileNavOpen(false)}>Career</a>
          <a href="#certifications" className={styles.mobileNavLink} onClick={() => setMobileNavOpen(false)}>Certifications</a>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={`${styles.heroContent} animate-fade-in`}>
              <h1 className={styles.heroTitle}>
                OPERATIONAL <br /><span className="text-cyan">EXCELLENCE</span>
              </h1>
              <p className={styles.heroSubtitle}>
                {profileData.title} based in {profileData.location}, focused on driving process improvement and team development.
              </p>
              <a href="#about" className="btn">
                Discover More
              </a>
            </div>
            
            <div className={`animate-fade-in delay-200`}>
              <div className={styles.heroImageContainer}>
                <div className={styles.heroImageWrapper}>
                  <Image 
                    src="/JPLinkedInFake.jpg" 
                    alt="John Powers"
                    fill
                    className={styles.heroImage}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <ScrollReveal>
            <h2 className={`${styles.sectionTitle} animate-fade-in`}>About</h2>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutText}>
                <p>{profileData.summary}</p>
                <p>With a robust background in customer and tech support, PC repair, and broad-scope project management, I bridge the gap between technical complexity and operational efficiency.</p>
              </div>
              <div className={styles.skillsContainer}>
                {profileData.skills.map((skill, idx) => (
                  <div key={idx} className={styles.skillItem}>
                    <span className="text-cyan" style={{ marginRight: '1rem' }}>//</span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Career Section */}
      <section id="career" className="section">
        <div className="container">
          <ScrollReveal>
            <h2 className={styles.sectionTitle}>Experience</h2>
            <div className={styles.timeline}>
              {profileData.experience.map((job) => (
                <div key={job.id} className={styles.timelineItem}>
                  <span className={styles.timelineDate}>{job.date}</span>
                  <h3 className={styles.timelineTitle}>{job.title}</h3>
                  <div className={styles.timelineCompany}>{job.company} — {job.location}</div>
                  <p className={styles.timelineDesc}>{job.description}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Certifications & Education Section */}
      <section id="certifications" className="section">
        <div className="container">
          <ScrollReveal>
            <h2 className={styles.sectionTitle}>Qualifications</h2>
            
            <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>Certifications</h3>
            <div className={styles.cardGrid} style={{ marginBottom: '5rem' }}>
              {profileData.certifications.map((cert, idx) => (
                <div key={idx} className={styles.card}>
                  <h4 className={styles.cardTitle}>{cert}</h4>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>Education & Honors</h3>
            <div className={styles.cardGrid}>
              {profileData.education.map((edu) => (
                <div key={edu.id} className={styles.card}>
                  <h4 className={styles.cardTitle}>{edu.degree}</h4>
                  <div className={styles.cardSubtitle}>{edu.institution} ({edu.date})</div>
                </div>
              ))}
              {profileData.honors.map((honor, idx) => (
                <div key={idx} className={styles.card}>
                  <h4 className={styles.cardTitle}>{honor}</h4>
                  <div className={styles.cardSubtitle}>Honor / Award</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <ScrollReveal>
            <h2 className={styles.footerTitle}>
              INITIATE <span className="text-cyan">CONTACT</span>
            </h2>
            <p className={styles.footerText}>
              Ready to discuss process optimization? Reach out via email at {profileData.contact.email} or call {profileData.contact.phone}.
            </p>
            <a href={`https://${profileData.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="btn">
              LinkedIn Profile
            </a>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} {profileData.name}. All systems operational.
            </p>
          </ScrollReveal>
        </div>
      </footer>
      
      {/* AI Digital Twin Chat Widget */}
      <ErrorBoundary fallback={<div className={styles.chatWidgetContainer} style={{bottom: '2rem', right: '2rem', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid #ff4444'}}>Chat module offline</div>}>
        <ChatWidget />
      </ErrorBoundary>
      
      {/* Custom Glowing Cursor */}
      <Cursor />
    </main>
  );
}
