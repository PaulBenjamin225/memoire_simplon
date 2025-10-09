import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Head from 'next/head'; // Importer le composant Head

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* Ce bloc s'appliquera à toutes les pages de l'application */}
      <Head>
        <title>TaskFlow - Gestionnaire de Tâches</title>
        
        {/* --- DÉBUT DU CODE FAVICON --- */}
        {/* Code copié de RealFaviconGenerator et adapté pour JSX */}
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
        {/* --- FIN DU CODE FAVICON --- */}
      </Head>
      
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;