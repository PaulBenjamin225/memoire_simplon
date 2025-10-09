import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Cette page est une passerelle invisible.
// Elle reçoit une URL de destination et y redirige l'utilisateur
// en ajoutant le token d'authentification.
export default function RedirectToWp() {
  const router = useRouter();

  useEffect(() => {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');
    
    // Récupérer l'URL de destination depuis les paramètres de la requête
    // Ex: /redirectToWp?destination=/wp-admin/post-new.php
    const destination = router.query.destination || '/';
    
    if (token) {
      // Si on a un token, on redirige vers WordPress avec le token dans l'URL
      const wordpressUrl = `http://localhost:8080${destination}?jwt=${token}`;
      window.location.href = wordpressUrl;
    } else {
      // Si pas de token, on redirige simplement vers la page de connexion de WordPress
      const wordpressLoginUrl = `http://localhost:8080/wp-login.php`;
      window.location.href = wordpressLoginUrl;
    }
  }, [router.query]);

  // Affiche un message de chargement pendant la redirection
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Redirection vers TaskFlow Hub...
    </div>
  );
}