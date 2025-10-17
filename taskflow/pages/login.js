// useState : pour gérer les champs du formulaire (email, mot de passe)
// useContext : pour accéder aux fonctions globales du contexte d’authentification
import { useState, useContext } from 'react';
// Importation du contexte d’authentification (permet d’utiliser la fonction login)
import AuthContext from '../context/AuthContext';
// Importation du composant Image de Next.js pour des images optimisées
import Image from 'next/image';
// Importation du composant Link de Next.js pour les liens internes
import Link from 'next/link';
// Importation d’icônes Heroicons pour embellir le formulaire
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// --- COMPOSANT PRINCIPAL : Page de connexion ---
export default function LoginPage() {
  // États pour stocker la saisie de l'utilisateur
  const [email, setEmail] = useState(''); // Contient l’adresse email saisie
  const [password, setPassword] = useState(''); // Contient le mot de passe saisi
  // Récupération de la fonction "login" depuis le contexte AuthContext
  const { login } = useContext(AuthContext);

  // Fonction déclenchée lors de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    login(email, password); // Appelle la fonction de connexion avec les infos saisies
  };

  // --- STRUCTURE VISUELLE DE LA PAGE ---
  return (
    // L'arrière-plan est maintenant un dégradé, plus une image.
    <div className="min-h-screen w-full flex items-center justify-center p-4 
    bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      
      <div className="w-full max-w-md md:max-w-4xl rounded-2xl shadow-2xl 
      overflow-hidden md:grid md:grid-cols-2">
        
        {/* --- Partie Gauche : Formulaire --- */}
        <div className="p-8 md:p-12 bg-slate-800 text-white">
          <div className="mb-8 text-center">
            <Image 
              src="/taskflow_logo.png" 
              alt="TaskFlow Logo" 
              width={150} 
              height={150}
              className="mx-auto rounded-full" 
            />
            <h1 className="mt-4 text-3xl font-bold">Bienvenue !</h1>
            <p className="text-slate-300">Simplifier, organiser, réussir.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 
                rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                placeholder="Email" autoComplete="email"
              />
            </div>
            <div className="relative">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                placeholder="Password" autoComplete="current-password"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 
                hover:to-blue-700 text-white font-bold text-lg rounded-lg shadow-lg focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-all duration-300 cursor-pointer hover:scale-105"
              >
                Se connecter
              </button>
            </div>
          </form>
        </div>

        {/* --- Partie Droite : L'Image --- */}
        <div className="hidden md:block relative">
          <Image
          src="/taskflow_connexion.jpg"
          alt="Workspace background"
          fill // l’image remplit entièrement son conteneur
          style={{ objectFit: 'cover' }} // l’image couvre tout le conteneur sans se déformer
          sizes="(max-width: 768px) 100vw, 50vw" // Aide Next.js à optimiser l'image en préchargeant la bonne version de l’image
          />
        </div>
      </div>
    </div>
  );
}