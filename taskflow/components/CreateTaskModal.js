import { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated, users }) {
  // Etats pour chaque champ du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [error, setError] = useState('');

  // Si le modal n'est pas ouvert, on n'affiche rien
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation simple
    if (!title || !deadline || !assignedToId) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/tasks', {
        title,
        description,
        deadline,
        assignedToId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Appelle la fonction du parent pour mettre à jour la liste
      onTaskCreated(response.data);
      // Réinitialise le formulaire et ferme le modal
      onClose();
      setTitle('');
      setDescription('');
      setDeadline('');
      setAssignedToId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    // Fond semi-transparent
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {/* Conteneur du modal */}
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Créer une nouvelle tâche</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">Titre (obligatoire)</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" rows="3"></textarea>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-300">Date d'échéance (obligatoire)</label>
            <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-300">Assigner à (obligatoire)</label>
            <select id="assignedTo" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500">
              <option value="" disabled>Sélectionner un employé</option>
              {/* On peuple le menu déroulant avec la liste des utilisateurs */}
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-slate-300 hover:bg-slate-700 rounded-lg">
              Annuler
            </button>
            <button type="submit" className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90">
              Créer la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}