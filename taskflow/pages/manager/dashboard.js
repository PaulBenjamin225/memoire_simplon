import { useState, useEffect, useContext } from 'react'; // import de createContext pour créer un contexte global, useState pour gérer l'état, useEffect pour exécuter du code après le rendu
import axios from 'axios'; // import de Axios pour faire des requêtes HTTP vers l'API backend
import PrivateRoute from '../../components/PrivateRoute'; // Protège la page pour certains rôles
import AuthContext from '../../context/AuthContext'; // Pour récupérer l'utilisateur connecté et la fonction logout
// Modals pour créer, éditer et confirmer des actions sur les tâches
import CreateTaskModal from '../../components/CreateTaskModal';
import ConfirmModal from '../../components/ConfirmModal';
import EditTaskModal from '../../components/EditTaskModal';
// Modals pour ajouter et éditer les utilisateurs
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
// Icônes de Heroicons utilisées dans le dashboard (boutons, filtres, navigation)
import { 
  PlusIcon,        // Pour le bouton "Ajouter"
  UserGroupIcon,   // Pour la statistique "Nombre d'employés"
  ListBulletIcon,  // Pour la statistique "Tâches totales"
  CheckCircleIcon, // Pour la statistique "Tâches terminées"
  FunnelIcon,      // Pour l'icône du filtre de tâches
  Bars3Icon,       // Pour le menu hamburger sur mobile
  XMarkIcon        // Pour le bouton fermer menu mobile
} from '@heroicons/react/24/solid';
import Head from 'next/head'; // Pour définir le titre de la page dans l'onglet du navigateur
import Link from 'next/link'; // Pour créer des liens internes ou externes avec Next.js

