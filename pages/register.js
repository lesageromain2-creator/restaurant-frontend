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
    setTimeout(() => setMounted(true), 50);
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
      await register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password
      });

      router.push('/dashboard');
    } catch (error) {
      setErrors([error.message || "Une erreur est survenue lors de l'inscription"]);
      setLoading(false);
      triggerShake();
    }
  };

  return (
    <>
      <Head>
        <title>Inscription - {settings.site_name || 'Restaurant'}</title>
      </Head>

      <Header settings={settings} />

      <div className="auth-page">
        {/* Background effects */}
        <div className="bg-effects">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className={`auth-container ${mounted ? 'mounted' : ''}`}>
          <div className={`auth-card ${shake ? 'shake' : ''}`}>
            {/* Header */}
            <div className="auth-header">
              <div className="auth-icon-wrapper">
                <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <h1>Créer un compte</h1>
              <p>Rejoignez-nous pour une expérience unique</p>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="error-box">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <strong>Erreur de validation</strong>
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
                <div className="form-group">
                  <label htmlFor="firstname">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Prénom
                  </label>
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

                <div className="form-group">
                  <label htmlFor="lastname">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Nom
                  </label>
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

              <div className="form-group">
                <label htmlFor="email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Adresse email
                </label>
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

              <div className="form-group">
                <label htmlFor="password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Mot de passe
                </label>
                <div className="password-input">
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
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label="Afficher/Masquer le mot de passe"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          background: getPasswordStrengthColor(),
                          transition: 'all 0.3s ease'
                        }}
                      ></div>
                    </div>
                    <div className="strength-info">
                      <span style={{ color: getPasswordStrengthColor(), fontWeight: 600 }}>
                        {getPasswordStrengthText()}
                      </span>
                      <span className="strength-tips">
                        {passwordStrength < 60 && 'Ajoutez majuscules, chiffres et caractères spéciaux'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Confirmer le mot de passe
                </label>
                <div className="password-input">
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
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    aria-label="Afficher/Masquer le mot de passe"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showConfirmPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="password-match-error">
                    ✗ Les mots de passe ne correspondent pas
                  </div>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="password-match-success">
                    ✓ Les mots de passe correspondent
                  </div>
                )}
              </div>

              <div className="terms-checkbox">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-text">
                    J'accepte les{' '}
                    <Link href="/terms" target="_blank">conditions d'utilisation</Link>
                    {' '}et la{' '}
                    <Link href="/privacy" target="_blank">politique de confidentialité</Link>
                  </span>
                </label>
              </div>

              <button type="submit" className="btn-submit" disabled={loading || !acceptTerms}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Création du compte...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Créer mon compte
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>ou s'inscrire avec</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button className="social-btn google" type="button" disabled={loading}>
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button className="social-btn apple" type="button" disabled={loading}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* Footer */}
            <div className="auth-footer">
              <p>Vous avez déjà un compte ?</p>
              <Link href="/login" className="login-link">
                Se connecter
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Side Info */}
          <div className="auth-side">
            <div className="side-content">
              <div className="side-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h2>Pourquoi nous rejoindre ?</h2>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Réservation instantanée et garantie</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Offres exclusives membres</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Programme de fidélité avantageux</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Accès prioritaire aux événements</span>
                </li>
              </ul>
              <div className="side-stats">
                <div className="stat">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Membres actifs</div>
                </div>
                <div className="stat">
                  <div className="stat-number">4.9</div>
                  <div className="stat-label">Note moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: #0a0a1e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          top: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          bottom: -150px;
          right: -150px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          top: 50%;
          left: 50%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }

        .auth-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .auth-container.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 50px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease;
          max-height: 90vh;
          overflow-y: auto;
        }

        .auth-card::-webkit-scrollbar {
          width: 8px;
        }

        .auth-card::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .auth-card::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .auth-card.shake {
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .auth-icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 25px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          animation: float 6s ease-in-out infinite;
        }

        .auth-icon {
          width: 40px;
          height: 40px;
          stroke: white;
        }

        .auth-header h1 {
          font-size: 2.5em;
          color: white;
          margin-bottom: 10px;
          font-weight: 800;
        }

        .auth-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1em;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 25px;
          animation: slideDown 0.4s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .error-icon svg {
          stroke: #ef4444;
        }

        .error-box strong {
          display: block;
          color: white;
          font-size: 1.05em;
          margin-bottom: 5px;
        }

        .error-box ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .error-box li {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 500;
          margin-bottom: 5px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 1.05em;
        }

        .form-group label svg {
          width: 20px;
          height: 20px;
        }

        .form-group input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 1.05em;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-family: inherit;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-input {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 5px;
          transition: all 0.3s ease;
        }

        .toggle-password:hover {
          color: white;
        }

        .toggle-password svg {
          width: 22px;
          height: 22px;
        }

        .toggle-password:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-strength {
          margin-top: 12px;
        }

        .strength-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
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
          font-size: 0.9em;
        }

        .strength-tips {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85em;
        }

        .password-match-error {
          margin-top: 8px;
          color: #ef4444;
          font-size: 0.9em;
          font-weight: 600;
        }

        .password-match-success {
          margin-top: 8px;
          color: #10b981;
          font-size: 0.9em;
          font-weight: 600;
        }

        .terms-checkbox {
          margin: 25px 0;
        }

        .terms-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95em;
          line-height: 1.6;
        }

        .terms-label input[type="checkbox"] {
          display: none;
        }

        .checkbox-custom {
          width: 22px;
          height: 22px;
          min-width: 22px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          margin-top: 2px;
        }

        .terms-label input[type="checkbox"]:checked + .checkbox-custom {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: #667eea;
        }

        .terms-label input[type="checkbox"]:checked + .checkbox-custom::after {
          content: '✓';
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .terms-text a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .terms-text a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .btn-submit {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.15em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          position: relative;
          overflow: hidden;
          margin-top: 10px;
        }

        .btn-submit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-submit:hover:not(:disabled)::before {
          width: 400px;
          height: 400px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-submit svg {
          width: 22px;
          height: 22px;
          position: relative;
          z-index: 1;
        }

        .btn-submit span:not(.spinner) {
          position: relative;
          z-index: 1;
        }

        .spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255, 255, 255, 0.3);
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
          margin: 30px 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider span {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          padding: 0 20px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9em;
        }

        .social-login {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }

        .social-btn {
          padding: 14px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
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

        .social-btn svg {
          width: 20px;
          height: 20px;
        }

        .auth-footer {
          text-align: center;
          padding-top: 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-footer p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 15px;
        }

        .login-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.05em;
          transition: all 0.3s ease;
        }

        .login-link:hover {
          color: #764ba2;
          gap: 12px;
        }

        .login-link svg {
          width: 18px;
          height: 18px;
        }

        .auth-side {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 30px;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-side::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.05)"/></svg>');
          background-size: 100px 100px;
          opacity: 0.3;
        }

        .side-content {
          position: relative;
          z-index: 1;
          color: white;
        }

        .side-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 6s ease-in-out infinite;
        }

        .side-icon svg {
          width: 40px;
          height: 40px;
        }

        .side-content h2 {
          font-size: 2.2em;
          margin-bottom: 30px;
          font-weight: 800;
          text-align: center;
        }

        .side-content ul {
          list-style: none;
          padding: 0;
          margin: 0 0 40px 0;
        }

        .side-content li {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          font-size: 1.1em;
          font-weight: 500;
        }

        .side-content li svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .side-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-top: 40px;
          padding-top: 40px;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-size: 3em;
          font-weight: 900;
          margin-bottom: 8px;
          background: linear-gradient(180deg, #fff, rgba(255,255,255,0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.95em;
          opacity: 0.9;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .auth-container {
            grid-template-columns: 1fr;
          }

          .auth-side {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .auth-page {
            padding: 20px 15px;
          }

          .auth-card {
            padding: 35px 25px;
          }

          .auth-header h1 {
            font-size: 2em;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .social-login {
            grid-template-columns: 1fr;
          }
        }


        
      `}</style>
    </>
  );
}