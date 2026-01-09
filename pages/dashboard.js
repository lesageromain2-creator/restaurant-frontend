// frontend/pages/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { checkAuth, logout, fetchSettings } from '../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ NOUVEAU
  const [authLoading, setAuthLoading] = useState(true); // ✅ NOUVEAU
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    reservations: 0,
    favorites: 0,
    reviews: 0,
    points: 0
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadUserData();
    setTimeout(() => setMounted(true), 50);
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Charger les données en parallèle
      const [authData, settingsData] = await Promise.all([
        checkAuth(),
        fetchSettings()
      ]);

      if (!authData.user) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      setUser(authData.user);
      setSettings(settingsData);

      // Simuler des stats (à remplacer par de vraies données)
      setStats({
        reservations: 5,
        favorites: 12,
        reviews: 3,
        points: 150
      });

    } catch (error) {
      console.error('Erreur chargement données:', error);
      router.push('/login?redirect=/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Chargement de votre espace...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a1e;
            color: white;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mon Espace - {settings.site_name || 'Restaurant'}</title>
      </Head>

      <Header settings={settings} />

      <div className="dashboard-page">
        {/* Background effects */}
        <div className="bg-effects">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
        </div>

        <div className={`dashboard-container ${mounted ? 'mounted' : ''}`}>
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-header">
              <div className="user-avatar">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" />
                ) : (
                  <span>{getInitials(user?.firstname, user?.lastname)}</span>
                )}
              </div>
              <div className="user-info">
                <h3>{user?.firstname} {user?.lastname}</h3>
                <p>{user?.email}</p>
                <span className="user-badge">{user?.role === 'admin' ? 'Admin' : 'Membre'}</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>Vue d'ensemble</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => setActiveTab('reservations')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Mes Réservations</span>
                {stats.reservations > 0 && (
                  <span className="badge">{stats.reservations}</span>
                )}
              </button>

              <button 
                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>Mes Favoris</span>
                {stats.favorites > 0 && (
                  <span className="badge">{stats.favorites}</span>
                )}
              </button>

              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Mon Profil</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m6-12h-6m6 6h-6m-6-6h6m-6 6h6"/>
                </svg>
                <span>Paramètres</span>
              </button>

              <div className="nav-divider"></div>

              <button className="nav-item logout" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Déconnexion</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="dashboard-main">
            {/* Header */}
            <div className="main-header">
              <div>
                <h1>{getGreeting()}, {user?.firstname} ! 👋</h1>
                <p>Bienvenue dans votre espace personnel</p>
              </div>
              <button className="btn-primary" onClick={() => router.push('/reservation')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nouvelle Réservation
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <div className="content-section">
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.reservations}</h3>
                      <p>Réservations actives</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.favorites}</h3>
                      <p>Plats favoris</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.reviews}</h3>
                      <p>Avis laissés</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.points}</h3>
                      <p>Points fidélité</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                  <h2>Actions Rapides</h2>
                  <div className="quick-actions">
                    <button className="action-btn" onClick={() => router.push('/reservation')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>Réserver une table</span>
                    </button>

                    <button className="action-btn" onClick={() => router.push('/menus')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                      </svg>
                      <span>Découvrir le menu</span>
                    </button>

                    <button className="action-btn" onClick={() => setActiveTab('favorites')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span>Mes favoris</span>
                    </button>

                    <button className="action-btn" onClick={() => router.push('/contact')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>Nous contacter</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="section-card">
                  <h2>Activité Récente</h2>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div className="activity-content">
                        <p><strong>Réservation confirmée</strong></p>
                        <span>Table pour 4 personnes - 15 janvier 2025 à 19h30</span>
                      </div>
                      <span className="activity-time">Il y a 2 jours</span>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <div className="activity-content">
                        <p><strong>Nouveau favori ajouté</strong></p>
                        <span>Filet de bœuf Rossini</span>
                      </div>
                      <span className="activity-time">Il y a 3 jours</span>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div className="activity-content">
                        <p><strong>Avis publié</strong></p>
                        <span>5/5 étoiles - "Expérience exceptionnelle !"</span>
                      </div>
                      <span className="activity-time">Il y a 5 jours</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="content-section">
                <div className="section-card">
                  <h2>Mes Réservations</h2>
                  <p className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Fonctionnalité en cours de développement
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="content-section">
                <div className="section-card">
                  <h2>Mes Plats Favoris</h2>
                  <p className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Aucun favori pour le moment
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="content-section">
                <div className="section-card">
                  <h2>Mon Profil</h2>

                  
                  <div className="profile-info">
                    <div className="info-row">
                      <label>Prénom</label>
                      <span>{user?.firstname}</span>
                    </div>
                    <div className="info-row">
                      <label>Nom</label>
                      <span>{user?.lastname}</span>
                    </div>
                    <div className="info-row">
                      <label>Email</label>
                      <span>{user?.email}</span>
                    </div>
                    <div className="info-row">
                      <label>Rôle</label>
                      <span className="badge-inline">{user?.role}</span>
                    </div>
                    <div className="info-row">
                      <label>Membre depuis</label>
                      <span>{new Date(user?.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => setActiveTab('settings')}>
                    Modifier mon profil
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="content-section">
                <div className="section-card">
                  <h2>Paramètres du Compte</h2>
                  <p className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m6-12h-6m6 6h-6m-6-6h6m-6 6h6"/>
                    </svg>
                    Fonctionnalité en cours de développement
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
         background: linear-gradient(135deg, #DC2626, #EA580C, #DB2777);



          padding-top: 80px;
          position: relative;
          overflow-x: hidden;
        }

        .bg-effects {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          top: -300px;
          right: -300px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          bottom: -250px;
          left: -250px;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 50px) scale(1.1); }
        }

        .dashboard-container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 30px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .dashboard-container.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* Sidebar */
        .dashboard-sidebar {
          background: #1E3A5F;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2em;
          font-weight: 700;
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-info h3 {
          color: white;
          font-size: 1.2em;
          margin-bottom: 5px;
        }

        .user-info p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9em;
          margin-bottom: 10px;
        }

        .user-badge {
          display: inline-block;
          padding: 5px 15px;
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          text-align: left;
          position: relative;
        }

        .nav-item svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .nav-item.logout {
          color: #ef4444;
          margin-top: 10px;
        }

        .nav-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .badge {
          margin-left: auto;
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75em;
          font-weight: 700;
        }

        .nav-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 10px 0;
        }

        /* Main Content */
        .dashboard-main {
          min-height: calc(100vh - 200px);
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .main-header h1 {
          color: white;
          font-size: 2.5em;
          margin-bottom: 5px;
        }

        .main-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.1em;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: #1E3A5F;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .btn-primary svg {
          width: 20px;
          height: 20px;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .content-section {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .section-card {
          background: #1E3A5F;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
        }

        .section-card h2 {
          color: white;
          font-size: 1.5em;
          margin-bottom: 20px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: #1E3A5F;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon svg {
          width: 28px;
          height: 28px;
          stroke: white;
        }

        .stat-content h3 {
          color: white;
          font-size: 2em;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .stat-content p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95em;
        }

        /* Quick Actions */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 25px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #667eea;
          transform: translateY(-3px);
        }

        .action-btn svg {
          width: 32px;
          height: 32px;
          stroke: #667eea;
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 15px;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon.success {
          background: rgba(16, 185, 129, 0.2);
        }

        .activity-icon.info {
          background: rgba(59, 130, 246, 0.2);
        }

        .activity-icon.warning {
          background: rgba(251, 191, 36, 0.2);
        }

        .activity-icon svg {
          width: 20px;
          height: 20px;
          stroke: white;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          color: white;
          margin-bottom: 5px;
        }

        .activity-content span {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9em;
        }

        .activity-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85em;
        }

        /* Profile Info */
        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row label {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
        }

        .info-row span {
          color: white;
          font-weight: 500;
        }

        .badge-inline {
          padding: 5px 15px;
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 600;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
        }

        .empty-state svg {
          width: 80px;
          height: 80px;
          stroke: rgba(255, 255, 255, 0.3);
          margin-bottom: 20px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dashboard-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .dashboard-sidebar {
            position: relative;
            top: 0;
          }

          .main-header h1 {
            font-size: 2em;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding-top: 60px;
          }

          .dashboard-container {
            padding: 20px 15px;
          }

          .main-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .main-header h1 {
            font-size: 1.8em;
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .activity-item {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .activity-time {
            align-self: flex-start;
          }
        }

      `
      
      
      
      
      
      }</style>
    </>
  );
}