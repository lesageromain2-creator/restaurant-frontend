// frontend/components/Header.js
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header({ settings = {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const siteName = settings.site_name || 'Restaurant';
  const restaurantStatus = settings.restaurant_status || 'open';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <Link href="/" className="logo">
            {settings.site_logo ? (
              <img 
                src={`/uploads/logos/${settings.site_logo}`} 
                alt={siteName}
                className="logo-img"
              />
            ) : (
              <div className="logo-content">
                <span className="logo-icon">🍽️</span>
                <span className="logo-text">{siteName}</span>
              </div>
            )}
          </Link>

          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <Link href="/" className="nav-link">Accueil</Link>
            <Link href="/categories" className="nav-link">Carte</Link>
            <Link href="/menus" className="nav-link">Menus</Link>
            <Link href="/reservation" className="nav-link">Réserver</Link>
             <Link href="/favorites" className="nav-link"> Mes favoris</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
          </nav>

          <div className="header-actions">
            <span className={`status-badge ${restaurantStatus}`}>
              {restaurantStatus === 'open' ? '🟢 Ouvert' : '🔴 Fermé'}
            </span>
            <button 
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.3s ease;
          background: transparent;
        }

        .header.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .logo-img {
          height: 50px;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        .logo-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          font-size: 2em;
          transition: all 0.3s ease;
        }

        .logo-text {
          font-size: 1.5em;
          font-weight: bold;
          color: #e74c3c;
          transition: all 0.3s ease;
        }

        .header:not(.scrolled) .logo-text {
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .nav {
          display: flex;
          gap: 30px;
        }

        .nav-link {
          text-decoration: none;
          color: #2c3e50;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 1.1em;
        }

        .header:not(.scrolled) .nav-link {
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .nav-link:hover {
          color: #e74c3c;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9em;
          transition: all 0.3s ease;
        }

        .status-badge.open {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.closed {
          background: #f8d7da;
          color: #721c24;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 2em;
          cursor: pointer;
          color: #2c3e50;
          transition: color 0.3s ease;
        }

        .header:not(.scrolled) .menu-toggle {
          color: white;
        }

        @media (max-width: 768px) {
          .nav {
            display: none;
            position: absolute;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }

          .nav-link {
            color: #2c3e50 !important;
            text-shadow: none !important;
          }

          .nav-open {
            display: flex;
          }

          .menu-toggle {
            display: block;
          }

          .status-badge {
            display: none;
          }
        }
      `}</style>
    </>
  );
}