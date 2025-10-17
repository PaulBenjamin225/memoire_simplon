import Link from 'next/link'; // Permet de créer des liens internes entre les pages sans rechargement complet (spécifique à Next.js)
import Image from 'next/image'; // Permet d'afficher des images optimisées (chargement adaptatif et responsive)

// Importation d’icônes provenant de la librairie Heroicons (version outline)
import { 
  ArrowRightIcon,          // Flèche utilisée dans les boutons d'action
  Bars3Icon,               // Icône "menu burger" pour ouvrir le menu mobile
  XMarkIcon,               // Icône de fermeture du menu mobile
  ListBulletIcon,          // Icône représentant des listes de tâches
  ChartBarIcon,            // Icône pour illustrer les statistiques ou graphiques
  UsersIcon,               // Icône pour la gestion des utilisateurs
  BellIcon,                // Icône pour les notifications
  ChatBubbleBottomCenterTextIcon, // Icône pour la messagerie ou les commentaires
  DevicePhoneMobileIcon,   // Icône pour symboliser l’accès mobile
  EnvelopeIcon             // Icône d’enveloppe utilisée dans la section contact
} from '@heroicons/react/24/outline';

// Importation du hook useState de React
// Il permet de gérer l’état local du composant (l’ouverture ou fermeture du menu mobile)
import { useState } from 'react';