// Composant pour afficher une ligne de tâche dans le tableau
const TaskRow = ({ task, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const CHAR_LIMIT = 100;
  const needsTruncation = task.description && task.description.length > CHAR_LIMIT;

  return (
    <tr className="hover:bg-slate-800 transition-colors">
      <td className="px-6 py-4 align-top">
        <div className="text-sm font-semibold text-white">{task.title}</div>
        {task.description && (
          <div className="text-sm text-slate-400 max-w-xs mt-1">
            <p className="whitespace-normal">
              {isExpanded ? task.description : `${task.description.substring(0, CHAR_LIMIT)}${needsTruncation ? '...' : ''}`}
            </p>
            {needsTruncation && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-1">
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-slate-300">{task.assignedTo.name}</td>
      <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-slate-300">{new Date(task.deadline).toLocaleDateString('fr-FR')}</td>
      <td className="px-6 py-4 whitespace-nowrap align-top">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${task.status === 'DONE' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
          {task.status === 'DONE' ? 'Terminé' : 'À faire'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-medium">
        <button onClick={onEdit} className="text-cyan-400 hover:text-cyan-300">Modifier</button>
        <button onClick={onDelete} className="text-red-500 hover:text-red-400 ml-4">Supprimer</button>
      </td>
    </tr>
  );
};

// Composant pour afficher une carte statistique
const StatCard = ({ title, value, icon }) => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center space-x-4">
    <div className="bg-slate-700 p-3 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

function ManagerDashboard() {
  const { user, logout } = useContext(AuthContext); // Récupère l'utilisateur et la fonction logout
  const [tasks, setTasks] = useState([]);  // Liste des tâches
  const [users, setUsers] = useState([]); // Liste des utilisateurs
  const [isLoading, setIsLoading] = useState(true); // Indique si les données sont en cours de chargement
  
  // États pour les modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Filtre par statut des tâches
  const [activeTab, setActiveTab] = useState('tasks'); // Onglet actif : 'tasks' ou 'users' 
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu mobile

// --- Récupère les tâches et utilisateurs au chargement ---
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { logout(); return; }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [tasksResponse, usersResponse] = await Promise.all([
          axios.get('/api/tasks/all', { headers }),
          axios.get('/api/users/all', { headers }),
        ]);
        setTasks(tasksResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Échec de la récupération des données du manager', error);
        if (error.response?.status === 401 || error.response?.status === 403) logout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [logout]);

  // Fonctions de gestion des tâches
  const handleTaskCreated = (newTask) => { setTasks([newTask, ...tasks]); }; // Ajoute une nouvelle tâche
  const handleEditClick = (task) => { setTaskToEdit(task); setIsEditModalOpen(true); }; // Ouvre modal édition
  const handleTaskUpdated = (updatedTask) => { setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))); setIsEditModalOpen(false); }; // Met à jour la tâche
  const handleDeleteClick = (taskId) => { setTaskToDelete(taskId); setIsConfirmModalOpen(true); }; // Ouvre modal confirmation suppression
  const confirmDeletion = async () => { // Supprime la tâche
    if (!taskToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/tasks/${taskToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasks.filter(task => task.id !== taskToDelete));
    } catch (error) {
      console.error('Échec de la suppression de la tâche', error);
      alert("La suppression de la tâche a échoué. Veuillez réessayer.");
    } finally {
      setIsConfirmModalOpen(false);
      setTaskToDelete(null);
    }
  };
  
  // Fonctions de gestion des utilisateurs
  const handleUserAdded = (newUser) => { setUsers([newUser, ...users]); };
  const handleEditUserClick = (user) => { setUserToEdit(user); setIsEditUserModalOpen(true); };
  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    setIsEditUserModalOpen(false);
    setIsDeactivateConfirmOpen(false);
  };
  const handleToggleStatusClick = (user) => {
    setUserToToggleStatus(user);
    setIsDeactivateConfirmOpen(true);
  };
  const confirmToggleStatus = async () => { // Active ou désactive un utilisateur
    if (!userToToggleStatus) return;
    const token = localStorage.getItem('token');
    try {
      const newStatus = !userToToggleStatus.isActive;
      const response = await axios.patch(`/api/users/${userToToggleStatus.id}`, { isActive: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      handleUserUpdated(response.data);
    } catch (error) {
      console.error('Échec de basculer le statut utilisateur', error);
      alert("La mise à jour du statut de l'utilisateur a échoué.");
    } finally {
      setIsDeactivateConfirmOpen(false);
      setUserToToggleStatus(null);
    }
  };

  // Logique de filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') { return true; }
    return task.status === statusFilter;
  });

  // Statistiques
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const totalEmployees = users.filter(u => u.role === 'EMPLOYEE').length;
  
  return (
    <PrivateRoute allowedRoles={['MANAGER']}>
      <Head>
        <title>Manager Dashboard - TaskFlow</title>
      </Head>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold">
                <span className="text-[#2962FF]">Task</span><span className="text-[#4CAF50]">Flow</span> 
                <span className="font-normal text-slate-400"> / Manager</span>
              </h1>
              <div className="hidden md:flex items-center">
                <Link href="/redirectToWp?destination=/" passHref>
                  <a target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-cyan-400 mr-6 text-sm font-medium transition-colors">
                    TaskFlow Hub
                  </a>
                </Link>
                <span className="text-slate-300 mr-4">Bonjour, {user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </div>
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300">
                  {isMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800 pb-4 px-4 space-y-4">
              <Link href="/redirectToWp?destination=/" passHref>
                <a target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-cyan-400 text-center py-2">
                  TaskFlow Hub
                </a>
              </Link>
              <div className="text-slate-300 text-center py-2 border-t border-slate-700">Bonjour, {user?.name}</div>
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>

        <main className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Tâches Totales" value={totalTasks} icon={<ListBulletIcon className="w-6 h-6 text-cyan-400"/>} />
            <StatCard title="Tâches Terminées" value={completedTasks} icon={<CheckCircleIcon className="w-6 h-6 text-cyan-400"/>} />
            <StatCard title="Nombre d'Employés" value={totalEmployees} icon={<UserGroupIcon className="w-6 h-6 text-cyan-400"/>} />
          </div>

          <div className="mb-6 border-b border-slate-700">
            <div className="flex space-x-8">
              <button onClick={() => setActiveTab('tasks')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'tasks' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}>
                GESTION DES TÂCHES
              </button>
              <button onClick={() => setActiveTab('users')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}>
                GESTION DES EMPLOYÉS
              </button>
            </div>
          </div>

          {activeTab === 'tasks' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-white">Toutes les Tâches</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500">
                      <option value="all">Tous les statuts</option>
                      <option value="TODO">À faire</option>
                      <option value="DONE">Terminé</option>
                    </select>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Créer une tâche
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tâche</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigné à</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Échéance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {isLoading ? (<tr><td colSpan="5" className="text-center py-8 text-slate-500">Chargement...</td></tr>) 
                    : filteredTasks.length > 0 ? filteredTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onEdit={() => handleEditClick(task)}
                          onDelete={() => handleDeleteClick(task.id)}
                        />
                      )) : (
                        <tr><td colSpan="5" className="text-center py-8 text-slate-500">Aucune tâche ne correspond à votre filtre.</td></tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-white">Liste des Utilisateurs</h2>
                <button onClick={() => setIsAddUserModalOpen(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Ajouter un employé
                </button>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {isLoading ? (<tr><td colSpan="4" className="text-center py-8 text-slate-500">Chargement...</td></tr>)
                    : users.map((u) => (
                      <tr key={u.id} className={`hover:bg-slate-800 transition-opacity ${!u.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${u.role === 'MANAGER' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{u.role === 'MANAGER' ? 'Manager' : 'Employé'}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => handleEditUserClick(u)} className="text-cyan-400 hover:text-cyan-300">Modifier</button>
                          <button 
                            onClick={() => handleToggleStatusClick(u)} 
                            className={`ml-4 ${u.isActive ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                          >
                            {u.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onTaskCreated={handleTaskCreated} users={users} />
      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDeletion} title="Confirmer la suppression" message="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible." />
      <EditTaskModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onTaskUpdated={handleTaskUpdated} task={taskToEdit} users={users} />
      <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onUserAdded={handleUserAdded} />
      <EditUserModal isOpen={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)} onUserUpdated={handleUserUpdated} user={userToEdit} />
      <ConfirmModal
        isOpen={isDeactivateConfirmOpen}
        onClose={() => setIsDeactivateConfirmOpen(false)}
        onConfirm={confirmToggleStatus}
        title={`${userToToggleStatus?.isActive ? 'Désactiver' : 'Activer'} le compte`}
        message={`Êtes-vous sûr de vouloir ${userToToggleStatus?.isActive ? 'Désactiver' : 'Activer'} le compte de ${userToToggleStatus?.name} ?`}
      />
    </PrivateRoute>
  );
}

export default ManagerDashboard;