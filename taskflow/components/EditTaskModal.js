import { useState, useEffect } from 'react'; // Import du hook React pour gérer les états internes
import axios from 'axios'; // Import de la bibliothèque axios pour effectuer des requêtes HTTP
import { XMarkIcon } from '@heroicons/react/24/solid'; // Import de l’icône de fermeture (croix)

// Le composant modal pour modifier une tâche
export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task, users }) {
  // État local pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedToId: '',
  });

  // État pour afficher un message d’erreur éventuel
  const [error, setError] = useState('');

  // Pré-remplit les champs du formulaire quand le modal s’ouvre ou quand `task` change
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        // Formater la date pour l'input type="date" (AAAA-MM-JJ)
        deadline: new Date(task.deadline).toISOString().split('T')[0],
        assignedToId: task.assignedToId,
      });
    }
  }, [task]); // Se déclenche chaque fois que la `task` change

  // Si le modal n’est pas ouvert, on ne rend rien
  if (!isOpen) return null;

  // Gère la saisie de l’utilisateur dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Envoi des données mises à jour vers le backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setError('');

    const token = localStorage.getItem('token'); // Récupération du token pour l’authentification
    try {
      // Requête PATCH pour mettre à jour la tâche
      const response = await axios.patch(`/api/tasks/${task.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onTaskUpdated(response.data); // Informe le parent de la mise à jour
      onClose(); // Ferme le modal
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    // Arrière-plan flou et sombre du modal
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Modifier la tâche</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon className="w-7 h-7" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">Titre</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" rows="3"></textarea>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-300">Date d'échéance</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>
          <div>
            <label htmlFor="assignedToId" className="block text-sm font-medium text-slate-300">Assigner à</label>
            <select name="assignedToId" value={formData.assignedToId} onChange={handleChange}
              className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-slate-300 hover:bg-slate-700 rounded-lg">Annuler</button>
            <button type="submit" className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}