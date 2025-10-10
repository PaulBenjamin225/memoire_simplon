import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Récupérer l'URL de WordPress depuis les variables d'environnement
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WP_URL;

export default function RedirectToWp() {
  const router = useRouter();
  const [message, setMessage] = useState("Préparation de la connexion sécurisée...");

  useEffect(() => {
    async function generateAndRedirect() {
      const taskflowToken = localStorage.getItem('token');
      const destination = router.query.destination || '/';

      if (!taskflowToken) {
        setMessage("Redirection...");
        // Redirige vers la page de connexion de WordPress
        window.location.href = `${WORDPRESS_URL}/wp-login.php`;
        return;
      }
      
      try {
        // Appelle notre API pour générer un token spécial pour WordPress
        const response = await axios.get('/api/auth/generate-wp-token'); // L'URL de l'API reste relative
        
        const { wpToken } = response.data;

        // Redirige vers WordPress avec le token spécial
        const finalUrl = `${WORDPRESS_URL}${destination}?jwt=${wpToken}`;
        window.location.href = finalUrl;

      } catch (error) {
        console.error("Failed to generate WordPress token:", error);
        setMessage("Échec de la connexion automatique. Veuillez réessayer.");
        // En cas d'échec, on redirige quand même vers WordPress
        setTimeout(() => {
          window.location.href = WORDPRESS_URL;
        }, 2000);
      }
    }
    
    if (router.isReady) {
      generateAndRedirect();
    }
  }, [router.isReady, router.query]);

  return <div style={{ padding: '2rem', textAlign: 'center' }}>{message}</div>;
}