// --- COMPOSANT PRINCIPAL DE LA PAGE D’ACCUEIL ---
export default function HomePage() {
  // État local pour savoir si le menu mobile est ouvert ou fermé
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* --- En-tête (Header) --- */}
      <header className="fixed w-full top-0 left-0 bg-slate-900/80 backdrop-blur-sm z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/taskflow_logo.png" 
            alt="TaskFlow Logo" 
            width={90} 
            height={90}
            className="mx-auto rounded-full" 
            />
          </Link>

          {/* Menu pour grands écrans */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="hover:text-cyan-400 transition-colors cursor-pointer hover:scale-105">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-cyan-400 transition-colors cursor-pointer hover:scale-105">Tarifs</Link>
            <Link href="#contact" className="hover:text-cyan-400 transition-colors cursor-pointer hover:scale-105">Contact</Link>
            <Link href="/login" className="hover:text-cyan-400 transition-colors cursor-pointer hover:scale-105">Se connecter</Link>
          </div>

          {/* Bouton du menu mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
            </button>
          </div>
        </nav>

        {/* Menu mobile dépliant */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 flex flex-col items-center space-y-4 py-4">
            <Link href="#features" className="hover:text-cyan-400 cursor-pointer hover:scale-105">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-cyan-400 cursor-pointer hover:scale-105">Tarifs</Link>
            <Link href="#contact" className="hover:text-cyan-400 cursor-pointer hover:scale-105">Contact</Link>
            <Link href="/login" className="hover:text-cyan-400 pt-4 border-t 
            border-slate-700 w-full text-center cursor-pointer hover:scale-105">Se connecter</Link>
          </div>
        )}
      </header>

      {/* --- Section Héros (Hero Section) --- */}
      <main className="pt-32 pb-16">
        <section className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Organisez votre travail. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Simplifiez votre vie.
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            <span className="text-3xl font-bold">
              <span className="text-[#00B0FF]">Task</span><span className="text-[#8BC34A]">Flow</span>
            </span> est la solution tout-en-un pour la gestion de tâches d'équipe. Assignez, suivez et complétez vos projets avec une efficacité redoutable.
          </p>
          <div className="mt-10 flex justify-center items-center space-x-4">
            <Link href="/login" className="bg-gradient-to-r from-cyan-500 to-blue-600 
            hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-opacity flex items-center cursor-pointer hover:scale-105">
              Commencer <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link href="#features" className="border border-slate-600 hover:bg-slate-800 
            text-slate-200 font-bold py-3 px-8 rounded-lg text-lg transition-colors cursor-pointer hover:scale-105">
              En savoir plus
            </Link>
          </div>
          <div className="mt-16 relative group">
          <div className="absolute inset-0 rounded-xl bg-cyan-500 opacity-50 blur-2xl group-hover:opacity-80 transition duration-500"></div>
          <Image 
            src="/taskflow_preview.jpg"
            alt="Aperçu du tableau de bord de TaskFlow"
            width={1000}
            height={600}
            className="relative rounded-xl border border-cyan-400 shadow-[0_0_40px_10px_rgba(0,255,255,0.3)] transition duration-500 mx-auto"
          />
        </div>

        </section>

         {/* --- Section Fonctionnalités --- */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Fonctionnalités Clés de <span className="text-[#00B0FF]">Task</span><span className="text-[#8BC34A]">Flow</span></h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour transformer le chaos en clarté et booster la productivité de votre équipe.
            </p>
          </div>
          
          {/* Grille des fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Carte 1: Gestion des tâches */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
                <ListBulletIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestion des tâches simplifiée</h3>
              <p className="text-slate-400">
                Créez, assignez et suivez les tâches en temps réel avec des statuts clairs et des priorités.
              </p>
            </div>

            {/* Carte 2: Tableau de bord */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
                <ChartBarIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tableau de bord intuitif</h3>
              <p className="text-slate-400">
                Une vue globale pour les managers et une interface épurée pour les employés, avec des statistiques de productivité.
              </p>
            </div>

            {/* Carte 3: Gestion des utilisateurs */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
                <UsersIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestion des utilisateurs et permissions</h3>
              <p className="text-slate-400">
                Contrôlez les droits d'accès. Les managers créent et gèrent les comptes, les employés réalisent les tâches qui leur sont confiées.
              </p>
            </div>

            {/* Carte 4: Notifications */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
                <BellIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Notifications et rappels</h3>
              <p className="text-slate-400">
                Recevez des alertes automatiques pour les deadlines importantes et les nouvelles assignations.
              </p>
            </div>

            {/* Carte 5: Collaboration */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
                <ChatBubbleBottomCenterTextIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collaboration centralisée</h3>
              <p className="text-slate-400">
                Ajoutez des commentaires et partagez des documents directement sur chaque tâche pour réduire les échanges par email.
              </p>
            </div>

            {/* Carte 6: Accessibilité */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
                <DevicePhoneMobileIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Accessibilité et mobilité</h3>
              <p className="text-slate-400">
                Interface responsive pour un accès depuis ordinateur, tablette ou smartphone avec synchronisation instantanée.
              </p>
            </div>

          </div>
        </section>

        {/* --- Section Tarifs / Appel à l'action --- */}
        <section id="pricing" className="container mx-auto px-6 py-20 bg-slate-800 rounded-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Une solution sur-mesure pour votre équipe.
            </h2>
            <p className="mt-4 text-lg text-cyan-300">
              Des performances optimales à un prix adapté.
            </p>
            <div className="mt-8 text-justify text-slate-300 space-y-4 ">
              <p>
                Chaque entreprise est unique, et vos besoins le sont aussi. 
                C’est pourquoi <span className="text-[#00B0FF]">Task</span><span className="text-[#8BC34A]">Flow</span> vous propose des solutions sur-mesure adaptées à la taille de votre équipe, 
                à vos projets et à votre organisation.
              </p>
              <p>
                En nous contactant, vous recevrez un devis personnalisé et attractif, 
                pensé pour vous offrir le meilleur rapport performance/prix. Notre objectif ? 
                Vous permettre de suivre vos tâches en temps réel, 
                de centraliser la communication et de gagner en productivité, 
                tout en restant simple et intuitif pour vos équipes.
              </p>
              <p>
                Ne laissez plus vos projets se disperser : découvrez comment TaskFlow 
                peut transformer votre manière de travailler et faites le premier 
                pas vers une gestion de tâches plus efficace.
              </p>
            </div>

            <div className="mt-10">
              <Link 
                href="#contact" 
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-opacity"
              >
                <span>Obtenir mon devis personnalisé</span>
                <ArrowRightIcon className="w-5 h-5 ml-2 inline-block" />
              </Link>
            </div>
          </div>
        </section>

        {/* --- Section Contact --- */}
        <section id="contact" className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Contactez-nous</h2>
            <p className="mt-4 text-slate-400">
              Une question, une suggestion, ou besoin d'un devis ? N'hésitez pas à nous écrire, nous serions ravis d'échanger avec vous.
            </p>

            <div className="mt-10">
              {/* Le lien cliquable pour envoyer un email */}
              <a 
                href="mailto:paulbenjaminahoutou@gmail.com" 
                className="inline-flex items-center justify-center gap-x-3 bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 py-4 px-8 rounded-lg text-lg text-slate-200 cursor-pointer hover:scale-105"
              >
                <EnvelopeIcon className="w-6 h-6" />
                <span>taskflow@gmail.com</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* --- Pied de page (Footer) --- */}
      <footer className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} <span className="text-[#00B0FF]">Task</span><span className="text-[#8BC34A]">Flow</span>. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}