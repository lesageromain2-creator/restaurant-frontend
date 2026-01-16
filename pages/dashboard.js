// frontend/pages/dashboard.js - VERSION COMPLÈTE AVEC FAVORIS INTÉGRÉS
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Heart, Clock, Flame, AlertCircle, Trash2, Eye, ShoppingCart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  checkAuth, 
  logout, 
  fetchSettings, 
  getMyReservations,
  cancelReservation,
  fetchFavorites, 
  removeFavorite, 
  getFavoritesCount,
  deleteReservation

} from '../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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

// Pour reservation: 


// ============================================
// 3. FRONTEND: Dans votre composant Dashboard
// Ajouter cette fonction et ce bouton
// ============================================

// État pour gérer la suppression
const [deleteLoading, setDeleteLoading] = useState(null);

// Fonction pour supprimer une réservation
const handleDeleteReservation = async (reservationId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
    return;
  }

  setDeleteLoading(reservationId);
  
  try {
    await deleteReservation(reservationId);
    
    // Recharger les réservations après suppression
    const data = await getMyReservations();
    setReservations(data);
    
    // Message de succès (optionnel)
    alert('Réservation supprimée avec succès');
  } catch (error) {
    console.error('Erreur suppression:', error);
    alert('Erreur lors de la suppression de la réservation');
  } finally {
    setDeleteLoading(null);
  }
};




  // États pour les favoris
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [removingFavoriteId, setRemovingFavoriteId] = useState(null);

  // États pour les réservations
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadUserData();
    setTimeout(() => setMounted(true), 50);
  }, []);

 // Charger les favoris quand l'onglet change
