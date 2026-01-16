// frontend/pages/favorites.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Heart, Trash2, ShoppingCart, Clock, Flame, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchSettings, fetchFavorites, removeFavorite, checkAuth } from '../utils/api';

export default function Favorites() {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    loadData();
    setTimeout(() => setMounted(true), 100);
  }, []);

 const loadData = async () => {
  try {
    setLoading(true);

    // Vérifier l'authentification
    const authData = await checkAuth();
    if (!authData.authenticated) {
      router.push('/login?redirect=/favorites');
      return;
    }

    // Charger les paramètres et favoris
    const [settingsData, favoritesData] = await Promise.all([
      fetchSettings(),
      fetchFavorites()
    ]);

    setSettings(settingsData);
    
    // ✅ CORRECTION: favoritesData.favorites au lieu de favoritesData directement
    setFavorites(favoritesData.favorites || []);

  } catch (error) {
    console.error('Erreur chargement:', error);
  } finally {
    setLoading(false);
  }
};

  const handleRemoveFavorite = async (dishId) => {
    if (!confirm('Retirer ce plat de vos favoris ?')) return;

    try {
      setRemovingId(dishId);
      await removeFavorite(dishId);
      
      // Retirer de la liste locale
      setFavorites(prev => prev.filter(fav => fav.id_dish !== dishId));
      
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      alert('Impossible de retirer ce favori');
    } finally {
      setRemovingId(null);
    }
  };

  const handleOrder = (dish) => {
    alert(`Commander: ${dish.name}\n\nRéservez une table pour profiter de ce plat !`);
  };

  const getDietaryBadges = (dish) => {
    const badges = [];
    if (dish.is_vegetarian) badges.push({ icon: '🌱', label: 'Végétarien', color: '#10b981' });
    if (dish.is_vegan) badges.push({ icon: '🥬', label: 'Végétalien', color: '#059669' });
    if (dish.is_gluten_free) badges.push({ icon: '🌾', label: 'Sans gluten', color: '#f59e0b' });
    return badges;
  };

  if (loading) {
    return (
      <>
        <div className="loading-screen">
          <div className="loader-wrapper">
            <Heart className="heart-pulse" size={60} />
          </div>
          <p className="loading-text">Chargement de vos favoris...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #DC2626, #EA580C, #DB2777);
          }
          .loader-wrapper {
            margin-bottom: 30px;
            animation: float 2s ease-in-out infinite;
          }
          .heart-pulse {
            color: white;
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
            animation: heartbeat 1.5s ease-in-out infinite;
          }
          .loading-text {
            color: white;
            font-size: 1.2em;
            font-weight: 700;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
            50% { transform: scale(1); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Mes Favoris - {settings.site_name || 'Restaurant'}</title>
      </Head>

      <Header settings={settings} />

      <div className="favorites-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="hero-gradient"></div>
          <div className={`hero-content ${mounted ? 'mounted' : ''}`}>
            <Heart className="hero-icon" size={80} />
            <h1>Mes Plats Favoris</h1>
            <p>
              {favorites.length > 0 
                ? `${favorites.length} plat${favorites.length > 1 ? 's' : ''} que vous adorez`
                : 'Aucun favori pour le moment'
              }
            </p>
          </div>
        </section>

        <div className="container">
          <button 
            className="back-button"
            onClick={() => router.push('/categories')}
          >
            <ArrowLeft size={20} />
            Découvrir la carte
          </button>

          {favorites.length > 0 ? (
            <div className={`favorites-grid ${mounted ? 'mounted' : ''}`}>
              {favorites.map((dish, index) => {
                const dietaryBadges = getDietaryBadges(dish);
                const isRemoving = removingId === dish.id_dish;

                return (
                  <div 
                    key={dish.id_dish}
                    className="favorite-card"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="card-image">
                      {dish.image_url ? (
                        <img src={dish.image_url} alt={dish.name} />
                      ) : (
                        <div className="placeholder-image">
                          <span className="placeholder-emoji">🍽️</span>
                        </div>
                      )}
                      
                      {/* Bouton Supprimer */}
                      <button 
                        className={`remove-btn ${isRemoving ? 'removing' : ''}`}
                        onClick={() => handleRemoveFavorite(dish.id_dish)}
                        disabled={isRemoving}
                        title="Retirer des favoris"
                      >
                        {isRemoving ? (
                          <div className="spinner-small"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>

                      {/* Badges diététiques */}
                      {dietaryBadges.length > 0 && (
                        <div className="dietary-badges">
                          {dietaryBadges.map((badge, i) => (
                            <span 
                              key={i}
                              className="dietary-badge"
                              style={{ background: badge.color }}
                              title={badge.label}
                            >
                              {badge.icon}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Statut disponibilité */}
                      {!dish.is_available && (
                        <div className="unavailable-overlay">
                          <span>Indisponible</span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="card-content">
                      {/* Catégorie */}
                      <div className="card-header">
                        <span className="category-badge">
                          {dish.category_icon && <span>{dish.category_icon}</span>}
                          {dish.category_name}
                        </span>
                        <span className="course-type">{dish.course_type}</span>
                      </div>

                      {/* Titre */}
                      <h3 className="dish-name">{dish.name}</h3>

                      {/* Description */}
                      {dish.description && (
                        <p className="dish-description">{dish.description}</p>
                      )}

                      {/* Meta informations */}
                      <div className="dish-meta">
                        {dish.preparation_time && (
                          <span className="meta-item">
                            <Clock size={14} />
                            {dish.preparation_time} min
                          </span>
                        )}
                        {dish.calories && (
                          <span className="meta-item">
                            <Flame size={14} />
                            {dish.calories} kcal
                          </span>
                        )}
                      </div>

                      {/* Allergènes */}
                      {dish.allergens && settings.show_allergens === '1' && (
                        <div className="allergens-warning">
                          <AlertCircle size={14} />
                          <span>Allergènes: {dish.allergens}</span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="card-footer">
                        {settings.show_prices === '1' && (
                          <div className="price-tag">
                            {parseFloat(dish.price).toFixed(2)}€
                          </div>
                        )}
                        
                        <button 
                          className="order-btn"
                          onClick={() => handleOrder(dish)}
                          disabled={!dish.is_available}
                        >
                          <ShoppingCart size={18} />
                          Commander
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`empty-state ${mounted ? 'mounted' : ''}`}>
              <Heart className="empty-icon" size={120} />
              <h2>Aucun favori pour le moment</h2>
              <p>Explorez notre carte et ajoutez vos plats préférés à vos favoris !</p>
              <button 
                className="btn-primary"
                onClick={() => router.push('/categories')}
              >
                Découvrir la carte
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .favorites-page {
          min-height: 100vh;
          background: #ffffff;
        }

        .page-hero {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 100px 20px 60px;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #DC2626, #EA580C, #DB2777);
          opacity: 1;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-content.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-icon {
          margin: 0 auto 20px;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
          animation: heartbeat 2s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
        }

        .hero-content h1 {
          font-size: 3.5em;
          margin-bottom: 15px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .hero-content p {
          font-size: 1.3em;
          opacity: 0.95;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: white;
          border: 2px solid #f1f3f5;
          border-radius: 12px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .back-button:hover {
          border-color: #DC2626;
          color: #DC2626;
          transform: translateX(-5px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 30px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease;
        }

        .favorites-grid.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .favorite-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: slideIn 0.6s ease;
          border: 2px solid transparent;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .favorite-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border-color: rgba(220, 38, 38, 0.3);
        }

        .card-image {
          position: relative;
          height: 280px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .favorite-card:hover .card-image img {
          transform: scale(1.1);
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-emoji {
          font-size: 5em;
          opacity: 0.3;
        }

        .remove-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .remove-btn:hover:not(:disabled) {
          transform: scale(1.1) rotate(5deg);
          background: rgba(220, 38, 38, 0.95);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
        }

        .remove-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .remove-btn.removing {
          background: rgba(156, 163, 175, 0.95);
        }

        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dietary-badges {
          position: absolute;
          top: 15px;
          left: 15px;
          display: flex;
          gap: 8px;
          z-index: 1;
        }

        .dietary-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2em;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .unavailable-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2em;
          letter-spacing: 1px;
        }

        .card-content {
          padding: 25px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(220, 38, 38, 0.1);
          color: #DC2626;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 700;
        }

        .course-type {
          font-size: 0.85em;
          color: #6b7280;
          font-weight: 600;
        }

        .dish-name {
          font-size: 1.6em;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .dish-description {
          color: #666;
          line-height: 1.7;
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .dish-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.9em;
          font-weight: 600;
        }

        .allergens-warning {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #fff3cd;
          border-radius: 10px;
          font-size: 0.85em;
          color: #856404;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid #f1f3f5;
        }

        .price-tag {
          font-size: 2em;
          font-weight: 900;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .order-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }

        .order-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
        }

        .order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #9ca3af;
        }

        .empty-state {
          text-align: center;
          padding: 100px 20px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .empty-state.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .empty-icon {
          color: rgba(220, 38, 38, 0.2);
          margin: 0 auto 30px;
        }

        .empty-state h2 {
          font-size: 2.5em;
          font-weight: 900;
          color: #1a1a1a;
          margin-bottom: 15px;
        }

        .empty-state p {
          font-size: 1.2em;
          color: #6b7280;
          margin-bottom: 40px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 40px;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(220, 38, 38, 0.4);
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5em;
          }

          .hero-content p {
            font-size: 1.1em;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }

          .card-image {
            height: 240px;
          }

          .dish-name {
            font-size: 1.4em;
          }

          .card-footer {
            flex-direction: column;
            gap: 15px;
          }

          .order-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}