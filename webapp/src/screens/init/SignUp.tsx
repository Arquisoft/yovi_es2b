import React, { useState } from 'react';
import Home from "../game/Home.tsx";
import InitialScreen from './InitialScreen';
import "./SignUp.css";
import yoviLogo from "../../../public/yovi_logo.png";

const SignUp: React.FC = () => {

      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [responseMessage, setResponseMessage] = useState<string | null>(null);
      const [signed, setSigned] = useState(false);
      const [toLog, setToLog] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setResponseMessage(null);
        setError(null);
    
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
            const res = await fetch(`${API_URL}/createuser`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                setResponseMessage(data.message);
                setPassword('');
                setSigned(true);
            } else {
                setError(data.error || 'Server error');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    if (signed) {
        return (<Home username={username}/>);
    }
    if (toLog) {
        return (<InitialScreen/>);
    }

    return (
        <div className="signup-screen">
            <img src={yoviLogo} alt="YOVI Logo" className="signup-screen__logo" />
            <h1>Bienvenido, regístrate aquí</h1>
            
            <form onSubmit={handleLogin} className="signup-form">
                <h1>Crea tu usuario y contraseña para registrárte en Yovi.</h1>
                <div className="form-group">
                    <label htmlFor="username">Usuario</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input"/>
                    
                    <label htmlFor="password">Contraseña</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input"/>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Creando usuario...' : 'Crear usuario'}
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

            <div className="goBack">
                <h2>¿Ya tienes usuario? Inicia sesión.</h2>
                <button onClick={() => setToLog(true)}>
                    Atrás
                </button>
            </div>         
        </div>
    );
}

export default SignUp;