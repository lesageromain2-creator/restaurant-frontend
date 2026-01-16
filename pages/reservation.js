// frontend/pages/reservation.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchSettings, createReservation, checkAuth } from '../utils/api';

export default function Reservation() {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    reservation_date: '',
    reservation_time: '',
    number_of_people: 2,
    special_requests: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    loadData();
    setTimeout(() => setMounted(true), 50);
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, authData] = await Promise.all([
        fetchSettings(),
        checkAuth()
      ]);

      setSettings(settingsData);
      
      if (authData.authenticated) {
        setUser(authData.user);
      }

      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({...prev, reservation_date: today}));

    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.reservation_date) {
      newErrors.push('La date est requise');
    }
    
    if (!formData.reservation_time) {
      newErrors.push('L\'heure est requise');
    }
    
    if (formData.number_of_people < 1 || formData.number_of_people > 20) {
      newErrors.push('Le nombre de personnes doit être entre 1 et 20');
    }

    const reservationDateTime = new Date(`${formData.reservation_date}T${formData.reservation_time}`);
    if (reservationDateTime < new Date()) {
      newErrors.push('La date et l\'heure doivent être dans le futur');
    }

    const [hour, minute] = formData.reservation_time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    const lunchStart = 12 * 60;
    const lunchEnd = 14 * 60 + 30;
    const dinnerStart = 19 * 60;
    const dinnerEnd = 22 * 60 + 30;

    const isLunchTime = timeInMinutes >= lunchStart && timeInMinutes <= lunchEnd;
    const isDinnerTime = timeInMinutes >= dinnerStart && timeInMinutes <= dinnerEnd;

    if (!isLunchTime && !isDinnerTime) {
      newErrors.push('Horaires disponibles : 12h00-14h30 et 19h00-22h30');
    }

    return newErrors;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login?redirect=/reservation');
      return;
    }

    setErrors([]);
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      await createReservation(formData);
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      setErrors([error.message || 'Une erreur est survenue']);
      setLoading(false);
      triggerShake();
    }
  };

  // Time slots pour une meilleure UX
  const timeSlots = {
    lunch: ['12:00', '12:30', '13:00', '13:30', '14:00'],
    dinner: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
  };

  if (success) {
    return (
      <>
        <Head>
          <title>Réservation confirmée - {settings.site_name}</title>
        </Head>

        <Header settings={settings} />

        <div className="success-page">
          <div className="success-container">
            <div className="success-animation">
              <div className="check-circle">
                <svg viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="25" fill="none"/>
                  <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>
            
            <h1>Réservation confirmée !</h1>
            <p className="success-subtitle">Merci pour votre confiance</p>
            
            <div className="reservation-card">
              <div className="card-header">
                <span className="card-icon">🍽️</span>
                <h3>Détails de votre réservation</h3>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <strong>Date</strong>
                    <p>{new Date(formData.reservation_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">🕐</span>
                  <div className="detail-content">
                    <strong>Heure</strong>
                    <p>{formData.reservation_time}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">👥</span>
                  <div className="detail-content">
                    <strong>Convives</strong>
                    <p>{formData.number_of_people} {formData.number_of_people > 1 ? 'personnes' : 'personne'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-primary"
              onClick={() => router.push('/dashboard')}
            >
              Voir mes réservations
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <Footer settings={settings} />

        <style jsx>{`
          .success-page {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
          }

          .success-page::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          }

          .success-container {
            background: white;
            padding: 60px 40px;
            border-radius: 32px;
            max-width: 600px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 90px rgba(0,0,0,0.3);
            position: relative;
            animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .success-animation {
            margin-bottom: 30px;
          }

          .check-circle {
            width: 120px;
            height: 120px;
            margin: 0 auto;
            position: relative;
          }

          .check-circle svg {
            width: 100%;
            height: 100%;
          }

          .check-circle circle {
            stroke: #10b981;
            stroke-width: 3;
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            animation: drawCircle 0.6s ease forwards;
          }

          .check-circle path {
            stroke: #10b981;
            stroke-width: 4;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: drawCheck 0.3s 0.6s ease forwards;
          }

          @keyframes drawCircle {
            to { stroke-dashoffset: 0; }
          }

          @keyframes drawCheck {
            to { stroke-dashoffset: 0; }
          }

          .success-container h1 {
            font-size: 3em;
            font-weight: 900;
            background: linear-gradient(135deg, #DC2626, #EA580C);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
          }

          .success-subtitle {
            font-size: 1.3em;
            color: #64748b;
            margin-bottom: 40px;
          }

          .reservation-card {
            background: #f8fafc;
            border-radius: 24px;
            padding: 30px;
            margin-bottom: 35px;
            border: 2px solid #e2e8f0;
          }

          .card-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 25px;
          }

          .card-icon {
            font-size: 2.5em;
          }

          .card-header h3 {
            font-size: 1.5em;
            font-weight: 800;
            color: #1e293b;
            margin: 0;
          }

          .card-body {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .detail-row {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px;
            background: white;
            border-radius: 16px;
            text-align: left;
            transition: all 0.3s;
          }

          .detail-row:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
          }

          .detail-icon {
            font-size: 2.5em;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #DC2626, #EA580C);
            border-radius: 16px;
            flex-shrink: 0;
          }

          .detail-content strong {
            display: block;
            font-size: 0.9em;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }

          .detail-content p {
            font-size: 1.2em;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
          }

          .btn-primary {
            width: 100%;
            padding: 20px;
            background: linear-gradient(135deg, #DC2626, #EA580C);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.2em;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
          }

          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(220, 38, 38, 0.4);
          }

          @media (max-width: 768px) {
            .success-container {
              padding: 40px 25px;
            }

            .success-container h1 {
              font-size: 2.2em;
            }

            .check-circle {
              width: 100px;
              height: 100px;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Réserver une table - {settings.site_name || 'Restaurant'}</title>
      </Head>

      <Header settings={settings} />

      <div className="reservation-page">
        {/* Hero moderne avec décorations */}
        <section className="hero">
          <div className="hero-bg">
            <div className="decoration-utensils">
              <span className="utensil fork">🍴</span>
              <span className="utensil knife">🔪</span>
              <span className="utensil spoon">🥄</span>
            </div>
          </div>
          <div className={`hero-content ${mounted ? 'mounted' : ''}`}>
            <span className="hero-badge">
              <span className="badge-dot"></span>
              Réservation instantanée
            </span>
            <h1>Réservez votre table</h1>
            <p>Une expérience gastronomique qui vous attend</p>
          </div>
        </section>

        <div className="container">
          <div className={`main-grid ${mounted ? 'mounted' : ''}`}>
            {/* Sidebar informative */}
            <aside className="sidebar">
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">🕐</span>
                  <h3>Horaires</h3>
                </div>
                <div className="info-body">
                  <div className="time-slot">
                    <span className="slot-emoji">☀️</span>
                    <div>
                      <strong>Déjeuner</strong>
                      <p>12:00 - 14:30</p>
                    </div>
                  </div>
                  <div className="time-slot">
                    <span className="slot-emoji">🌙</span>
                    <div>
                      <strong>Dîner</strong>
                      <p>19:00 - 22:30</p>
                    </div>
                  </div>
                  <div className="time-slot closed">
                    <span className="slot-emoji">🚫</span>
                    <div>
                      <strong>Dimanche</strong>
                      <p>Fermé</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">📞</span>
                  <h3>Contact</h3>
                </div>
                <div className="info-body">
                  {settings.site_phone && (
                    <a href={`tel:${settings.site_phone}`} className="contact-link">
                      <span className="contact-icon">📱</span>
                      <div>
                        <strong>Téléphone</strong>
                        <p>{settings.site_phone}</p>
                      </div>
                    </a>
                  )}
                  {settings.site_email && (
                    <a href={`mailto:${settings.site_email}`} className="contact-link">
                      <span className="contact-icon">✉️</span>
                      <div>
                        <strong>Email</strong>
                        <p>{settings.site_email}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <div className="info-card highlight">
                <div className="info-header">
                  <span className="info-icon">⭐</span>
                  <h3>Avantages</h3>
                </div>
                <div className="info-body">
                  <ul className="benefits-list">
                    <li>
                      <span className="check">✓</span>
                      Confirmation immédiate
                    </li>
                    <li>
                      <span className="check">✓</span>
                      Annulation gratuite 2h avant
                    </li>
                    <li>
                      <span className="check">✓</span>
                      Tables jusqu'à 20 personnes
                    </li>
                    <li>
                      <span className="check">✓</span>
                      Service personnalisé
                    </li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Formulaire principal */}
            <main className="form-section">
              <div className={`form-container ${shake ? 'shake' : ''}`}>
                <div className="form-header">
                  <div className="header-decoration">
                    <span className="deco-element">🍷</span>
                    <span className="deco-element">🥖</span>
                    <span className="deco-element">🧀</span>
                  </div>
                  <h2>Réservation</h2>
                  <p>Complétez les informations ci-dessous</p>
                </div>

                {!user && (
                  <div className="alert alert-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <div>
                      <strong>Connexion requise</strong>
                      <p>
                        <a href="/login?redirect=/reservation">Connectez-vous</a> pour réserver une table
                      </p>
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="alert alert-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <div>
                      <strong>Erreur</strong>
                      <ul>
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Date Selection */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📅</span>
                      Date de réservation
                      <span className="required">*</span>
                    </label>
                    <div className="input-enhanced">
                      <input
                        type="date"
                        name="reservation_date"
                        value={formData.reservation_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        disabled={loading || !user}
                      />
                    </div>
                  </div>

                  {/* Time Selection avec boutons */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">🕐</span>
                      Heure d'arrivée
                      <span className="required">*</span>
                    </label>
                    <div className="time-selector">
                      <div className="service-section">
                        <div className="service-label">☀️ Déjeuner</div>
                        <div className="time-buttons">
                          {timeSlots.lunch.map(time => (
                            <button
                              key={time}
                              type="button"
                              className={`time-btn ${formData.reservation_time === time ? 'active' : ''}`}
                              onClick={() => setFormData({...formData, reservation_time: time})}
                              disabled={loading || !user}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="service-section">
                        <div className="service-label">🌙 Dîner</div>
                        <div className="time-buttons">
                          {timeSlots.dinner.map(time => (
                            <button
                              key={time}
                              type="button"
                              className={`time-btn ${formData.reservation_time === time ? 'active' : ''}`}
                              onClick={() => setFormData({...formData, reservation_time: time})}
                              disabled={loading || !user}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nombre de personnes avec slider */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">👥</span>
                      Nombre de convives
                      <span className="required">*</span>
                    </label>
                    <div className="people-selector">
                      <button
                        type="button"
                        className="people-btn"
                        onClick={() => setFormData({...formData, number_of_people: Math.max(1, formData.number_of_people - 1)})}
                        disabled={loading || !user || formData.number_of_people <= 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                      
                      <div className="people-display">
                        <div className="people-number">{formData.number_of_people}</div>
                        <div className="people-text">
                          {formData.number_of_people > 1 ? 'Personnes' : 'Personne'}
                        </div>
                        <input
                          type="range"
                          name="number_of_people"
                          value={formData.number_of_people}
                          onChange={handleChange}
                          min="1"
                          max="20"
                          disabled={loading || !user}
                          className="people-slider"
                        />
                      </div>
                      
                      <button
                        type="button"
                        className="people-btn"
                        onClick={() => setFormData({...formData, number_of_people: Math.min(20, formData.number_of_people + 1)})}
                        disabled={loading || !user || formData.number_of_people >= 20}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Demandes spéciales */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">💬</span>
                      Demandes spéciales
                    </label>
                    <div className="input-enhanced">
                      <textarea
                        name="special_requests"
                        value={formData.special_requests}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Allergies, régimes spéciaux, occasion particulière..."
                        disabled={loading || !user}
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading || !user}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Réservation en cours...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Confirmer la réservation
                      </>
                    )}
                  </button>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .reservation-page {
          min-height: 100vh;
          background: #fafafa;
        }

        /* HERO SECTION */
        .hero {
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #DC2626, #EA580C, #DB2777);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
        }

        .decoration-utensils {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .utensil {
          position: absolute;
          font-size: 4em;
          opacity: 0.1;
          animation: float 20s ease-in-out infinite;
        }

        .fork {
          top: 20%;
          left: 15%;
          animation-delay: 0s;
        }

        .knife {
          top: 60%;
          right: 20%;
          animation-delay: 5s;
        }

        .spoon {
          bottom: 25%;
          left: 60%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(5deg); }
          50% { transform: translate(-20px, 20px) rotate(-5deg); }
          75% { transform: translate(20px, 20px) rotate(5deg); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
          padding: 0 20px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-content.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          font-weight: 700;
          margin-bottom: 25px;
          font-size: 0.95em;
        }

        .badge-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        .hero-content h1 {
          font-size: 4.5em;
          font-weight: 900;
          margin-bottom: 20px;
          letter-spacing: -2px;
        }

        .hero-content p {
          font-size: 1.5em;
          opacity: 0.95;
        }

        /* CONTAINER */
        .container {
          max-width: 1400px;
          margin: -80px auto 0;
          padding: 0 20px 80px;
          position: relative;
          z-index: 10;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 35px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .main-grid.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* SIDEBAR */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .info-card {
          background: white;
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 2px solid #f1f3f5;
          transition: all 0.3s;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.15);
          border-color: #DC2626;
        }

        .info-card.highlight {
          background: linear-gradient(135deg, #fef2f2, #fff7ed);
          border-color: #fca5a5;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
        }

        .info-icon {
          font-size: 2.5em;
        }

        .info-header h3 {
          font-size: 1.4em;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        .info-body {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .time-slot,
        .contact-link {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 16px;
          transition: all 0.3s;
          text-decoration: none;
        }

        .time-slot:hover,
        .contact-link:hover {
          background: #f1f5f9;
          transform: translateX(5px);
        }

        .time-slot.closed {
          opacity: 0.5;
        }

        .slot-emoji,
        .contact-icon {
          font-size: 2em;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .time-slot strong,
        .contact-link strong {
          display: block;
          font-size: 0.9em;
          color: #64748b;
          margin-bottom: 3px;
        }

        .time-slot p,
        .contact-link p {
          font-size: 1.1em;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          color: #1e293b;
          font-weight: 600;
          border-bottom: 1px solid rgba(220, 38, 38, 0.1);
        }

        .benefits-list li:last-child {
          border-bottom: none;
        }

        .check {
          width: 28px;
          height: 28px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          flex-shrink: 0;
        }

        /* FORM SECTION */
        .form-section {
          display: flex;
          flex-direction: column;
        }

        .form-container {
          background: white;
          border-radius: 32px;
          padding: 50px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 2px solid #f1f3f5;
        }

        .form-container.shake {
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
        }

        .header-decoration {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .deco-element {
          font-size: 2.5em;
          animation: bounce 2s ease-in-out infinite;
        }

        .deco-element:nth-child(2) {
          animation-delay: 0.2s;
        }

        .deco-element:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .form-header h2 {
          font-size: 3em;
          font-weight: 900;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .form-header p {
          font-size: 1.2em;
          color: #64748b;
        }

        /* ALERTS */
        .alert {
          display: flex;
          gap: 15px;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 30px;
          animation: slideIn 0.4s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .alert-info {
          background: #dbeafe;
          border: 2px solid #3b82f6;
        }

        .alert-info svg {
          stroke: #2563eb;
        }

        .alert-error {
          background: #fee2e2;
          border: 2px solid #ef4444;
        }

        .alert-error svg {
          stroke: #dc2626;
        }

        .alert strong {
          display: block;
          font-weight: 800;
          margin-bottom: 5px;
          color: #1e293b;
        }

        .alert p {
          margin: 0;
          color: #475569;
        }

        .alert a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: underline;
        }

        .alert ul {
          list-style: none;
          padding: 0;
          margin: 5px 0 0;
        }

        .alert li {
          color: #475569;
          font-weight: 600;
          margin-bottom: 3px;
        }

        /* FORM ELEMENTS */
        .form-group {
          margin-bottom: 35px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          font-size: 1.1em;
          font-weight: 700;
          color: #1e293b;
        }

        .label-icon {
          font-size: 1.5em;
        }

        .required {
          color: #ef4444;
        }

        .input-enhanced {
          position: relative;
        }

        .input-enhanced input,
        .input-enhanced textarea {
          width: 100%;
          padding: 18px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 1.1em;
          font-family: inherit;
          transition: all 0.3s;
          background: #f8fafc;
        }

        .input-enhanced input:focus,
        .input-enhanced textarea:focus {
          outline: none;
          border-color: #DC2626;
          background: white;
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        .input-enhanced input:disabled,
        .input-enhanced textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-enhanced textarea {
          resize: vertical;
          min-height: 120px;
        }

        /* TIME SELECTOR */
        .time-selector {
          display: flex;
          flex-direction: column;
          gap: 25px;
          padding: 25px;
          background: #f8fafc;
          border-radius: 20px;
          border: 2px solid #e2e8f0;
        }

        .service-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .service-label {
          font-size: 1.2em;
          font-weight: 800;
          color: #1e293b;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }

        .time-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 12px;
        }

        .time-btn {
          padding: 15px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1.05em;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .time-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .time-btn span {
          position: relative;
          z-index: 1;
        }

        .time-btn:hover:not(:disabled) {
          border-color: #DC2626;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        .time-btn.active {
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          border-color: transparent;
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
        }

        .time-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        /* PEOPLE SELECTOR */
        .people-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          padding: 40px;
          background: linear-gradient(135deg, #fef2f2, #fff7ed);
          border-radius: 24px;
          border: 3px dashed rgba(220, 38, 38, 0.3);
        }

        .people-btn {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
        }

        .people-btn svg {
          width: 28px;
          height: 28px;
        }

        .people-btn:hover:not(:disabled) {
          transform: scale(1.15) rotate(90deg);
          box-shadow: 0 12px 30px rgba(220, 38, 38, 0.5);
        }

        .people-btn:active:not(:disabled) {
          transform: scale(1.05);
        }

        .people-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        .people-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .people-number {
          font-size: 4em;
          font-weight: 900;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .people-text {
          font-size: 1.1em;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .people-slider {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .people-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          transition: all 0.3s;
        }

        .people-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.6);
        }

        .people-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          transition: all 0.3s;
        }

        .people-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.6);
        }

        /* SUBMIT BUTTON */
        .btn-submit {
          width: 100%;
          padding: 24px;
          background: linear-gradient(135deg, #DC2626, #EA580C);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 1.3em;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 12px 35px rgba(220, 38, 38, 0.4);
          position: relative;
          overflow: hidden;
        }

        .btn-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #EA580C, #DC2626);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .btn-submit:hover:not(:disabled)::before {
          opacity: 1;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 18px 45px rgba(220, 38, 38, 0.6);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-submit svg,
        .btn-submit span {
          position: relative;
          z-index: 1;
        }

        .btn-submit svg {
          width: 24px;
          height: 24px;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 350px;
          }

          .hero-content h1 {
            font-size: 3em;
          }

          .hero-content p {
            font-size: 1.2em;
          }

          .container {
            margin-top: -60px;
            padding-bottom: 60px;
          }

          .form-container {
            padding: 35px 25px;
          }

          .form-header h2 {
            font-size: 2.2em;
          }

          .time-buttons {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          }

          .people-selector {
            padding: 30px 20px;
            gap: 20px;
          }

          .people-btn {
            width: 60px;
            height: 60px;
          }

          .people-number {
            font-size: 3em;
          }

          .btn-submit {
            font-size: 1.15em;
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .hero-content h1 {
            font-size: 2.2em;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .form-header h2 {
            font-size: 1.8em;
          }

          .header-decoration {
            gap: 15px;
          }

          .deco-element {
            font-size: 2em;
          }

          .time-buttons {
            grid-template-columns: repeat(3, 1fr);
          }

          .time-btn {
            padding: 12px;
            font-size: 0.95em;
          }

          .people-display {
            min-width: 150px;
          }

          .people-number {
            font-size: 2.5em;
          }

          .people-text {
            font-size: 0.9em;
          }
        }
      `}</style>
    </>
  );
}