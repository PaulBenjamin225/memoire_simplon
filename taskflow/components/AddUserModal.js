import { useState } from 'react'; // Import du hook useState pour gérer l'état local du composant
import axios from 'axios'; // Import de la bibliothèque axios pour les requêtes HTTP
import { XMarkIcon } from '@heroicons/react/24/solid'; // Import d'une icône de fermeture

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  // États pour stocker les valeurs saisies et les erreurs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Si le modal n'est pas ouvert, ne rien rendre
  if (!isOpen) return null;

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setError(''); // Réinitialise les erreurs

    // Vérifie que tous les champs sont remplis
    if (!name || !email || !password) {
      setError('Tous les champs sont requis.');
      return;
    }

    // Récupération du token d'authentification stocké dans le navigateur
    const token = localStorage.getItem('token');
    try {
      // Envoi de la requête POST à l'API pour ajouter un utilisateur
      const response = await axios.post('/api/users', // URL de l'endpoint backend
        { name, email, password }, // Données envoyées
        { headers: { Authorization: `Bearer ${token}` } } // En-têtes avec le token
      );

      onUserAdded(response.data); // Informe le parent qu'un utilisateur a été ajouté
      onClose(); // Ferme le modal

      // Réinitialise les champs après ajout
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      // Capture et affichage du message d'erreur
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  // Rendu du composant (interface utilisateur du modal)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Ajouter un nouvel employé</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nom complet</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Adresse email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Mot de passe initial</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-slate-300 hover:bg-slate-700 rounded-lg">
              Annuler
            </button>
            <button type="submit" className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
              Ajouter l'employé
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}