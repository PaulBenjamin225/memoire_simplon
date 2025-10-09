import { useContext, useEffect } from 'react'; // Importation des hooks React
import { useRouter } from 'next/router'; // Importation du hook de navigation Next.js
import AuthContext from '../context/AuthContext'; // Importation du contexte d'authentification

// Définition du composant PrivateRoute
// Il protège une route et vérifie si l'utilisateur est connecté et autorisé
const PrivateRoute = ({ children, allowedRoles }) => {
  // Récupération des infos utilisateur et de l'état de chargement depuis le contexte Auth
  const { user, loading } = useContext(AuthContext);

  // Initialisation du router pour redirections
  const router = useRouter();

  // useEffect : s'exécute à chaque fois que "user", "loading", "router" ou "allowedRoles" change
  useEffect(() => {
    if (loading) {
      return; // Si le chargement est en cours, ne rien faire pour l'instant
    }

    // Si aucun utilisateur n'est connecté, rediriger vers la page de login
    if (!user) {
      router.push('/login');
      return;
    }

    // Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle On redirige vers la page de connexion
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/login');
    }

  }, [user, loading, router, allowedRoles]);

  // Affichage pendant la vérification de l'utilisateur
  if (loading || !user) {
    return <div>Chargement...</div>; // Message temporaire pendant le chargement
  }
  
  // Vérification finale des rôles pour afficher un message si accès non autorisé
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Accès non autorisé...</div>;
  }

  // Si tout est ok (utilisateur connecté et autorisé), afficher les composants enfants
  return <>{children}</>;
};

// Export du composant PrivateRoute pour l'utiliser dans d'autres pages
export default PrivateRoute;
