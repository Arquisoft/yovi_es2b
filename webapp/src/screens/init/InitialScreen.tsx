import React, { useState } from 'react';
import Home from "../game/Home.tsx";
import SignUp from "../init/SignUp.tsx";
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponseMessage(null);
    setError(null);

    if (!username.trim()) {
      setError('Escriba el usuario.');
      return;
    }
    if (!password.trim()) {
      setError('Escriba la contraseña.');
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
        setError(data.error || 'Server error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
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
      <img src={yoviLogo} alt="YOVI Logo" className="initial-screen__logo" />
      <h1>Bienvenido de nuevo, inicia sesión aquí</h1>

      <form onSubmit={handleSubmit} className="register-form">
        <h1>Escriba su usuario y contraseña para iniciar sesión.</h1>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text" id="username" value={username}
            onChange={(e) => setUsername(e.target.value)} className="form-input"/>
          <label htmlFor="password">Contraseña</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input password-field__input"
            />
            <button
              type="button"
              className="password-field__toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            />
          </div>
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Cargando usuario...' : 'Iniciar sesión'}
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
        <h2>¿No tienes usuario? Haz click aquí para crear uno.</h2>
        <button onClick={() => setToSigned(true)}>
          Regístrate
        </button>
      </div>
    </div>
    
  );
};

export default InitialScreen;
