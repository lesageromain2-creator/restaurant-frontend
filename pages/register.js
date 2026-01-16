// frontend/pages/register.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { register, fetchSettings } from '../utils/api';

export default function Register() {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    loadSettings();
    setTimeout(() => setMounted(true), 100);
  }, []);

  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (error) {
      console.error('Erreur settings:', error);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return '#ef4444';
    if (passwordStrength < 60) return '#f59e0b';
    if (passwordStrength < 80) return '#3b82f6';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Faible';
    if (passwordStrength < 60) return 'Moyen';
    if (passwordStrength < 80) return 'Bon';
    return 'Excellent';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.firstname.trim()) {
      newErrors.push('Le prénom est requis');
    } else if (formData.firstname.trim().length < 2) {
      newErrors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (!formData.lastname.trim()) {
      newErrors.push('Le nom est requis');
    } else if (formData.lastname.trim().length < 2) {
      newErrors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!formData.email.trim()) {
      newErrors.push("L'email est requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("L'email n'est pas valide");
    }

    if (!formData.password) {
      newErrors.push('Le mot de passe est requis');
    } else if (formData.password.length < 6) {
      newErrors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Les mots de passe ne correspondent pas');
    }

    if (!acceptTerms) {
      newErrors.push('Vous devez accepter les conditions d\'utilisation');
    }

    return newErrors;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Tentative d\'inscription...');
      
      await register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Inscription réussie, redirection...');
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      setErrors([error.message || "Une erreur est survenue lors de l'inscription"]);
      setLoading(false);
      triggerShake();
    }
  };

  return (
    <>
      <Head>
        <title>Inscription - {settings.site_name || 'Restaurant'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <Header settings={settings} />

      <div className="register-page">
        <div className="register-background">
          <div className="bg-orb orb-1"></div>
          <div className="bg-orb orb-2"></div>
          <div className="bg-orb orb-3"></div>
          <div className="bg-grid"></div>
        </div>

        <div className={`register-container ${mounted ? 'mounted' : ''}`}>
          <div className={`register-card ${shake ? 'shake' : ''}`}>
            {/* Header */}
            <div className="card-header">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <h1>Rejoignez-nous</h1>
              <p>Créez votre compte en quelques secondes</p>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="alert-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-field">
                  <label htmlFor="firstname">Prénom</label>
                  <div className="input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Jean"
                      required
                      disabled={loading}
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label htmlFor="lastname">Nom</label>
                  <div className="input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Dupont"
                      required
                      disabled={loading}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="email">Adresse email</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean.dupont@email.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="password">Mot de passe</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          background: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                    <div className="strength-info">
                      <span style={{ color: getPasswordStrengthColor() }}>
                        {getPasswordStrengthText()}
                      </span>
                      {passwordStrength < 60 && (
                        <span className="hint">Ajoutez majuscules et chiffres</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="input-field">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className={`match-indicator ${formData.password === formData.confirmPassword ? 'success' : 'error'}`}>
                    {formData.password === formData.confirmPassword ? '✓ Correspond' : '✗ Ne correspond pas'}
                  </div>
                )}
              </div>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  J'accepte les{' '}
                  <Link href="/terms">conditions</Link>
                  {' '}et la{' '}
                  <Link href="/privacy">politique de confidentialité</Link>
                </span>
              </label>

              <button type="submit" className="submit-btn" disabled={loading || !acceptTerms}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>ou continuer avec</span>
            </div>

            <div className="social-buttons">
              <button className="social-btn google" type="button" disabled={loading}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>

              <button className="social-btn apple" type="button" disabled={loading}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            <div className="card-footer">
              <p>Vous avez déjà un compte ?</p>
              <Link href="/login" className="link-action">
                Se connecter
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Benefits Side Panel - Hidden on mobile */}
          <div className="benefits-panel">
            <div className="benefits-content">
              <div className="benefits-icon">
                🍽️
              </div>
              <h2>Pourquoi nous rejoindre ?</h2>
              <ul className="benefits-list">
                <li>
                  <span className="benefit-icon">⚡</span>
                  <span>Réservation instantanée</span>
                </li>
                <li>
                  <span className="benefit-icon">🎁</span>
                  <span>Offres exclusives membres</span>
                </li>
                <li>
                  <span className="benefit-icon">⭐</span>
                  <span>Programme de fidélité</span>
                </li>
                <li>
                  <span className="benefit-icon">🎉</span>
                  <span>Événements prioritaires</span>
                </li>
              </ul>
              <div className="stats">
                <div className="stat-item">
                  <div className="stat-value">10K+</div>
                  <div className="stat-label">Membres</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">4.9★</div>
                  <div className="stat-label">Note</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .register-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          top: -150px;
          left: -150px;
        }

        .orb-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          bottom: -100px;
          right: -100px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          top: 40%;
          left: 50%;
          animation-delay: 14s;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }

        .register-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .register-container.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .register-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          max-height: 90vh;
          overflow-y: auto;
        }

        .register-card::-webkit-scrollbar {
          width: 6px;
        }

        .register-card::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .register-card::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .register-card.shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .header-icon svg {
          width: 36px;
          height: 36px;
          color: white;
        }

        .card-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .card-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1rem;
        }

        .alert-error {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .alert-error svg {
          width: 20px;
          height: 20px;
          color: #ef4444;
          flex-shrink: 0;
        }

        .alert-error strong {
          display: block;
          color: white;
          margin-bottom: 0.25rem;
        }

        .alert-error ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .alert-error li {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          margin: 0.25rem 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .input-field {
          margin-bottom: 1rem;
        }

        .input-field label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper svg {
          position: absolute;
          left: 1rem;
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.5);
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .input-wrapper input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .input-wrapper input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.1);
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .input-wrapper input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .toggle-btn:hover:not(:disabled) {
          opacity: 1;
        }

        .toggle-btn:disabled {
          cursor: not-allowed;
        }

        .password-strength {
          margin-top: 0.75rem;
        }

        .strength-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .strength-fill {
          height: 100%;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .strength-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .strength-info span:first-child {
          font-weight: 600;
        }

        .hint {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }

        .match-indicator {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .match-indicator.success {
          color: #10b981;
        }

        .match-indicator.error {
          color: #ef4444;
        }

        .checkbox-field {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin: 1.5rem 0;
          cursor: pointer;
          position: relative;
        }

        .checkbox-field input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          margin-top: 2px;
        }

        .checkbox-field input[type="checkbox"]:checked + .checkmark {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
        }

        .checkbox-field input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .checkbox-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .checkbox-text a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .checkbox-text a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-btn svg {
          width: 20px;
          height: 20px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 1.5rem 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(255, 255, 255, 0.12);
        }

        .divider span {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          padding: 0 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .social-btn {
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          transition: all 0.3s ease;
        }

        .social-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .card-footer p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .link-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .link-action:hover {
          color: #764ba2;
          gap: 0.75rem;
        }

        .link-action svg {
          width: 16px;
          height: 16px;
        }

        .benefits-panel {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 24px;
          padding: 2.5rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .benefits-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }

        .benefits-content {
          position: relative;
          z-index: 1;
        }

        .benefits-icon {
          font-size: 4rem;
          text-align: center;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
        }

        .benefits-content h2 {
          font-size: 1.75rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
        }

        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .benefit-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(180deg, #fff, rgba(255,255,255,0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 600;
        }

        /* ============================================
           RESPONSIVE DESIGN
           ============================================ */

        /* Tablets */
        @media (max-width: 1024px) {
          .register-container {
            grid-template-columns: 1fr;
            max-width: 600px;
          }

          .benefits-panel {
            display: none;
          }
        }

        /* Mobile Large */
        @media (max-width: 768px) {
          .register-page {
            padding: 1rem 0.75rem;
          }

          .register-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .card-header h1 {
            font-size: 1.75rem;
          }

          .header-icon {
            width: 60px;
            height: 60px;
          }

          .header-icon svg {
            width: 30px;
            height: 30px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .social-buttons {
            grid-template-columns: 1fr;
          }

          .input-wrapper input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }

        /* Mobile Small */
        @media (max-width: 480px) {
          .register-card {
            padding: 1.5rem 1.25rem;
          }

          .card-header {
            margin-bottom: 1.5rem;
          }

          .card-header h1 {
            font-size: 1.5rem;
          }

          .card-header p {
            font-size: 0.9rem;
          }

          .header-icon {
            width: 50px;
            height: 50px;
            margin-bottom: 1rem;
          }

          .input-field {
            margin-bottom: 0.875rem;
          }

          .input-wrapper input {
            padding: 0.75rem 0.875rem 0.75rem 2.75rem;
          }

          .submit-btn {
            padding: 0.875rem;
          }

          .checkbox-text {
            font-size: 0.85rem;
          }
        }

        /* Touch devices optimizations */
        @media (hover: none) and (pointer: coarse) {
          .submit-btn:active:not(:disabled) {
            transform: scale(0.98);
          }

          .social-btn:active:not(:disabled) {
            transform: scale(0.98);
          }

          .link-action:active {
            opacity: 0.7;
          }
        }

        /* Landscape mobile fix */
        @media (max-height: 600px) and (orientation: landscape) {
          .register-card {
            max-height: none;
            margin: 1rem 0;
          }

          .card-header {
            margin-bottom: 1rem;
          }

          .benefits-panel {
            display: none;
          }
        }
      `}</style>
    </>
  );
}