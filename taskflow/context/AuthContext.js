import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
// CORRECTION 1: Changer l'importation
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // CORRECTION 2: Utiliser jwtDecode (camelCase)
        const decoded = jwtDecode(token);
        // Vérifier si le token n'est pas expiré
        if (Date.now() >= decoded.exp * 1000) {
            console.log("Token is expired, removing.");
            localStorage.removeItem('token');
        } else {
            setUser({ ...decoded });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      
      // CORRECTION 3: Utiliser jwtDecode (camelCase)
      const decoded = jwtDecode(token);
      setUser({ ...decoded });

      // Redirection en fonction du rôle
      if (decoded.role === 'MANAGER') {
        router.push('/manager/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error.response) {
        console.error('Login failed with server response:', error.response.data);
        alert(error.response.data.message || "Échec de la connexion.");
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert("Le serveur ne répond pas. Vérifiez que le serveur de développement est bien lancé (npm run dev).");
      } else {
        console.error('Error setting up request:', error.message);
        alert("Une erreur inattendue est survenue lors de la tentative de connexion.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;