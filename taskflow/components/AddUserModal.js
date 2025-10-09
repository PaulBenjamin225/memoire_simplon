import { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Tous les champs sont requis.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/users', 
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onUserAdded(response.data); // Informe le parent qu'un utilisateur a été ajouté
      onClose(); // Ferme le modal

      // Réinitialise les champs
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

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