import { createContext, useState, useEffect } from 'react'; // import de createContext pour créer un contexte React pour partager les données d’authentification à tous les composants sans passer par les props, useState pour gérer l'état, useEffect pour exécuter du code après le rendu
import axios from 'axios'; // import de Axios pour faire des requêtes HTTP vers l'API backend
import { useRouter } from 'next/router'; // useRouter de Next.js pour gérer les redirections côté client
import { jwtDecode } from 'jwt-decode';  // jwtDecode pour décoder le token JWT et lire les informations de l'utilisateur sans faire de requête au serveur

// Création du contexte d'authentification
const AuthContext = createContext();

// Fournisseur AuthProvider pour envelopper l'application et partager les données d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stocke les infos de l’utilisateur connecté (null si personne n’est connecté)
  const [loading, setLoading] = useState(true); // Indique si l'état d'authentification est en cours de chargement
  const router = useRouter(); // Hook pour rediriger l’utilisateur après login/logout

  // Vérification automatique du token JWT au chargement
  useEffect(() => {
    const token = localStorage.getItem('token'); // Récupère le token stocké localement
    if (token) {
      try {
        const decoded = jwtDecode(token); // Décode le token pour obtenir les infos utilisateur
        if (Date.now() >= decoded.exp * 1000) { // Vérifier si le token n'est pas expiré
            console.log("Token est expiré, suppression."); 
            localStorage.removeItem('token'); // Supprime le token expiré
        } else {
            setUser({ ...decoded }); // Si valide, on restaure l'utilisateur
        }
      } catch (error) {
        console.error("Invalid token:", error); // Token corrompu
        localStorage.removeItem('token'); // Supprime le token invalide
      }
    }
    setLoading(false); // Fin de la vérification initiale
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password }); // Axios envoie une requête HTTP POST à l'API avec l’email et le mot de passe.
      const { token } = res.data; // On récupère le token JWT depuis la réponse du serveur
      localStorage.setItem('token', token); // Sauvegarde du token côté client
      const decoded = jwtDecode(token); // Décode le token pour obtenir les infos utilisateur
      setUser({ ...decoded }); // Met à jour l'état utilisateur avec les infos décodées

      // Redirection en fonction du rôle
      if (decoded.role === 'MANAGER') { // Si le rôle est MANAGER, redirige vers le tableau de bord manager
        router.push('/manager/dashboard'); 
      } else {
        router.push('/dashboard'); // Sinon, redirige vers le tableau de bord standard corespondant au tableau de bord des employes
      }
    } catch (error) {
      // Gestion détaillée des erreurs selon leur origine
      if (error.response) {
        console.error('La connexion a échoué avec la réponse du serveur:', error.response.data);
        alert(error.response.data.message || "Échec de la connexion."); 
      } else if (error.request) {
        console.error('Aucune réponse reçue:', error.request);
        alert("Le serveur ne répond pas. Vérifiez que le serveur de développement est bien lancé (npm run dev).");
      } else {
        console.error('Error setting up request:', error.message);
        alert("Une erreur inattendue est survenue lors de la tentative de connexion.");
      }
    }
  };

  // Déconnexion
  const logout = () => { // Fonction pour se déconnecter
    localStorage.removeItem('token'); // Supprime le token
    setUser(null); // Réinitialise l'état utilisateur
    router.push('/login'); // Redirige vers la page de connexion
  };

  // Fournit les données et fonctions d'authentification à l'ensemble de l'application
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;