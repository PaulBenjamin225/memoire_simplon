import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

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
                focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-all duration-300"
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
          fill // 'layout="fill"' devient simplement 'fill'
          style={{ objectFit: 'cover' }} // 'objectFit' va dans une prop 'style'
          sizes="(max-width: 768px) 100vw, 50vw" // Aide Next.js à optimiser l'image
          />
        </div>
      </div>
    </div>
  );
}