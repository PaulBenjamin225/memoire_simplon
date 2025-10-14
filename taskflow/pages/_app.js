import { AuthProvider } from '../context/AuthContext'; // Fournit le contexte d'authentification pour toute l'application
import '../styles/globals.css'; // Import du fichier CSS global de l'application (styles appliqués à toutes les pages)
import Head from 'next/head'; // Composant Next.js permettant de définir les métadonnées de la page (title, favicon, etc.)

// Composant principal de l'application Next.js
function MyApp({ Component, pageProps }) {
  return (
    // AuthProvider englobe toute l'application pour fournir le contexte d'utilisateur connecté
    <AuthProvider>
      {/* Head définit le titre et les icônes de l'application dans le navigateur */}
      <Head>
        <title>TaskFlow - Gestionnaire de Tâches</title>
        
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
      </Head>

      {/* Head définit le titre et les icônes de l'application dans le navigateur */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

// Export par défaut de l'application pour Next.js
export default MyApp;