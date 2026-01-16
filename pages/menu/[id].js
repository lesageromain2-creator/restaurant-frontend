//menu/[id].js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchSettings } from '../../utils/api';

export default function MenuDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [settings, setSettings] = useState({});
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setMounted(true), 100);
    }
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les paramètres du site
      const settingsData = await fetchSettings();
      setSettings(settingsData);

      // Charger le menu spécifique depuis l'API
      const response = await fetch(`http://localhost:5000/menus/${id}`);
      
      if (!response.ok) {
        throw new Error('Menu non trouvé');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors du chargement du menu');
      }

      console.log('Menu chargé:', data);
      setMenu(data);
    } catch (error) {
      console.error('Erreur chargement menu:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupDishesByCourse = (dishes) => {
    if (!dishes || !Array.isArray(dishes)) return {};
    
    const grouped = {};
    dishes.forEach(dish => {
      const courseType = dish.course_type || 'Autres';
      if (!grouped[courseType]) {
        grouped[courseType] = [];
      }
      grouped[courseType].push(dish);
    });
    return grouped;
  };

  const courseIcons = {
    'Entrée': '🥗',
    'Plat': '🍖',
    'Dessert': '🍰',
    'Fromage': '🧀',
    'Boisson': '🍷'
  };

  const menuTypeLabels = {
    standard: '✨ Standard',
    seasonal: '🍂 Saisonnier',
    special: '⭐ Spécial',
    tasting: '🍷 Dégustation',
    chef: '👨‍🍳 Menu Chef'
  };

  if (loading) {
    return (
      <>
        <div className="loading-screen">
          <div className="loader-wrapper">
            <div className="loader"></div>
            <div className="loader-inner"></div>
          </div>
          <p className="loading-text">Chargement du menu...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          }
          .loader-wrapper {
            position: relative;
            width: 80px;
            height: 80px;
            margin-bottom: 30px;
          }
          .loader {
            position: absolute;
            width: 80px;
            height: 80px;
            border: 4px solid rgba(220, 38, 38, 0.1);
            border-top: 4px solid #DC2626;
            border-radius: 50%;
            animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          }
          .loader-inner {
            position: absolute;
            width: 60px;
            height: 60px;
            top: 10px;
            left: 10px;
            border: 4px solid rgba(234, 88, 12, 0.1);
            border-bottom: 4px solid #EA580C;
            border-radius: 50%;
            animation: spin 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
          }
          .loading-text {
            background: linear-gradient(135deg, #DC2626, #EA580C, #DB2777);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.2em;
            font-weight: 700;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </>
    );
  }

  if (error || !menu) {
    return (
      <>
        <Header settings={settings} />
        <div className="error-page">
          <h1>Menu introuvable</h1>
          <p>{error || 'Ce menu n\'existe pas ou n\'est plus disponible'}</p>
          <button onClick={() => router.push('/menus')}>Retour aux menus</button>
        </div>
        <Footer settings={settings} />
        <style jsx>{`
          .error-page {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }
          .error-page h1 {
            font-size: 2em;
            color: #DC2626;
            margin-bottom: 20px;
          }
          .error-page p {
            color: #666;
            margin-bottom: 30px;
          }
          .error-page button {
            padding: 14px 28px;
            background: #DC2626;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>
      </>
    );
  }

  const groupedDishes = groupDishesByCourse(menu.dishes);

  return (
    <>
      <Head>
        <title>{menu.title} - {settings.site_name || 'Restaurant'}</title>
      </Head>

      <Header settings={settings} />

      <div className="menu-detail-page">
        <section className="page-hero">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
          {menu.image && (
            <div className="hero-image">
              <img src={menu.image} alt={menu.title} />
              <div className="hero-image-overlay"></div>
            </div>
          )}
          <div className={`hero-content ${mounted ? 'mounted' : ''}`}>
            <span className="hero-badge">{menuTypeLabels[menu.menu_type] || '✨ Menu'}</span>
            <h1>{menu.title}</h1>
            <p>{menu.description}</p>
            <div className="hero-price">
              <span className="price-label">À partir de</span>
              <span className="price-value">{parseFloat(menu.price).toFixed(2)}€</span>
              <span className="price-label">par personne</span>
            </div>
          </div>
        </section>

        <div className="container">
          <button 
            className="back-button"
            onClick={() => router.push('/menus')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour aux menus
          </button>

          {Object.keys(groupedDishes).length > 0 ? (
            <div className={`courses-section ${mounted ? 'mounted' : ''}`}>
              {Object.entries(groupedDishes).map(([courseType, dishes], courseIndex) => (
                <div 
                  key={courseType} 
                  className="course-section"
                  style={{ animationDelay: `${courseIndex * 100}ms` }}
                >
                  <div className="course-header">
                    <span className="course-icon">{courseIcons[courseType] || '🍴'}</span>
                    <h2 className="course-title">{courseType}</h2>
                    <span className="course-count">{dishes.length}</span>
                  </div>
                  
                  <div className="dishes-list">
                    {dishes.map((dish, dishIndex) => (
                      <div 
                        key={dish.id_dish} 
                        className="dish-item"
                        style={{ animationDelay: `${(courseIndex * 100) + (dishIndex * 50)}ms` }}
                      >
                        {dish.image_url && (
                          <div className="dish-image">
                            <img src={dish.image_url} alt={dish.name} />
                            <div className="dish-badges">
                              {dish.is_vegetarian && <span className="badge-icon" title="Végétarien">🌱</span>}
                              {dish.is_vegan && <span className="badge-icon" title="Végétalien">🥬</span>}
                              {dish.is_gluten_free && <span className="badge-icon" title="Sans gluten">🌾</span>}
                            </div>
                          </div>
                        )}
                        <div className="dish-content">
                          <h3 className="dish-name">{dish.name}</h3>
                          {dish.description && (
                            <p className="dish-description">{dish.description}</p>
                          )}
                          
                          <div className="dish-meta">
                            {dish.preparation_time && (
                              <span className="meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {dish.preparation_time} min
                              </span>
                            )}
                            {dish.calories && (
                              <span className="meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                                {dish.calories} kcal
                              </span>
                            )}
                          </div>

                          {dish.allergens && (
                            <div className="dish-allergens">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                              Allergènes: {dish.allergens}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-dishes">
              <div className="no-dishes-icon">🍽️</div>
              <h3>Composition en cours</h3>
              <p>Les plats de ce menu seront bientôt disponibles.</p>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="btn-reserve"
              onClick={() => router.push('/reservation')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Réserver ce menu
            </button>
            <button 
              className="btn-contact"
              onClick={() => router.push('/contact')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Nous contacter
            </button>
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .menu-detail-page {
          min-height: 100vh;
          background: #ffffff;
        }

        .page-hero {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 100px 20px;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #DC2626, #EA580C, #DB2777);
          opacity: 0.95;
          z-index: 1;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          z-index: 2;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(234, 88, 12, 0.9));
        }

        .hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          color: white;
          max-width: 900px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-content.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-badge {
          display: inline-block;
          padding: 10px 24px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          font-size: 0.95em;
          font-weight: 600;
          margin-bottom: 25px;
        }

        .hero-content h1 {
          font-size: 4em;
          margin-bottom: 20px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .hero-content p {
          font-size: 1.4em;
          opacity: 0.95;
          margin-bottom: 35px;
          line-height: 1.6;
        }

        .hero-price {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .price-value {
          font-size: 3.5em;
          font-weight: 900;
          letter-spacing: -2px;
        }

        .price-label {
          font-size: 1.1em;
          opacity: 0.9;
          font-weight: 500;
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

        .courses-section {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .courses-section.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .course-section {
          background: #f8f9fa;
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 40px;
        }

        .course-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #e9ecef;
        }

        .course-icon {
          font-size: 2.5em;
        }

        .course-title {
          font-size: 2em;
          font-weight: 800;
          color: #1a1a1a;
          flex: 1;
        }

        .course-count {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .dishes-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .dish-item {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          gap: 25px;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .dish-item:hover {
          border-color: #DC2626;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.15);
          transform: translateY(-5px);
        }

        .dish-image {
          width: 220px;
          height: 180px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .dish-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .dish-item:hover .dish-image img {
          transform: scale(1.1);
        }

        .dish-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 8px;
        }

        .badge-icon {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .dish-content {
          flex: 1;
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dish-name {
          font-size: 1.5em;
          font-weight: 800;
          color: #1a1a1a;
        }

        .dish-description {
          color: #666;
          line-height: 1.7;
        }

        .dish-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-size: 0.9em;
          font-weight: 500;
        }

        .meta-item svg {
          opacity: 0.7;
        }

        .dish-allergens {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #fff3cd;
          border-radius: 8px;
          font-size: 0.85em;
          color: #856404;
          font-weight: 600;
          align-self: flex-start;
        }

        .no-dishes {
          text-align: center;
          padding: 100px 20px;
          background: #f8f9fa;
          border-radius: 24px;
        }

        .no-dishes-icon {
          font-size: 5em;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .no-dishes h3 {
          font-size: 2em;
          font-weight: 800;
          color: #333;
          margin-bottom: 15px;
        }

        .no-dishes p {
          color: #999;
          font-size: 1.1em;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 60px;
          flex-wrap: wrap;
        }

        .btn-reserve,
        .btn-contact {
          padding: 18px 40px;
          border: none;
          border-radius: 12px;
          font-size: 1.1em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .btn-reserve {
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
        }

        .btn-reserve:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(220, 38, 38, 0.4);
        }

        .btn-contact {
          background: white;
          color: #DC2626;
          border: 2px solid #DC2626;
        }

        .btn-contact:hover {
          background: #DC2626;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.2);
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5em;
          }

          .hero-content p {
            font-size: 1.1em;
          }

          .price-value {
            font-size: 2.5em;
          }

          .course-section {
            padding: 25px;
          }

          .dish-item {
            flex-direction: column;
          }

          .dish-image {
            width: 100%;
            height: 200px;
          }

          .dish-content {
            padding: 20px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-reserve,
          .btn-contact {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}