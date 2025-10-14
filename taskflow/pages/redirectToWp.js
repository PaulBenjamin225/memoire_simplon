import { useEffect, useState } from 'react'; // Importation des hooks React : useEffect (pour exécuter du code après le rendu) et useState (pour gérer un état local)
import axios from 'axios'; // Importation de la bibliothèque Axios pour faire des requêtes HTTP
import { useRouter } from 'next/router'; // Importation du hook useRouter de Next.js pour accéder à la navigation et aux paramètres d’URL

// Récupérer l'URL de WordPress depuis les variables d'environnement
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WP_URL;

// Composant principal de la page de redirection
export default function RedirectToWp() {
  const router = useRouter(); // Permet d'accéder aux informations de la route (ex : paramètres d'URL)
  const [message, setMessage] = useState("Préparation de la connexion sécurisée..."); // État local pour afficher un message à l’utilisateur

  // useEffect s’exécute au chargement du composant
  useEffect(() => {
    // Fonction asynchrone pour générer le token WordPress et rediriger l’utilisateur
    async function generateAndRedirect() {
      const taskflowToken = localStorage.getItem('token'); // Récupération du token TaskFlow stocké dans le navigateur (localStorage)
      const destination = router.query.destination || '/'; // Si une destination est passée dans l’URL, on la récupère, sinon on met "/"

      // Si aucun token TaskFlow n’est trouvé, on redirige directement vers la page de login WordPress
      if (!taskflowToken) {
        setMessage("Redirection...");
        // Redirige vers la page de connexion de WordPress
        window.location.href = `${WORDPRESS_URL}/wp-login.php`;
        return;
      }
      
      try {
        // Appelle notre API pour générer un token spécial pour WordPress
        const response = await axios.get('/api/auth/generate-wp-token'); // L'URL de l'API reste relative
        
        const { wpToken } = response.data; // On extrait le token WordPress de la réponse

        // Redirige vers WordPress avec le token spécial
        const finalUrl = `${WORDPRESS_URL}${destination}?jwt=${wpToken}`;
        window.location.href = finalUrl; // Redirection vers WordPress avec le token inclus dans l’URL

      } catch (error) {
        // Si la génération du token échoue, on affiche une erreur dans la console
        console.error("Échec de la génération du jeton WordPress:", error);
        setMessage("Connexion...");
        // Redirection vers WordPress après un court délai
        setTimeout(() => {
          window.location.href = WORDPRESS_URL;
        }, 2000);
      }
    }
    
    // On exécute la fonction seulement quand le routeur est prêt
    if (router.isReady) {
      generateAndRedirect();
    }
  }, [router.isReady, router.query]);

  return <div style={{ padding: '2rem', textAlign: 'center' }}>{message}</div>;
}