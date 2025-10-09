import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PrivateRoute from '../components/PrivateRoute';
import AuthContext from '../context/AuthContext';
import Head from 'next/head';
import { 
  ListBulletIcon, CheckCircleIcon, ExclamationTriangleIcon 
} from '@heroicons/react/24/solid';

// --- Composant StatCard (style du dashboard manager) ---
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

// --- Composant pour afficher une seule tâche (design mis à jour) ---
const TaskItem = ({ task, onStatusChange }) => {
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'DONE';

    const handleCheckboxChange = () => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        onStatusChange(task.id, newStatus);
    };

    return (
        <div className={`bg-slate-800 p-4 rounded-lg flex items-center justify-between border-l-4 transition-all duration-300 hover:bg-slate-700 ${isOverdue ? 'border-red-500' : 'border-slate-700'}`}>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={task.status === 'DONE'}
                    onChange={handleCheckboxChange}
                    className="h-6 w-6 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <div className="ml-4">
                    <p className={`font-semibold ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                    {task.description && <p className="text-sm text-slate-400">{task.description}</p>}
                </div>
            </div>
            <div className="flex flex-col items-end text-sm">
                <span className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
                    {new Date(task.deadline).toLocaleDateString('fr-FR')}
                </span>
                {isOverdue && <span className="text-xs text-red-500">En retard</span>}
            </div>
        </div>
    );
};

function EmployeeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { logout(); return; }
      try {
        const res = await axios.get('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        if (error.response?.status === 401) logout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [logout]);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem('token');
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.error('Failed to update task status', error);
      setTasks(originalTasks);
      alert("La mise à jour de la tâche a échoué.");
    }
  };

  // Séparation des tâches et calcul des stats
  const tasksTodo = tasks.filter(t => t.status === 'TODO');
  const tasksDone = tasks.filter(t => t.status === 'DONE');
  const overdueTasks = tasksTodo.filter(t => new Date(t.deadline) < new Date());

  return (
    <PrivateRoute allowedRoles={['EMPLOYEE']}>
      <Head>
        <title>Mes Tâches - TaskFlow</title>
      </Head>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold">
                <span className="text-[#2962FF]">Task</span><span className="text-[#4CAF50]">Flow</span> 
                <span className="font-normal text-slate-400"> / Espace Employé</span>
              </h1>
              <a 
                href="/redirectToWp?destination=/" // URL de votre WordPress
                target="_blank" // Ouvre dans un nouvel onglet
                rel="noopener noreferrer" 
                className="text-slate-300 hover:text-cyan-400 mr-6 text-sm font-medium transition-colors"
              >
                TaskFlow Hub
              </a>
              <div className="flex items-center">
                <span className="text-slate-300 mr-4">Bonjour, {user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Section des cartes de statistiques pour l'employé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Tâches à faire" value={tasksTodo.length} icon={<ListBulletIcon className="w-6 h-6 text-cyan-400"/>} />
            <StatCard title="Tâches terminées" value={tasksDone.length} icon={<CheckCircleIcon className="w-6 h-6 text-cyan-400"/>} />
            <StatCard title="Tâches en retard" value={overdueTasks.length} icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400"/>} />
          </div>
          
          {/* Section des tâches à faire */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Tâches à realiser</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-slate-400">Chargement...</p>
              ) : tasksTodo.length > 0 ? (
                tasksTodo.map(task => <TaskItem key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} />)
              ) : (
                <div className="bg-slate-800 p-6 text-center rounded-lg text-slate-400">
                  <p>Bravo, vous n'avez aucune tâche en cours ! 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Section des tâches terminées */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Tâches terminées</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-slate-400">Chargement...</p>
              ) : tasksDone.length > 0 ? (
                tasksDone.map(task => <TaskItem key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} />)
              ) : (
                <div className="bg-slate-800 p-6 text-center rounded-lg text-slate-400">
                  <p>Aucune tâche terminée pour le moment.</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </PrivateRoute>
  );
}

export default EmployeeDashboard;