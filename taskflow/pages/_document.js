// Import des composants nécessaires pour personnaliser le document HTML dans Next.js
import { Html, Head, Main, NextScript } from "next/document"; 

// Composant personnalisé pour le document HTML de l'application
export default function Document() {
  return (
    <Html lang="FR">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
