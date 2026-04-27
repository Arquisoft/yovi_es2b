import React, { useState } from 'react';
import Home from "../game/Home.tsx";
import SignUp from "../init/SignUp.tsx";
import PasswordToggleButton from "../../components/password/PasswordToggleButton.tsx";
import "./InitialScreen.css";
import yoviLogo from "../../../public/yovi_logo.png";

const InitialScreen: React.FC = () => {

  const [username, setUsername] = useState(() => localStorage.getItem('yovi-username') ?? '');  
  // useState tiene una funcion para que se guarde el inicio de sesion aunque se recargue la pagina, guardando el usuario en el localStorage del navegador, y recuperandolo al cargar el componente (carga perezosa)
 
  //useState define una funcion que recupera el usuario guardado en localStorage si este existe o devuelve una cadena vacía si no hay ningún usuario guardado.
  const [logged, setLogged] = useState(() => Boolean(localStorage.getItem('yovi-username')));

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
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
        // Guardar el usuario en localStorage para mantener la sesión iniciada incluso después de recargar la página. LocalStorage es un almacenamiento web de TypeScript.
        localStorage.setItem('yovi-username', username);
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
            <PasswordToggleButton
              showPassword={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
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
