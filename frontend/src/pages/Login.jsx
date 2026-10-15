import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      // ✅ URL avec double /api/api/ (comme votre configuration Django)
      const response = await axios.post(
        'http://127.0.0.1:8000/api/api/users/login/', 
        formData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin({ ...user, token });
      navigate('/dashboard');  // ✅ Redirection vers /dashboard (qui affiche LayoutDashboard)

    } catch (err) {
      console.error('Erreur de connexion:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Nom d\'utilisateur ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion au serveur. Vérifiez que le serveur Django est bien démarré.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">🏥</div>
          <h1>Clinique Médicale</h1>
          <p>Connectez-vous à votre espace</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username} 
              onChange={handleChange}
              placeholder="Entrez votre nom d'utilisateur"
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe"
              disabled={loading}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '65%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#555'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="login-footer"></div>
      </div>
    </div>
  );
};

export default Login;