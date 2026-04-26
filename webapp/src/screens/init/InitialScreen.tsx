import React, { useState } from 'react';
import Home from "../game/Home.tsx";
import SignUp from "../init/SignUp.tsx";
import PasswordToggleButton from "../../components/password/PasswordToggleButton.tsx";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";
import "./InitialScreen.css";
import yoviLogo from "../../../public/yovi_logo.png";

const InitialScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);
  const [toSigned, setToSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t, locale, setLocale } = useLanguageContext();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponseMessage(null);
    setError(null);

    if (!username.trim()) {
      setError(t('initial.errorUsername'));
      return;
    }
    if (!password.trim()) {
      setError(t('initial.errorPassword'));
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
      const res = await fetch(`${API_URL}/loginuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        setResponseMessage(data.message);
        setPassword('');
        setLogged(true);
      } else {
        setError(data.error || t('initial.serverError'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('initial.networkError'));
    } finally {
      setLoading(false);
    }
  };

  if (logged) {
    return (<Home username={username}/>);
  }
  if (toSigned) {
    return (<SignUp/>);
  }

  return (
    <div className="initial-screen">
      <img src={yoviLogo} alt={t('initial.logoAlt')} className="initial-screen__logo" />
      <h1>{t('initial.welcome')}</h1>

      <form onSubmit={handleSubmit} className="register-form">
        <h1>{t('initial.subtitle')}</h1>
        <div className="form-group">
          <label htmlFor="username">{t('initial.usernameLabel')}</label>
          <input
            type="text" id="username" value={username}
            onChange={(e) => setUsername(e.target.value)} className="form-input"/>
          <label htmlFor="password">{t('initial.passwordLabel')}</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input password-field__input"
            />
            <PasswordToggleButton
              showPassword={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          </div>
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? t('initial.loadingButton') : t('initial.loginButton')}
        </button>

        {responseMessage && (
          <div className="success-message" style={{ marginTop: 12, color: 'green' }}>
            {responseMessage}
          </div>
        )}
        {error && (
          <div className="error-message" style={{ marginTop: 12, color: 'red' }}>
            {error}
          </div>
        )}
      </form>

      <div className="signup">
        <h2>{t('initial.signupPrompt')}</h2>
        <button onClick={() => setToSigned(true)}>
          {t('initial.signupButton')}
        </button>
      </div>

      <div className="language-select">
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <label htmlFor="language-select">{t('common.language')}:</label>
        <select id="language-select" value={locale} onChange={(event) => setLocale(event.target.value as "es" | "en")}>
          <option value="es">{t('common.spanish')}</option>
          <option value="en">{t('common.english')}</option>
        </select>
      </div>

    </div>
    
  );
};

export default InitialScreen;
