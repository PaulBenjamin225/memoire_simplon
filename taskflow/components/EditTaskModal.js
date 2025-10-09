import { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Le modal reçoit la tâche à modifier ('task') en props
export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task, users }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedToId: '',
  });
  const [error, setError] = useState('');

  // Ce `useEffect` est crucial: il pré-remplit le formulaire quand le modal s'ouvre
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    try {
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