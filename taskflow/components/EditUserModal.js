import { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function EditUserModal({ isOpen, onClose, onUserUpdated, user }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [error, setError] = useState('');

  // Pré-remplit le formulaire quand un utilisateur est sélectionné
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

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
      const response = await axios.patch(`/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserUpdated(response.data); // Informe le parent
      onClose(); // Ferme le modal
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Modifier l'utilisateur</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon className="w-7 h-7" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nom complet</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Adresse email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300">Rôle</label>
            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
              <option value="EMPLOYEE">Employé</option>
              <option value="MANAGER">Manager</option>
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