useEffect(() => {
  if (activeTab === 'favorites' && user) {
    loadFavorites();
  }
}, [activeTab, user]);

  // Charger les réservations quand l'onglet change
  useEffect(() => {
    if (activeTab === 'reservations' && user) {
      loadReservations();
    }
  }, [activeTab, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const [authData, settingsData] = await Promise.all([
        checkAuth(),
        fetchSettings()
      ]);

      if (!authData.authenticated || !authData.user) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      setUser(authData.user);
      setSettings(settingsData);

      // Charger les stats
      await Promise.all([
        loadReservationsForStats(),
        loadFavoritesForStats()
      ]);

    } catch (error) {
      console.error('Erreur chargement données:', error);
      router.push('/login?redirect=/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger le compte des favoris pour les stats
  const loadFavoritesForStats = async () => {
    try {
      const count = await getFavoritesCount();
      setStats(prev => ({ ...prev, favorites: count }));
    } catch (error) {
      console.error('Erreur stats favoris:', error);
    }
  };

  // ✅ Charger la liste complète des favoris
  
const loadFavorites = async () => {
  try {
    setFavoritesLoading(true);
    const data = await fetchFavorites();
    console.log('Données favoris reçues:', data); // Debug
    // ✅ Utiliser data.favorites comme dans favorites.js
    setFavorites(data.favorites || []);
    console.log('Favoris définis:', data.favorites || []); // Debug
  } catch (error) {
    console.error('Erreur chargement favoris:', error);
  } finally {
    setFavoritesLoading(false);
  }
};

  // ✅ Retirer un favori
  const handleRemoveFavorite = async (dishId) => {
    if (!confirm('Retirer ce plat de vos favoris ?')) return;

    try {
      setRemovingFavoriteId(dishId);
      await removeFavorite(dishId);
      setFavorites(prev => prev.filter(fav => fav.id_dish !== dishId));
      await loadFavoritesForStats();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Impossible de retirer ce favori');
    } finally {
      setRemovingFavoriteId(null);
    }
  };

  // ✅ Commander un plat
  const handleOrder = (dish) => {
    alert(`Commander: ${dish.name}\n\nRéservez une table pour profiter de ce plat !`);
  };

  // ✅ Obtenir les badges diététiques
  const getDietaryBadges = (dish) => {
    const badges = [];
    if (dish.is_vegetarian) badges.push({ icon: '🌱', label: 'Végétarien', color: '#10b981' });
    if (dish.is_vegan) badges.push({ icon: '🥬', label: 'Végétalien', color: '#059669' });
    if (dish.is_gluten_free) badges.push({ icon: '🌾', label: 'Sans gluten', color: '#f59e0b' });
    return badges;
  };

  // Charger les réservations pour les stats
  const loadReservationsForStats = async () => {
    try {
      const data = await getMyReservations();
      const activeReservations = data.filter(r => r.status !== 'cancelled' && r.status !== 'completed');
      setStats(prev => ({ ...prev, reservations: activeReservations.length }));
    } catch (error) {
      console.error('Erreur stats réservations:', error);
    }
  };

  // Charger la liste complète des réservations
  const loadReservations = async () => {
    try {
      setReservationsLoading(true);
      const data = await getMyReservations();
      const sorted = data.sort((a, b) => {
        const dateA = new Date(`${a.reservation_date}T${a.reservation_time}`);
        const dateB = new Date(`${b.reservation_date}T${b.reservation_time}`);
        return dateB - dateA;
      });
      setReservations(sorted);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setReservationsLoading(false);
    }
  };

  // Annuler une réservation
  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      setCancellingId(reservationId);
      await cancelReservation(reservationId);
      await loadReservations();
      await loadReservationsForStats();
      alert('Réservation annulée avec succès');
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert(error.message || 'Impossible d\'annuler cette réservation');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
      confirmed: { text: 'Confirmée', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
      cancelled: { text: 'Annulée', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
      completed: { text: 'Terminée', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' }
    };
    return badges[status] || badges.pending;
  };

  const canCancelReservation = (reservation) => {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return false;
    }
    const reservationDateTime = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return reservationDateTime > twoHoursFromNow;
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

            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="content-section">
                <div className="stats-grid">
                  <div className="stat-card" onClick={() => setActiveTab('reservations')} style={{ cursor: 'pointer' }}>
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

                  <div className="stat-card" onClick={() => setActiveTab('favorites')} style={{ cursor: 'pointer' }}>
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
              </div>
            )}

            {/* Section Réservations */}
            {activeTab === 'reservations' && (
              <div className="content-section">
                <div className="section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                      <h2>Mes Réservations</h2>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>
                        Gérez toutes vos réservations
                      </p>
                    </div>
                    <button 
                      className="btn-refresh"
                      onClick={loadReservations}
                      disabled={reservationsLoading}
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{ 
                          animation: reservationsLoading ? 'spin 1s linear infinite' : 'none',
                          width: '20px',
                          height: '20px'
                        }}
                      >
                        <polyline points="23 4 23 10 17 10"/>
                        <polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      Actualiser
                    </button>
                  </div>

                  {reservationsLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Chargement de vos réservations...</p>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '80px', height: '80px', margin: '0 auto 20px' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <h3>Aucune réservation</h3>
                      <p>Vous n'avez pas encore effectué de réservation</p>
                      <button 
                        className="btn-primary"
                        onClick={() => router.push('/reservation')}
                        style={{ marginTop: '20px' }}
                      >
                        Réserver une table
                      </button>
                    </div>
                  ) : (
                    <div className="reservations-grid">
                      {reservations.map((reservation) => {
                        const statusInfo = getStatusBadge(reservation.status);
                        const canCancel = canCancelReservation(reservation);
                        const isCancelling = cancellingId === reservation.id;

                        return (
                          <div key={reservation.id} className="reservation-card">
                            <div className="reservation-header">
                              <div className="reservation-date-badge">
                                <div className="date-day">
                                  {new Date(reservation.reservation_date).getDate()}
                                </div>
                                <div className="date-month">
                                  {new Date(reservation.reservation_date).toLocaleDateString('fr-FR', { month: 'short' })}
                                </div>
                              </div>
                              <div className="reservation-status">
                                <span 
                                  className="status-badge"
                                  style={{ 
                                    background: statusInfo.bg,
                                    color: statusInfo.color,
                                    border: `2px solid ${statusInfo.color}`
                                  }}
                                >
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>



                            <div className="reservation-body">
                              <div className="reservation-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <div>
                                  <strong>Heure</strong>
                                  <p>{formatTime(reservation.reservation_time)}</p>
                                </div>
                              </div>

                              <div className="reservation-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <div>
                                  <strong>Personnes</strong>
                                  <p>{reservation.number_of_people} personne{reservation.number_of_people > 1 ? 's' : ''}</p>
                                </div>
                              </div>

                              

                              {reservation.special_requests && (
                                <div className="reservation-detail">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                  </svg>
                                  <div>
                                    <strong>Demande spéciale</strong>
                                    <p>{reservation.special_requests}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteReservation(reservation.id)}
                  disabled={deleteLoading === reservation.id}
                >
                  {deleteLoading === reservation.id ? (
                    <>
                      <span className="spinner"></span>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Supprimer
                    </>
                  )}
                </button>


           {canCancel && (
                              <div className="reservation-actions">
                                <button
                                  className="btn-cancel-reservation"
                                  onClick={() => handleCancelReservation(reservation.id)}
                                  disabled={isCancelling}
                                >
                                  {isCancelling ? (
                                    <>
                                      <span className="spinner-small"></span>
                                      Annulation...
                                    </>
                                  ) : (
                                    <>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="15" y1="9" x2="9" y2="15"/>
                                        <line x1="9" y1="9" x2="15" y2="15"/>
                                      </svg>
                                      Annuler la réservation
                                    </>
                                  )}
                                </button>
                              </div>

                              
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

{/* ✅ SECTION FAVORIS */}
            {activeTab === 'favorites' && (
              <div className="content-section">
                <div className="section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                      <h2>❤️ Mes Plats Favoris</h2>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>
                        {favorites.length} plat{favorites.length > 1 ? 's' : ''} que vous adorez
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-refresh" onClick={loadFavorites} disabled={favoritesLoading}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: favoritesLoading ? 'spin 1s linear infinite' : 'none', width: '20px', height: '20px' }}>
                          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Actualiser
                      </button>
                      <button className="btn-secondary" onClick={() => router.push('/categories')}>
                        <Eye size={18} />
                        Voir la carte
                      </button>
                    </div>
                  </div>

                  {favoritesLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Chargement de vos favoris...</p>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="empty-state">
                      <Heart size={80} />
                      <h3>Aucun favori</h3>
                      <p>Explorez notre carte et ajoutez vos plats préférés</p>
                      <button className="btn-primary" onClick={() => router.push('/categories')} style={{ marginTop: '20px' }}>
                        Découvrir la carte
                      </button>
                    </div>
                  ) : (
                    <div className="favorites-grid-dashboard">
                      {favorites.map((dish) => {
                        const dietaryBadges = getDietaryBadges(dish);
                        const isRemoving = removingFavoriteId === dish.id_dish;

                        return (
                          <div key={dish.id_dish} className="favorite-card-dashboard">
                            {/* Image */}
                            <div className="favorite-image">
                              {dish.image_url ? (
                                <img src={dish.image_url} alt={dish.name} />
                              ) : (
                                <div className="placeholder-image">🍽️</div>
                              )}
                              
                              {/* Bouton supprimer */}
                              <button 
                                className={`remove-favorite-btn ${isRemoving ? 'removing' : ''}`}
                                onClick={() => handleRemoveFavorite(dish.id_dish)}
                                disabled={isRemoving}
                                title="Retirer des favoris"
                              >
                                {isRemoving ? <div className="spinner-tiny"></div> : <Trash2 size={18} />}
                              </button>

                              {/* Badges */}
                              {dietaryBadges.length > 0 && (
                                <div className="dietary-badges-overlay">
                                  {dietaryBadges.map((badge, i) => (
                                    <span key={i} className="dietary-badge" style={{ background: badge.color }} title={badge.label}>
                                      {badge.icon}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Contenu */}
                            <div className="favorite-content">
                              <div className="favorite-header">
                                <span className="category-tag">{dish.category_icon} {dish.category_name}</span>
                                <span className="course-type">{dish.course_type}</span>
                              </div>

                              <h3 className="favorite-name">{dish.name}</h3>

                              {dish.description && (
                                <p className="favorite-description">{dish.description}</p>
                              )}

                              <div className="favorite-meta">
                                {dish.preparation_time && (
                                  <span className="meta-tag">
                                    <Clock size={14} />
                                    {dish.preparation_time} min
                                  </span>
                                )}
                                {dish.calories && (
                                  <span className="meta-tag">
                                    <Flame size={14} />
                                    {dish.calories} kcal
                                  </span>
                                )}
                              </div>

                              {dish.allergens && settings.show_allergens === '1' && (
                                <div className="allergens-tag">
                                  <AlertCircle size={14} />
                                  <span>Allergènes: {dish.allergens}</span>
                                </div>
                              )}

                              <div className="favorite-footer">
                                {settings.show_prices === '1' && (
                                  <div className="price-display">{parseFloat(dish.price).toFixed(2)}€</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}






            {/* Section Profil */}
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

            {/* Section Paramètres */}
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

      <style>{`

        .btn-delete {
    padding: 10px 18px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
  }

  .btn-delete:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .btn-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }




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
          display: flex;
          align-items: center;
          gap: 8px;
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

        .reservations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 25px;
        }

        .reservation-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 25px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reservation-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .reservation-date-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .date-day {
          font-size: 2em;
          font-weight: 900;
          color: white;
          line-height: 1;
        }

        .date-month {
          font-size: 0.75em;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge-mini {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75em;
          font-weight: 700;
          text-transform: uppercase;
        }

        .reservation-body {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .reservation-detail {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .reservation-detail:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .reservation-detail svg {
          width: 20px;
          height: 20px;
          color: #667eea;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .reservation-detail strong {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85em;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .reservation-detail p {
          color: white;
          font-weight: 600;
          margin: 0;
        }

        .reservation-actions {
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-cancel-reservation {
          width: 100%;
          padding: 12px;
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-cancel-reservation:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.25);
          border-color: #ef4444;
          transform: translateY(-2px);
        }

        .btn-cancel-reservation:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel-reservation svg {
          width: 18px;
          height: 18px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-top-color: #ef4444;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-refresh:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: #667eea;
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-all-btn {
          background: transparent;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          color: #764ba2;
          transform: translateX(5px);
        }

        .empty-state-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
          padding: 20px;
        }

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

        .empty-state h3 {
          color: white;
          font-size: 1.5em;
          margin-bottom: 10px;
        }

        .empty-state p {
          margin-bottom: 0;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .favorites-grid-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        .favorite-card-dashboard {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: slideIn 0.5s ease;
        }

        .favorite-card-dashboard:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .favorite-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }

        .favorite-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .favorite-card-dashboard:hover .favorite-image img {
          transform: scale(1.1);
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-size: 4em;
        }

        .remove-favorite-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 2;
          opacity: 0;
        }

        .favorite-card-dashboard:hover .remove-favorite-btn {
          opacity: 1;
        }

        .remove-favorite-btn:hover:not(:disabled) {
          background: #dc2626;
          transform: scale(1.1);
        }

        .remove-favorite-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .remove-favorite-btn.removing {
          opacity: 1;
        }

        .spinner-tiny {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .dietary-badges-overlay {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          gap: 8px;
          z-index: 1;
        }

        .dietary-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .favorite-content {
          padding: 20px;
        }

        .favorite-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .category-tag {
          padding: 6px 12px;
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
        }

        .course-type {
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          font-size: 0.75em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .favorite-name {
          color: white;
          font-size: 1.3em;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .favorite-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9em;
          line-height: 1.6;
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .favorite-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .meta-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85em;
        }

        .allergens-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 10px;
          color: #f59e0b;
          font-size: 0.85em;
          margin-bottom: 12px;
        }

        .favorite-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .price-display {
          color: #10b981;
          font-size: 1.5em;
          font-weight: 800;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .dashboard-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .dashboard-sidebar {
            position: relative;
            top: 0;
          }

          .reservations-grid {
            grid-template-columns: 1fr;
          }

          .favorites-grid-dashboard {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding-top: 60px;
          }

          .main-header {
            flex
            08:32-direction: column;
            align-items: flex-start;
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

      .favorites-grid-dashboard {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
</>
);
}